"use client";

import dynamic from "next/dynamic";

import type { AirflowView, AirSpeed } from "./airflow-lab";

const AirflowScene = dynamic(() => import("./airflow-scene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#07111c]">
      <div className="flex items-center gap-3 text-xs font-bold text-white/40">
        <span className="size-5 animate-spin rounded-full border-2 border-[#59d8ff]/20 border-t-[#59d8ff] motion-reduce:animate-none" />
        Initialising wind tunnel
      </div>
    </div>
  ),
});

export function AirflowCanvas(props: {
  view: AirflowView;
  speed: AirSpeed;
  showStreamlines: boolean;
  showPressure: boolean;
  showTurbulence: boolean;
  paused: boolean;
}) {
  return <AirflowScene {...props} />;
}
