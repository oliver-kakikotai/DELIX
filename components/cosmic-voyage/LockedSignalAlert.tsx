'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { LockedMission } from './data';

// Pop-up when a visitor clicks a locked planet. Same playful "warning"
// language as the PhaseWarning tag (hand-lettered tag),
// and it shows the actual key needed rather than just its name. Centred
// with a dimmed backdrop, so it never sits on top of the planet's own card.
export function LockedSignalAlert({
  mission,
  keysFound,
  keysTotal,
  onFindKey,
  onClose,
}: {
  mission: LockedMission | null;
  keysFound: number;
  keysTotal: number;
  onFindKey: () => void;
  onClose: () => void;
}) {
  // Escape closes it.
  useEffect(() => {
    if (!mission) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mission, onClose]);

  return (
    <AnimatePresence>
      {mission && (
        <motion.div
          key="locked-alert"
          className="fixed inset-0 z-[80] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="locked-alert-title"
            className="relative w-[min(92vw,400px)] rounded-[28px] border border-white/12 bg-[#07080f]/95 px-7 pb-7 pt-6 text-center shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            // Small "denied" head-shake once it lands.
            animate={{ opacity: 1, scale: 1, y: 0, x: [0, 0, -9, 8, -6, 4, 0] }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
              x: { duration: 0.5, delay: 0.25, times: [0, 0.01, 0.2, 0.4, 0.6, 0.8, 1] },
            }}
          >
            {/* Warning tag */}
            <div className="flex items-center justify-center">
              <span className="whitespace-nowrap font-script text-2xl leading-none text-white/85">
                Signal locked
              </span>
            </div>

            {/* The key this planet needs */}
            <div className="relative mx-auto mt-7 grid h-28 w-28 place-items-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-dashed border-white/25 motion-safe:animate-[spin_14s_linear_infinite]"
              />
              <span aria-hidden="true" className="absolute inset-3 rounded-full bg-white/[0.04]" />
              {mission.toolImage ? (
                <Image src={mission.toolImage} alt="" width={64} height={64} className="relative h-16 w-16 object-contain" />
              ) : (
                <span className="relative text-3xl text-white/50">?</span>
              )}
              {/* little padlock badge */}
              <span className="absolute -bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black text-sm">
                🔒
              </span>
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/40">Key required</p>
            <h3 id="locked-alert-title" className="mt-2 text-xl font-black tracking-[0.06em] text-white">
              {mission.toolName}
            </h3>
            <p className="mt-3 px-4 text-sm leading-6 text-white/55">{mission.clue}</p>

            <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/35">
              Keys recovered {keysFound} / {keysTotal}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onFindKey}
                autoFocus
                className="rounded-full bg-white py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-black outline-none transition hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080f]"
              >
                Go find the key →
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40 transition hover:text-white/75"
              >
                Keep flying
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
