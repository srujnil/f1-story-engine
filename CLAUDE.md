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

- Next.js 16 (App Router), TypeScript (strict mode)
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
- **Community Paddock v1 (persistent)**: `/community` is real now — Supabase Auth
  (magic-link email only, no password/OAuth yet) + Postgres. Reading is public;
  reacting/commenting requires sign-in. Schema/RLS/rate-limits/GRANTs live in
  `supabase/schema.sql`, applied by hand via the SQL Editor (no migrations tooling
  in v0). A Postgres trigger auto-creates a `profiles` row on signup.
- **Supabase client architecture**: `lib/supabase/client.ts` (browser, singleton),
  `lib/supabase/server.ts` (fresh per-request, wired to `next/headers` cookies),
  `proxy.ts` (session refresh — see "Next.js 16 rename" below). `lib/community.ts`
  is the server-only adapter that shapes DB rows into the existing `CommunityPost`
  UI types, same pattern as `lib/jolpica.ts`.
- **RLS + GRANTs, not RLS alone**: this Supabase project has "Automatically expose
  new tables" turned off deliberately (tighter default access). That means RLS
  policies alone 42501 with "permission denied" — Postgres needs the matching
  `GRANT` to `anon`/`authenticated` first. Both live together in
  `supabase/schema.sql`; if a new table is added, it needs both.
- **PostgREST embed ambiguity**: `reactions` has FKs to *both* `posts` and
  `profiles`, so a naive `posts.select('*, profiles(...)')` fails with "more than
  one relationship was found" (PostgREST also sees `posts → reactions → profiles`
  as a candidate path). Nested embeds must name the exact FK constraint, e.g.
  `profiles!posts_author_id_fkey`.
- **Persistent community guardrails**: no `update`/`delete` RLS policy on
  posts/comments/reactions in v0 — removal happens via the Supabase dashboard
  (service role bypasses RLS), which is the entire v0 "admin" story. `reports` has
  no `select` policy for the same reason. Rate limits (5 posts/10min, 20
  comments/10min per user) are a Postgres `before insert` trigger, not an external
  service. Editor-authored prompts are nullable-`author_id` seed rows with a
  display-name override, not real auth users. Separate team rooms, DMs, media
  uploads, followers, and a custom moderation UI are deferred.
- **`data/mock-community.ts` demoted**: dev fixture only now, not imported by the
  live route — its content became the SQL seed data in `supabase/schema.sql`
  instead, per the existing "live routes never import mocks" rule.
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
  (credited in the page-bottom source footer, required by the license). The as-downloaded model was ~48MB /
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
- **Car showcase motion**: the white-studio model auto-rotates slowly only while
  at least 25% of its stage is visible. The first OrbitControls drag or zoom marks
  the scene as user-controlled and disables showcase rotation for that component
  visit; damping keeps the handoff smooth.
- **Car Explorer learning labs**: the page also includes an interactive five-type
  tyre lab (Soft, Medium, Hard, Intermediate, Full Wet) sourced from Pirelli's
  current F1 terminology, plus a lightweight CFD-inspired airflow visual. Tyre
  bars are relative educational profiles, not measured data. The airflow panel is
  a conceptual React Three Fiber particle visual, never an engineering simulation.
  It clones the existing GLTF scene so the two canvases do not re-parent one Three.js
  object, uses authored Catmull-Rom flow paths and instanced path-aligned streaks, supports
  side/top/front/floor cameras plus layer and playback controls, lowers particle
  density on small screens, and starts paused when reduced motion is preferred.
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
- **Next.js 16 rename**: `middleware.ts` is deprecated in favor of `proxy.ts`
  (function renamed `middleware` → `proxy` too). Confirmed against
  `node_modules/next/dist/docs/.../proxy.md`, not assumed — this repo's build
  warns loudly if the old name is used.
- **Welcome v1**: `/welcome` is a personal scroll-story landing page, separate
  from the `/` dashboard. Reuses `f1-car.glb` in a new dark hero (passive
  auto-rotate only, no OrbitControls) via the same `dynamic(..., {ssr:false})`
  boundary pattern as Car Explorer (`components/welcome/hero-canvas.tsx` /
  `hero-scene.tsx`). `components/welcome/scroll-reveal.tsx` is a small reusable
  `IntersectionObserver` fade-in, reduced-motion aware from the start via a
  lazy `useState` initializer (not a `setState`-in-effect, which this repo's
  ESLint config flags as an error).
- **`.motorsport-pattern` is light-mode-tuned**: its SVG strokes are near-black
  at low opacity, so it's invisible on a dark background as-is. Fixed on
  `/welcome` with an isolated decorative layer (`invert` CSS filter applied
  only to that layer, not to the text content sharing the section).
- **Reused-asset license discipline**: any page that reuses `f1-car.glb` needs
  its own copy of the CC BY 4.0 attribution footer — it's per-page, not
  automatic just because the asset is already licensed for Car Explorer.
- **`/` is now Welcome, dashboard is `/hub`**: the site's actual front door is
  the scroll-story page — anyone who gets the bare link lands there first.
  Every internal `href="/"` was audited and updated when this moved.
- **r3f rotation-pivot bug, fixed**: rotating a `<group>` spins it around its
  *own local origin*, not around the mesh's visual center. `f1-car.glb`'s
  local origin sits well past one end of the car (its local z-span is
  [-5.24, -0.45] — nowhere near 0), so a naive `group.rotation.y` spin looked
  like the car fishtailing around its nose instead of a clean turntable. Fix:
  offset the inner `<primitive>` by `-MODEL_CENTER` so the model's true
  center lands on the group's origin, then position the *group* wherever it
  needs to sit in world space. Check this any time a model's local origin
  isn't obviously at its geometric center.
- **Hero is now a bounded box, not a full-bleed absolute layer**: it used to
  be `absolute inset-0` across the entire viewport-height hero section,
  overlapping content below it that scrolls past. That's the likely cause of
  a white-flash/render-glitch report while scrolling — large WebGL canvases
  positioned absolute-over-scrolling-content are a known compositor risk
  category. Fixed by containing the Canvas to a fixed-size, centered box
  (`h-[420px] sm:h-[540px]`, `max-w-4xl`) sitting in normal document flow
  under the headline, confirmed glitch-free afterward. Car is also centered
  under the headline now (was offset beside it in a side-by-side layout).
- **Debugging gotcha for this hero**: the camera in `hero-scene.tsx` has no
  explicit `lookAt`/target — react-three-fiber's default camera happens to
  aim roughly at the world origin, which is *not* exactly `MODEL_CENTER`.
  Screenshot-based framing checks are also unreliable if the preview
  viewport is shorter than the box being tested — always size the test
  viewport taller than the box before judging 3D framing off a screenshot,
  or you'll debug a false "too zoomed in" crop that's really just a
  viewport-height mismatch.
- **Frame the hero car against its worst-case rotation footprint, not one
  snapshot**: it auto-rotates a full 360°, and different angles project very
  different apparent widths to a fixed camera — a broadside view is much
  wider than a nose-on one. An earlier pass looked fine at whatever angle it
  happened to be at during a screenshot, then clipped on the live site at
  other angles. Fixed by computing the actual worst case: local bbox
  half-extents x:0.825, y:0.48, z:2.395 → since rotation is Y-axis only, the
  horizontal sweep radius is `sqrt(x² + z²) ≈ 2.53`, and camera
  distance/`CAR_SCALE` are sized to keep ~15-20% margin beyond that at every
  angle — verified by sampling screenshots across an actual rotation sweep
  (nose-on, three-quarter, broadside, rear), not just the resting pose.
  Still clipped on one side on the live site after that fix — the real bug:
  the camera had no explicit `lookAt`, relying on react-three-fiber's
  implicit default aim (never verified, just assumed). A one-sided
  clip is exactly the symptom of a camera aimed slightly off-target, not a
  sizing problem. Fixed properly with a `CameraRig` component
  (`hero-scene.tsx`) that explicitly `camera.lookAt(MODEL_CENTER)` and
  computes distance dynamically from the actual canvas aspect ratio
  (`useThree().size`, recomputed on resize) rather than a hand-tuned number
  per breakpoint — removes the guesswork entirely instead of iterating on it
  a third time.
- **Scroll-reveal made more robust**: `threshold: 0.3` needed 30% of an
  element visible before firing, which a fast scroll can blow past without
  ever satisfying — permanently stuck at `opacity-0`. Verified the reveal
  state itself was never the bug (once triggered it stays revealed; tested
  scroll up/down/up, opacity stayed 1 throughout) — the trigger just
  sometimes never fired at all. `scroll-reveal.tsx` now uses `threshold: 0`
  with a `-10%` bottom `rootMargin` (fires almost immediately), plus a
  mount-time `getBoundingClientRect()` fallback that reveals immediately if
  the element is already on-screen when the observer attaches.
- **`rss-parser` doesn't use `fetch`** — it uses Node's raw `http`/`https`
  modules internally, so Next's `next: { revalidate }` Data Cache (which
  only patches global `fetch`) doesn't apply to `parser.parseURL()`. Fixed
  by fetching the XML ourselves via `fetch()` (caching + a custom
  `User-Agent`) and handing the text to `parser.parseString()` instead —
  see `lib/news.ts`. Check this same thing before caching any future
  non-fetch-based library call the same way.
- **News feeds verified live before adding**: PlanetF1 and Autosport RSS
  URLs were fetched and inspected directly, not assumed from search results
  or memory — confirmed valid RSS 2.0 with the expected item fields.
  RaceFans' guessed feed URL 403'd and was left out rather than guessed at
  further; `NEWS_FEEDS` in `lib/news.ts` takes an array, so adding a
  confirmed-working source later is a one-line change.
- **News cards never reproduce full article text** — headline + the
  publisher's own short syndicated excerpt (`contentSnippet`) + source +
  link to the original only. Full-text scraping would be reproducing
  someone else's copyrighted writing, not aggregating news.
- **`force-dynamic` was silently defeating every `next: { revalidate }`
  fetch cache** on `/hub`, `/updates`, `/community`, `/seasons/[year]` —
  it also sets `fetchCache = "force-no-store"` for the whole route,
  overriding every per-fetch revalidate window in `lib/openf1.ts`,
  `lib/jolpica.ts`, `lib/news.ts`. Measured on production before touching
  anything: `/updates` ~12.8s, `/seasons/2026` ~2.7s, every single load.
  Removed it — these routes still render dynamically anyway because
  `NavBar` calls `supabase.auth.getUser()` (reads cookies) on every page.
- **Removing `force-dynamic` alone didn't fix it** — production stayed at
  the same ~13s/~3s after that deploy. Root cause #2: Next's default
  `fetchCache: "auto"` only honors a fetch's own cache option when that
  fetch runs *before* a Request-time API in the render — `NavBar`'s cookie
  read happens first, so every data fetch on these pages was still being
  forced to `no-store` regardless of `next.revalidate`. Fixed by adding
  `export const fetchCache = "default-cache"` to `hub/page.tsx`,
  `updates/page.tsx`, `seasons/[year]/page.tsx` — it still honors whatever
  cache option a fetch explicitly asks for, it just stops Next silently
  overriding it. (Source: Next's own bundled
  `caching-without-cache-components.md` docs, not assumed.)
- **`lib/openf1.ts`'s rate limiter was throttling cache hits too**: root
  cause #3, and the dominant one for `/updates`. `fetchOpenF1` ran a global
  `waitForRequestSlot()` (360ms min spacing, to respect OpenF1's real rate
  limit) *unconditionally* before every call — including calls that were
  already cached and never touched the network. `/updates` fans out to
  ~35 `fetchOpenF1` calls (5 races × 7 endpoints via `getRaceStory`), so a
  fully warm cache still cost 35 × 360ms ≈ 12.6s. Plain `fetch()` +
  `next.revalidate` can't fix this on its own (no way to know it's a cache
  hit before paying the queue delay); switched the raw fetch+rate-limit
  logic to be wrapped in `unstable_cache` (keyed by path) instead — on a
  cache hit, the wrapped function never runs at all, so the rate limiter
  never runs either. `unstable_cache` also isn't subject to the
  before/after-cookies() restriction above. Verified locally: cold ~1.6s
  (down from ~12.6s), warm ~0.02s; confirmed live on production too
  (first hit after deploy ~14s, then 2s → 0.8s → 0.7s as cache warms).
- **Nav bar had no responsive collapse** — logo + all 6 links + sign-in in
  one non-wrapping row overflowed past the viewport on any window narrower
  than ~900px, pushing the *entire page* into horizontal scroll (confirmed
  via `document.documentElement.scrollWidth` > `clientWidth`). Fixed by
  giving just the link row its own `overflow-x-auto` container (logo and
  sign-in/out stay `shrink-0` outside it, always visible) plus a
  `.no-scrollbar` utility in `globals.css` so it reads as a tab strip, not
  a visible scrollbar. Deliberately not a hamburger menu — contained
  horizontal scroll was the agreed-on minimal fix for now.
- **Grid CTA buttons need an explicit `justify-self`** — a `sm:`/`lg:
  grid-cols-[1fr_auto]` pattern (used for text+button rows, e.g. the
  Community Paddock CTA on `/hub`) falls back to a single grid column below
  its breakpoint, and CSS grid's default `justify-items: stretch` stretches
  an `inline-flex` `<Link>` to the full column width — a button that looks
  broken, not just narrow. Always pair that pattern with
  `justify-self-start` on the button. The Hub CTA had also drifted to a
  `lg:` breakpoint while the identical pattern in
  `car-explorer/airflow-lab.tsx` used `sm:` — match `sm:` unless there's a
  reason not to.

@AGENTS.md
