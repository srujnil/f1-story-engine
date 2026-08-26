import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MomentumResult } from "@/types";

export function MomentumSpotlight({
  result,
}: {
  result: MomentumResult | null;
}) {
  if (!result) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <Badge variant="outline" className="mb-1 w-fit">
            Momentum Spotlight
          </Badge>
          <CardTitle>Building the form window</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Momentum appears after six completed races.
        </CardContent>
      </Card>
    );
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
