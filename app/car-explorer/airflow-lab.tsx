"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Eye,
  Gauge,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Wind,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { AirflowCanvas } from "./airflow-canvas";

export type AirflowView = "side" | "top" | "front" | "floor";
export type AirSpeed = "slow" | "race" | "fast";

const VIEW_COPY: Record<
  AirflowView,
  { label: string; title: string; description: string }
> = {
  side: {
    label: "Side",
    title: "Body + floor flow",
    description:
      "Follow clean air as it splits above and below the chassis before expanding into the rear wake.",
  },
  top: {
    label: "Top",
    title: "Wake management",
    description:
      "See the conceptual flow wrap around the wheels and sidepods, then tighten toward the rear assembly.",
  },
  front: {
    label: "Front",
    title: "The first impact",
    description:
      "The nose, front wing, and exposed wheels are the first surfaces to shape the incoming air.",
  },
  floor: {
    label: "Floor",
    title: "Underfloor energy",
    description:
      "Look beneath the car as accelerated floor streams travel toward the diffuser and lower rear wake.",
  },
};

const SPEEDS: Record<AirSpeed, { label: string }> = {
  slow: { label: "Slow" },
  race: { label: "Race" },
  fast: { label: "Fast" },
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function ToggleButton({
  pressed,
  onClick,
  icon: Icon,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: typeof Layers3;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59d8ff]",
        pressed
          ? "border-[#59d8ff]/40 bg-[#59d8ff]/10 text-[#8ce5ff]"
          : "border-white/10 text-white/45 hover:text-white/75",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}

export function AirflowLab() {
  const [view, setView] = useState<AirflowView>("side");
  const [speed, setSpeed] = useState<AirSpeed>("race");
  const [showStreamlines, setShowStreamlines] = useState(true);
  const [showPressure, setShowPressure] = useState(true);
  const [showTurbulence, setShowTurbulence] = useState(true);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const [pausedOverride, setPausedOverride] = useState<boolean | null>(null);
  const paused = pausedOverride ?? prefersReducedMotion;
  const [resetKey, setResetKey] = useState(0);
  const copy = VIEW_COPY[view];

  return (
    <section
      aria-labelledby="airflow-title"
      className="overflow-hidden rounded-3xl border border-black/10 bg-[#111218] text-white shadow-xl shadow-black/10"
    >
      <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#59d8ff]">
            <Wind className="size-4" aria-hidden="true" />
            3D aero lab
          </div>
          <h2
            id="airflow-title"
            className="mt-2 font-heading text-3xl font-black tracking-tight sm:text-4xl"
          >
            See the invisible
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Move through a three-dimensional wind tunnel and isolate the forces
            shaping the car&apos;s aerodynamic story.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[#59d8ff]/30 bg-[#59d8ff]/10 px-3 py-1.5 text-xs font-bold text-[#8ce5ff]">
          CFD-inspired · not simulation data
        </span>
      </div>

      <div className="border-y border-white/10 bg-[#07111c]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 xl:flex-row xl:items-center xl:justify-between xl:px-6">
          <div
            role="group"
            aria-label="Wind tunnel camera view"
            className="grid grid-cols-4 rounded-xl border border-white/10 bg-black/20 p-1"
          >
            {(Object.keys(VIEW_COPY) as AirflowView[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={view === item}
                onClick={() => setView(item)}
                className={cn(
                  "min-h-10 rounded-lg px-3 text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59d8ff] sm:px-4",
                  view === item
                    ? "bg-[#59d8ff] text-[#071019] shadow-[0_0_20px_rgba(89,216,255,0.22)]"
                    : "text-white/45 hover:text-white",
                )}
              >
                {VIEW_COPY[item].label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Airflow animation speed"
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/20 p-1"
            >
              <Gauge className="ml-2 size-4 text-white/35" aria-hidden="true" />
              {(Object.keys(SPEEDS) as AirSpeed[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={speed === item}
                  onClick={() => setSpeed(item)}
                  className={cn(
                    "min-h-9 rounded-lg px-3 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59d8ff]",
                    speed === item
                      ? "bg-white/15 text-white"
                      : "text-white/40 hover:text-white/75",
                  )}
                >
                  {SPEEDS[item].label}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-label={
                paused ? "Resume airflow animation" : "Pause airflow animation"
              }
              aria-pressed={paused}
              onClick={() => setPausedOverride(!paused)}
              className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59d8ff]"
            >
              {paused ? (
                <Play className="size-4" aria-hidden="true" />
              ) : (
                <Pause className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              aria-label="Reset wind tunnel"
              onClick={() => {
                setView("side");
                setSpeed("race");
                setShowStreamlines(true);
                setShowPressure(true);
                setShowTurbulence(true);
                setPausedOverride(null);
                setResetKey((current) => current + 1);
              }}
              className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59d8ff]"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative h-[360px] overflow-hidden sm:h-[470px] lg:h-[560px]">
          <AirflowCanvas
            key={resetKey}
            view={view}
            speed={speed}
            showStreamlines={showStreamlines}
            showPressure={showPressure}
            showTurbulence={showTurbulence}
            paused={paused}
          />

          <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-[#07111c]/75 px-3 py-2 backdrop-blur-md sm:left-6 sm:top-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#8ce5ff]">
              <span className="size-1.5 animate-pulse rounded-full bg-[#59d8ff] motion-reduce:animate-none" />
              Wind tunnel active
            </div>
            <p className="mt-1 text-[11px] font-semibold text-white/45">
              {copy.label} camera · {SPEEDS[speed].label.toLowerCase()} flow
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-4 rounded-xl border border-white/10 bg-[#07111c]/75 px-3 py-2 text-[10px] font-bold text-white/50 backdrop-blur-md sm:flex sm:bottom-6 sm:left-6">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#59d8ff]" /> Clean flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#ffd35a]" />
              Accelerated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#ff5b55]" /> Pressure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#557cff]" /> Wake
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
          <ToggleButton
            pressed={showStreamlines}
            onClick={() => setShowStreamlines((current) => !current)}
            icon={Eye}
          >
            Streamlines
          </ToggleButton>
          <ToggleButton
            pressed={showPressure}
            onClick={() => setShowPressure((current) => !current)}
            icon={Layers3}
          >
            Pressure zones
          </ToggleButton>
          <ToggleButton
            pressed={showTurbulence}
            onClick={() => setShowTurbulence((current) => !current)}
            icon={Sparkles}
          >
            Rear turbulence
          </ToggleButton>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8">
        <div>
          <p className="font-heading text-xl font-black">{copy.title}</p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/50">
            {copy.description}
          </p>
        </div>
        <p className="max-w-sm text-[10px] leading-relaxed text-white/30 sm:text-right">
          Particle paths are illustrative and do not represent measured
          velocity, pressure, or a team&apos;s aerodynamic design.
        </p>
      </div>
    </section>
  );
}
