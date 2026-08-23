// MOCK DATA — fictional storylines written for UI development, not real reporting.
// Replace with real editorial copy once you're writing about actual races.

import type { QuickStory } from "@/types";

export const mockStories: QuickStory[] = [
  {
    id: "story-1",
    headline: "Ishikawa's quiet form flip",
    blurb:
      "Three races ago Vantage F1 looked out of ideas. A front-wing change at Rivermouth turned into three wins in a row — the biggest form swing of the season so far.",
    tag: "Momentum",
    relatedRound: 6,
  },
  {
    id: "story-2",
    headline: "Meridian's one-stop gamble",
    blurb:
      "Voss started sixth at Altavista. Meridian called an early one-stop against every rival's two-stop plan — and it paid off by lap 40.",
    tag: "Strategy",
    relatedRound: 4,
  },
  {
    id: "story-3",
    headline: "Solace's Okafor problem",
    blurb:
      "Okafor was on pace for a podium at Highland until a slow pit stop dropped him out of contention. It's the third slow stop of the season for the same car.",
    tag: "Drama",
    relatedRound: 7,
  },
  {
    id: "story-4",
    headline: "The title fight tightens",
    blurb:
      "Ishikawa's run has closed what looked like a comfortable gap to a single race worth of points. Meridian's response at the next round matters more than usual.",
    tag: "Standings",
  },
  {
    id: "story-5",
    headline: "Beaumont finally converts",
    blurb:
      "Two near-misses in as many races had people asking if Ferro could close out a lead. Pole to flag at Northshore, defended cleanly, answered that.",
    tag: "Drama",
    relatedRound: 3,
  },
];
