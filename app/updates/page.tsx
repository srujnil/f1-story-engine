import { DataUnavailable } from "@/components/data-unavailable";
import { NavBar } from "@/components/nav-bar";
import { NewsList } from "@/components/updates/news-list";
import { RaceControlList } from "@/components/updates/race-control-list";
import { getSeasonData } from "@/lib/jolpica";
import { getLatestNews } from "@/lib/news";
import { getRecentRaceControlFeed } from "@/lib/race-control-feed";

const FEATURED_SEASON = 2026;

export const dynamic = "force-dynamic";

async function loadRaceControl() {
  try {
    const { races } = await getSeasonData(FEATURED_SEASON);
    return await getRecentRaceControlFeed(races);
  } catch (error: unknown) {
    console.error("Updates page: season/race-control fetch failed", error);
    return null;
  }
}

async function loadNews() {
  try {
    return await getLatestNews();
  } catch (error: unknown) {
    console.error("Updates page: news fetch failed", error);
    return null;
  }
}

export default async function UpdatesPage() {
  // Independent fetches, independent fallbacks — one section failing must
  // never take the other down with it.
  const [raceControlItems, newsItems] = await Promise.all([
    loadRaceControl(),
    loadNews(),
  ]);

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
            Real Race Control facts and the latest headlines — refreshed
            regularly.
          </p>
        </div>

        <section aria-labelledby="news-heading">
          <h2
            id="news-heading"
            className="mb-4 font-heading text-2xl font-black tracking-tight"
          >
            Latest news
          </h2>
          {newsItems ? (
            <NewsList items={newsItems} />
          ) : (
            <DataUnavailable
              title="News feed is temporarily unavailable"
              message="Couldn't reach our news sources. Try refreshing in a few minutes."
            />
          )}
        </section>

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
