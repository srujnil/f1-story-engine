import { NavBar } from "@/components/nav-bar";
import { CarExplorerCanvas } from "./car-explorer-canvas";

export default function CarExplorerPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            Interactive garage
          </div>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            Car <span className="text-primary">Explorer</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Drag to rotate, scroll to zoom, and tap a part of the car to see
            what it does.
          </p>
        </div>

        <CarExplorerCanvas />
      </main>
    </div>
  );
}
