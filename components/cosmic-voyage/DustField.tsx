'use client';

// The homepage's star dust: one fixed canvas behind every section, so the
// same dust is on screen from the 3D rock (whose RockDust ring sits on top of
// it), through the "Earth life was strange" intro, to the planets.
//
// It is also what the planet song titles are made of. A ParticleTitle
// registers a formation (dustFormations.ts) — where the title is and its
// shape — and while that formation is in play, grains are pulled out of this
// very field into the letters — nearly all of it, so while a title is formed
// the sky is down to a few scattered stars — then flown back to their places.
// No separate particles are added for titles.
//
// Background motion: three depth layers drift slowly and scroll at different
// rates (parallax), wrapping around the viewport.
//
// Cost: ~3.5k fillRects per frame on a 2D canvas (~1 ms); the loop stops
// while the tab is hidden (requestAnimationFrame does that itself).

import { useEffect, useRef } from 'react';
import { activeFormation } from './dustFormations';

const LAYERS = [
  // parallax: px of dust movement per px scrolled
  { count: 2300, parallax: 0.04, size: [0.9, 1.3], alpha: [0.16, 0.4] },
  { count: 900, parallax: 0.1, size: [1.1, 1.8], alpha: [0.3, 0.65] },
  { count: 300, parallax: 0.2, size: [1.4, 2.2], alpha: [0.45, 0.85] },
] as const;
const ALPHAS = 12;
// Grains that stay in the sky while a title is formed (the rest form it).
const KEEP_IN_SKY = 110;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIn = (t: number) => t * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Grain = {
  // in the sky (viewport fractions)
  x: number; y: number; size: number; alpha: number; parallax: number;
  tw: number; ph: number; dx: number; dy: number;
  // when pulled into a title
  delay: number; // 0–1 random, so the word condenses everywhere at once
  sw: number; // stir/swirl radius (px)
  glow: number; // brightness in the word, 0.55–1
  wr: number; // wobble radius in the word (px)
  esc: boolean; ep: number; eph: number; edx: number; edy: number; // escapees (~12%)
};

// Motion of a grain inside a formed word: offset from its spot + alpha factor.
function alive(g: Grain, tx: number, time: number) {
  let ox = Math.cos(time * 1.7 + g.ph) * g.wr;
  let oy = Math.sin(time * 2.1 + g.ph * 1.3) * g.wr;
  oy += Math.sin(time * 1.6 - tx * 0.035) * 1.6; // wave left → right
  let a = 0.85 + 0.15 * Math.sin(time * 3 + g.ph * 3);
  if (g.esc) {
    const c = (time / g.ep + g.eph) % 1;
    if (c < 0.55) {
      const e = c / 0.55; // drifting away, fading out
      const d = 1 - Math.pow(1 - e, 2);
      ox += g.edx * d + Math.sin(time * 4 + g.ph) * 3 * e;
      oy += g.edy * d;
      a *= 1 - e;
    } else if (c < 0.75) {
      a = 0; // gone
    } else {
      a *= (c - 0.75) / 0.25; // re-forming in place
    }
  }
  return { ox, oy, a };
}

export default function DustField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rand = mulberry32(3);
    const grains: Grain[] = [];
    for (const layer of LAYERS) {
      for (let i = 0; i < layer.count; i++) {
        grains.push({
          x: rand(),
          y: rand(),
          size: layer.size[0] + rand() * (layer.size[1] - layer.size[0]),
          alpha: layer.alpha[0] + rand() * (layer.alpha[1] - layer.alpha[0]),
          parallax: layer.parallax,
          tw: 0.6 + rand() * 1.8,
          ph: rand() * Math.PI * 2,
          dx: (rand() - 0.5) * 0.004,
          dy: (rand() - 0.5) * 0.003,
          delay: rand(),
          sw: 6 + rand() * 22,
          glow: 0.55 + rand() * 0.45,
          wr: 0.6 + rand() * 1.8,
          esc: rand() < 0.12,
          ep: 2.5 + rand() * 4,
          eph: rand(),
          edx: (rand() - 0.3) * 70,
          edy: -15 - rand() * 55,
        });
      }
    }
    // Which grains a title borrows, in order: a fixed shuffle of the whole
    // field, so they come from all over the sky (and every layer); the last
    // KEEP_IN_SKY in this order are the ones left behind.
    const recruitOrder = grains.map((_, i) => i);
    for (let i = recruitOrder.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [recruitOrder[i], recruitOrder[j]] = [recruitOrder[j], recruitOrder[i]];
    }
    const slotOf = new Int32Array(grains.length).fill(-1);
    recruitOrder.forEach((g, slot) => (slotOf[g] = slot));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const wrap = (v: number) => v - Math.floor(v);
    const buckets: number[][] = Array.from({ length: ALPHAS }, () => []);
    let raf = 0;

    const draw = (now: number) => {
      const t = reduceMotion ? 0 : now / 1000;
      const sy = window.scrollY;
      const active = reduceMotion ? null : activeFormation();
      let box: DOMRect | null = null;
      let count = 0;
      let stops: readonly number[] = [];
      let targets: Float32Array | null = null;
      if (active) {
        box = active.f.box.getBoundingClientRect();
        targets = active.f.targets;
        count = Math.min(targets.length / 2, grains.length - KEEP_IN_SKY);
        stops = active.f.stops;
      }
      const p = active?.p ?? 0;

      for (const b of buckets) b.length = 0;
      for (let i = 0; i < grains.length; i++) {
        const g = grains[i];
        // Its place in the sky right now.
        const hx = wrap(g.x + g.dx * t) * w;
        const hy = wrap(g.y + g.dy * t - (sy * g.parallax) / h) * h;
        const skyA = g.alpha * (0.65 + 0.35 * Math.sin(t * g.tw + g.ph));
        let x = hx;
        let y = hy;
        let a = skyA;
        let size = g.size;

        const slot = slotOf[i];
        if (box && targets && slot < count) {
          const [s0, s1, s2, s3, s4] = stops;
          const tx = targets[slot * 2];
          const lx = box.left + tx;
          const ly = box.top + targets[slot * 2 + 1];
          // Stir: a small swirl around its sky position.
          const swx = Math.cos(t * 0.9 + g.ph) * g.sw;
          const swy = Math.sin(t * 1.1 + g.ph) * g.sw * 0.7;
          const wordSize = Math.max(g.size, 1.3);
          if (p < s1) {
            const k = clamp01((p - s0) / (s1 - s0));
            x = hx + swx * k;
            y = hy + swy * k;
            a = skyA + (g.glow * 0.7 - skyA) * k * 0.5;
          } else if (p < s2) {
            const k = easeInOut(clamp01(((p - s1) / (s2 - s1) - g.delay * 0.5) / 0.5));
            const m = alive(g, tx, t);
            const kk = k * k; // blend into the living motion as it lands
            x = (hx + swx) * (1 - k) + (lx + m.ox * kk) * k;
            y = (hy + swy) * (1 - k) + (ly + m.oy * kk) * k;
            const from = skyA + (g.glow * 0.7 - skyA) * 0.5;
            a = from + (g.glow * m.a - from) * k;
            size = g.size + (wordSize - g.size) * k;
          } else if (p < s3) {
            const m = alive(g, tx, t);
            x = lx + m.ox;
            y = ly + m.oy;
            a = g.glow * m.a;
            size = wordSize;
          } else {
            // Back to exactly where it came from, so the sky is whole again.
            const k = easeIn(clamp01(((p - s3) / (s4 - s3) - g.delay * 0.4) / 0.6));
            const m = alive(g, tx, t);
            x = (lx + m.ox) * (1 - k) + (hx + swx * (1 - k)) * k;
            y = (ly + m.oy) * (1 - k) + (hy + swy * (1 - k)) * k;
            a = g.glow * m.a * (1 - k) + skyA * k;
            size = wordSize + (g.size - wordSize) * k;
          }
        }
        if (a <= 0.02) continue;
        buckets[Math.min(ALPHAS - 1, Math.floor(a * ALPHAS))].push(x, y, size);
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (let b = 0; b < ALPHAS; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        ctx.globalAlpha = (b + 0.5) / ALPHAS;
        for (let k = 0; k < list.length; k += 3) {
          const s = list[k + 2];
          ctx.fillRect(list[k] - s / 2, list[k + 1] - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
