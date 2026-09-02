import { DataUnavailable } from "@/components/data-unavailable";
import { NavBar } from "@/components/nav-bar";
import { RaceControlList } from "@/components/updates/race-control-list";
import { getSeasonData } from "@/lib/jolpica";
import { getRecentRaceControlFeed } from "@/lib/race-control-feed";

const FEATURED_SEASON = 2026;

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  let raceControlItems;
  try {
    const { races } = await getSeasonData(FEATURED_SEASON);
    raceControlItems = await getRecentRaceControlFeed(races);
  } catch (error: unknown) {
    console.error("Updates page: season/race-control fetch failed", error);
    raceControlItems = null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Constant updates
          </p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            What&apos;s happening
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Real Race Control facts from recent rounds — refreshed hourly.
          </p>
        </div>

        <section aria-labelledby="race-control-heading">
          <h2
            id="race-control-heading"
            className="mb-4 font-heading text-2xl font-black tracking-tight"
          >
            Race Control
          </h2>
          {raceControlItems ? (
            <RaceControlList items={raceControlItems} />
          ) : (
            <DataUnavailable
              title="Race Control feed is temporarily unavailable"
              message="OpenF1 or Jolpica could not be reached. Try refreshing in a few minutes."
            />
          )}
        </section>
      </main>
    </div>
  );
}
