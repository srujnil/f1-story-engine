"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CAR_PARTS } from "./car-parts";
import { CarDiagram } from "./car-diagram";

export function CarBreakdown() {
  const [activePartId, setActivePartId] = useState<string>(CAR_PARTS[0].id);
  const activePart = CAR_PARTS.find((part) => part.id === activePartId)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card className="w-full overflow-visible bg-white p-6">
        {/* Both the diagram and the hotspots position against this single box,
            so their percentage coordinates share one coordinate space. */}
        <div className="relative aspect-[800/260] w-full">
          <CarDiagram activePartId={activePartId} />

          {CAR_PARTS.map((part) => {
            const selected = part.id === activePartId;
            return (
              <button
                key={part.id}
                type="button"
                aria-pressed={selected}
                aria-label={part.label}
                onClick={() => setActivePartId(part.id)}
                style={{
                  left: `${part.hotspot.x}%`,
                  top: `${part.hotspot.y}%`,
                }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                <span className="relative flex size-3.5">
                  {!selected && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric/60 motion-reduce:animate-none" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-3.5 rounded-full ring-2 ring-white transition-all duration-200",
                      selected
                        ? "scale-125 bg-primary"
                        : "bg-electric group-hover:scale-110",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        key={activePart.id}
        className="animate-in fade-in slide-in-from-bottom-2 h-fit duration-300 motion-reduce:animate-none"
      >
        <CardHeader>
          <CardTitle>{activePart.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed">
            {activePart.description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
