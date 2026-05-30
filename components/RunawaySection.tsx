'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const clipReveal = {
  hidden: { clipPath: 'inset(100% 0 0 0)', y: 24, opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    y: 0,
    opacity: 1,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const tags = ['Musician', 'Dreamer', 'Space Explorer'];

const paragraphs = [
  "Hey there! I'm a creative soul with a passion for music, art, and storytelling. Through DELIX, I explore the cosmic journey of self-discovery and expression.",
  "Each song represents a different chapter of my journey — from procrastination and introspection to finding joy in life's simple pleasures.",
  "When I'm not creating music, you'll find me stargazing, exploring new sounds, or sharing salmon and potatoes with friends. Welcome to my corner of the cosmos 🌟",
];

export default function RunawaySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax: background moves slower than the page scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const photoY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center"
    >
      {/* ── Parallax background ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img
          src="/images/runaway.png"
          alt=""
          className="w-full h-full object-cover scale-110"
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
      </motion.div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Photo column ── */}
          <motion.div
            className="flex justify-center lg:justify-start"
            style={{ y: photoY }}
            initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
            animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {/* Outer pulse rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-2xl border border-purple-500/20"
                  style={{ inset: -(i + 1) * 18 }}
                  animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.025, 1] }}
                  transition={{ duration: 3.5 + i * 0.9, repeat: Infinity, delay: i * 0.6 }}
                />
              ))}

              {/* Rotating conic-gradient border */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72">
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #a855f7, #ec4899, #60a5fa, #34d399, #a855f7)',
                    padding: '2.5px',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-full h-full bg-black rounded-2xl" />
                </motion.div>

                <img
                  src="/images/profile.jpg"
                  alt="Profile"
                  className="absolute inset-[2.5px] w-[calc(100%-5px)] h-[calc(100%-5px)] object-cover rounded-2xl"
                />

                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
              </div>

              {/* Corner accents */}
              <motion.div
                className="absolute -bottom-5 -right-5 w-10 h-10 border-r-2 border-b-2 border-pink-400/70"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.9 }}
              />
              <motion.div
                className="absolute -top-5 -left-5 w-10 h-10 border-l-2 border-t-2 border-purple-400/70"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 1.0 }}
              />
            </div>
          </motion.div>

          {/* ── Text column ── */}
          <motion.div
            className="space-y-7"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              className="text-xs font-mono tracking-[0.35em] text-purple-400 uppercase"
            >
              ◈ &nbsp;The Creator
            </motion.p>

            {/* Title — clip-path curtain reveal */}
            <div className="overflow-hidden">
              <motion.h2
                variants={clipReveal}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-200">
                  About
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  Me
                </span>
              </motion.h2>
            </div>

            {/* Animated divider */}
            <motion.div
              className="h-px bg-gradient-to-r from-purple-500 via-pink-500 to-transparent"
              variants={{
                hidden: { scaleX: 0, originX: '0%' },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            />

            {/* Paragraphs */}
            {paragraphs.map((text, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-gray-300 text-base md:text-lg leading-relaxed"
              >
                {text}
              </motion.p>
            ))}

            {/* Tags — spring pop */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 border border-purple-500/40 rounded-full text-purple-300 text-sm font-medium backdrop-blur-sm bg-purple-500/10 cursor-default"
                  initial={{ opacity: 0, y: 18, scale: 0.88 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    duration: 0.55,
                    delay: 0.9 + i * 0.1,
                    type: 'spring',
                    stiffness: 220,
                    damping: 18,
                  }}
                  whileHover={{
                    scale: 1.08,
                    borderColor: 'rgba(168,85,247,0.75)',
                    backgroundColor: 'rgba(168,85,247,0.22)',
                    transition: { duration: 0.2 },
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
