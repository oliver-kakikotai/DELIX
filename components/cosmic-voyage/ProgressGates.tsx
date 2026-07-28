'use client';

import { useState } from 'react';
import { MotionValue, useMotionValueEvent } from 'framer-motion';
import Model3DViewer from '../Model3DViewer';

// Keeps the WebGL portal model's render loop paused whenever the voyage has
// scrolled past the portal phase, instead of leaving it rendering every frame
// for the whole 560vh scroll journey. Isolated in its own component so the
// per-frame scroll updates only re-render this small gate, not all of
// CosmicVoyage.
export function Model3DGate({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest <= 0.22;
    setActive((prev) => (prev === next ? prev : next));
  });
  return <Model3DViewer modelPath="/models/hitem3d.glb" className="relative z-10" autoRotateSpeed={1.1} active={active} />;
}

// Same isolation trick for the phase label — it used to be top-level state,
// so every phase change re-rendered the entire CosmicVoyage tree.
export function PhaseLabel({ progress, className }: { progress: MotionValue<number>; className: string }) {
  const [phase, setPhase] = useState('PORTAL');
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest < 0.14 ? 'PORTAL' : latest < 0.92 ? 'PLANET APPROACH' : latest < 1 ? 'EXIT VECTOR' : 'ARCHIVE';
    setPhase((prev) => (prev === next ? prev : next));
  });
  return <div className={className}>{phase}</div>;
}
