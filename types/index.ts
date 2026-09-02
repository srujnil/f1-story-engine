// Shared types — mirrors the data model in SPEC.md. Keep these two in sync.

export type PodiumFinisher = {
  position: 1 | 2 | 3;
  driver: string;
  team: string;
};

export type Race = {
  season: number;
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: string; // ISO date, e.g. "2026-03-08"
  startTime: string | null; // ISO timestamp when Jolpica supplies a race time
  status: "completed" | "upcoming";
  podium: PodiumFinisher[];
  poleSitter: string | null;
  fastestLap: string | null;
};

export type DriverForm = {
  driver: string;
  team: string;
  /** Last 6 race finishing positions, oldest to newest. */
  last6Positions: number[];
};

export type DriverStanding = {
  position: number;
  driver: string;
  team: string;
  points: number;
  wins: number;
};

export type TeamStanding = {
  position: number;
  team: string;
  points: number;
  wins: number;
};

export type QuickStoryTag =
  "Momentum" | "Strategy" | "Drama" | "Standings" | "Results";

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

export type SeasonData = {
  races: Race[];
  driverForm: DriverForm[];
  standings: DriverStanding[];
  teamStandings: TeamStanding[];
};

export type CommunityReaction = "fire" | "agree" | "wild" | "disagree";

export type CommunityComment = {
  id: string;
  author: string;
  favoriteTeam: string;
  body: string;
  createdAtLabel: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  authorRole: "Editor" | "Member";
  favoriteTeam: string;
  category: "Paddock Debate" | "Hot Take" | "Race Chat";
  headline: string;
  body: string;
  createdAtLabel: string;
  reactions: Record<CommunityReaction, number>;
  /** The signed-in viewer's own reaction, if any. Server-computed. */
  myReaction?: CommunityReaction;
  comments: CommunityComment[];
};

export type RaceStoryMomentType =
  "red-flag" | "safety-car" | "penalty" | "collision";

export type RaceStoryMoment = {
  id: string;
  lap: number;
  type: RaceStoryMomentType;
  headline: string;
  detail: string;
  provenance: "Race Control";
};

export type RaceStrategyStint = {
  compound: string;
  lapStart: number;
  lapEnd: number;
};

export type RaceStrategy = {
  driver: string;
  team: string;
  finishPosition: 1 | 2 | 3;
  stints: RaceStrategyStint[];
  pitLaps: number[];
};

export type RaceStory = {
  round: number;
  raceName: string;
  sessionKey: number;
  totalLaps: number;
  classifiedFinishers: number;
  retirements: number;
  winnerGapSeconds: number | null;
  disruptions: number;
  moments: RaceStoryMoment[];
  strategies: RaceStrategy[];
};

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  /** ISO timestamp. */
  publishedAt: string;
  /** The publisher's own short syndicated excerpt — never full article text. */
  excerpt: string | null;
};
