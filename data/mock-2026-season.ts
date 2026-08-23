// MOCK DATA — entirely fictional. Circuits, dates, drivers, and results below are
// invented for UI development and do not represent the real 2026 F1 season.
// Replace with a real data source in Step 6 (see SPEC.md — Jolpica F1 API).

import type { Race } from "@/types";

export const mockSeason2026: Race[] = [
  {
    round: 1,
    name: "Grand Prix of Meridian Bay",
    circuit: "Meridian Bay Street Circuit",
    country: "Fictional Country A",
    date: "2026-03-08",
    podium: [
      { position: 1, driver: "A. Voss", team: "Meridian Racing" },
      { position: 2, driver: "K. Lindqvist", team: "Solace Motorsport" },
      { position: 3, driver: "R. Okafor", team: "Solace Motorsport" },
    ],
    poleSitter: "A. Voss",
    fastestLap: "K. Lindqvist",
  },
  {
    round: 2,
    name: "Desert Sands Grand Prix",
    circuit: "Sands International Raceway",
    country: "Fictional Country B",
    date: "2026-03-22",
    podium: [
      { position: 1, driver: "K. Lindqvist", team: "Solace Motorsport" },
      { position: 2, driver: "A. Voss", team: "Meridian Racing" },
      { position: 3, driver: "M. Beaumont", team: "Ferro Grand Prix" },
    ],
    poleSitter: "K. Lindqvist",
    fastestLap: "A. Voss",
  },
  {
    round: 3,
    name: "Northshore Grand Prix",
    circuit: "Northshore Circuit",
    country: "Fictional Country C",
    date: "2026-04-05",
    podium: [
      { position: 1, driver: "M. Beaumont", team: "Ferro Grand Prix" },
      { position: 2, driver: "A. Voss", team: "Meridian Racing" },
      { position: 3, driver: "T. Ishikawa", team: "Vantage F1" },
    ],
    poleSitter: "M. Beaumont",
    fastestLap: "T. Ishikawa",
  },
  {
    round: 4,
    name: "Grand Prix of Altavista",
    circuit: "Altavista Hillside Circuit",
    country: "Fictional Country D",
    date: "2026-04-19",
    podium: [
      { position: 1, driver: "A. Voss", team: "Meridian Racing" },
      { position: 2, driver: "R. Okafor", team: "Solace Motorsport" },
      { position: 3, driver: "K. Lindqvist", team: "Solace Motorsport" },
    ],
    poleSitter: "R. Okafor",
    fastestLap: "A. Voss",
  },
  {
    round: 5,
    name: "Rivermouth Grand Prix",
    circuit: "Rivermouth Street Circuit",
    country: "Fictional Country E",
    date: "2026-05-03",
    podium: [
      { position: 1, driver: "T. Ishikawa", team: "Vantage F1" },
      { position: 2, driver: "M. Beaumont", team: "Ferro Grand Prix" },
      { position: 3, driver: "A. Voss", team: "Meridian Racing" },
    ],
    poleSitter: "T. Ishikawa",
    fastestLap: "M. Beaumont",
  },
  {
    round: 6,
    name: "Grand Prix of Solmar",
    circuit: "Solmar Coastal Circuit",
    country: "Fictional Country F",
    date: "2026-05-17",
    podium: [
      { position: 1, driver: "T. Ishikawa", team: "Vantage F1" },
      { position: 2, driver: "A. Voss", team: "Meridian Racing" },
      { position: 3, driver: "R. Okafor", team: "Solace Motorsport" },
    ],
    poleSitter: "A. Voss",
    fastestLap: "T. Ishikawa",
  },
  {
    round: 7,
    name: "Highland Grand Prix",
    circuit: "Highland Park Circuit",
    country: "Fictional Country G",
    date: "2026-05-31",
    podium: [
      { position: 1, driver: "T. Ishikawa", team: "Vantage F1" },
      { position: 2, driver: "K. Lindqvist", team: "Solace Motorsport" },
      { position: 3, driver: "M. Beaumont", team: "Ferro Grand Prix" },
    ],
    poleSitter: "T. Ishikawa",
    fastestLap: "K. Lindqvist",
  },
  {
    round: 8,
    name: "Grand Prix of Castellon",
    circuit: "Castellon Ring",
    country: "Fictional Country H",
    date: "2026-06-14",
    podium: [
      { position: 1, driver: "A. Voss", team: "Meridian Racing" },
      { position: 2, driver: "T. Ishikawa", team: "Vantage F1" },
      { position: 3, driver: "K. Lindqvist", team: "Solace Motorsport" },
    ],
    poleSitter: "T. Ishikawa",
    fastestLap: "A. Voss",
  },
];
