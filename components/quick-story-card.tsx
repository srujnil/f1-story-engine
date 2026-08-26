import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuickStory } from "@/types";

const accentClasses = [
  "border-[#9fd8f5] bg-[#eef9ff]",
  "border-[#f0c7d0] bg-[#fff1f4]",
  "border-[#cdb9ee] bg-[#f7f1ff]",
  "border-[#ecd680] bg-[#fff9df]",
];

export function QuickStoryCard({
  story,
  accentIndex = 0,
}: {
  story: QuickStory;
  accentIndex?: number;
}) {
  return (
    <Card
      className={`h-full border border-t-4 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accentClasses[accentIndex % accentClasses.length]}`}
    >
      <CardHeader>
        <Badge
          variant="outline"
          className="mb-1 w-fit border-black/10 bg-white/80 text-[#383843]"
        >
          {story.tag}
        </Badge>
        <CardTitle className="text-xl font-extrabold tracking-tight">
          {story.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p className="leading-relaxed">{story.blurb}</p>
        {story.relatedRound !== undefined && (
          <Link
            href={`/seasons/2026#round-${story.relatedRound}`}
            className="text-sm font-semibold text-[#1479ad] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            See round {story.relatedRound} in the timeline →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
