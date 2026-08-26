"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, History } from "lucide-react";
import { RaceStoryPanel } from "@/components/race-story-panel";
import { circuitAssetFor, countryFlag } from "@/lib/circuit-assets";
import type { Race, RaceStory } from "@/types";

function storyHref(race: Race): string {
  return `/seasons/${race.season}?story=${race.round}#race-story`;
}

function ArchiveArrow({
  race,
  direction,
}: {
  race: Race | undefined;
  direction: "previous" | "next";
}) {
  const label =
    direction === "previous" ? "Previous race story" : "Next race story";
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight;

  if (!race) {
    return (
      <span
        aria-disabled="true"
        className="grid size-10 place-items-center rounded-xl border border-black/[0.08] text-black/20"
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
    );
  }

  return (
    <Link
      href={storyHref(race)}
      prefetch={false}
      aria-label={`${label}: ${race.name}`}
      className="grid size-10 place-items-center rounded-xl border border-black/10 bg-white text-black/60 transition-colors hover:border-electric/40 hover:bg-electric/10 hover:text-[#1479ad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
    >
      <Icon aria-hidden="true" className="size-4" />
    </Link>
  );
}

export function RaceStoryArchive({
  races,
  selectedRound,
  story,
}: {
  races: Race[];
  selectedRound: number;
  story: RaceStory | null;
}) {
  const completedRaces = races.filter((race) => race.status === "completed");
  const selectedIndex = completedRaces.findIndex(
    (race) => race.round === selectedRound,
  );
  const selectedRace = completedRaces[selectedIndex];
  const selectedLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    selectedLink.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
  }, [selectedRound]);

  if (!selectedRace) return null;

  return (
    <section
      id="race-story"
      aria-labelledby="archive-heading"
      className="scroll-mt-24 space-y-5"
    >
      <div className="rounded-3xl border border-black/10 bg-[#f8f9fb] p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-violet">
              <History aria-hidden="true" className="size-4" /> Race Story
              archive
            </p>
            <h2
              id="archive-heading"
              className="mt-1 font-heading text-2xl font-black tracking-tight"
            >
              Choose a completed race
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <ArchiveArrow
              race={completedRaces[selectedIndex - 1]}
              direction="previous"
            />
            <ArchiveArrow
              race={completedRaces[selectedIndex + 1]}
              direction="next"
            />
          </div>
        </div>

        <nav
          aria-label="Completed race stories"
          className="flex snap-x gap-2 overflow-x-auto pb-2"
        >
          {completedRaces.map((race) => {
            const selected = race.round === selectedRound;
            const circuitAsset = circuitAssetFor(race.circuit, race.country);
            return (
              <Link
                key={race.round}
                ref={selected ? selectedLink : undefined}
                href={storyHref(race)}
                prefetch={false}
                aria-current={selected ? "page" : undefined}
                aria-label={`View ${race.name} race story`}
                title={race.name}
                data-selected={selected}
                className={`circuit-tile group relative min-w-32 snap-start overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                  selected
                    ? "border-electric/55 bg-[#eef9ff] text-[#08628f] shadow-sm"
                    : "border-black/10 bg-white text-[#24242d] hover:-translate-y-0.5 hover:border-electric/35 hover:bg-[#f6fbff]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black/40">
                    R{race.round}
                  </span>
                  {circuitAsset ? (
                    <span aria-hidden="true" className="text-xl leading-none">
                      {countryFlag(circuitAsset.countryCode)}
                    </span>
                  ) : null}
                </span>

                {circuitAsset ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 500 500"
                    className="mt-1 h-14 w-full overflow-visible p-1"
                  >
                    <use
                      href={`/circuits/${circuitAsset.asset}.svg#track`}
                      className="circuit-outline"
                    />
                    <use
                      href={`/circuits/${circuitAsset.asset}.svg#track`}
                      className="circuit-tracer"
                    />
                  </svg>
                ) : (
                  <span className="mt-4 block truncate font-heading text-sm font-black">
                    {race.country}
                  </span>
                )}
                <span className="sr-only">{race.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {story ? (
        <RaceStoryPanel
          story={story}
          isLatest={selectedIndex === completedRaces.length - 1}
        />
      ) : (
        <div
          role="status"
          className="rounded-[2rem] border border-amber/35 bg-[#fff9df] p-6 sm:p-8"
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a6b00]">
            Story data unavailable
          </p>
          <h3 className="mt-1 font-heading text-3xl font-black">
            {selectedRace.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60">
            The official result remains available above, but OpenF1 has not
            supplied the historical session detail needed for pivotal moments
            and tyre strategy.
          </p>
        </div>
      )}
    </section>
  );
}
