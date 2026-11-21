'use client';

import { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import Planet from '../Planet';
import { VoyageSong } from './data';
import SongTitle from '@/components/SongTitle';
import { getCardShape } from './cardShapes';

export function VoyagePlanet({
  song,
  progress,
  onClick,
}: {
  song: VoyageSong;
  progress: MotionValue<number>;
  onClick: () => void;
}) {
  const holdStart = song.path.range[2];
  const holdEnd = song.path.range[3];
  const holdSpan = holdEnd - holdStart;
  const infoIn = holdStart + holdSpan * 0.18;
  const infoOut = holdEnd - holdSpan * 0.18;
  // The fixed, backdrop-blurred info card is expensive to keep painting on
  // every scroll frame (backdrop-filter re-samples the whole screen behind
  // it). Only mount it while this song's window is anywhere near active, so
  // a fast scroll isn't recomputing blur for all 5 songs' cards at once.
  const [isNear, setIsNear] = useState(false);
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest >= song.path.range[0] - 0.02 && latest <= song.path.range[4] + 0.02;
    setIsNear((prev) => (prev === next ? prev : next));
  });
  const x = useTransform(progress, song.path.range, song.path.x);
  const y = useTransform(progress, song.path.range, song.path.y);
  const planetScale = useTransform(progress, song.path.range, song.path.scale);
  const planetOpacity = useTransform(
    progress,
    [song.path.range[0], song.path.range[1], song.path.range[3], song.path.range[4]],
    [0, 1, 1, 0]
  );
  const infoOpacity = useTransform(
    progress,
    [holdStart, infoIn, infoOut, holdEnd],
    [0, 1, 1, 0]
  );
  const infoY = useTransform(
    progress,
    [holdStart, infoIn, infoOut, holdEnd],
    ['28vh', '0vh', '0vh', '-34vh']
  );
  const depthGlow = useTransform(progress, song.path.range, [0, 0.12, 0.28, 0.28, 0]);
  // A side card on the left or right, alternating per song. On phones it's a
  // narrow portrait card hugging the edge so the planet stays visible.
  const infoPlacementClass = song.path.infoPlacement === 'left'
    ? 'left-[4vw] md:left-[7vw]'
    : 'right-[4vw] md:right-[7vw]';

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={song.unlocked ? `Open ${song.title}` : `${song.title} is locked`}
        className="pointer-events-auto absolute left-1/2 top-1/2 z-20 grid h-[28vmin] min-h-40 w-[28vmin] min-w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center"
        style={{ x, y, scale: planetScale, opacity: planetOpacity }}
      >
        <motion.span
          className="absolute h-[30vmin] w-[30vmin] rounded-full"
          style={{
            opacity: depthGlow,
            // Soft falloff baked into the gradient stops instead of a
            // `filter: blur(34px)` — that blur had to be recomputed on every
            // scroll frame as the planet scales up to ~3x.
            background: `radial-gradient(circle, ${song.color || '#ffffff'}40 0%, ${song.color || '#ffffff'}22 35%, ${song.color || '#ffffff'}0a 60%, transparent 78%)`,
          }}
        />
        <motion.span
          className="relative grid h-full w-full overflow-hidden rounded-full"
        >
          {song.planetImage ? (
            <Image
              src={song.planetImage}
              alt={song.title}
              fill
              sizes="28vmin"
              className="scale-[1.055] rounded-full object-cover"
            />
          ) : (
            <Planet alt={song.title} className="h-full w-full" />
          )}
        </motion.span>
      </motion.button>

      {isNear && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={song.unlocked ? `Open ${song.title}` : `${song.title} is locked`}
          className={`pointer-events-auto fixed bottom-[12vh] z-40 w-[46vw] max-w-[240px] px-5 pb-7 pt-9 text-left md:w-[min(42vw,480px)] md:max-w-none md:px-9 md:pb-8 md:pt-11 ${infoPlacementClass}`}
          style={{ y: infoY, opacity: infoOpacity }}
        >
          {/* Per-song irregular card shape, stretched to the card's box: a
              portrait variant on phones, a landscape one from md up. The
              button is its own stacking context (fixed + z-40), so -z-10 keeps
              these behind the text but still inside the card. */}
          {(['tall', 'wide'] as const).map((variant) => (
            <svg
              key={variant}
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className={`pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${
                variant === 'tall' ? 'md:hidden' : 'hidden md:block'
              }`}
            >
              <path d={getCardShape(song.slug, variant)} fill="#D9FF12" />
            </svg>
          ))}
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/55 md:text-[10px] md:tracking-[0.34em]">
            {song.unlocked ? 'UNLOCKED SIGNAL' : 'LOCKED SIGNAL'}
          </p>
          <SongTitle
            title={song.title}
            titleImage={song.titleImage}
            dark
            sizes="(min-width: 768px) 420px, 46vw"
            className={song.titleImage ? 'w-full max-w-[420px]' : 'text-2xl leading-none text-black md:text-6xl'}
            imageClassName="max-h-[18vh] object-contain object-left"
          />
          <p className="mt-3 line-clamp-6 max-w-md text-xs leading-5 text-black/65 md:mt-4 md:line-clamp-none md:text-sm md:leading-7">
            {song.intro || song.description || 'A passing world in the DELIX archive.'}
          </p>
        </motion.button>
      )}
    </>
  );
}
