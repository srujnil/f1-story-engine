"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type TyreCompound = {
  id: "soft" | "medium" | "hard" | "intermediate" | "wet";
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  surface: string;
  bestFor: string;
  tradeoff: string;
  traits: { label: string; value: number }[];
};

const TYRES: TyreCompound[] = [
  {
    id: "soft",
    label: "Soft",
    shortLabel: "S",
    color: "#e10600",
    textColor: "#ffffff",
    surface: "Dry track",
    bestFor: "Qualifying, restarts, and short attacking stints",
    tradeoff: "Fast warm-up and peak grip, but the shortest useful life.",
    traits: [
      { label: "Peak grip", value: 5 },
      { label: "Durability", value: 2 },
      { label: "Warm-up", value: 5 },
    ],
  },
  {
    id: "medium",
    label: "Medium",
    shortLabel: "M",
    color: "#ffd500",
    textColor: "#161616",
    surface: "Dry track",
    bestFor: "Flexible race stints and changing strategy windows",
    tradeoff: "Balances competitive pace with a more useful stint length.",
    traits: [
      { label: "Peak grip", value: 4 },
      { label: "Durability", value: 3 },
      { label: "Warm-up", value: 4 },
    ],
  },
  {
    id: "hard",
    label: "Hard",
    shortLabel: "H",
    color: "#f4f4f1",
    textColor: "#161616",
    surface: "Dry track",
    bestFor: "Long stints, hot races, and abrasive circuits",
    tradeoff: "Maximum durability, with slower warm-up and less peak grip.",
    traits: [
      { label: "Peak grip", value: 3 },
      { label: "Durability", value: 5 },
      { label: "Warm-up", value: 2 },
    ],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    shortLabel: "I",
    color: "#22b24c",
    textColor: "#ffffff",
    surface: "Damp / light rain",
    bestFor: "Wet tarmac without heavy standing water, or a drying track",
    tradeoff: "A wide crossover tyre between dry slicks and the full wet.",
    traits: [
      { label: "Wet grip", value: 4 },
      { label: "Water clearing", value: 3 },
      { label: "Crossover range", value: 5 },
    ],
  },
  {
    id: "wet",
    label: "Full Wet",
    shortLabel: "W",
    color: "#1685e5",
    textColor: "#ffffff",
    surface: "Heavy rain",
    bestFor: "Standing water and the highest aquaplaning risk",
    tradeoff: "Maximum water clearing, but unsuitable as the circuit dries.",
    traits: [
      { label: "Wet grip", value: 5 },
      { label: "Water clearing", value: 5 },
      { label: "Dry-track pace", value: 1 },
    ],
  },
];

function TyreGraphic({
  tyre,
  compact = false,
}: {
  tyre: TyreCompound;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative shrink-0 rounded-full bg-[#111216] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_16px_30px_rgba(0,0,0,0.2)]",
        compact ? "size-12" : "size-48 sm:size-56",
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className="tyre-rotate size-full"
        style={{ color: tyre.color }}
      >
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
        />
        <circle
          cx="100"
          cy="100"
          r="67"
          fill="none"
          stroke="#34363d"
          strokeWidth="2"
        />
        {!compact && (
          <g stroke="#4a4c54" strokeWidth="4" strokeLinecap="round">
            {Array.from({ length: 16 }).map((_, index) => {
              const angle = index * 22.5;
              return (
                <line
                  key={angle}
                  x1="100"
                  y1="20"
                  x2="100"
                  y2="29"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
          </g>
        )}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="#202229"
          stroke="#555861"
          strokeWidth="3"
        />
        <g fill="#767a84">
          {Array.from({ length: 8 }).map((_, index) => (
            <rect
              key={index}
              x="96"
              y="57"
              width="8"
              height="36"
              rx="3"
              transform={`rotate(${index * 45} 100 100)`}
            />
          ))}
        </g>
        <circle cx="100" cy="100" r="15" fill="#b6bac3" />
        <circle cx="100" cy="100" r="7" fill="#34363d" />
      </svg>
      <span
        className={cn(
          "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-heading font-black",
          compact ? "size-5 text-[9px]" : "size-9 text-sm",
        )}
        style={{ backgroundColor: tyre.color, color: tyre.textColor }}
      >
        {tyre.shortLabel}
      </span>
    </div>
  );
}

export function TyreLab() {
  const [activeId, setActiveId] = useState<TyreCompound["id"]>("soft");
  const activeTyre = TYRES.find((tyre) => tyre.id === activeId)!;

  return (
    <section
      aria-labelledby="tyre-lab-title"
      className="overflow-hidden rounded-3xl bg-[#f6f6f3] text-[#17181c] shadow-sm"
    >
      <div className="border-b border-black/10 px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
          Strategy lab
        </p>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2
              id="tyre-lab-title"
              className="font-heading text-3xl font-black tracking-tight sm:text-4xl"
            >
              Choose <span className="text-primary">your tyre</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60 sm:text-base">
              Every compound is a compromise between grip, life, temperature,
              and weather. Select a tyre to explore its role.
            </p>
          </div>
          <span className="w-fit rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/55">
            2026 weekend labels
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[19rem_1fr]">
        <div
          role="group"
          aria-label="Select a tyre compound"
          className="grid grid-cols-2 gap-2 border-b border-black/10 p-4 sm:grid-cols-5 lg:grid-cols-1 lg:border-b-0 lg:border-r lg:p-5"
        >
          {TYRES.map((tyre) => {
            const selected = activeId === tyre.id;
            return (
              <button
                key={tyre.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(tyre.id)}
                className={cn(
                  "group flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  selected
                    ? "border-black/15 bg-white shadow-sm"
                    : "border-transparent hover:border-black/10 hover:bg-white/70",
                )}
              >
                <TyreGraphic tyre={tyre} compact />
                <span>
                  <span className="block text-sm font-black">{tyre.label}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-black/45">
                    {tyre.surface}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={activeTyre.id}
          className="animate-in fade-in slide-in-from-bottom-2 grid gap-8 p-5 duration-300 motion-reduce:animate-none sm:p-8 xl:grid-cols-[16rem_1fr] xl:items-center"
        >
          <div className="flex justify-center">
            <TyreGraphic tyre={activeTyre} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: activeTyre.color,
                  color: activeTyre.textColor,
                }}
              >
                {activeTyre.shortLabel} compound
              </span>
              <span className="text-sm font-bold text-black/45">
                {activeTyre.surface}
              </span>
            </div>
            <h3 className="mt-4 font-heading text-3xl font-black">
              {activeTyre.label}
            </h3>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <dt className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">
                  Best used for
                </dt>
                <dd className="mt-2 text-sm font-bold leading-relaxed">
                  {activeTyre.bestFor}
                </dd>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <dt className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">
                  The trade-off
                </dt>
                <dd className="mt-2 text-sm font-bold leading-relaxed">
                  {activeTyre.tradeoff}
                </dd>
              </div>
            </dl>

            <div
              className="mt-6 space-y-3"
              aria-label={`${activeTyre.label} relative performance profile`}
            >
              {activeTyre.traits.map((trait) => (
                <div
                  key={trait.label}
                  className="grid grid-cols-[7rem_1fr] items-center gap-3"
                >
                  <span className="text-xs font-bold text-black/55">
                    {trait.label}
                  </span>
                  <div
                    className="flex gap-1.5"
                    role="img"
                    aria-label={`${trait.label}: ${trait.value} out of 5`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className="h-2 flex-1 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            index < trait.value ? activeTyre.color : "#deded9",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-black/10 px-5 py-3 text-[11px] leading-relaxed text-black/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          Relative profiles are educational, not live telemetry. Actual
          performance depends on the nominated compound, circuit, car setup,
          weather, and tyre management.
        </p>
        <p className="shrink-0">
          Learn more:{" "}
          <a
            href="https://www.pirelli.com/tyres/en-gb/motorsport/car/formula-1"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Pirelli F1 tyres
          </a>
        </p>
      </div>
    </section>
  );
}
