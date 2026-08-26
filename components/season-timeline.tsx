"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCard } from "@/components/race-card";
import { RaceStoryArchive } from "@/components/race-story-archive";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Race, RaceStory } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function SeasonTimeline({
  races,
  raceStory,
  selectedStoryRound,
}: {
  races: Race[];
  raceStory: RaceStory | null;
  selectedStoryRound: number;
}) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const selectedRace = races.find((r) => r.round === selectedRound) ?? null;
  const completedCount = races.filter(
    (race) => race.status === "completed",
  ).length;
  const progress = races.length ? (completedCount / races.length) * 100 : 0;

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-[#111118] shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-semibold">
            {completedCount} rounds complete
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-black/50">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-electric" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber" /> Upcoming
            </span>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-electric"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div
        role="list"
        aria-label="Races this season"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 pt-1"
      >
        {races.map((race) => (
          <div role="listitem" key={race.round}>
            <RaceCard
              race={race}
              onSelect={setSelectedRound}
              storySelected={selectedStoryRound === race.round}
            />
          </div>
        ))}
      </div>

      <Sheet
        open={selectedRace !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRound(null);
        }}
      >
        <SheetContent>
          {selectedRace && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Round {selectedRace.round}: {selectedRace.name}
                </SheetTitle>
                <SheetDescription>
                  {selectedRace.circuit}, {selectedRace.country} ·{" "}
                  {dateFormatter.format(new Date(selectedRace.date))}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 text-sm">
                {selectedRace.status === "completed" ? (
                  <>
                    <div>
                      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Podium
                      </h3>
                      <ol className="flex flex-col gap-1">
                        {selectedRace.podium.map((finisher) => (
                          <li
                            key={finisher.position}
                            className="flex justify-between"
                          >
                            <span>
                              {finisher.position}. {finisher.driver}
                            </span>
                            <span className="text-muted-foreground">
                              {finisher.team}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pole position</span>
                      <span className="text-foreground">
                        {selectedRace.poleSitter ?? "Unavailable"}
                      </span>
                    </div>
                    <Link
                      href={`/seasons/${selectedRace.season}?story=${selectedRace.round}#race-story`}
                      prefetch={false}
                      onClick={() => setSelectedRound(null)}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-electric px-4 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                    >
                      Open full race story
                    </Link>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Fastest lap</span>
                      <span className="text-foreground">
                        {selectedRace.fastestLap ?? "Unavailable"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    This race is scheduled for{" "}
                    {dateFormatter.format(new Date(selectedRace.date))}. Results
                    will appear after the race.
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <RaceStoryArchive
        races={races}
        selectedRound={selectedStoryRound}
        story={raceStory}
      />
    </>
  );
}
