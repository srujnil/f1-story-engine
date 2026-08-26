import type { QuickStory, Race } from "@/types";

export function buildResultStories(races: Race[], limit = 4): QuickStory[] {
  return races
    .filter((race) => race.status === "completed" && race.podium.length === 3)
    .slice(-limit)
    .reverse()
    .map((race) => {
      const [winner, second, third] = race.podium;
      const details = [
        race.poleSitter ? `${race.poleSitter} started from pole.` : null,
        race.fastestLap ? `${race.fastestLap} set the fastest lap.` : null,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `result-${race.season}-${race.round}`,
        headline: `${winner.driver} wins the ${race.name}`,
        blurb:
          `${winner.driver} won for ${winner.team}, ahead of ${second.driver} and ${third.driver}. ${details}`.trim(),
        tag: "Results" as const,
        relatedRound: race.round,
      };
    });
}
