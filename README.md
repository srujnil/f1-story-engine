# F1 Story Engine

An interactive F1 web product that connects news → decisions → performance →
results. See [`SPEC.md`](./SPEC.md) for full product scope and
[`CLAUDE.md`](./CLAUDE.md) for tech/process conventions.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Storyline Hub, or
[http://localhost:3000/seasons/2026](http://localhost:3000/seasons/2026) for the
Season Timeline.

## Status: Broadcast Hub v1 (real race data)

- `/` — broadcast-style Hub with live KPIs, switchable driver/team standings,
  interactive form chart, and factual recent-result feed
- `/seasons/[year]` — full schedule and completed results, with upcoming race states
  plus a selectable archive of pivotal Race Control events and podium tyre strategy
- `/community` — real, persisted shared paddock (Supabase Auth + Postgres): team
  filters, reactions, and comments. Reading is public; posting needs a magic-link
  email sign-in
- `/car-explorer` — sourced, rotatable 3D car-parts explainer with accessible
  hotspots and selector controls; the licensed fan-made model is not a real
  team's technical design

Race data comes from the free Jolpica F1 API and is fetched server-side, paginated,
and cached for one hour. The files in `/data/mock-*.ts` remain development fixtures
only and are not used by the live routes.

The selected completed race is enriched from OpenF1 historical data after the live
session window. Use `?story={round}#race-story` to share a specific breakdown.
Race Control events, pit stops, tyre stints, and result metrics are cached for one
hour; the base timeline still works if this enrichment is unavailable.

## Project structure

```
/app          — routes (Next.js App Router)
/components   — shared React components
/lib          — business logic, and server-only Jolpica/OpenF1/Supabase adapters
/data         — clearly labeled development fixtures
/types        — shared TypeScript types
/supabase     — schema.sql (tables, RLS, rate limits, grants, seed data)
```

## Environment variables

Copy `.env.example` to `.env.local`. The Jolpica/OpenF1 vars are optional
(code has defaults); `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for Community sign-in/persistence
to work — get them from your Supabase project's Settings → API.

Schema setup: run `supabase/schema.sql` once in your project's SQL Editor
(creates tables, RLS policies, rate-limit triggers, required GRANTs, and seeds
the starter discussion posts).

## Data behavior

- Jolpica requires a custom user agent; API calls therefore stay server-side.
- Results are fetched in 100-item pages and merged by round because pagination can
  split one race's grid across pages.
- The one-hour cache protects Jolpica's free rate limit. This product is not a live
  timing screen, so that freshness tradeoff is intentional.

## Visual system

- Outfit for display headlines; Geist for body copy.
- Racing red, electric blue, amber, and violet communicate different stat types.
- Recharts powers the selectable six-race driver-form visualization.
- Pure-white editorial canvas with light navigation, flat pastel KPI and result
  cards, and crisp white data panels—no decorative gradients or glows.
- Standings and completed race cards use team-specific colour accents.
