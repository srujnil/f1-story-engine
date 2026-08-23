import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Race } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function RaceCard({
  race,
  onSelect,
}: {
  race: Race;
  onSelect: (round: number) => void;
}) {
  const winner = race.podium.find((p) => p.position === 1);

  return (
    <button
      type="button"
      id={`round-${race.round}`}
      onClick={() => onSelect(race.round)}
      aria-label={`Round ${race.round}: ${race.name}, ${dateFormatter.format(
        new Date(race.date),
      )}. View race detail.`}
      className="w-64 shrink-0 snap-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <span className="text-xs font-medium text-muted-foreground">
            Round {race.round} · {dateFormatter.format(new Date(race.date))}
          </span>
          <CardTitle className="text-base">{race.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {winner ? (
            <span>
              🏆 <span className="text-foreground">{winner.driver}</span> ·{" "}
              {winner.team}
            </span>
          ) : (
            <span>Podium pending</span>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
