import { NavBar } from "@/components/nav-bar";
import { CarBreakdown } from "./car-breakdown";

export default function CarExplorerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            Car Explorer
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Tap a part of the car to see what it does. This is a conceptual
            illustration of a 2026-spec car, not a real team&apos;s car.
          </p>
        </div>

        <CarBreakdown />

        <p className="text-xs leading-relaxed text-muted-foreground">
          Conceptual illustration—not team-specific technical data. 2026
          regulation details are sourced from the{" "}
          <a
            href="https://www.fia.com/news/new-era-competition-fia-showcases-future-focused-formula-1-regulations-2026-and-beyond"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#1479ad] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          >
            FIA 2026 overview
          </a>{" "}
          and the{" "}
          <a
            href="https://www.fia.com/regulations/technical-regulations/2026/FIA-C11.1.1"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#1479ad] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          >
            current FIA technical regulations
          </a>
          .
        </p>
      </main>
    </div>
  );
}
