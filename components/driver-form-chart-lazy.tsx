"use client";

import dynamic from "next/dynamic";
import type { DriverForm } from "@/types";

const DriverFormChart = dynamic(
  () =>
    import("@/components/driver-form-chart").then(
      (module) => module.DriverFormChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading driver form chart"
        className="min-h-[28rem] animate-pulse rounded-3xl border border-black/10 bg-white motion-reduce:animate-none"
      />
    ),
  },
);

export function DriverFormChartLazy({
  drivers,
  rounds,
}: {
  drivers: DriverForm[];
  rounds: string[];
}) {
  return <DriverFormChart drivers={drivers} rounds={rounds} />;
}
