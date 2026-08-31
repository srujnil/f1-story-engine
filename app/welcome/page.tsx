import Link from "next/link";
import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { HeroCanvas } from "@/components/welcome/hero-canvas";
import { ScrollReveal } from "@/components/welcome/scroll-reveal";

export const metadata: Metadata = {
  title: "F1 Story Engine — Welcome",
  description:
    "Welcome to the world of F1 and community — where stats meet conversation.",
};

export default function WelcomePage() {
  return (
    <div className="bg-[#07080b] text-white">
      <NavBar />

      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-57px)] items-center justify-center overflow-hidden">
        <HeroCanvas />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#07080b]/40 via-[#07080b]/10 to-[#07080b]"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/50">
            F1 Story Engine
          </p>
          <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Welcome to the world of F1
            <br />
            <span className="text-primary">— and community.</span>
          </h1>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40 motion-reduce:animate-none"
        >
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="18"
              height="26"
              rx="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="10" cy="8" r="2" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Scroll story */}
      <section className="relative overflow-hidden bg-[#0c0d11]">
        {/* .motorsport-pattern's strokes are near-black, tuned for the light
            car-explorer page — inverted here, and isolated to its own layer
            so the filter doesn't also invert the text below. */}
        <div
          aria-hidden="true"
          className="motorsport-pattern absolute inset-0 invert"
        />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-40 px-6 py-40">
          <ScrollReveal className="text-center">
            <p className="font-heading text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Where F1 stats meet{" "}
              <span className="text-electric">conversations.</span>
            </p>
          </ScrollReveal>

          <ScrollReveal className="text-center">
            <p className="font-heading text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Highlights from the actual{" "}
              <span className="text-amber">turning points</span> of the
              race — and the discussion that follows.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Credit */}
      <section className="border-t border-white/10 bg-[#07080b] py-16 text-center">
        <ScrollReveal>
          <p className="font-heading text-lg font-bold tracking-tight text-white/70">
            by Srujnil
          </p>
        </ScrollReveal>
      </section>

      {/* Dedication */}
      <section className="bg-[#07080b] px-6 pb-28">
        <ScrollReveal className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              A special acknowledgment
            </p>
            <p className="text-base leading-relaxed text-white/70 sm:text-lg">
              This is for the fans who love this sport for the pure drive
              and the nitty-gritty of it, not the glamour — the ones who
              pull other people in simply because of how much they care
              about the technical side of it.
            </p>
            <p className="mt-6 font-heading text-lg font-bold text-white">
              Thanks, Parth 🙂
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080b]"
          >
            Enter the paddock →
          </Link>
        </div>
      </section>

      {/* Required CC BY 4.0 attribution for the reused 3D model — see
          app/car-explorer/page.tsx for the source of this credit. */}
      <footer className="border-t border-white/10 py-4 text-center text-[9px] leading-relaxed text-white/30">
        Model &amp; sources · Fan-made concept{" "}
        <a
          href="https://sketchfab.com/3d-models/2026-f1-car-evo-1-2208ef7bd3de4e25be25efa100f27501"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-white/45 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          2026 F1 Car EVO-1
        </a>{" "}
        by{" "}
        <a
          href="https://sketchfab.com/abuhossain844"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-white/45 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          Abu Saif
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-white/45 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          CC BY 4.0
        </a>
      </footer>
    </div>
  );
}
