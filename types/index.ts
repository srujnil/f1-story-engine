// Shared types — mirrors the data model in SPEC.md. Keep these two in sync.

export type PodiumFinisher = {
  position: 1 | 2 | 3;
  driver: string;
  team: string;
};

export type Race = {
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: string; // ISO date, e.g. "2026-03-08"
  podium: PodiumFinisher[];
  poleSitter: string;
  fastestLap: string;
};

export type DriverForm = {
  driver: string;
  team: string;
  /** Last 6 race finishing positions, oldest to newest. */
  last6Positions: number[];
};

export type QuickStoryTag = "Momentum" | "Strategy" | "Drama" | "Standings";

export type QuickStory = {
  id: string;
  headline: string;
  blurb: string;
  tag: QuickStoryTag;
  /** Links to a Race.round, if this story is tied to a specific race. */
  relatedRound?: number;
};

export type MomentumResult = {
  driver: string;
  team: string;
  /** avg(prior 3) - avg(recent 3); positive = improving. */
  delta: number;
};
