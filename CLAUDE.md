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
npm run make:black-wordmarks # regenerate black copies of song-title/logo wordmarks (public/images/black/) after changing one
npm run bake:engraving # re-bake the rock's "Hola, this is Delix" decal after changing the model or components/engravingConfig.json
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
`components/CosmicVoyage.tsx` is the homepage's main component; it orchestrates state and layout only. The page tells the story in order: **portal** (3D rock fly-in) → **OriginFile** (who DELIX is: sole survivor of a lost galaxy, now on Earth) → **planets** (the songs DELIX wrote *on Earth* — not memories of the lost world) → **signal tools** game (unlock the locked songs). The portal and planet sections are separate sticky sections mapped onto one shared voyage-progress scale (portal 0→0.2, planets 0.14→1), so `flightPaths` ranges and other timing constants are on that scale. Its pieces live in `components/cosmic-voyage/`:
- `data.ts` — static data: `signalTools`, `flightPaths`, `starField`, related types
- `DustField.tsx` — the homepage's fixed star-dust background (canvas, 3 parallax layers, ~3.5k grains) behind every section, and the source of the grains for `ParticleTitle` formations; same grains as `RockDust`, so the dust runs unbroken from the rock to the planet titles
- `VoyagePlanet.tsx` — planets during the flight-through phase (the tools/keys deliberately appear only in the game section, not among the planets)
- `ParticleTitle.tsx` + `dustFormations.ts` — the planet card's song title made of the background star dust: ParticleTitle samples the wordmark's shape (from `titleImageDark`'s alpha) and registers a formation; `DustField` pulls nearly all its grains out of the sky into the letters (only ~110 stay behind) (stir → gather → alive: wobble, wave, escaping grains → fly back home), all on scroll progress so it reverses. No extra particles are added for titles. The card has no background. Static white wordmark under reduced motion. Not used for the "Earth life was strange" intro — tried, unreadable for that long a script line
- `LockedSignalAlert.tsx` — pop-up when a locked planet is clicked (key required, keys recovered, jump to the game)
- `SongUnlockedAlert.tsx` — pop-up after a tool is recovered, showing the song it unlocked (derived from the tool; opened by the `collectedTools` effect in CosmicVoyage)
- `AlbumCompleteFinale.tsx` — shown instead of SongUnlockedAlert when the last tool is recovered: full album tracklist + "play the whole album"
- `SignalToolsSection.tsx` — the whole game chapter: tool buttons (slot positions clear of the card's label/pressure bar), the chase game, and `SignalSlots`
- `SignalToolButton.tsx` / `PocketRecoveryGame.tsx` — the signal-tools section and its chase mini-game (canvas-based, imperative render loop)
- `ProgressGates.tsx` — `Model3DGate` (pauses the 3D model's render loop off-phase) and `PhaseWarning` (bottom-center hand-lettered phase tag + playful quip, one phase set per section; in the planet section a 5-star song track lights up as each planet arrives — hollow rings for locked songs), both isolated so per-frame scroll updates don't re-render the whole tree

`components/Planet.tsx` is a generic fallback planet visual, only used when a song has no `planetImage` (currently none — every song in `albumData` sets one).

### Viewport heights
Use `svh` (`h-svh`, `h-[260svh]`, …), not `vh`/`h-screen`, for full-screen sticky panels, scroll-section lengths and things anchored to the viewport bottom. On mobile Safari `vh` is the *large* viewport (address bar hidden), so `100vh` panels get cut off and bottom-anchored UI slides under the toolbar; `svh` is stable and always fully visible.

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
- **3D:** `@react-three/fiber` + `@react-three/drei` (see `Model3DViewer.tsx`; `RockDust.tsx` is the star-dust ring around the rock — kept outside the camera's hold distance so it never covers the engraving)
- **Animation:** Framer Motion (scroll-linked transforms throughout `CosmicVoyage`), GSAP, tsparticles
- **Testing:** Vitest, @testing-library/react
- **Lint:** ESLint flat config (`eslint.config.mjs`)

## Notes for future work

- `app/api/subscribe/route.ts` and `hooks/useEmailSubscription.ts` are currently orphaned (no caller) — either wire them up or remove them.
- No product analytics/event tracking yet — there's no way to see unlock-funnel drop-off (how many visitors collect all 4 signal tools, where they quit).
- No mobile-specific QA has been done; the scroll-jacked homepage and the pointer-drag chase mini-game are both worth testing on real touch devices.
