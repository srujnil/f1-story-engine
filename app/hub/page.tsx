import { DataUnavailable } from "@/components/data-unavailable";
import Link from "next/link";
import { DriverFormChartLazy } from "@/components/driver-form-chart-lazy";
import { LiveStatGrid } from "@/components/live-stat-grid";
import { NavBar } from "@/components/nav-bar";
import { QuickStoryCard } from "@/components/quick-story-card";
import { StandingsPanel } from "@/components/standings-panel";
import { StartingLights } from "@/components/starting-lights";
import { getSeasonData } from "@/lib/jolpica";
import { computeMomentum } from "@/lib/momentum";
import { buildResultStories } from "@/lib/result-stories";

const FEATURED_SEASON = 2026;

// NavBar reads cookies() (Supabase session) before this page's own data
// fetches run, which puts those fetches "after a Request-time API." Under
// the default fetchCache "auto" that forces them to skip the Data Cache
// outright, ignoring their own `next: { revalidate }` options entirely.
// "default-cache" restores that: it still honors whatever cache option a
// fetch explicitly asks for, it just stops Next from forcing no-store on
// them by default. (docs: fetchCache route segment config)
export const fetchCache = "default-cache";

export default async function StorylineHubPage() {
  let seasonData;

  try {
    seasonData = await getSeasonData(FEATURED_SEASON);
  } catch (error: unknown) {
    // Was silently swallowed before — logging so Vercel's runtime logs actually
    // show *why* Jolpica failed instead of just a clean 200 with no trace.
    console.error(`Jolpica fetch failed for ${FEATURED_SEASON}`, error);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DataUnavailable />
        </main>
      </div>
    );
  }

  const momentum = computeMomentum(seasonData.driverForm);
  const stories = buildResultStories(seasonData.races);
  const completedRaces = seasonData.races.filter(
    (race) => race.status === "completed",
  );
  const progress = Math.round(
    (completedRaces.length / seasonData.races.length) * 100,
  );
  const formRounds = completedRaces.slice(-6).map((race) => `R${race.round}`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="grid items-end gap-8 border-b border-black/10 pb-9 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#1479ad]">
              <span className="size-2 animate-pulse rounded-full bg-electric motion-reduce:animate-none" />
              Live season intelligence
            </div>
            <h1 className="max-w-4xl font-heading text-5xl font-black leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              The season has a <span className="text-primary">pulse.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Follow the drivers gaining ground, the title pressure building,
              and the results shaping 2026.
            </p>
          </div>
          <div className="grid gap-3">
            <StartingLights />
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Season progress</span>
                <span>
                  {completedRaces.length} / {seasonData.races.length} rounds
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <LiveStatGrid seasonData={seasonData} momentum={momentum} />

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.85fr)]">
          <DriverFormChartLazy
            drivers={seasonData.driverForm}
            rounds={formRounds}
          />
          <StandingsPanel
            standings={seasonData.standings}
            teamStandings={seasonData.teamStandings}
          />
        </div>

        <section
          aria-labelledby="stories-heading"
          className="flex flex-col gap-5 rounded-[2rem] border border-electric/20 bg-white p-5 text-[#24242d] shadow-sm sm:p-8"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Race feed
              </p>
              <h2
                id="stories-heading"
                className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Latest results, quickly
              </h2>
            </div>
            <span className="hidden text-sm font-medium text-black/50 sm:block">
              Built from live race data
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stories.map((story, index) => (
              <QuickStoryCard
                key={story.id}
                story={story}
                accentIndex={index}
              />
            ))}
          </div>
        </section>

        <section className="grid items-center gap-6 rounded-[2rem] border border-primary/20 bg-[#fff1f4] p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              Community paddock
            </p>
            <h2 className="font-heading text-3xl font-black tracking-tight">
              The numbers start the argument.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60 sm:text-base">
              React to hot takes, filter discussion by favourite team, and join
              a race conversation in the new community prototype.
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Enter the paddock →
          </Link>
        </section>
        <p className="text-xs text-muted-foreground">
          Race data from Jolpica F1 · refreshed hourly
        </p>
      </main>
    </div>
  );
}
