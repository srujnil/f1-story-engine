import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuickStory } from "@/types";

const tagVariant: Record<QuickStory["tag"], "default" | "secondary" | "outline"> = {
  Momentum: "default",
  Strategy: "secondary",
  Drama: "outline",
  Standings: "secondary",
};

export function QuickStoryCard({ story }: { story: QuickStory }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Badge variant={tagVariant[story.tag]} className="mb-1 w-fit">
          {story.tag}
        </Badge>
        <CardTitle>{story.headline}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>{story.blurb}</p>
        {story.relatedRound !== undefined && (
          <Link
            href={`/seasons/2026#round-${story.relatedRound}`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            See round {story.relatedRound} in the timeline →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
