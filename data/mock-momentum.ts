// MOCK DATA — entirely fictional, hand-crafted to line up with mock-2026-season.ts
// (rounds 3-8) so the Momentum Spotlight tells a consistent story: T. Ishikawa
// climbing from mid-pack to race wins. Not real results.

import type { DriverForm } from "@/types";

export const mockDriverForm: DriverForm[] = [
  {
    driver: "T. Ishikawa",
    team: "Vantage F1",
    last6Positions: [8, 6, 1, 1, 1, 2],
  },
  {
    driver: "A. Voss",
    team: "Meridian Racing",
    last6Positions: [2, 1, 3, 2, 5, 1],
  },
  {
    driver: "K. Lindqvist",
    team: "Solace Motorsport",
    last6Positions: [4, 3, 6, 4, 2, 3],
  },
  {
    driver: "M. Beaumont",
    team: "Ferro Grand Prix",
    last6Positions: [5, 4, 2, 5, 3, 4],
  },
  {
    driver: "R. Okafor",
    team: "Solace Motorsport",
    last6Positions: [7, 2, 6, 3, 7, 6],
  },
];
