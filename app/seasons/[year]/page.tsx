import { NavBar } from "@/components/nav-bar";
import { SeasonTimeline } from "@/components/season-timeline";
import { DataUnavailable } from "@/components/data-unavailable";
import { getSeasonData } from "@/lib/jolpica";
import { getRaceStory, isOpenF1RateLimitError } from "@/lib/openf1";
import { notFound } from "next/navigation";
import type { RaceStory } from "@/types";

export default async function SeasonPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ story?: string }>;
}) {
  const { year } = await params;
  const { story } = await searchParams;
  const numericYear = Number(year);

  if (
    !Number.isInteger(numericYear) ||
    numericYear < 1950 ||
    numericYear > new Date().getUTCFullYear()
  ) {
    notFound();
  }

  let races;
  let raceStory: RaceStory | null = null;
  let selectedStoryRound = 0;
  try {
    ({ races } = await getSeasonData(numericYear));
    const completedRaces = races.filter((race) => race.status === "completed");
    const latestCompletedRace = completedRaces.at(-1);
    const requestedRound = Number(story);
    const requestedRace = Number.isInteger(requestedRound)
      ? completedRaces.find((race) => race.round === requestedRound)
      : undefined;
    const selectedRace = requestedRace ?? latestCompletedRace;
    if (selectedRace) {
      selectedStoryRound = selectedRace.round;
      raceStory = await getRaceStory(selectedRace).catch((error: unknown) => {
        // Story enrichment is optional. A rate limit should produce the existing
        // unavailable state, not a noisy Next.js development error overlay.
        if (isOpenF1RateLimitError(error)) return null;

        console.error(
          `OpenF1 enrichment failed for ${selectedRace.season} round ${selectedRace.round}`,
          error,
        );
        return null;
      });
    }
  } catch (error: unknown) {
    // Same fix as app/page.tsx — log before falling back so the real cause is
    // visible in Vercel's runtime logs instead of a silent, traceless 200.
    console.error(`Jolpica fetch failed for ${numericYear}`, error);
    races = null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1479ad]">
            Race by race
          </p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            {year} Season Timeline
          </h1>
        </div>
        {races ? (
          <SeasonTimeline
            races={races}
            raceStory={raceStory}
            selectedStoryRound={selectedStoryRound}
          />
        ) : (
          <DataUnavailable />
        )}
        <p className="text-xs text-muted-foreground">
          Results from Jolpica F1 · race stories from OpenF1 historical data ·
          refreshed hourly
        </p>
      </main>
    </div>
  );
}
