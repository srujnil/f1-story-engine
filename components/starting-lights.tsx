"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

type SequencePhase = "ready" | "running" | "go";

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 414;

export function StartingLights() {
  const [litCount, setLitCount] = useState(0);
  const [phase, setPhase] = useState<SequencePhase>("ready");
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const runSequence = useCallback(() => {
    clearTimers();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLitCount(0);
      setPhase("go");
      return;
    }

    setLitCount(0);
    setPhase("running");

    for (let light = 1; light <= LIGHT_COUNT; light += 1) {
      timers.current.push(
        window.setTimeout(() => setLitCount(light), light * LIGHT_INTERVAL_MS),
      );
    }

    timers.current.push(
      window.setTimeout(
        () => {
          setLitCount(0);
          setPhase("go");
        },
        LIGHT_COUNT * LIGHT_INTERVAL_MS + 650,
      ),
    );
  }, [clearTimers]);

  useEffect(() => {
    const startTimer = window.setTimeout(runSequence, 250);
    return () => {
      window.clearTimeout(startTimer);
      clearTimers();
    };
  }, [clearTimers, runSequence]);

  return (
    <div className="rounded-2xl border border-black/10 bg-[#17171d] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-heading text-xs font-black uppercase tracking-[0.2em] text-white/60">
          Race start
        </p>
        <button
          type="button"
          onClick={runSequence}
          aria-label="Replay five-light start sequence"
          className="grid size-8 place-items-center rounded-lg text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div
        aria-hidden="true"
        className="grid grid-cols-5 gap-2 rounded-xl bg-black/35 p-3"
      >
        {Array.from({ length: LIGHT_COUNT }, (_, index) => (
          <span
            key={index}
            className={`aspect-square rounded-full border transition-all duration-150 motion-reduce:transition-none ${
              index < litCount
                ? "border-[#ff5365] bg-primary shadow-[0_0_18px_rgba(225,29,48,0.85)]"
                : "border-white/15 bg-white/[0.07]"
            }`}
          />
        ))}
      </div>

      <p className="mt-3 min-h-5 text-sm font-bold text-[#ff6473]">
        {phase === "go" ? "Lights out — away we go!" : null}
      </p>
      <span className="sr-only" aria-live="polite">
        {phase === "go" ? "Lights out — away we go!" : ""}
      </span>
    </div>
  );
}
