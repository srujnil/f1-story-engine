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
- `/community` — shared-paddock prototype with team filters, reactions, and local
  demo comments; interactions are non-persistent until auth and moderation land
- `/car-explorer` — sourced, conceptual 2026 car-parts explainer with accessible
  interactive hotspots; it is not a real team's technical design

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
/lib          — business logic and the server-only Jolpica adapter
/data         — clearly labeled development fixtures
/types        — shared TypeScript types
```

## Environment variables

No environment variables are required. Copy `.env.example` to `.env.local` only
if you need to override the default Jolpica base URL.

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
