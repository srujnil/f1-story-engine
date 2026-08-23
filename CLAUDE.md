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
- Recharts (reserved for later trend/standings charts — not used yet)
- ESLint + Prettier
- Node 22, npm as package manager
- Deploy target: Vercel (free tier)

## Folder Conventions

```
/app          — routes (App Router). No src/ directory.
/components   — shared React components, kebab-case filenames
/lib          — pure logic / utilities (no React), e.g. momentum.ts
/data         — mock data for now; will hold API client code later
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
- **Single hardcoded dark theme** for v0. No light/dark toggle yet (deferred —
  would mean pulling in `next-themes` or similar, not needed for this slice).
- **Infographics and video export are explicitly deferred** to a post-MVP slice.
  Data model is kept clean so it *can* feed an export pipeline later, but no
  generation work happens in v0.
- **Real data source (Step 6+)**: Jolpica F1 API — free, no API key, community
  successor to the retired Ergast API. It has no narrative layer; Quick Story
  blurbs stay human-written even after real data lands.
- No `src/` directory — top-level `app/`, `components/`, `lib/`, `data/`, `types/`.
- shadcn/ui `Sheet` component used for the race detail side panel (Base UI
  Dialog under the hood — focus trap, ESC-to-close — comes for free).
