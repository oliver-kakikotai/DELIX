'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryItem {
  chapter: string;
  chapterNum: string;
  title: string;
  content: string;
  image: string;
  accent: string;
}

const stories: StoryItem[] = [
  {
    chapter: 'Chapter',
    chapterNum: '01',
    title: 'The Beginning',
    content:
      'It all started with a simple melody that echoed through the cosmos. A sound that would become the foundation of DELIX — a journey through space and self-discovery.',
    image: '/images/IMG_0485.PNG',
    accent: '#a855f7',
  },
  {
    chapter: 'Chapter',
    chapterNum: '02',
    title: 'Finding My Voice',
    content:
      'Through countless nights of experimentation and exploration, I discovered that music wasn't just about sound — it was about emotion, memory, and connection.',
    image: '/images/IMG_0487.PNG',
    accent: '#ec4899',
  },
  {
    chapter: 'Chapter',
    chapterNum: '03',
    title: 'The Cosmic Journey',
    content:
      'Each planet in this album represents a different aspect of the human experience. From procrastination to introspection, from loneliness to joy.',
    image: '/images/IMG_0503.PNG',
    accent: '#60a5fa',
  },
  {
    chapter: 'Chapter',
    chapterNum: '04',
    title: "Tomorrow's Promise",
    content:
      "The first song, 'Tomorrow,' captures that feeling we all know — the promise we make to ourselves that tomorrow will be different, better, more alive.",
    image: '/images/IMG_0505.JPG',
    accent: '#34d399',
  },
];

function ChapterPanel({
  story,
  direction,
  isTransitioning,
}: {
  story: StoryItem;
  direction: number;
  isTransitioning: boolean;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={story.chapterNum}
        custom={direction}
        initial={{ opacity: 0, y: direction > 0 ? '6%' : '-6%' }}
        animate={{ opacity: 1, y: '0%' }}
        exit={{ opacity: 0, y: direction > 0 ? '-6%' : '6%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {/* Full-bleed image */}
        <img
          src={story.image}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

        {/* Giant decorative chapter number */}
        <motion.div
          className="absolute left-0 bottom-0 select-none pointer-events-none"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: story.accent }}
        >
          <span
            className="font-black leading-none"
            style={{
              fontSize: 'clamp(14rem, 30vw, 28rem)',
              opacity: 0.07,
              lineHeight: 1,
              letterSpacing: '-0.05em',
            }}
          >
            {story.chapterNum}
          </span>
        </motion.div>

        {/* Content — bottom-left editorial layout */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16 lg:p-20 max-w-3xl">
          {/* Eyebrow */}
          <motion.p
            className="font-mono text-xs tracking-[0.35em] uppercase mb-4"
            style={{ color: story.accent }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {story.chapter} {story.chapterNum}
          </motion.p>

          {/* Title — clip reveal */}
          <div className="overflow-hidden mb-5">
            <motion.h2
              className="font-black leading-tight"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                background: `linear-gradient(135deg, #fff 30%, ${story.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {story.title}
            </motion.h2>
          </div>

          {/* Divider */}
          <motion.div
            className="h-px mb-5"
            style={{ background: `linear-gradient(to right, ${story.accent}, transparent)` }}
            initial={{ scaleX: 0, originX: '0%' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Body text */}
          <motion.p
            className="text-gray-200 leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {story.content}
          </motion.p>
        </div>

        {/* Flash overlay on transition */}
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0.18 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function StorySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumulatedDelta = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= stories.length || next === currentIndex) return;
      setIsTransitioning(true);
      setDirection(next > currentIndex ? 1 : -1);
      setCurrentIndex(next);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [currentIndex]
  );

  // Desktop wheel hijack
  useEffect(() => {
    if ('ontouchstart' in window) return;

    const handleWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const isSticky = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!isSticky) return;

      const down = e.deltaY > 0;
      const up = e.deltaY < 0;

      if ((currentIndex === 0 && up) || (currentIndex === stories.length - 1 && down)) {
        accumulatedDelta.current = 0;
        return;
      }

      if ((down && currentIndex < stories.length - 1) || (up && currentIndex > 0)) {
        e.preventDefault();
        accumulatedDelta.current += e.deltaY;
        const threshold = 700;

        if (Math.abs(accumulatedDelta.current) >= threshold) {
          goTo(currentIndex + (down ? 1 : -1));
          accumulatedDelta.current = 0;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, goTo]);

  // Mobile swipe
  useEffect(() => {
    if (!('ontouchstart' in window)) return;
    const section = sectionRef.current;
    if (!section) return;

    let startY = 0;
    let startTime = 0;
    let sticky = false;

    const onStart = (e: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      sticky = rect.top <= 0 && rect.bottom >= window.innerHeight;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const onEnd = (e: TouchEvent) => {
      if (!sticky) return;
      const dy = startY - e.changedTouches[0].clientY;
      const dt = Date.now() - startTime;
      if (dt < 300 && Math.abs(dy) > 70) {
        goTo(currentIndex + (dy > 0 ? 1 : -1));
      }
    };

    section.addEventListener('touchstart', onStart, { passive: true });
    section.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      section.removeEventListener('touchstart', onStart);
      section.removeEventListener('touchend', onEnd);
    };
  }, [currentIndex, goTo]);

  const story = stories[currentIndex];

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '100vh' : `${stories.length * 100}vh`,
        minHeight: '100vh',
        backgroundColor: '#000',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {/* Chapter panel */}
        <ChapterPanel
          story={story}
          direction={direction}
          isTransitioning={isTransitioning}
        />

        {/* ── Vertical progress dots (right side) ── */}
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
          {stories.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to chapter ${i + 1}`}
              className="group flex items-center gap-2 outline-none"
              style={{ touchAction: 'manipulation' }}
            >
              <motion.div
                className="rounded-full transition-all duration-300"
                animate={{
                  width: i === currentIndex ? 28 : 8,
                  height: 8,
                  backgroundColor: i === currentIndex ? s.accent : 'rgba(255,255,255,0.25)',
                  boxShadow:
                    i === currentIndex
                      ? `0 0 10px ${s.accent}99`
                      : 'none',
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </button>
          ))}
        </div>

        {/* ── Top progress bar ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 z-30">
          <motion.div
            className="h-full"
            style={{ background: story.accent }}
            animate={{ width: `${((currentIndex + 1) / stories.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </section>
  );
}
