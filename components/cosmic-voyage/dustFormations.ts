// Shared registry between ParticleTitle (which knows *where* a title is and
// *what shape* it has) and DustField (which owns every grain of star dust on
// the homepage). A title doesn't draw particles of its own: it registers a
// formation here, and DustField pulls grains out of the background to form
// it, then sends them back to their places in the sky.
import type { MotionValue } from 'framer-motion';

export type DustFormation = {
  /** The title box; read every frame (it may move while scrolling in). */
  box: HTMLElement;
  /** Landing spots inside the box, css px: [x0, y0, x1, y1, …]. */
  targets: Float32Array;
  progress: MotionValue<number>;
  /** [stir, gather start, formed, break up, back in the sky] on the progress scale. */
  stops: readonly [number, number, number, number, number];
};

const formations = new Set<DustFormation>();

export function addFormation(f: DustFormation) {
  formations.add(f);
  return () => {
    formations.delete(f);
  };
}

/** The formation currently in play (at most one is at a time on the page). */
export function activeFormation(): { f: DustFormation; p: number } | null {
  for (const f of formations) {
    const p = f.progress.get();
    if (p > f.stops[0] && p < f.stops[4]) return { f, p };
  }
  return null;
}
