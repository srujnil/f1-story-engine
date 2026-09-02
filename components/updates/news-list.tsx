import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types";

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 60) return relativeFormatter.format(-diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return relativeFormatter.format(-diffHours, "hour");
  return relativeFormatter.format(-Math.round(diffHours / 24), "day");
}

export function NewsList({ items }: { items: NewsItem[] }) {
  if (!items.length) {
    return (
      <p className="rounded-2xl bg-[#f8f9fb] p-4 text-sm text-muted-foreground">
        No news items available right now.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item.link}
          className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold text-black/45">
            <span>via {item.source}</span>
            <span aria-hidden="true">·</span>
            <span>{relativeTime(item.publishedAt)}</span>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-start gap-1.5 font-heading text-base font-black hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.title}
            <ExternalLink
              aria-hidden="true"
              className="mt-1 size-3.5 shrink-0 text-black/30 group-hover:text-primary"
            />
          </a>
          {item.excerpt && (
            <p className="mt-1 text-sm leading-relaxed text-black/55">
              {item.excerpt}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
