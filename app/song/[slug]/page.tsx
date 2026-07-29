'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSongBySlug } from '@/data/albumData';
import { useAudio } from '@/contexts/AudioContext';
import { useUnlock } from '@/contexts/UnlockContext';
import LyricsDisplay from '@/components/LyricsDisplay';

const songWorlds: Record<string, {
  signal: string;
  atmosphere: string;
  background: string;
  accent: string;
  media?: 'video' | 'star';
  mediaSrc?: string;
}> = {
  tomorrow: {
    signal: 'COMFORT ORBIT',
    atmosphere: 'A warm world for ambition, hesitation, and the small gravity of tomorrow.',
    background: 'radial-gradient(circle at 22% 34%, rgba(255,215,0,0.24), transparent 34%), radial-gradient(circle at 78% 72%, rgba(255,118,75,0.16), transparent 32%), #020204',
    accent: '#FFD700',
    media: 'star',
  },
  'the-real-reason': {
    signal: 'REASON CHAMBER',
    atmosphere: 'A violet signal room where the hidden motive finally becomes visible.',
    background: 'radial-gradient(circle at 68% 32%, rgba(155,89,182,0.28), transparent 36%), radial-gradient(circle at 24% 76%, rgba(70,42,118,0.2), transparent 34%), #020205',
    accent: '#9B59B6',
    media: 'video',
    mediaSrc: '/video/therealreason.mp4',
  },
  'third-person': {
    signal: 'OUTSIDE VIEW',
    atmosphere: 'A blue observation deck for seeing yourself from one step away.',
    background: 'radial-gradient(circle at 50% 28%, rgba(52,152,219,0.28), transparent 34%), radial-gradient(circle at 20% 82%, rgba(126,188,255,0.13), transparent 30%), #02050a',
    accent: '#3498DB',
    media: 'video',
    mediaSrc: '/video/car.MP4',
  },
  'salmon-and-potatoes': {
    signal: 'MEMORY TABLE',
    atmosphere: 'A quiet archive of ordinary comfort, soft rituals, and remembered appetite.',
    background: 'radial-gradient(circle at 26% 30%, rgba(230,126,34,0.24), transparent 34%), radial-gradient(circle at 76% 70%, rgba(255,214,153,0.12), transparent 34%), #050302',
    accent: '#E67E22',
    media: 'video',
    mediaSrc: '/video/book.MP4',
  },
  'the-ascension': {
    signal: 'ASCENSION GATE',
    atmosphere: 'A final lift through bright pressure, release, and a widening sky.',
    background: 'radial-gradient(circle at 50% 24%, rgba(236,240,241,0.22), transparent 30%), radial-gradient(circle at 76% 72%, rgba(126,155,255,0.18), transparent 34%), #030307',
    accent: '#ECF0F1',
    media: 'star',
  },
};

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const { startSong, currentSong, isPlaying, currentTime } = useAudio();
  const { checkUnlock } = useUnlock();
  const [showMeteors, setShowMeteors] = useState(false);

  const slug = params.slug as string;
  const song = getSongBySlug(slug);

  // 如果歌曲不存在或未解锁，重定向回首页
  useEffect(() => {
    if (!song) {
      router.push('/');
      return;
    }

    const isUnlocked = checkUnlock(song.id);
    console.log('🎵 Song page loaded:', {
      songId: song.id,
      title: song.title,
      isUnlocked,
      albumDataUnlocked: song.unlocked
    });

    if (!isUnlocked) {
      console.log('🔒 Song not unlocked, redirecting to home');
      router.push('/');
    } else if (currentSong?.id !== song.id) {
      // 自动同步到当前 URL 对应的歌曲
      console.log('▶️ Auto-playing song');
      startSong(song);
    }
  }, [song, router, currentSong?.id, startSong, checkUnlock]);

  // 监听特定歌词时间，触发星星效果
  useEffect(() => {
    // "I should probably eat something" 的时间点：2:38.50 = 158.5秒
    const triggerTime = 158.5;
    const threshold = 0.5; // 0.5秒的误差范围

    if (currentTime >= triggerTime && currentTime <= triggerTime + threshold && !showMeteors) {
      setShowMeteors(true);
      // 星星出现后保持显示，不再隐藏
    }
  }, [currentTime, showMeteors]);

  if (!song) {
    return null;
  }

  const world = songWorlds[song.slug] || {
    signal: 'SONG WORLD',
    atmosphere: song.description || 'A recovered signal in the DELIX archive.',
    background: `radial-gradient(circle at 50% 50%, ${song.color || '#ffffff'}30, transparent 70%), #020204`,
    accent: song.color || '#ffffff',
    media: 'star',
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: world.background }}>
      <div className="absolute inset-0">
        {world.media === 'video' && world.mediaSrc ? (
          <video
            src={world.mediaSrc}
            className="absolute inset-0 h-full w-full object-cover opacity-32"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <motion.img
            src="/images/star.png"
            alt=""
            className="absolute bottom-[-12vh] right-[4vw] h-[58vmin] w-[58vmin] object-contain opacity-80"
            style={{
              filter: `drop-shadow(0 0 40px ${world.accent}80)`,
            }}
            animate={{
              y: isPlaying ? [0, -18, 0] : 0,
              rotate: isPlaying ? [-2, 2, -2] : 0,
            }}
            transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-0 bg-black/28" />
        {[...Array(38)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 37 + 9) % 100}%`,
              top: `${(i * 61 + 17) % 100}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              opacity: 0.18 + ((i * 11) % 45) / 100,
            }}
            animate={{ opacity: [0.16, 0.72, 0.16] }}
            transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.3 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.div
          className="fixed left-0 right-0 top-0 z-50 border-b bg-black/30 backdrop-blur-md"
          style={{ borderColor: `${world.accent}24` }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <span className="text-2xl">←</span>
              <span>Back to Album</span>
            </button>

            <div className="text-center">
              <p className="text-sm text-white/42">Now Playing</p>
              <h2 className="text-white text-xl font-bold">{song.title}</h2>
            </div>

            <div className="w-24"></div> {/* 占位符保持居中 */}
          </div>
        </motion.div>

        <main className="relative flex min-h-screen items-center justify-center px-5 pb-36 pt-28">
          <motion.section
            className="w-full max-w-5xl"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 text-center">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.34em]" style={{ color: `${world.accent}aa` }}>
                {world.signal}
              </p>
              <h1 className="text-6xl font-black leading-none md:text-8xl">{song.title}</h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/54">{world.atmosphere}</p>
            </div>

            <motion.div
              className="relative mx-auto max-w-4xl overflow-hidden border bg-black/28 shadow-[0_30px_140px_rgba(0,0,0,0.42)] backdrop-blur-xl"
              style={{ borderColor: `${world.accent}24` }}
              animate={{
                boxShadow: isPlaying
                  ? [`0 24px 120px ${world.accent}14`, `0 34px 160px ${world.accent}28`, `0 24px 120px ${world.accent}14`]
                  : `0 24px 120px rgba(0,0,0,0.42)`,
              }}
              transition={{ duration: 4, repeat: isPlaying ? Infinity : 0 }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${world.accent}88, transparent)` }} />
              <LyricsDisplay
                key={song.id}
                lyricsPath={song.lyricsPath}
                className="h-[48vh] min-h-[390px]"
              />
            </motion.div>

            <AnimatePresence>
              {showMeteors && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(14)].map((_, i) => (
                    <motion.img
                      key={i}
                      src="/images/star.png"
                      alt=""
                      className="absolute h-8 w-8 object-contain"
                      style={{
                        left: `${(i * 23 + 8) % 100}%`,
                        top: `${(i * 41 + 12) % 100}%`,
                        filter: `drop-shadow(0 0 10px ${world.accent})`,
                      }}
                      animate={{ y: [0, -26, 0], rotate: [0, 180, 360], opacity: [0, 1, 0] }}
                      transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pointer-events-none fixed bottom-24 left-5 z-20 hidden max-w-xs border border-white/10 bg-black/36 p-4 backdrop-blur-xl md:block">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: `${world.accent}aa` }}>
                Current World
              </p>
              <p className="text-sm leading-6 text-white/58">{world.atmosphere}</p>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
