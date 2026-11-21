'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';

// Origin File — two acts driven by this section's own scroll progress (0–1).
//
// Act 1 (0 → ~0.4): DELIX in full colour. The camera starts pushed in on its
//   face and pulls back to reveal the whole artwork. Copy sits in an
//   acid-yellow irregular card (same language as the planet cards) instead of
//   on top of the art, so the art never needs darkening to stay readable.
// Act 2 (~0.42 → 1): three photos get dealt onto the "table" one by one like
//   polaroids, each landing at its own angle on top of the last. Each keeps its
//   native aspect ratio, so the wide comic strip is shown in full.

const photos = [
  {
    src: '/images/IMG_0485.PNG',
    width: 2048,
    height: 2048,
    caption: 'It watched its galaxy disappear from a field that wasn’t home yet.',
    // Where it lands and how it's tilted once settled.
    land: { x: '-7vw', y: '-3vh', rotate: -6 },
    // Which side it flies in from.
    from: { x: '-60vw', rotate: -24 },
  },
  {
    src: '/images/IMG_0508.PNG',
    width: 2048,
    height: 2048,
    caption: 'What’s left of a lost world, worn like jewelry.',
    land: { x: '6vw', y: '1vh', rotate: 5 },
    from: { x: '60vw', rotate: 22 },
  },
  {
    src: '/images/IMG_0629.PNG',
    width: 4096,
    height: 2048,
    caption: 'Whatever it couldn’t save, it kept as memory.',
    land: { x: '0vw', y: '2vh', rotate: -2 },
    from: { x: '0vw', rotate: 10 },
  },
] as const;

// Scroll windows (fractions of the section's scroll progress).
const ACT1_PULLBACK_END = 0.32;
const CARD_IN = [0.04, 0.12] as const;
const CARD_OUT = [0.36, 0.42] as const;
const PHOTO_START = 0.44;
const PHOTO_STEP = 0.16; // gap between successive photos landing
const PHOTO_FLIGHT = 0.1; // how long each photo takes to land

// Card shape for the act-1 copy: a wobbly blob with a lifted top-right corner.
const CARD_SHAPE =
  'M4 10 C18 3 40 6 62 3 C78 1 92 0 97 8 C100 30 96 58 98 84 C99 95 92 99 80 97 C58 94 34 99 14 97 C5 96 1 92 2 82 C3 60 0 34 4 10 Z';

export function OriginFile() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Act 1 — camera pull-back on the artwork.
  const artScale = useTransform(p, [0, ACT1_PULLBACK_END], [1.9, 1]);
  // Act 2 — art steps back (soft blur + slight dim) so the photos read as the
  // foreground. Full colour for the whole of act 1.
  const artFilter = useTransform(
    p,
    [CARD_OUT[0], PHOTO_START + 0.06],
    ['blur(0px) brightness(1)', 'blur(6px) brightness(0.6)']
  );

  const cardOpacity = useTransform(p, [CARD_IN[0], CARD_IN[1], CARD_OUT[0], CARD_OUT[1]], [0, 1, 1, 0]);
  const cardY = useTransform(p, [CARD_IN[0], CARD_IN[1], CARD_OUT[0], CARD_OUT[1]], ['12vh', '0vh', '0vh', '14vh']);
  const cardRotate = useTransform(p, [CARD_IN[0], CARD_IN[1]], [-6, -2]);

  const hintOpacity = useTransform(p, [0, 0.06, 0.3, 0.36], [1, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative z-30 h-[420vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── The artwork, full colour ── */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: artScale, filter: artFilter, transformOrigin: '66% 28%' }}
        >
          <Image
            src="/images/DELIX.png"
            alt="DELIX, the last survivor of a destroyed world"
            fill
            sizes="100vw"
            className="object-cover"
            // Keep DELIX's face in frame when the viewport is narrower than
            // the artwork (phones crop the sides heavily).
            style={{ objectPosition: '72% 30%' }}
          />
        </motion.div>
        {/* Thin fades top and bottom only, so the section blends into the
            starfield around it without dimming the art itself. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[14vh] bg-gradient-to-b from-black to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-black/80 to-transparent" />

        {/* ── Act 1 copy card ── */}
        <motion.div
          className="absolute bottom-[9vh] left-[4vw] z-10 w-[min(88vw,460px)] px-7 pb-8 pt-9 text-black md:left-[6vw] md:px-10 md:pb-10 md:pt-12"
          style={{ opacity: cardOpacity, y: cardY, rotate: cardRotate }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible drop-shadow-[0_24px_50px_rgba(0,0,0,0.45)]"
          >
            <path d={CARD_SHAPE} fill="#D9FF12" />
          </svg>
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-black/55 md:text-[10px]">
            Origin File / DELIX IP
          </p>
          <h2 className="font-script text-4xl leading-none md:text-6xl">
            The last signal from a dead world.
          </h2>
          <p className="mt-4 text-sm leading-6 text-black/70 md:text-base md:leading-7">
            The only survivor of a world that no longer exists — now on Earth,
            carrying its home as memory.
          </p>
          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-black/45 md:text-[10px]">
            Species unknown · Population 1 · Homeworld lost
          </p>
        </motion.div>

        {/* ── Act 2 photos ── */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {photos.map((photo, i) => (
            <Polaroid key={photo.src} photo={photo} index={i} progress={p} />
          ))}
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-white/60"
          style={{ opacity: hintOpacity }}
        >
          Scroll to open the file
        </motion.div>
      </div>
    </section>
  );
}

function Polaroid({
  photo,
  index,
  progress,
}: {
  photo: (typeof photos)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = PHOTO_START + index * PHOTO_STEP;
  const end = start + PHOTO_FLIGHT;
  const flight = [start, end];

  const x = useTransform(progress, flight, [photo.from.x, photo.land.x]);
  const y = useTransform(progress, flight, ['115vh', photo.land.y]);
  const rotate = useTransform(progress, flight, [photo.from.rotate, photo.land.rotate]);
  // A touch of overshoot in scale sells the "dropped onto the table" landing.
  const scale = useTransform(progress, [start, end - 0.015, end], [1.12, 0.98, 1]);

  const isWide = photo.width > photo.height;

  return (
    <motion.figure
      className={`absolute bg-[#F4F1E8] p-2.5 pb-10 shadow-[0_30px_70px_rgba(0,0,0,0.55)] md:p-4 md:pb-16 ${
        // Square photos: fit within ~half the viewport height. The wide comic
        // gets more width so every panel stays legible.
        isWide ? 'w-[min(90vw,110vh)]' : 'w-[min(74vw,52vh)]'
      }`}
      style={{ x, y, rotate, scale, zIndex: index + 1 }}
    >
      <Image
        src={photo.src}
        alt={photo.caption}
        width={photo.width}
        height={photo.height}
        sizes={isWide ? '(min-width: 768px) 1100px, 90vw' : '(min-width: 768px) 520px, 74vw'}
        className="h-auto w-full bg-black"
      />
      <figcaption className="absolute inset-x-3 bottom-2 font-script text-base leading-tight text-black/75 md:inset-x-5 md:bottom-4 md:text-2xl">
        {photo.caption}
      </figcaption>
    </motion.figure>
  );
}
