import { FlagTriangleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { momentStyles } from "@/components/race-story-panel";
import type { RaceControlFeedItem } from "@/lib/race-control-feed";

export function RaceControlList({ items }: { items: RaceControlFeedItem[] }) {
  if (!items.length) {
    return (
      <p className="rounded-2xl bg-[#f8f9fb] p-4 text-sm text-muted-foreground">
        No Race Control events recorded for recent rounds.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item) => {
        const style = momentStyles[item.type];
        return (
          <li
            key={`${item.round}-${item.id}`}
            className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <FlagTriangleRight
                aria-hidden="true"
                className="size-3.5 text-primary"
              />
              <span className="text-xs font-bold text-black/45">
                Round {item.round} · {item.raceName} · Lap {item.lap}
              </span>
              <Badge variant="outline" className={style.className}>
                {style.label}
              </Badge>
            </div>
            <p className="font-heading text-base font-black">
              {item.headline}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-black/55">
              {item.detail}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
