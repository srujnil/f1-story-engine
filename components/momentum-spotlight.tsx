import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MomentumResult } from "@/types";

export function MomentumSpotlight({ result }: { result: MomentumResult | null }) {
  if (!result) {
    // Defensive fallback — shouldn't happen with well-formed data, but an
    // empty state beats a crash if the mock/real data set is ever malformed.
    return null;
  }

  return (
    <Card
      aria-label={`Momentum spotlight: ${result.driver}, up ${result.delta.toFixed(
        1,
      )} positions on average`}
      className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card"
    >
      <CardHeader>
        <Badge variant="default" className="mb-1 w-fit">
          Momentum Spotlight
        </Badge>
        <CardTitle className="text-3xl font-bold tracking-tight">
          {result.driver}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>{result.team}</span>
        <span>
          Up an average of{" "}
          <strong className="text-foreground">{result.delta.toFixed(1)}</strong>{" "}
          finishing positions over the last 3 races.
        </span>
      </CardContent>
    </Card>
  );
}
