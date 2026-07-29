# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DELIX** is an interactive album-archive site for the Runaway Rabbit IP, built with Next.js 15 (App Router) + TypeScript. The homepage (`CosmicVoyage`) is a single scroll-driven experience: songs appear as planets you fly past, locked songs are unlocked by collecting "signal tools" via a canvas chase mini-game, and each song has its own lyrics/detail page.

## Development Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build         # production build
npm run start         # start production server
npm run lint          # ESLint (next/core-web-vitals + next/typescript)
npx tsc --noEmit      # type check
npm test              # run tests once (Vitest)
npm run test:watch    # Vitest watch mode
```

**Development URL:** http://localhost:3000

CI (`.github/workflows/ci.yml`) runs `tsc → lint → test → build` on every push/PR to `main`.

## Architecture

### Routes
- `app/page.tsx` — homepage: `Navigation` + `CosmicVoyage` + `Footer`
- `app/song/[slug]/page.tsx` — per-song page (lyrics, unlock status), driven by `data/albumData.ts`
- `app/api/subscribe/route.ts` — email subscribe endpoint; not currently called from any UI (the form/hook that used to call it, `hooks/useEmailSubscription.ts`, isn't wired to a page)
- `app/layout.tsx` mounts the global providers plus `GlobalAudioPlayer`, which renders on every route

### CosmicVoyage
`components/CosmicVoyage.tsx` is the homepage's main component; it orchestrates state and layout only. Its pieces live in `components/cosmic-voyage/`:
- `data.ts` — static data: `signalTools`, `flightPaths`, `starField`, related types
- `VoyagePlanet.tsx` / `VoyageToolBeacon.tsx` — planets/tools during the flight-through phase
- `SignalToolButton.tsx` / `PocketRecoveryGame.tsx` — the signal-tools section and its chase mini-game (canvas-based, imperative render loop)
- `ProgressGates.tsx` — `Model3DGate` (pauses the 3D model's render loop off-phase) and `PhaseLabel`, both isolated so per-frame scroll updates don't re-render the whole tree

`components/Planet.tsx` is a generic fallback planet visual, only used when a song has no `planetImage` (currently none — every song in `albumData` sets one).

### Contexts (all provided in `app/layout.tsx`)
- `AudioContext` — playback state for `GlobalAudioPlayer`; all exposed methods are memoized with `useCallback` so consumers (e.g. the song page's effects) don't re-fire on every `currentTime` tick
- `UnlockContext` — song/tool unlock logic, persisted to `localStorage`; collected tools intentionally reset each session (so the chase mini-game replays) while unlocked songs persist. Unlock is intentionally binary: `auto` (the one free starter song) or `manual` (collect the matching signal tool) — there's no listen-time/click-count/etc. tracking, so don't reintroduce it without a product reason.

The site is English-only by design (no i18n) — don't reintroduce a language switcher or multi-locale content without checking with the project owner first; it was deliberately removed.

### Data
`data/albumData.ts` defines the album/song list, including each song's `unlockCondition` (`auto` or `manual`).

### Testing
Vitest + React Testing Library (`vitest.config.ts`, jsdom environment). Tests focus on logic, not animation/visual rendering:
- `data/albumData.test.ts` — data integrity, helper functions
- `contexts/UnlockContext.test.tsx` — unlock/collect logic via `renderHook`

### Images
All images go through `next/image`. Large/variable-size visuals use `fill` + `sizes`; fixed-size icons pass explicit `width`/`height`. Don't reintroduce raw `<img>` tags.

## Technology Stack

- **Framework:** Next.js 15.5.x, App Router
- **Language:** TypeScript 5.x, strict mode, `@/*` path alias to repo root
- **Styling:** Tailwind CSS 4.x
- **3D:** `@react-three/fiber` + `@react-three/drei` (see `Model3DViewer.tsx`)
- **Animation:** Framer Motion (scroll-linked transforms throughout `CosmicVoyage`), GSAP, tsparticles
- **Testing:** Vitest, @testing-library/react
- **Lint:** ESLint flat config (`eslint.config.mjs`)

## Notes for future work

- `app/api/subscribe/route.ts` and `hooks/useEmailSubscription.ts` are currently orphaned (no caller) — either wire them up or remove them.
- No product analytics/event tracking yet — there's no way to see unlock-funnel drop-off (how many visitors collect all 4 signal tools, where they quit).
- No mobile-specific QA has been done; the scroll-jacked homepage and the pointer-drag chase mini-game are both worth testing on real touch devices.
