"use client";

import dynamic from "next/dynamic";

// Same boundary as app/car-explorer/car-explorer-canvas.tsx — three.js
// touches `window` at import time, so the actual scene must be dynamically
// imported with ssr:false from a Client Component, never imported directly
// into a Server Component tree.
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-[#07080b]">
      <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" />
    </div>
  ),
});

export function HeroCanvas() {
  return <HeroScene />;
}
