import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teamColor } from "@/lib/team-colors";
import type { Race } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function RaceCard({
  race,
  onSelect,
  storySelected = false,
}: {
  race: Race;
  onSelect: (round: number) => void;
  storySelected?: boolean;
}) {
  const winner = race.podium.find((p) => p.position === 1);

  return (
    <button
      type="button"
      id={`round-${race.round}`}
      onClick={() => onSelect(race.round)}
      aria-label={`Round ${race.round}: ${race.name}, ${dateFormatter.format(
        new Date(race.date),
      )}. ${race.status === "completed" ? "View race result." : "View scheduled race detail."}`}
      className="w-72 shrink-0 snap-start rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={`h-full border border-t-4 transition-all duration-300 hover:-translate-y-1 ${
          race.status === "completed"
            ? "border-black/10 bg-white hover:border-black/25 hover:shadow-md"
            : "border-amber/35 bg-[#fff9df] hover:border-amber/60 hover:shadow-md"
        }`}
        style={{
          borderTopColor: winner ? teamColor(winner.team) : "#46a7ff",
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Round {race.round} · {dateFormatter.format(new Date(race.date))}
            </span>
            {race.status === "completed" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                  storySelected
                    ? "bg-electric text-white"
                    : "bg-electric/10 text-[#1479ad]"
                }`}
              >
                {storySelected ? "Story selected" : "Race story"}
              </span>
            )}
          </div>
          <CardTitle className="text-xl font-extrabold tracking-tight">
            {race.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {winner ? (
            <span>
              🏆 <span className="text-foreground">{winner.driver}</span> ·{" "}
              {winner.team}
            </span>
          ) : (
            <span className="font-medium text-[#9a6b00]">
              Upcoming · result pending
            </span>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
