'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';

const stats = [
  { label: 'Species', value: 'Unknown — population 1' },
  { label: 'Homeworld', value: 'Lost' },
  { label: 'Status', value: 'Refugee, Earth-bound' },
];

const imageBeats = [
  {
    src: '/images/IMG_0485.PNG',
    caption: 'It watched its galaxy disappear from a field that wasn’t home yet.',
  },
  {
    src: '/images/IMG_0508.PNG',
    caption: 'What’s left of a lost world, worn like jewelry.',
  },
  {
    src: '/images/IMG_0629.PNG',
    caption: 'Whatever it couldn’t save, it kept as memory.',
  },
];

// 1 text beat + N image beats, evenly split across the scroll distance.
// Each beat rises along an arc from the bottom-right corner up to dead
// center, holds there, then continues the arc back down to the bottom-left
// corner as the next one enters — same range/keyframe convention as the
// flight-path beats in cosmic-voyage/data.ts, just driven by this section's
// own local scroll progress instead of the homepage-wide one.
//
// The curve (not a straight diagonal) comes from x and y reaching their
// target at different rates: at the midpoint keyframe x has already covered
// most of its distance while y still has some left, so the path swoops in
// mostly sideways first and rises the rest of the way at the end — never
// overshooting above center, since y only ever ranges between 0 (center)
// and its corner offset (never negative).
//
// Opacity is intentionally on its OWN, much narrower keyframe windows right
// at the two corners (not tied to the same start/mid/end points as the
// position curve) — it was previously fading out across the whole slide, so
// text/images visibly went transparent while still well inside the frame,
// long before they'd actually left it. Now it stays fully opaque for
// nearly the entire arc and only fades in the last sliver near each corner,
// once the content is already essentially off-screen.
function useBeatStyle(progress: MotionValue<number>, index: number, total: number) {
  const span = 1 / total;
  const start = index * span;
  const end = start + span;
  const edge = span * 0.18;
  const fadeEdge = edge * 0.2;
  const range = [
    start,
    start + fadeEdge,
    start + edge * 0.5,
    start + edge,
    end - edge,
    end - edge * 0.5,
    end - fadeEdge,
    end,
  ];

  const x = useTransform(progress, range, ['60vw', '60vw', '18vw', '0vw', '0vw', '-18vw', '-60vw', '-60vw']);
  const y = useTransform(progress, range, ['14vh', '14vh', '3vh', '0vh', '0vh', '3vh', '14vh', '14vh']);
  const opacity = useTransform(progress, range, [0, 1, 1, 1, 1, 1, 1, 0]);
  // Banks into the same curve x/y trace, instead of staying perfectly
  // upright while it swoops through the arc — rising toward center it
  // leans the way a skater leans into a turn (rotated one way), levels out
  // flat exactly at center, then leans the other way heading back down to
  // the opposite corner. Follows the same range points as x/y so the tilt
  // is always in sync with the position it's tilting for.
  const rotate = useTransform(progress, range, [-8, -8, -3, 0, 0, 3, 8, 8]);
  return { x, y, opacity, rotate };
}

export function OriginFile() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const totalBeats = 1 + imageBeats.length;
  const textBeat = useBeatStyle(scrollYProgress, 0, totalBeats);

  return (
    <section ref={sectionRef} className="relative z-30 h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* DELIX art fills the whole section as a backdrop — its background is
            already transparent, so it blends straight into the starfield
            instead of sitting in a boxed frame. Stays pinned the whole time
            the beats below scroll past in front of it. */}
        <div className="absolute inset-0">
          <Image
            src="/images/DELIX.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />
        </div>

        <motion.div
          className="absolute inset-0 z-10 flex items-center px-5 md:px-8"
          style={{ x: textBeat.x, y: textBeat.y, rotate: textBeat.rotate, opacity: textBeat.opacity }}
        >
          <div className="mx-auto w-full max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-100/48">
              Origin File / DELIX IP
            </p>
            <h2 className="font-script text-5xl leading-none md:text-7xl">
              The last signal from a dead world.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
              DELIX didn&apos;t come here by choice. When its homeworld was destroyed, DELIX was
              the only one who made it out alive — the last survivor of an entire species. What
              arrived on Earth wasn&apos;t an explorer. It was a refugee: one small creature
              carrying the memory of a planet that no longer exists.
            </p>

            <div className="mt-9 grid max-w-xl grid-cols-1 gap-4 border-y border-white/10 py-5 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/78">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {imageBeats.map((beat, i) => (
          <OriginImageBeat
            key={beat.src}
            src={beat.src}
            caption={beat.caption}
            index={i + 1}
            total={totalBeats}
            progress={scrollYProgress}
          />
        ))}

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-white/32">
          Scroll to continue the file
        </div>
      </div>
    </section>
  );
}

function OriginImageBeat({
  src,
  caption,
  index,
  total,
  progress,
}: {
  src: string;
  caption: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const beat = useBeatStyle(progress, index, total);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center md:px-8"
      style={{ x: beat.x, y: beat.y, rotate: beat.rotate, opacity: beat.opacity }}
    >
      <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/32">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
      <div className="relative h-[46vh] w-full max-w-md overflow-hidden rounded-2xl border border-cyan-100/15 bg-black/40 backdrop-blur-xl">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 450px"
          className="object-cover"
        />
      </div>
      <p className="mt-6 max-w-sm text-sm leading-7 text-white/58">{caption}</p>
    </motion.div>
  );
}
