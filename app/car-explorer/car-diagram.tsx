import { cn } from "@/lib/utils";

/**
 * Purely presentational: a stylized side-profile silhouette of a conceptual
 * 2026-spec F1 car, decorative (aria-hidden) since the real interactive/labeled
 * surface is the hotspot buttons layered on top by CarBreakdown. Two layers:
 * a static line-art illustration (always visible) and a highlight overlay per
 * part (invisible at rest, tints electric-blue when its hotspot is active).
 */
export function CarDiagram({ activePartId }: { activePartId: string | null }) {
  const highlightClass = (id: string) =>
    cn(
      "fill-electric/45 transition-opacity duration-300 ease-out",
      activePartId === id ? "opacity-100" : "opacity-0",
    );

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 260"
      className="h-full w-full overflow-visible"
    >
      {/* Static line-art illustration — always visible, decorative only */}
      <g className="fill-foreground/85">
        {/* Tub, cockpit, engine cover, rear bodywork */}
        <path
          d="M 30 200
             Q 90 165 180 150
             Q 260 130 320 118
             L 350 100
             Q 380 88 410 100
             Q 440 108 470 106
             Q 520 98 560 100
             Q 610 104 640 118
             L 660 130
             Q 655 150 650 170
             L 630 225
             L 160 225
             Q 100 222 60 214
             Z"
          className="fill-foreground/12"
        />

        {/* Nose */}
        <path d="M 30 200 Q 90 165 180 150 Q 260 130 320 118 L 330 150 Q 250 168 180 185 Q 110 198 40 214 Z" />

        {/* Halo */}
        <path
          d="M 315 118 Q 340 78 375 78 Q 410 78 405 112"
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
        />

        {/* Front wing — kept clear of the front wheel (leading edge at x=66) */}
        <rect x={15} y={204} width={47} height={10} rx={3} />
        <rect x={13} y={194} width={8} height={28} rx={2} />
        <rect x={59} y={194} width={8} height={28} rx={2} />

        {/* Rear wing */}
        <rect x={665} y={95} width={10} height={45} />
        <rect x={655} y={80} width={110} height={16} rx={4} />

        {/* Wheels */}
        <circle cx={110} cy={195} r={44} className="fill-foreground/60" />
        <circle cx={110} cy={195} r={20} className="fill-background" />
        <circle cx={655} cy={195} r={44} className="fill-foreground/60" />
        <circle cx={655} cy={195} r={20} className="fill-background" />
      </g>

      {/* Highlight overlays — one per interactive part, invisible until active */}
      <rect
        x={8}
        y={188}
        width={54}
        height={40}
        rx={6}
        className={highlightClass("front-wing")}
      />
      <path
        d="M 30 200 Q 90 165 180 150 Q 260 130 320 118 L 330 155 Q 250 172 180 188 Q 110 200 40 216 Z M 310 116 Q 335 72 378 72 Q 418 72 412 114 Z"
        className={highlightClass("nose-halo")}
      />
      <rect
        x={455}
        y={118}
        width={110}
        height={80}
        rx={22}
        className={highlightClass("sidepod")}
      />
      <path
        d="M 470 100 Q 520 90 560 94 Q 610 98 645 118 L 610 145 Q 555 118 495 122 Z"
        className={highlightClass("power-unit")}
      />
      <rect
        x={648}
        y={75}
        width={125}
        height={70}
        rx={8}
        className={highlightClass("rear-wing")}
      />
      <rect
        x={150}
        y={210}
        width={510}
        height={24}
        rx={6}
        className={highlightClass("floor-diffuser")}
      />
      <g className={highlightClass("wheel-brake-duct")}>
        <circle cx={110} cy={195} r={48} />
        <circle cx={655} cy={195} r={48} />
      </g>
    </svg>
  );
}
