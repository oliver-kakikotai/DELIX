'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { albumData } from '@/data/albumData';
import SongTitle from '../SongTitle';
import { SignalTool } from './data';

// Pop-up after a signal tool is recovered: shows the song it unlocked.
// Everything shown is derived from the tool (and its song in albumData), so
// callers only pass which tool was just collected.
export function SongUnlockedAlert({
  tool,
  onEnter,
  onClose,
}: {
  tool: SignalTool | null;
  onEnter: (slug: string) => void;
  onClose: () => void;
}) {
  // Escape closes it.
  useEffect(() => {
    if (!tool) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, onClose]);

  const song = tool ? albumData.songs.find((s) => s.id === tool.songId) : undefined;
  const color = song?.color ?? '#ffffff';

  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          key="song-unlocked"
          className="fixed inset-0 z-[90] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* modal card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="song-unlocked-title"
            className="relative z-10 w-[min(92vw,480px)] overflow-hidden border border-white/14 bg-black/90 shadow-[0_40px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* planet image banner */}
            <div className="relative h-52 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 60% 50%, ${color}28, transparent 70%)` }}
              />
              <Image
                src={song?.planetImage ?? '/images/planet1.png'}
                alt=""
                width={176}
                height={176}
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-80"
                style={{ boxShadow: `0 0 80px ${color}44` }}
              />
              {/* tool icon badge */}
              <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-cyan-100/28 bg-black/70 shadow-[0_0_28px_rgba(165,231,255,0.18)] backdrop-blur-xl">
                <Image src={tool.image} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
              {/* scan line */}
              <motion.div
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-100/60 to-transparent"
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent" />
            </div>

            {/* content */}
            <div className="px-7 pb-7 pt-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-100/52">
                ✦ Song Unlocked
              </p>
              {/* Same hand-lettered wordmark as the planet cards and song page. */}
              <div id="song-unlocked-title">
                <SongTitle
                  title={tool.unlocksSong}
                  titleImage={song?.titleImage}
                  className="w-[min(100%,300px)] text-5xl leading-none text-white"
                  sizes="300px"
                />
              </div>

              {/* genre badge */}
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{ borderColor: `${color}44`, background: `${color}12` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>
                  {song?.genre ?? 'Unknown Genre'}
                </span>
              </div>

              {song?.intro && <p className="mt-5 text-sm leading-7 text-white/55">{song.intro}</p>}

              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/30">
                Recovered via: {tool.name}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    onClose();
                    if (song?.slug) onEnter(song.slug);
                  }}
                  className="flex-1 rounded-full border border-white/18 bg-white/[0.08] py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white outline-none transition hover:bg-white/[0.14] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-100/60"
                >
                  Enter this world →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/36 transition hover:text-white/70"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
