// Static reference data for the Car Explorer's interactive breakdown. This is a
// conceptual/stylized 2026-spec F1 car, not a real team's real car — descriptions
// stay generic and edition-agnostic (how the part class functions in modern F1
// broadly), only calling out 2026 rule changes that are already public knowledge
// (active aero, the hybrid power split), never inventing team-specific specifics.

export type CarPart = {
  id: string;
  label: string;
  description: string;
  /** Position of the hotspot marker, as a percentage of the diagram's width/height. */
  hotspot: { x: number; y: number };
};

export const CAR_PARTS: CarPart[] = [
  {
    id: "front-wing",
    label: "Front wing",
    description:
      "Generates downforce at the front axle and directs airflow around the front tyres. The FIA's 2026 design uses a two-element active flap as part of the standard Z-Mode for corners and low-drag X-Mode for straights.",
    hotspot: { x: 5, y: 80 },
  },
  {
    id: "nose-halo",
    label: "Nose & halo",
    description:
      "The nose houses a crash-absorbing structure ahead of the driver's feet. For 2026, the FIA specifies a two-stage front impact structure; above the cockpit, the halo provides additional head protection.",
    hotspot: { x: 44, y: 35 },
  },
  {
    id: "sidepod",
    label: "Sidepod & cooling inlet",
    description:
      "The intakes on each flank feed air to the radiators that cool the power unit, gearbox, and hybrid battery, while the outer bodywork is shaped to manage airflow toward the rear of the car.",
    hotspot: { x: 64, y: 61 },
  },
  {
    id: "power-unit",
    label: "Power unit & engine cover",
    description:
      "Beneath the engine cover sits the hybrid power unit. For 2026, the battery element rises from 120kW to 350kW—an almost 300% increase—as the power distribution moves toward a more even combustion/electric split.",
    hotspot: { x: 70, y: 45 },
  },
  {
    id: "rear-wing",
    label: "Rear wing (active aero)",
    description:
      "Produces downforce over the rear axle for cornering grip. The FIA's 2026 design uses a three-element active rear wing: Z-Mode is the standard cornering configuration, while X-Mode reduces drag on straights.",
    hotspot: { x: 89, y: 42 },
  },
  {
    id: "floor-diffuser",
    label: "Floor & diffuser",
    description:
      "The underfloor and diffuser generate ground-effect downforce. For 2026, the FIA specifies a partially flat floor and a lower-powered diffuser to reduce ground effect and the reliance on very stiff, low-running setups.",
    hotspot: { x: 50, y: 85 },
  },
  {
    id: "wheel-brake-duct",
    label: "Wheel & brake duct",
    description:
      "Formula 1 retains 18-inch wheels for 2026, while front tyre width drops by 25mm and rear width by 30mm. The duct beside each hub channels air toward the brakes to manage heat.",
    hotspot: { x: 82, y: 75 },
  },
];
