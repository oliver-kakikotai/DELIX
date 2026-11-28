'use client';

import { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import Planet from '../Planet';
import { VoyageSong } from './data';
import SongTitle from '@/components/SongTitle';
import { ParticleTitle } from './ParticleTitle';

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
  // Only mount the info card (and register its particle-title formation)
  // while this song's window is anywhere near active.
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
  // The title is star dust (ParticleTitle): a cloud gathers into the
  // wordmark as the planet arrives, holds (alive) while the card is shown,
  // then breaks up as it leaves. Stops on the same progress scale.
  const titleStops = [
    song.path.range[1] - 0.012,
    song.path.range[1] + 0.004,
    infoIn,
    infoOut,
    Math.min(song.path.range[4], holdEnd + 0.03),
  ] as const;
  // (No glow behind the planet: a large radial gradient scaled up ~3x with
  // the planet had to be re-rasterised every frame, and was one of the two
  // main causes of dropped frames in this section.)
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
        // No card background or label: the particle title and intro sit
        // straight on the star dust. The title is formed by DustField out of
        // the background's own grains (ParticleTitle only marks where).
        <button
          type="button"
          onClick={onClick}
          aria-label={song.unlocked ? `Open ${song.title}` : `${song.title} is locked`}
          className={`pointer-events-auto fixed bottom-[12svh] z-40 w-[46vw] max-w-[240px] px-1 text-left md:w-[min(42vw,480px)] md:max-w-none md:px-2 ${infoPlacementClass}`}
        >
          {song.titleImageDark ? (
            <ParticleTitle
              src={song.titleImageDark}
              fallbackSrc={song.titleImage}
              title={song.title}
              progress={progress}
              stops={titleStops}
              className="w-full max-w-[420px] max-h-[18svh]"
            />
          ) : (
            <motion.div style={{ opacity: infoOpacity }}>
              <SongTitle
                title={song.title}
                titleImage={song.titleImage}
                sizes="(min-width: 768px) 420px, 46vw"
                className={song.titleImage ? 'w-full max-w-[420px]' : 'text-2xl leading-none text-white md:text-6xl'}
                imageClassName="max-h-[18svh] object-contain object-left"
              />
            </motion.div>
          )}
          <motion.p
            className="mt-3 line-clamp-6 max-w-md text-xs leading-5 text-white/60 md:mt-4 md:line-clamp-none md:text-sm md:leading-7"
            style={{ opacity: infoOpacity }}
          >
            {song.intro || song.description || 'A passing world in the DELIX archive.'}
          </motion.p>
        </button>
      )}
    </>
  );
}
