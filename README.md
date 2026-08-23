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

## Status: v0 (mock data only)

- `/` — Storyline Hub: momentum spotlight + quick story feed
- `/seasons/[year]` — Season Timeline: horizontal race cards, click for detail

No backend, no live API calls yet. All data in `/data/mock-*.ts` is fictional —
see the header comment in each file.

## Project structure

```
/app          — routes (Next.js App Router)
/components   — shared React components
/lib          — pure logic (e.g. momentum calculation)
/data         — mock data for now; real API client lands in Step 6
/types        — shared TypeScript types
```

## Environment variables

Copy `.env.example` to `.env.local`. Nothing is required for v0 — see the file for
what's planned for real-data integration.
