'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { albumData } from '@/data/albumData';
import { useAudio } from '@/contexts/AudioContext';
import SongTitle from '../SongTitle';
import StarField from '../StarField';
import { starField } from './data';

// The payoff after the last signal tool is recovered: replaces the usual
// single-song popup with the whole album as a tracklist (every song DELIX
// wrote since landing on Earth), the just-unlocked one marked as new, and a
// button to play it from track 1 (the player then runs through the album).
export function AlbumCompleteFinale({
  open,
  newSongId,
  onOpenSong,
  onClose,
}: {
  open: boolean;
  /** The song the final tool unlocked, tagged "new" in the list. */
  newSongId: number | null;
  onOpenSong: (slug: string) => void;
  onClose: () => void;
}) {
  const { startSong } = useAudio();
  const songs = albumData.songs;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="album-complete"
          role="dialog"
          aria-modal="true"
          aria-labelledby="album-complete-title"
          className="fixed inset-0 z-[95] overflow-y-auto bg-black/92"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="pointer-events-none fixed inset-0">
            <StarField stars={starField} />
          </div>

          <div className="relative mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center px-5 py-10 text-center">
            {/* Same hand-lettered tag as the PhaseWarning */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="whitespace-nowrap font-script text-2xl leading-none text-white/85">
                Archive complete
              </span>
            </motion.div>

            <motion.h2
              id="album-complete-title"
              className="mt-5 font-script text-5xl text-white md:text-6xl"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              The whole album is unlocked.
            </motion.h2>
            <motion.p
              className="mt-4 max-w-md text-sm leading-6 text-white/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              Every song DELIX has written since landing on Earth is yours now. Thanks for flying with us.
            </motion.p>

            {/* Tracklist */}
            <ol className="mt-7 w-full space-y-2">
              {songs.map((song, i) => (
                <motion.li
                  key={song.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.09, ease: 'easeOut' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSong(song.slug);
                    }}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <span className="w-6 text-[11px] font-semibold tabular-nums text-white/35">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {song.planetImage && (
                      <Image
                        src={song.planetImage}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <SongTitle
                      as="h3"
                      title={song.title}
                      titleImage={song.titleImage}
                      sizes="200px"
                      className={song.titleImage ? 'w-[min(52vw,200px)]' : 'text-2xl leading-none text-white'}
                      imageClassName="max-h-12 object-contain object-left"
                    />
                    <span className="ml-auto flex items-center gap-3">
                      {song.id === newSongId && (
                        <span className="rounded-full border border-white/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                          New
                        </span>
                      )}
                      <span className="text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70">→</span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </ol>

            <motion.div
              className="mt-6 flex w-full flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + songs.length * 0.09 + 0.1 }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => {
                  startSong(songs[0]);
                  onClose();
                }}
                className="rounded-full bg-white py-3.5 text-[11px] font-bold uppercase tracking-[0.24em] text-black outline-none transition hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                ▶ Play the whole album
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40 transition hover:text-white/75"
              >
                Keep exploring
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
