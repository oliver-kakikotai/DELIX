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

// Bottom-center phase "warning tag": caution-tape stripes either side of the
// phase name, plus a tongue-in-cheek line underneath. Isolated (like
// Model3DGate) so per-frame scroll updates only re-render this small piece,
// and only when the phase actually changes.
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

const phaseIndexAt = (set: PhaseSet, p: number) =>
  PHASE_SETS[set].findIndex((ph) => p < ph.until);

export function PhaseWarning({ progress, phaseSet }: { progress: MotionValue<number>; phaseSet: PhaseSet }) {
  const [index, setIndex] = useState(() => phaseIndexAt(phaseSet, progress.get()));
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = phaseIndexAt(phaseSet, latest);
    setIndex((prev) => (prev === next ? prev : next));
  });
  const phase = PHASE_SETS[phaseSet][index];

  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center">
      {/* key → remounts on phase change, replaying the blink-in animation */}
      <div key={phase.name} className="hazard-tag-flash flex items-center justify-center gap-2.5">
        <span aria-hidden="true" className="hazard-stripes h-2.5 w-9" />
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.38em] text-white/70">
          {phase.name}
        </span>
        <span aria-hidden="true" className="hazard-stripes hazard-stripes-reverse h-2.5 w-9" />
      </div>
      <p className="mt-1.5 text-[9px] lowercase tracking-[0.24em] text-white/36">{phase.quip}</p>
      <div className="mx-auto mt-3 h-10 w-px overflow-hidden bg-white/10">
        <motion.div
          className="h-5 w-px bg-white/80"
          animate={{ y: [-20, 44] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
