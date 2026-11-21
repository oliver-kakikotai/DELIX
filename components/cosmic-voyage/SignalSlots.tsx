'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { albumData } from '@/data/albumData';
import { SignalTool } from './data';

// Replaces the old "Signal Log" list: four polaroid slots under the game
// board. An empty slot shows the tool's silhouette; once collected, the tool
// slaps in like a sticker and the unlocked song's hand-lettered title appears
// underneath — clicking it goes straight to that song.

const SLOT_TILTS = [-3, 2, -1.5, 3];

export function SignalSlots({
  tools,
  isCollected,
  onOpenSong,
}: {
  tools: readonly SignalTool[];
  isCollected: (toolId: number) => boolean;
  onOpenSong: (slug: string) => void;
}) {
  const collectedCount = tools.filter((t) => isCollected(t.id)).length;

  return (
    <div className="mt-8">
      <div className="mb-5 flex items-end justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/45">Recovered signals</p>
        <p className="font-script text-3xl leading-none text-[#D9FF12]">
          {collectedCount}
          <span className="text-xl text-white/35">/{tools.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {tools.map((tool, i) => {
          const collected = isCollected(tool.id);
          const song = albumData.songs.find((s) => s.id === tool.songId);
          const tilt = SLOT_TILTS[i % SLOT_TILTS.length];

          const frame = (
            <div
              className={`bg-[#F4F1E8] p-2 pb-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 md:p-3 md:pb-4 ${
                collected ? 'group-hover:-translate-y-1' : 'opacity-80'
              }`}
              style={{ rotate: `${tilt}deg` }}
            >
              <div className="relative grid aspect-square place-items-center overflow-hidden bg-[#14111f]">
                {/* Silhouette while empty */}
                <Image
                  src={tool.image}
                  alt=""
                  width={160}
                  height={160}
                  className="h-1/2 w-1/2 object-contain opacity-20 brightness-0 invert"
                />
                <AnimatePresence>
                  {collected && (
                    <motion.div
                      key="sticker"
                      className="absolute inset-0 grid place-items-center bg-[#D9FF12]"
                      initial={{ scale: 1.6, rotate: -18, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    >
                      <Image
                        src={tool.image}
                        alt={tool.name}
                        width={200}
                        height={200}
                        className="h-2/3 w-2/3 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-2 flex h-10 items-center justify-center md:h-14">
                {collected && song?.titleImage ? (
                  <Image
                    src={song.titleImage}
                    alt={song.title}
                    width={2172}
                    height={724}
                    sizes="(min-width: 768px) 220px, 40vw"
                    className="h-full w-auto max-w-full object-contain brightness-0"
                  />
                ) : collected && song ? (
                  <span className="font-script text-xl text-black">{song.title}</span>
                ) : (
                  <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-black/35">
                    Signal {String(i + 1).padStart(2, '0')} · locked
                  </span>
                )}
              </div>
            </div>
          );

          return collected && song ? (
            <button
              key={tool.id}
              type="button"
              onClick={() => onOpenSong(song.slug)}
              aria-label={`Open ${song.title}`}
              className="group text-left"
            >
              {frame}
            </button>
          ) : (
            <div key={tool.id} aria-label={`${tool.name} not yet recovered`}>
              {frame}
            </div>
          );
        })}
      </div>
    </div>
  );
}
