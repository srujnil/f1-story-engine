# F1 Story Engine — Spec

## Purpose

F1 Story Engine is an interactive product that connects **news → decisions →
performance → results** for a Formula 1 season. Instead of a plain results table, it
surfaces the _storylines_ underneath the numbers — who's trending up, what strategic
decision shifted a race, how a season is unfolding — in a format quick enough to scan
in 10 seconds or narrate over on a short-form video (Instagram/Reels).

## Long-term Product Vision

Build a vibrant, mobile-first F1 community experience rather than a static results
site. Later vertical slices will add interactive visual storytelling, driver/team
personalization, community participation, and creator-friendly 9:16 infographic
and video presentation modes. These are the destination, not requirements for the
first real-data release.

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
  podium for completed races; scheduled date and pending state for upcoming races).

Both routes: clean light editorial theme, mobile-responsive, keyboard-navigable, aria-labeled
interactive elements. v0 shipped over mock data; Step 6 now supplies real race data
through server-side Jolpica calls with no database or API keys.

## Momentum Rule (v0)

For each tracked driver, keep their last 6 race finishing positions. Split into two
windows of 3: `recent = positions[3..6]`, `prior = positions[0..3]`. Compute
`avg(prior) - avg(recent)`. The driver with the highest positive delta (biggest drop
in average finishing position = improving) is the Momentum Spotlight.

This is intentionally simple — no weighting, no points, no ML. It's a clear, explain-
on-camera rule we can refine once real data is wired in.

## Data Model

```ts
type Race = {
  season: number;
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: string; // ISO date
  startTime: string | null; // ISO timestamp when available
  status: "completed" | "upcoming";
  podium: { position: 1 | 2 | 3; driver: string; team: string }[];
  poleSitter: string | null;
  fastestLap: string | null;
};

type DriverForm = {
  driver: string;
  team: string;
  last6Positions: number[]; // race-finish positions, oldest → newest
};

type DriverStanding = {
  position: number;
  driver: string;
  team: string;
  points: number;
  wins: number;
};

type TeamStanding = {
  position: number;
  team: string;
  points: number;
  wins: number;
};

type QuickStory = {
  id: string;
  headline: string;
  blurb: string;
  tag: "Momentum" | "Strategy" | "Drama" | "Standings" | "Results";
  relatedRound?: number; // links to a Race.round
};
```

All mock data is clearly fictional (not real 2026 results/dates) and labeled as such
in-file, per the "no invented facts presented as real" rule.

## Community Paddock v1 (persistent)

`/community` graduated from a client-only prototype to real, persisted content
backed by Supabase Auth + Postgres:

- One shared paddock rather than separate empty team rooms.
- Favourite-team filters and team-colour identity.
- Reading is open to everyone; reacting/commenting requires sign-in.
- Auth is magic-link email only (`supabase.auth.signInWithOtp`) — no password, no
  OAuth app registered yet. Signing in auto-creates the account and a `profiles`
  row via a Postgres trigger on `auth.users`.
- Schema, RLS policies, rate-limit triggers, and the required GRANTs (this project
  has "Automatically expose new tables" off, so RLS alone isn't enough — see
  `supabase/schema.sql`'s comments) all live in `supabase/schema.sql`, run by hand
  in the SQL Editor — no migrations tooling yet.
- Public `select` on every table; `insert` gated to the signed-in user's own rows;
  no `update`/`delete` policies on posts/comments/reactions — removal happens via
  the Supabase dashboard for now, which is the entire v0 "admin" story.
- Rate limits: 5 posts / 10 min and 20 comments / 10 min per user, enforced by a
  Postgres trigger, not an external service.
- `reports` table has no `select` policy at all — reports are only visible via the
  dashboard (service role bypasses RLS).
- Editor-authored discussion prompts ("Story Engine Desk") are nullable-`author_id`
  seed rows with a display-name override, not tied to a real auth user — matches
  "News posts are initially editor-created."
- The former mock accounts/discussions in `data/mock-community.ts` are dev
  fixtures only now; the live route never imports them (their content became the
  SQL seed data instead).
- DMs, media uploads, followers, complex profiles, and a custom moderation UI
  remain deferred.

## Explicit Non-Goals for the original results MVP

- No live/current race data or polling
- No infographic image generation or video export (planned for a later slice — data
  model above is kept clean so it _can_ feed an export pipeline later, but no
  generation work happens now)
- No predictions/betting angle
- Single season only (2026), no season switcher yet
- No search/filter/sort on the timeline

## Tech Stack

- Next.js 16 (App Router), TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui for primitives (Base UI headless components under the hood)
- Recharts 3 for interactive driver-form and standings visualizations
- ESLint + Prettier
- Deploy target: Vercel (free tier)

## Real Data (Step 6)

Planned source: **Jolpica F1 API** (free, no API key, community-maintained successor
to the retired Ergast API) for race schedules/results/standings. It has no narrative
layer — "Quick Story" blurbs stay human/editorially written even after real data
lands; only the factual scaffolding (races, positions, podiums) comes from the API.

Implementation decisions:

- Fetch only on the server because Jolpica requires a custom `User-Agent`.
- Cache responses for one hour to stay comfortably inside free-tier rate limits.
- Paginate results at the API maximum of 100 and merge fragments by race round.
- Show both completed and upcoming races; never present missing results as zeroes.
- Generate factual recent-result cards from race data for the live Hub. These are
  not a replacement for future human-authored editorial analysis.

## Broadcast Hub v1

The first post-data visual slice makes the landing page feel like a sports media
product rather than a plain dashboard:

- Outfit display typography with Geist for body copy.
- Semantic racing-red, electric-blue, amber, and violet accents.
- Live cards for championship leader, momentum leader, latest winner, and next race.
- Season progress and top-five driver standings.
- Selectable six-race driver-form chart built with Recharts.
- Responsive hover/selection states with reduced-motion support.
- Live Drivers/Teams leaderboard switcher using driver and constructor standings.
- Pure-white canvas with light navigation and crisp white data panels.
- Flat pastel KPI cards and single-colour story rails; avoid decorative gradients
  and glows so dense race information stays easy to scan.
- Use electric blue, violet, amber, and team colours for energy; reserve racing red
  for a small number of meaningful brand or status accents.
- Team-coloured standings bars and completed-race timeline accents.

## Race Story v0

The first narrative enrichment slice fills the Season Timeline with a selectable
story archive for completed races:

- Server-side OpenF1 historical-data adapter with one-hour caching and graceful
  fallback when enrichment is unavailable.
- Meeting/session matching by season, race name, country, and date.
- Up to six high-signal Race Control moments: red flags, Safety Car/VSC periods,
  penalties, and collision rulings.
- Podium strategy board showing recorded tyre stints and post-restart pit laps.
- Factual race-pulse metrics: race distance, disruption count, retirements, and
  winning margin.
- Every automated moment is labelled `Race Control`; strategy is labelled as
  recorded data, not an assessment of whether a call was good or bad.
- The enriched race card links through its detail drawer to the full story, and the
  story links to Community Paddock discussion.
- A horizontally scrollable archive bar and previous/next controls select one
  completed race at a time. Selection is stored in the shareable `?story={round}`
  URL and defaults to the latest completed race.
- Archive links disable Next.js prefetch so opening the page does not silently load
  every race's enrichment. The selected race automatically scrolls into view.
- OpenF1 requests are paced below the documented free limit and retry once after a
  `429`; missing historical tyre compounds are shown as `UNKNOWN` rather than
  crashing the page.

Free-tier boundary: OpenF1 historical data becomes free outside its live-session
window, so Race Story v0 is post-race rather than live timing. Strategy mistakes,
turning-point judgements, and sourced news remain an editorial layer; the app must
not generate those claims from telemetry alone.

## Car Explorer v1

`/car-explorer` is an interactive educational slice built around the licensed,
fan-made “2026 F1 Car EVO-1” model by Abu Saif (CC BY 4.0):

- The optimized model is bundled with the app so local and deployed builds use
  the same free-tier-friendly asset without external storage.
- Users can rotate and zoom the model, then select seven broad car systems through
  accessible 3D hotspots or keyboard-friendly selector controls.
- The studio model slowly auto-rotates as a showcase while it is visible, then
  permanently hands camera control to the user after their first drag or zoom.
- A white studio stage, colour-coded markers, and a compact part detail card keep
  the experience clear without implying a real team livery.
- Model attribution, licence, and official FIA regulation sources remain visibly
  linked in a minimal source footer at the bottom of the page, keeping the studio
  stage visually clean without hiding required credit.
- The model is explicitly presented as a fan-made concept, never a real team's
  technical design. An explode view and team-specific geometry remain deferred.
- An interactive tyre strategy lab covers the weekend-labelled Soft, Medium, Hard,
  Intermediate, and Full Wet compounds using current official Pirelli terminology.
  Relative trait profiles are educational rather than live telemetry because tyre
  performance changes with the nominated compound, circuit, car, and conditions.
- A React Three Fiber wind-tunnel lab reuses a cloned instance of the concept car
  with lightweight, path-aligned glowing streaks following authored aerodynamic paths. Side,
  top, front, and floor cameras combine with speed, streamline, pressure-zone,
  turbulence, pause, and reset controls. It is explicitly labelled as an
  illustration, not engineering simulation data, reduces particle density on small
  screens, and starts paused for users who prefer reduced motion.

## Welcome v1 (scroll-story landing page)

`/` is a personal introduction/manifesto page — the site's actual front door, so
anyone who gets the link lands here first. The live-data dashboard (formerly `/`)
moved to `/hub`; every internal link that used to point at `/` was updated:

- Full-viewport dark hero: the same licensed `f1-car.glb` from Car Explorer,
  reused in a new dark/cinematic lighting setup (red + electric-blue rim lights,
  no white studio) — slow passive auto-rotation only, no drag/zoom controls, since
  this is a hero moment, not an explorer.
- A scroll-revealed story (`components/welcome/scroll-reveal.tsx`, a small
  reusable `IntersectionObserver` fade/slide wrapper) walks through the product
  pitch, ending in a credit line and a personal dedication.
- `.motorsport-pattern`'s strokes are tuned for the light Car Explorer page and
  are invisible on a dark background undoctored — inverted via CSS `filter` on
  an isolated decorative layer so the text content isn't also inverted.
- Reduced motion is respected in both the hero rotation and the scroll reveals,
  matching every other animated piece in the app.
- The CC BY 4.0 attribution footer required for the reused model is carried onto
  this page too, not just Car Explorer.
- A closing CTA links back into `/` so the page doesn't dead-end for a first-
  time visitor.

## Updates v1 (Race Control feed + RSS news)

`/updates` answers "what's happening right now" with two independently-
failing sections:

- **Race Control** reuses `lib/openf1.ts`'s existing per-race pipeline (no
  new OpenF1 calls) across the last 5 completed races instead of one
  selected race — real penalties, flags, and safety cars, not invented ones.
- **Latest news** aggregates RSS from PlanetF1 and Autosport (confirmed live,
  valid RSS 2.0 feeds by fetching them directly, not assumed — RaceFans'
  feed 403'd and was left out). Cards show headline + the publisher's own
  short syndicated excerpt + source + a link to the original article —
  never full article text, which would be reproducing someone else's
  copyrighted writing rather than aggregating it.
- Each section fetches and fails independently; one source being down never
  takes the other section with it.

## Constraints

- Everything free-tier friendly (Vercel free, Supabase free if/when a DB is needed,
  no paid APIs)
- No secrets or API keys committed
- Accessibility: keyboard-navigable, aria labels on interactive elements
