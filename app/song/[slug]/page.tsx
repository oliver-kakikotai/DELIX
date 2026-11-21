'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getSongBySlug } from '@/data/albumData';
import { useAudio } from '@/contexts/AudioContext';
import { useUnlock } from '@/contexts/UnlockContext';
import LyricsDisplay from '@/components/LyricsDisplay';
import SongTitle from '@/components/SongTitle';
import StarField from '@/components/StarField';

const songWorlds: Record<string, {
  background: string;
  accent: string;
  media?: 'video' | 'star';
  mediaSrc?: string;
  // Playback time (seconds) at which the falling-stars effect starts, tied
  // to a specific lyric in that song. Songs without one never show it.
  meteorAt?: number;
}> = {
  tomorrow: {
    background: 'radial-gradient(circle at 22% 34%, rgba(255,215,0,0.24), transparent 34%), radial-gradient(circle at 78% 72%, rgba(255,118,75,0.16), transparent 32%), #020204',
    accent: '#FFD700',
    media: 'star',
    // "I should probably eat something" — [02:41.00] in tomorrow-sample.lrc
    meteorAt: 161,
  },
  'the-real-reason': {
    background: 'radial-gradient(circle at 68% 32%, rgba(155,89,182,0.28), transparent 36%), radial-gradient(circle at 24% 76%, rgba(70,42,118,0.2), transparent 34%), #020205',
    accent: '#9B59B6',
    media: 'video',
    mediaSrc: '/video/therealreason.mp4',
  },
  'third-person': {
    background: 'radial-gradient(circle at 50% 28%, rgba(52,152,219,0.28), transparent 34%), radial-gradient(circle at 20% 82%, rgba(126,188,255,0.13), transparent 30%), #02050a',
    accent: '#3498DB',
    media: 'video',
    mediaSrc: '/video/car.mp4',
  },
  'salmon-and-potatoes': {
    background: 'radial-gradient(circle at 26% 30%, rgba(230,126,34,0.24), transparent 34%), radial-gradient(circle at 76% 70%, rgba(255,214,153,0.12), transparent 34%), #050302',
    accent: '#E67E22',
    media: 'video',
    mediaSrc: '/video/book.mp4',
  },
  'the-ascension': {
    background: 'radial-gradient(circle at 50% 24%, rgba(236,240,241,0.22), transparent 30%), radial-gradient(circle at 76% 72%, rgba(126,155,255,0.18), transparent 34%), #030307',
    accent: '#ECF0F1',
    media: 'star',
  },
};

// Fixed twinkling background stars (same StarField as the homepage).
const backgroundStars = Array.from({ length: 38 }, (_, i) => ({
  left: (i * 37 + 9) % 100,
  top: (i * 61 + 17) % 100,
  size: 1 + (i % 3),
  opacity: 0.18 + ((i * 11) % 45) / 100,
}));

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const { startSong, currentSong, isPlaying, currentTime } = useAudio();
  const { checkUnlock } = useUnlock();

  const slug = params.slug as string;
  const song = getSongBySlug(slug);

  // Missing or still-locked songs go back to the homepage; otherwise make
  // sure the player is on the song this URL points at.
  useEffect(() => {
    if (!song || !checkUnlock(song.id)) {
      router.push('/');
      return;
    }
    if (currentSong?.id !== song.id) {
      startSong(song);
    }
  }, [song, router, currentSong?.id, startSong, checkUnlock]);

  const world = song
    ? songWorlds[song.slug] || {
        background: `radial-gradient(circle at 50% 50%, ${song.color || '#ffffff'}30, transparent 70%), #020204`,
        accent: song.color || '#ffffff',
        media: 'star' as const,
      }
    : undefined;

  // Falling stars from the song's own trigger lyric onward. Derived from
  // playback time (not a one-shot latch on a 0.5s window), so it also works
  // after seeking past the line, and it's scoped to this page's song.
  const meteorAt = world?.meteorAt;
  const showMeteors =
    meteorAt !== undefined && currentSong?.id === song?.id && currentTime >= meteorAt;

  // Stay on once triggered for this visit, even if the listener seeks back.
  const [meteorsLatched, setMeteorsLatched] = useState(false);
  useEffect(() => {
    if (showMeteors) setMeteorsLatched(true);
  }, [showMeteors]);
  useEffect(() => {
    setMeteorsLatched(false);
  }, [slug]);

  if (!song || !world) {
    return null;
  }

  return (
    <div className="relative min-h-svh overflow-hidden text-white" style={{ background: world.background }}>
      {/* ── Background world ── */}
      <div className="pointer-events-none fixed inset-0">
        {world.media === 'video' && world.mediaSrc ? (
          <video
            src={world.mediaSrc}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <motion.div
            className="absolute bottom-[-12vh] right-[4vw] h-[58vmin] w-[58vmin] opacity-80"
            style={{ filter: `drop-shadow(0 0 40px ${world.accent}80)` }}
            animate={{
              y: isPlaying ? [0, -18, 0] : 0,
              rotate: isPlaying ? [-2, 2, -2] : 0,
            }}
            transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            <Image src="/images/star.png" alt="" fill sizes="58vmin" className="object-contain" />
          </motion.div>
        )}
        {/* Lighter than the old 32%-opacity video under two heavy overlays,
            so the song's world actually shows; the lyrics get their own
            soft dark backing below for legibility. */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0.72)_100%)]" />
        <StarField stars={backgroundStars} />
      </div>

      {/* ── Back to album (same pill style as the homepage nav) ── */}
      <motion.button
        type="button"
        onClick={() => router.push('/')}
        className="fixed left-5 top-5 z-50 flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:border-white/30 hover:text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span aria-hidden="true" className="text-base leading-none">←</span>
        Back to album
      </motion.button>

      {/* ── Content: title + world card on the left, lyrics on the right ── */}
      <main className="relative z-10 mx-auto grid min-h-svh max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-36 pt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14">
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <SongTitle
            as="h1"
            title={song.title}
            titleImage={song.titleImage}
            sizes="(min-width: 768px) 520px, 90vw"
            className={song.titleImage ? 'w-full max-w-[520px]' : 'text-6xl leading-none md:text-8xl'}
            imageClassName="max-h-[30svh] object-contain object-left"
          />

        </motion.section>

        <motion.section
          // Soft dark backing (no border, no blur — a backdrop blur over a
          // playing video would be recomputed every frame) so lyrics stay
          // readable over bright, busy song videos.
          className="rounded-[32px] bg-black/50 shadow-[0_0_80px_40px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <LyricsDisplay
            key={song.id}
            lyricsPath={song.lyricsPath}
            accent={world.accent}
            className="h-[62svh] min-h-[420px]"
          />
        </motion.section>
      </main>

      <AnimatePresence>
        {meteorsLatched && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-8 w-8"
                style={{
                  left: `${(i * 23 + 8) % 100}%`,
                  top: `${(i * 41 + 12) % 100}%`,
                  filter: `drop-shadow(0 0 10px ${world.accent})`,
                }}
                animate={{ y: [0, -26, 0], rotate: [0, 180, 360], opacity: [0, 1, 0] }}
                transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
              >
                <Image src="/images/star.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
