import { NavBar } from "@/components/nav-bar";
import { AirflowLab } from "./airflow-lab";
import { CarExplorerCanvas } from "./car-explorer-canvas";
import { TyreLab } from "./tyre-lab";

export default function CarExplorerPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f8f5] text-[#17181c]">
      <div aria-hidden="true" className="motorsport-pattern absolute inset-0" />
      <NavBar />
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            Interactive garage
          </div>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            Car <span className="text-primary">Explorer</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-black/55">
            Drag to rotate, scroll to zoom, and tap a part of the car to see
            what it does.
          </p>
        </div>

        <CarExplorerCanvas />
        <TyreLab />
        <AirflowLab />
        <footer className="border-t border-black/10 py-4 text-[9px] leading-relaxed text-black/35">
          Model &amp; sources · Fan-made concept{" "}
          <a
            href="https://sketchfab.com/3d-models/2026-f1-car-evo-1-2208ef7bd3de4e25be25efa100f27501"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-black/50 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            2026 F1 Car EVO-1
          </a>{" "}
          by{" "}
          <a
            href="https://sketchfab.com/abuhossain844"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-black/50 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            Abu Saif
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-black/50 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            CC BY 4.0
          </a>{" "}
          ·{" "}
          <a
            href="https://www.fia.com/news/new-era-competition-fia-showcases-future-focused-formula-1-regulations-2026-and-beyond"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-black/50 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            FIA 2026
          </a>{" "}
          ·{" "}
          <a
            href="https://www.fia.com/regulations/technical-regulations/2026/FIA-C11.1.1"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-black/50 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            technical rules
          </a>
        </footer>
      </main>
    </div>
  );
}
