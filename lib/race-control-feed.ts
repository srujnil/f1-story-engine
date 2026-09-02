import "server-only";

import { getRaceStory, isOpenF1RateLimitError } from "@/lib/openf1";
import type { Race, RaceStoryMoment } from "@/types";

export type RaceControlFeedItem = RaceStoryMoment & {
  round: number;
  raceName: string;
  raceDate: string;
};

/**
 * Flattens Race Control moments (penalties, flags, safety cars) across the
 * last `limit` completed races into one feed, reusing lib/openf1.ts's
 * existing per-race pipeline instead of adding new OpenF1 calls. Each
 * getRaceStory call is already cached (next: { revalidate: 3600 } in
 * fetchOpenF1), so this costs nothing extra for races the Race Story
 * archive already fetched.
 *
 * One race's story failing (rate limit, no matching OpenF1 meeting, etc.)
 * must never take down the whole feed — same convention as
 * app/seasons/[year]/page.tsx's race-story enrichment.
 */
export async function getRecentRaceControlFeed(
  races: Race[],
  limit = 5,
): Promise<RaceControlFeedItem[]> {
  const recentCompleted = races
    .filter((race) => race.status === "completed")
    .slice(-limit);

  const stories = await Promise.all(
    recentCompleted.map((race) =>
      getRaceStory(race).catch((error: unknown) => {
        if (isOpenF1RateLimitError(error)) return null;
        console.error(
          `Race Control feed: story fetch failed for ${race.season} round ${race.round}`,
          error,
        );
        return null;
      }),
    ),
  );

  const items: RaceControlFeedItem[] = [];
  for (const [index, story] of stories.entries()) {
    if (!story) continue;
    const race = recentCompleted[index];
    for (const moment of story.moments) {
      items.push({ ...moment, round: race.round, raceName: race.name, raceDate: race.date });
    }
  }

  return items
    .sort((left, right) => right.raceDate.localeCompare(left.raceDate))
    .slice(0, 12);
}
