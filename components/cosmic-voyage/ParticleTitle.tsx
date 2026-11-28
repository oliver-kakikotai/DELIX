'use client';

// A song title on the planet cards (VoyagePlanet), made of the homepage's
// background star dust: this component draws nothing itself. It samples the
// wordmark's shape and registers a formation (dustFormations.ts); DustField
// then pulls grains out of the sky into the letters and sends them back.
// Driven by the voyage scroll progress, so scrolling back reverses it:
//
//   stops[0]→[1]  the recruited grains start to stir where they are
//   stops[1]→[2]  they fly in (random order) and form the wordmark
//   stops[2]→[3]  formed — but alive: grains wobble, a slow wave runs along
//                 the word, and stray grains keep escaping and re-forming
//   stops[3]→[4]  they fly back to their places in the background
//
// The word never swaps to the real image; it stays particles. With
// prefers-reduced-motion the static white wordmark is shown instead.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MotionValue } from 'framer-motion';
import { addFormation } from './dustFormations';

const MAX_TARGETS = 4000; // ≥ DustField's grain count

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Opaque-pixel coordinates of a wordmark fitted (contain, top-left) into a
// box, cached so remounting a card doesn't decode/scan the image again.
const shapeCache = new Map<string, Promise<number[]>>();
function sampleShape(src: string, boxW: number, boxH: number) {
  const key = `${src}|${Math.round(boxW)}x${Math.round(boxH)}`;
  let pending = shapeCache.get(key);
  if (!pending) {
    pending = (async () => {
      const img = new window.Image();
      img.src = src;
      await img.decode();
      const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const filled: number[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 140) filled.push(x, y);
        }
      }
      return filled;
    })();
    shapeCache.set(key, pending);
    pending.catch(() => shapeCache.delete(key));
  }
  return pending;
}

export function ParticleTitle({
  src,
  fallbackSrc,
  title,
  progress,
  stops,
  className = '',
}: {
  /** Wordmark whose alpha gives the shape (any colour; grains are white). */
  src: string;
  /** White wordmark shown instead under prefers-reduced-motion. */
  fallbackSrc?: string;
  title: string;
  progress: MotionValue<number>;
  /** [stir, gather start, formed, break up, back in the sky] on the progress scale. */
  stops: readonly [number, number, number, number, number];
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const [s0, s1, s2, s3, s4] = stops;

  useEffect(() => {
    if (reducedMotion) return;
    const box = boxRef.current;
    if (!box) return;
    let remove: (() => void) | null = null;
    let generation = 0;

    const register = async () => {
      const gen = ++generation;
      const { width, height } = box.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      try {
        const filled = await sampleShape(src, width, height);
        if (gen !== generation || !filled.length) return;
        // Landing spots for (up to) every grain in the sky — DustField pulls
        // in nearly the whole field, leaving only a few stars behind.
        const count = MAX_TARGETS;
        const rand = mulberry32(11);
        const targets = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          const k = Math.floor(rand() * (filled.length / 2)) * 2;
          targets[i * 2] = filled[k] + rand() - 0.5;
          targets[i * 2 + 1] = filled[k + 1] + rand() - 0.5;
        }
        remove?.();
        remove = addFormation({ box, targets, progress, stops: [s0, s1, s2, s3, s4] });
      } catch {
        /* image failed — the title box just stays empty */
      }
    };

    void register();
    const ro = new ResizeObserver(() => void register());
    ro.observe(box);
    return () => {
      generation++;
      ro.disconnect();
      remove?.();
    };
  }, [reducedMotion, src, progress, s0, s1, s2, s3, s4]);

  return (
    // 3:1 like the wordmark files; the grains land in this box
    <div ref={boxRef} role="img" aria-label={title} className={`relative aspect-[3/1] ${className}`}>
      {reducedMotion && fallbackSrc && (
        <Image src={fallbackSrc} alt="" fill sizes="420px" className="object-contain object-left-top" />
      )}
    </div>
  );
}
