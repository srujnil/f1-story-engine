"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { rankMomentum } from "@/lib/momentum";
import { teamColor } from "@/lib/team-colors";
import type { DriverForm } from "@/types";

export function DriverFormChart({
  drivers,
  rounds,
}: {
  drivers: DriverForm[];
  rounds: string[];
}) {
  const ranked = useMemo(() => rankMomentum(drivers).slice(0, 5), [drivers]);
  const [selectedDriver, setSelectedDriver] = useState(ranked[0]?.driver ?? "");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const selectedForm = drivers.find(
    (driver) => driver.driver === selectedDriver,
  );
  const selectedMomentum = ranked.find(
    (driver) => driver.driver === selectedDriver,
  );
  const color = teamColor(selectedForm?.team ?? "");
  const data =
    selectedForm?.last6Positions.map((position, index) => ({
      round: rounds[index] ?? `R${index + 1}`,
      position,
    })) ?? [];

  if (!selectedForm) return null;

  return (
    <section
      aria-labelledby="form-heading"
      className="min-w-0 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1479ad]">
            Interactive form tracker
          </p>
          <h2
            id="form-heading"
            className="font-heading text-2xl font-extrabold tracking-tight"
          >
            Six-race momentum
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lower finishing position is better. Select a driver to compare their
            run.
          </p>
        </div>
        <div className="rounded-2xl border border-electric/20 bg-[#eef9ff] px-4 py-2 text-right">
          <p className="text-xs text-muted-foreground">Momentum score</p>
          <p className="font-heading text-2xl font-extrabold" style={{ color }}>
            {selectedMomentum && selectedMomentum.delta > 0 ? "+" : ""}
            {selectedMomentum?.delta.toFixed(1)}
          </p>
        </div>
      </div>

      <div
        className="my-5 flex gap-2 overflow-x-auto pb-1"
        aria-label="Select driver"
      >
        {ranked.map((driver) => {
          const active = driver.driver === selectedDriver;
          return (
            <button
              key={driver.driver}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDriver(driver.driver)}
              className="shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: active
                  ? teamColor(driver.team)
                  : "rgba(0,0,0,.12)",
                backgroundColor: active
                  ? `${teamColor(driver.team)}22`
                  : "rgba(0,0,0,.03)",
                color: active ? teamColor(driver.team) : "inherit",
              }}
            >
              {driver.driver.split(" ").at(-1)}
            </button>
          );
        })}
      </div>

      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(0,0,0,.08)" vertical={false} />
            <XAxis
              dataKey="round"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
            <YAxis
              reversed
              domain={[1, 20]}
              ticks={[1, 5, 10, 15, 20]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: color, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,.12)",
                borderRadius: 14,
                color: "#111118",
              }}
            />
            <Line
              type="linear"
              dataKey="position"
              name="Finish"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, stroke: "#ffffff", strokeWidth: 3, r: 5 }}
              activeDot={{ r: 7, fill: color }}
              isAnimationActive={!reduceMotion}
              animationDuration={550}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
