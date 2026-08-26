# CLAUDE.md

This file is the source of truth for how we build F1 Story Engine. It's auto-loaded
every session — keep it current as decisions change.

## Purpose

F1 Story Engine is an interactive product that connects **news → decisions →
performance → results** for a Formula 1 season. Rather than a plain results table,
it surfaces the storylines underneath the numbers — who's trending up, what
strategic decision shifted a race, how a season is unfolding — in a format quick
enough to scan in 10 seconds or narrate over on a short-form video. See `SPEC.md`
for full scope.

## Tech Stack

- Next.js 15 (App Router), TypeScript (strict mode)
- Tailwind CSS 4
- shadcn/ui for primitives (this project's shadcn preset builds on Base UI, not
  Radix — same idea, accessible headless components, reuse before hand-rolling)
- Recharts 3 for interactive form and standings visualizations
- ESLint + Prettier
- Node 22, npm as package manager
- Deploy target: Vercel (free tier)

## Folder Conventions

```
/app          — routes (App Router). No src/ directory.
/components   — shared React components, kebab-case filenames
/lib          — pure logic, utilities, and server-only API adapters (no React)
/data         — clearly labeled mock fixtures; live routes must not import them
/types        — shared TypeScript types
```

## Naming Conventions

- Component files: kebab-case (`race-card.tsx`), exported component: PascalCase
  (`RaceCard`)
- Route folders: kebab-case, dynamic segments as `[param]` (Next.js convention)
- Lib/util functions: camelCase (`computeMomentum`)
- Types: PascalCase, singular (`Race`, not `Races`)
- Mock data files: `mock-*.ts`, always with a header comment flagging fictional data

## Commit Style

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
Small commits, one per meaningful chunk of work.

## How We Work Together

1. **Plan before code.** For anything beyond a trivial change, propose a plan
   first, wait for approval, then execute. Use Plan mode.
2. **Small commits.** After each meaningful chunk, suggest a git commit message.
3. **Question assumptions.** If `SPEC.md` contradicts good practice, or a request
   conflicts with the spec, flag it — don't just comply.
4. **No premature optimization.** Ship the ugly working version first, refactor
   later.
5. **Be honest about tradeoffs.** If a library/approach has downsides, say so.
6. **Never invent APIs or data.** If unsure whether a package/API exists or works
   a certain way, check docs or say so explicitly.

## Decisions So Far

- Two routes for v0: `/` is the **Storyline Hub** (landing — momentum spotlight +
  quick story feed), `/seasons/[year]` is the **Season Timeline** (drill-down,
  defaults to 2026).
- **Momentum rule**: average finishing position, last-3-races vs prior-3-races,
  biggest positive delta (improvement) wins. Simple and explainable on camera —
  see `lib/momentum.ts`. No ML, no weighting.
- **Mock data is clearly fictional** — invented driver/team/circuit names, not
  real 2026 results — so nothing in the UI reads as a real factual claim about a
  real person or event.
- **Single hardcoded bright editorial theme** for v1. Both routes use a pure-white
  canvas and light navigation; team colours, electric blue, violet, and pastel
  panels carry the F1 energy while red is reserved for a few meaningful accents.
  Panels use flat colour rather than decorative gradients or glows. A
  user-selectable theme remains deferred.
- **Infographics and video export are explicitly deferred** to a post-MVP slice.
  Data model is kept clean so it _can_ feed an export pipeline later, but no
  generation work happens in v0.
- **Real data source (Step 6+)**: Jolpica F1 API — free, no API key, community
  successor to the retired Ergast API. It has no narrative layer; Quick Story
  blurbs stay human-written even after real data lands.
- **Step 6 real-data architecture**: Jolpica calls are server-only so the required
  custom `User-Agent` can be sent. Schedule/results are cached for one hour;
  paginated result fragments are merged by round before adaptation.
- **Factual quick-result cards** replace fictional stories on the live Hub. These
  are templated summaries of API results, not editorial analysis. Human-authored
  narrative remains a separate future layer.
- **Long-term product direction**: a vibrant, mobile-first F1 community product
  with interactive visual storytelling, creator-friendly 9:16 graphics/video
  modes, personalization, and community participation. These ship as vertical
  slices after the trustworthy real-data foundation.
- **Community Paddock v0**: `/community` launches as one shared paddock with
  favourite-team filters, fictional demo discussions, and client-local reactions
  and comments. The UI explicitly says interactions reset on refresh.
- **Persistent community guardrails**: real posting will require Supabase auth;
  news remains editor-created and sourced, while fan content is labelled discussion
  or hot takes. RLS, reporting, rate limits, and admin removal are launch blockers.
  Separate team rooms, DMs, media uploads, followers, and complex profiles are deferred.
- **Race Story archive v0**: completed races can be selected from a horizontal
  archive or previous/next controls. The shareable `?story={round}` URL defaults to
  the latest completed race, and only that race is enriched server-side with cached
  OpenF1 historical data. Missing enrichment must never break the Jolpica timeline.
- **OpenF1 request discipline**: archive links use `prefetch={false}`; requests are
  paced below 3/second with one `429` retry. Historical null tyre compounds are
  normalized to `UNKNOWN` and shown honestly in the strategy board. A second
  `429` is an expected optional-enrichment miss and must fall back quietly; other
  OpenF1 failures remain genuine errors.
- **Car Explorer v1**: `/car-explorer` upgraded from the SVG diagram to a real
  rotatable 3D model — "2026 F1 CAR EVO-1" by Abu Saif, CC BY 4.0 via Sketchfab
  (credited on-page, required by the license). The as-downloaded model was ~48MB /
  ~5M render vertices across 107 near-anonymous meshes (no per-part names besides
  "FRONT NOSE" and "floor"); `gltf-transform optimize` (weld/join/simplify/meshopt)
  cut it to ~570KB / ~740K vertices before committing it to `public/models/`.
  The optimized asset ships with the app so local and Vercel builds use the same
  file without external storage. Because the model
  has no separate part meshes, the 7 interactive hotspots are positioned in fixed
  3D space (`car-parts.ts`) rather than tied to mesh names, rendered via drei's
  `<Html>` so they track the model through rotation. Camera is framed from the
  model's measured bounding box directly rather than an auto-fit helper. Generic
  car-part explanations and 2026 rule claims must be checked against, and visibly
  link to, current official FIA sources; never present the model as a real team's
  actual car.
- **Known environment gotcha**: a from-scratch `<Canvas>` can render solid black
  even with a correct scene graph, camera, and no console errors — the WebGL
  context creation itself can fail silently under contexts/tabs that have
  accumulated many prior canvases in the same session. Always sanity-check a
  blank r3f canvas in a **fresh browser tab**, not a long-reused one, before
  assuming the scene/model/code is broken.
- **Provenance boundary**: red flags, neutralisations, penalties, collisions, tyre
  stints, and pit laps may be presented as sourced facts. “Strategy mistake,”
  “turning point,” and similar causal judgements require an editor and a source;
  telemetry alone must not be presented as editorial truth.
- **OpenF1 free-tier boundary**: use historical data after the live-session window,
  cache for one hour, and keep the adapter replaceable because OpenF1's stated free
  usage/licensing may not fit a future commercial launch.
- **Circuit selector visuals**: completed-race archive controls use locally stored,
  accurate CC0 circuit outlines plus country flags. The active/hovered/focused
  circuit gets a restrained lap tracer, with reduced-motion respected; full race
  names remain available to assistive technology and tooltips.
- **Broadcast Hub v1**: Outfit is the display face and Geist is the readable body
  face. Red, electric blue, amber, and violet have stable semantic roles across
  live stats; team accents are used for standings/form. The landing page now
  includes live KPIs, season progress, top-five standings, and a selectable
  six-race Recharts form visualization.
- **Leaderboard and light editorial pass**: the Hub fetches live constructor
  standings alongside driver standings. One accessible tabbed panel switches
  between the top five drivers and teams, with team-coloured bars. The Hub uses a
  pure-white canvas, flat pastel KPI and story cards, crisp white data panels,
  restrained shadows, and single-colour rails instead of gradients; completed timeline cards
  use the winner's team accent.
- No `src/` directory — top-level `app/`, `components/`, `lib/`, `data/`, `types/`.
- shadcn/ui `Sheet` component used for the race detail side panel (Base UI
  Dialog under the hood — focus trap, ESC-to-close — comes for free).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
