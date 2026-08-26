// Static reference data for the Car Explorer's interactive breakdown, shown over
// the "2026 F1 CAR EVO-1" model by Abu Saif (CC-BY-4.0, via Sketchfab — see the
// credit line on the page). This is a fan-made conceptual model, not a real team's
// real car — descriptions stay generic and edition-agnostic (how the part class
// functions in modern F1 broadly), only calling out 2026 rule changes that are
// already public knowledge, never inventing team-specific specifics.

export type CarPart = {
  id: string;
  label: string;
  description: string;
  accent: string;
  /** Hotspot position in the model's own local coordinate space (metres-ish). */
  hotspot: [number, number, number];
};

export const CAR_PARTS: CarPart[] = [
  {
    id: "front-wing",
    label: "Front wing",
    accent: "#d7192d",
    description:
      "Generates downforce at the front axle and directs airflow around the front tyres. The FIA's 2026 design uses a two-element active flap as part of the standard Z-Mode for corners and low-drag X-Mode for straights.",
    hotspot: [0, -0.15, -0.6],
  },
  {
    id: "nose-halo",
    label: "Nose & halo",
    accent: "#e6a500",
    description:
      "The nose houses a crash-absorbing structure ahead of the driver's feet. For 2026, the FIA specifies a two-stage front impact structure; above the cockpit, the halo provides additional head protection.",
    hotspot: [0, 0.45, -2.2],
  },
  {
    id: "sidepod",
    label: "Sidepod & cooling inlet",
    accent: "#238ccc",
    description:
      "The intakes on each flank feed air to the radiators that cool the power unit, gearbox, and hybrid battery, while the outer bodywork is shaped to manage airflow toward the rear of the car.",
    hotspot: [0.55, 0.1, -3.2],
  },
  {
    id: "power-unit",
    label: "Power unit & engine cover",
    accent: "#159f85",
    description:
      "Beneath the engine cover sits the hybrid power unit. For 2026, the battery element rises from 120kW to 350kW—an almost 300% increase—as the power distribution moves toward a more even combustion/electric split.",
    hotspot: [0, 0.35, -3.8],
  },
  {
    id: "rear-wing",
    label: "Rear wing (active aero)",
    accent: "#e45d18",
    description:
      "Produces downforce over the rear axle for cornering grip. The FIA's 2026 design uses a three-element active rear wing: Z-Mode is the standard cornering configuration, while X-Mode reduces drag on straights.",
    hotspot: [0, 0.5, -4.9],
  },
  {
    id: "floor-diffuser",
    label: "Floor & diffuser",
    accent: "#4767d8",
    description:
      "The underfloor and diffuser generate ground-effect downforce. For 2026, the FIA specifies a partially flat floor and a lower-powered diffuser to reduce ground effect and the reliance on very stiff, low-running setups.",
    hotspot: [0, -0.3, -3.5],
  },
  {
    id: "wheel-brake-duct",
    label: "Wheel & brake duct",
    accent: "#cf315f",
    description:
      "Formula 1 retains 18-inch wheels for 2026, while front tyre width drops by 25mm and rear width by 30mm. The duct beside each hub channels air toward the brakes to manage heat.",
    hotspot: [0.7, -0.1, -4.6],
  },
];
