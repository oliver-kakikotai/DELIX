'use client';

import { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent } from 'framer-motion';
import Model3DViewer from '../Model3DViewer';

// Keeps the WebGL portal model's render loop paused whenever the voyage has
// scrolled past the portal phase, instead of leaving it rendering every frame
// for the whole 560vh scroll journey. Isolated in its own component so the
// per-frame scroll updates only re-render this small gate, not all of
// CosmicVoyage.
export function Model3DGate({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    // The portal section's progress tops out at 0.2 (the rock is fully
    // faded by then) and stays there while the rest of the page scrolls,
    // so pause just before it — otherwise the WebGL loop would keep running
    // for the whole page.
    const next = latest < 0.195;
    setActive((prev) => (prev === next ? prev : next));
  });
  return <Model3DViewer modelPath="/models/hitem3d.glb" className="relative z-10" autoRotateSpeed={1.1} active={active} progress={progress} />;
}

// Bottom-center phase tag: the phase name hand-lettered (same script as the
// song wordmarks), a quip underneath and, in the planet section, a 5-star
// track — one star per song — that lights up as each planet is passed.
// Isolated (like Model3DGate) so per-frame scroll updates only re-render this
// small piece, and only when the phase or current planet actually changes.
// The portal and the planet voyage are separate pinned sections (with the
// origin story between them), each with its own tag.
const PHASE_SETS = {
  portal: [
    { until: Infinity, name: 'Portal', quip: 'unidentified object ahead' },
  ],
  voyage: [
    { until: 0.92, name: 'Planet Approach', quip: 'mind the gravity' },
    { until: 1, name: 'Exit Vector', quip: 'keep ears inside the vehicle' },
    { until: Infinity, name: 'Archive', quip: 'you made it, rabbit' },
  ],
} as const;

type PhaseSet = keyof typeof PHASE_SETS;

/** One star on the song track, in flight order. */
export type TrackStop = { id: number; title: string; unlocked: boolean; arrivesAt: number };

const phaseIndexAt = (set: PhaseSet, p: number) =>
  PHASE_SETS[set].findIndex((ph) => p < ph.until);

// Index of the planet currently on screen (the last one that has arrived),
// or -1 before the first.
const stopIndexAt = (track: TrackStop[], p: number) => {
  let i = -1;
  track.forEach((stop, n) => {
    if (p >= stop.arrivesAt) i = n;
  });
  return i;
};

export function PhaseWarning({
  progress,
  phaseSet,
  track,
}: {
  progress: MotionValue<number>;
  phaseSet: PhaseSet;
  track?: TrackStop[];
}) {
  const [index, setIndex] = useState(() => phaseIndexAt(phaseSet, progress.get()));
  const [stop, setStop] = useState(() => (track ? stopIndexAt(track, progress.get()) : -1));
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = phaseIndexAt(phaseSet, latest);
    setIndex((prev) => (prev === next ? prev : next));
    if (track) {
      const nextStop = stopIndexAt(track, latest);
      setStop((prev) => (prev === nextStop ? prev : nextStop));
    }
  });
  const phase = PHASE_SETS[phaseSet][index];

  return (
    <div className="pointer-events-none absolute bottom-[4svh] left-1/2 z-30 -translate-x-1/2 text-center">
      {/* key → remounts on phase change, replaying the fade-in */}
      <motion.p
        key={phase.name}
        className="whitespace-nowrap font-script text-2xl leading-none text-white/85 md:text-3xl"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {phase.name}
      </motion.p>

      {track && <SongTrack track={track} current={stop} />}

      <p className="mt-2 text-[9px] lowercase tracking-[0.24em] text-white/36">{phase.quip}</p>
      <div className="mx-auto mt-3 h-8 w-px overflow-hidden bg-white/10">
        <motion.div
          className="h-4 w-px bg-white/80"
          animate={{ y: [-16, 36] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// Four-point sparkle, the same shape as the ✦ used around the site.
const SPARKLE = 'M6 0 C6.6 4 8 5.4 12 6 C8 6.6 6.6 8 6 12 C5.4 8 4 6.6 0 6 C4 5.4 5.4 4 6 0 Z';

function SongTrack({ track, current }: { track: TrackStop[]; current: number }) {
  return (
    <ol className="mt-3 flex items-center justify-center" aria-label="Songs passed">
      {track.map((stop, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        return (
          <li key={stop.id} className="flex items-center" aria-current={isCurrent ? 'step' : undefined}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`h-px w-5 transition-colors duration-500 md:w-7 ${reached ? 'bg-white/50' : 'bg-white/12'}`}
              />
            )}
            <span className="sr-only">
              {stop.title}
              {stop.unlocked ? '' : ' (locked)'}
            </span>
            <span aria-hidden="true" className="relative grid h-4 w-4 place-items-center">
              {stop.unlocked ? (
                <svg
                  viewBox="0 0 12 12"
                  className={`transition-all duration-500 ${
                    isCurrent
                      ? 'h-4 w-4 fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]'
                      : reached
                        ? 'h-2.5 w-2.5 fill-white/70'
                        : 'h-2.5 w-2.5 fill-white/20'
                  }`}
                >
                  <path d={SPARKLE} />
                </svg>
              ) : (
                // Locked song: an empty ring — still lights up as you pass it.
                <span
                  className={`block rounded-full border transition-all duration-500 ${
                    isCurrent
                      ? 'h-2.5 w-2.5 border-white/90 shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                      : reached
                        ? 'h-2 w-2 border-white/55'
                        : 'h-2 w-2 border-white/20'
                  }`}
                />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
