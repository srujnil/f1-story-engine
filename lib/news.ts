import "server-only";

import Parser from "rss-parser";
import type { NewsItem } from "@/types";

// Confirmed live, valid RSS 2.0 feeds (fetched and inspected directly before
// adding — not assumed). Add more sources here; everything downstream
// already handles an arbitrary-length list.
const NEWS_FEEDS: { source: string; url: string }[] = [
  { source: "PlanetF1", url: "https://www.planetf1.com/ps-rss" },
  { source: "Autosport", url: "https://www.autosport.com/rss/f1/news/" },
];

const REVALIDATE_SECONDS = 30 * 60; // fresher than the hourly race-data cache
const MAX_EXCERPT_LENGTH = 200;

// rss-parser's parseURL() uses Node's raw http/https modules, not fetch —
// Next's `next: { revalidate }` Data Cache only patches global fetch, so it
// wouldn't apply there. Fetching the XML ourselves gets us caching *and* a
// custom User-Agent (some sites block default/missing ones).
async function fetchFeedXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "F1StoryEngine/0.1.0 (+https://f1-story-engine.vercel.app)" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`News feed request failed with status ${response.status}`);
  }
  return response.text();
}

function toExcerpt(text: string | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.length > MAX_EXCERPT_LENGTH
    ? `${trimmed.slice(0, MAX_EXCERPT_LENGTH).trimEnd()}…`
    : trimmed;
}

async function fetchOneFeed(
  parser: Parser,
  feed: { source: string; url: string },
): Promise<NewsItem[]> {
  const xml = await fetchFeedXml(feed.url);
  const parsed = await parser.parseString(xml);

  return parsed.items.flatMap((item) => {
    if (!item.title || !item.link) return [];
    return [
      {
        title: item.title,
        link: item.link,
        source: feed.source,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        excerpt: toExcerpt(item.contentSnippet ?? item.summary),
      },
    ];
  });
}

/**
 * Aggregates headlines from NEWS_FEEDS. Never republishes full article
 * bodies — only the publisher's own short syndicated excerpt, headline, and
 * a link back to the original — that's the legitimate line between
 * aggregating news and reproducing someone else's copyrighted writing.
 *
 * A single feed failing (network error, malformed XML, blocked request)
 * is dropped silently rather than failing the whole page — same
 * graceful-degradation convention as every other external data source here.
 */
export async function getLatestNews(limit = 10): Promise<NewsItem[]> {
  const parser = new Parser();

  const results = await Promise.all(
    NEWS_FEEDS.map((feed) =>
      fetchOneFeed(parser, feed).catch((error: unknown) => {
        console.error(`News feed failed for ${feed.source}`, error);
        return [] as NewsItem[];
      }),
    ),
  );

  const seenLinks = new Set<string>();
  const merged: NewsItem[] = [];
  for (const item of results.flat()) {
    if (seenLinks.has(item.link)) continue;
    seenLinks.add(item.link);
    merged.push(item);
  }

  return merged
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, limit);
}
