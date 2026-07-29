'use client';

import { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import Planet from '../Planet';
import { VoyageSong } from './data';

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
  const infoPlacementClass = song.path.infoPlacement === 'left'
    ? 'left-[7vw]'
    : 'right-[7vw]';

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
            background: `radial-gradient(circle, ${song.color || '#ffffff'}44, transparent 72%)`,
            filter: 'blur(34px)',
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
          className={`pointer-events-auto fixed bottom-[12vh] z-40 w-[min(42vw,480px)] rounded-2xl border border-black/10 bg-[#D9FF12] px-6 py-5 text-left shadow-[0_20px_80px_rgba(0,0,0,0.35)] ${infoPlacementClass}`}
          style={{ y: infoY, opacity: infoOpacity }}
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-black/55">
            {song.unlocked ? 'UNLOCKED SIGNAL' : 'LOCKED SIGNAL'}
          </p>
          <h2 className="text-3xl font-black leading-none text-black md:text-5xl">{song.title}</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-black/65">
            {song.intro || song.description || 'A passing world in the DELIX archive.'}
          </p>
        </motion.button>
      )}
    </>
  );
}
