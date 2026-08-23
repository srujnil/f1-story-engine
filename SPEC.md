# F1 Story Engine — Spec

## Purpose

F1 Story Engine is an interactive product that connects **news → decisions →
performance → results** for a Formula 1 season. Instead of a plain results table, it
surfaces the *storylines* underneath the numbers — who's trending up, what strategic
decision shifted a race, how a season is unfolding — in a format quick enough to scan
in 10 seconds or narrate over on a short-form video (Instagram/Reels).

## MVP Scope

Two routes, shipped as separate vertical slices:

### 1. Storyline Hub — `/`
The landing page. Answers "what's the story right now?" at a glance.
- **Momentum Spotlight** (hero): one driver/team currently trending, computed from
  recent race-by-race finishing positions (see Momentum Rule below).
- **Quick Story feed**: 4–6 short narrative cards (headline + 1–3 sentence blurb),
  each optionally tagged (`Momentum`, `Strategy`, `Drama`, `Standings`) and optionally
  linked to a race round.

### 2. Season Timeline — `/seasons/[year]` (default `2026`)
The drill-down view.
- Horizontal, scrollable row of race cards: round number, race name, date, podium
  (top 3: driver + team).
- Click a race card → side panel with expanded detail (poleSitter, fastest lap, full
  podium — mocked for v0).

Both routes: dark theme, mobile-responsive, keyboard-navigable, aria-labeled
interactive elements. No backend, no live API calls in this slice — pure UI over mock
data.

## Momentum Rule (v0)

For each tracked driver, keep their last 6 race finishing positions. Split into two
windows of 3: `recent = positions[3..6]`, `prior = positions[0..3]`. Compute
`avg(prior) - avg(recent)`. The driver with the highest positive delta (biggest drop
in average finishing position = improving) is the Momentum Spotlight.

This is intentionally simple — no weighting, no points, no ML. It's a clear, explain-
on-camera rule we can refine once real data is wired in.

## Data Model (mock, v0)

```ts
// /data/mock-2026-season.ts
type Race = {
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: string; // ISO date
  podium: { position: 1 | 2 | 3; driver: string; team: string }[];
  poleSitter: string;
  fastestLap: string;
};

// /data/mock-momentum.ts
type DriverForm = {
  driver: string;
  team: string;
  last6Positions: number[]; // race-finish positions, oldest → newest
};

// /data/mock-stories.ts
type QuickStory = {
  id: string;
  headline: string;
  blurb: string;
  tag: "Momentum" | "Strategy" | "Drama" | "Standings";
  relatedRound?: number; // links to a Race.round
};
```

All mock data is clearly fictional (not real 2026 results/dates) and labeled as such
in-file, per the "no invented facts presented as real" rule.

## Explicit Non-Goals for MVP

- No user accounts or auth
- No live/current race data or polling
- No infographic image generation or video export (planned for a later slice — data
  model above is kept clean so it *can* feed an export pipeline later, but no
  generation work happens now)
- No predictions/betting angle
- Single season only (2026), no season switcher yet
- No search/filter/sort on the timeline

## Tech Stack

- Next.js 15 (App Router), TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui for primitives (Base UI headless components under the hood)
- Recharts (reserved for later — standings/trend charts, not needed for this slice)
- ESLint + Prettier
- Deploy target: Vercel (free tier)

## Real Data (post-MVP, Step 6+)

Planned source: **Jolpica F1 API** (free, no API key, community-maintained successor
to the retired Ergast API) for race schedules/results/standings. It has no narrative
layer — "Quick Story" blurbs stay human/editorially written even after real data
lands; only the factual scaffolding (races, positions, podiums) comes from the API.

## Constraints

- Everything free-tier friendly (Vercel free, Supabase free if/when a DB is needed,
  no paid APIs)
- No secrets or API keys committed
- Accessibility: keyboard-navigable, aria labels on interactive elements
