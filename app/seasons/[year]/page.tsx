import { NavBar } from "@/components/nav-bar";
import { SeasonTimeline } from "@/components/season-timeline";
import { mockSeason2026 } from "@/data/mock-2026-season";

// v0 only has mock data for 2026 — any other year falls back to it rather than
// a hard 404, since there's nothing else to show yet. Real per-year data lands
// in Step 6.
export default async function SeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6">
        <h1 className="text-sm font-medium text-muted-foreground">
          {year} Season Timeline
        </h1>
        <SeasonTimeline races={mockSeason2026} />
      </main>
    </div>
  );
}
