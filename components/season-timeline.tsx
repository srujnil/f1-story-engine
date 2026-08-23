"use client";

import { useState } from "react";
import { RaceCard } from "@/components/race-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Race } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function SeasonTimeline({ races }: { races: Race[] }) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const selectedRace = races.find((r) => r.round === selectedRound) ?? null;

  return (
    <>
      <div
        role="list"
        aria-label="Races this season"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {races.map((race) => (
          <div role="listitem" key={race.round}>
            <RaceCard race={race} onSelect={setSelectedRound} />
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
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Podium
                  </h3>
                  <ol className="flex flex-col gap-1">
                    {selectedRace.podium.map((finisher) => (
                      <li key={finisher.position} className="flex justify-between">
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
                  <span className="text-foreground">{selectedRace.poleSitter}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fastest lap</span>
                  <span className="text-foreground">{selectedRace.fastestLap}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
