"use client";

import dynamic from "next/dynamic";

// next/dynamic with { ssr: false } is only allowed inside a Client Component in
// the App Router — three.js touches `window` at import time, so importing
// car-scene.tsx anywhere in the Server Component tree would crash the build.
// This tiny wrapper is the boundary that makes that legal.
const CarScene = dynamic(() => import("./car-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-black/10 bg-white lg:aspect-auto lg:h-[500px]">
      <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" />
    </div>
  ),
});

export function CarExplorerCanvas() {
  return <CarScene />;
}
