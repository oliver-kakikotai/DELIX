'use client';

import { RefObject, useEffect, useState } from 'react';
import Image from 'next/image';
import { useUnlock } from '@/contexts/UnlockContext';
import { signalTools, SignalTool } from './data';
import { SignalToolButton } from './SignalToolButton';
import { PocketRecoveryGame } from './PocketRecoveryGame';
import { SignalSlots } from './SignalSlots';

// Tool button slots in the game card (percent of the card). Vertically they
// stay within ~26–74% so a button (icon + name, ~130px tall) never reaches
// the top-left label or the bottom pressure bar, even at the card's 460px
// minimum height; horizontally they stay out of the middle where the pocket
// roams most.
const TOOL_SLOTS = [
  { l: 18, t: 33 },
  { l: 82, t: 33 },
  { l: 18, t: 67 },
  { l: 82, t: 67 },
];
const TOOL_JITTER = { l: 8, t: 12 };

// The homepage's last chapter: the 4 signal tools ("keys") on the game card,
// the pocket-chase mini-game, and the recovered-signals row below it.
// Unlock state comes from UnlockContext; what happens on inspect/collect is
// up to the parent (CosmicVoyage), which also owns the shared recovery panel.
export function SignalToolsSection({
  sectionRef,
  focusedToolId,
  chasedToolId,
  onChasedToolChange,
  onInspect,
  onCollect,
  onOpenSong,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  focusedToolId: number;
  chasedToolId: number | null;
  onChasedToolChange: (toolId: number | null) => void;
  onInspect: (tool: SignalTool) => void;
  onCollect: (tool: SignalTool) => void;
  onOpenSong: (slug: string) => void;
}) {
  const { checkToolCollected } = useUnlock();

  // Positions for the 4 tool buttons inside the signal-tools card: one per
  // slot (left/right × upper/lower band), shuffled and jittered each visit.
  // The bands keep every button clear of the "Chase the pocket" label in the
  // top-left corner and the corner-pressure bar along the bottom — fully
  // random placement used to drop tools on top of them.
  // Starts from the un-jittered slot layout (same on server and client, so
  // hydration never sees mismatched left/top values), then shuffles once
  // mounted — a client-only effect runs after hydration.
  const fallbackToolPositions = TOOL_SLOTS.map((slot) => ({
    left: `${slot.l}%`,
    top: `${slot.t}%`,
  }));
  const [toolPositions, setToolPositions] = useState(fallbackToolPositions);

  useEffect(() => {
    const slots = [...TOOL_SLOTS];
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    setToolPositions(
      slots.map((slot) => ({
        left: `${(slot.l + (Math.random() - 0.5) * TOOL_JITTER.l).toFixed(1)}%`,
        top: `${(slot.t + (Math.random() - 0.5) * TOOL_JITTER.t).toFixed(1)}%`,
      }))
    );
  }, []);

  return (
        <section
          ref={sectionRef}
          id="signal-tools"
          className="relative z-30 mx-auto max-w-6xl px-5 py-28"
        >
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/45">SIGNAL TOOLS</p>
              <h2 className="w-full max-w-[640px]">
                <Image
                  src="/images/收集遗失的钥匙.png"
                  alt="Collect the missing keys."
                  width={2172}
                  height={724}
                  sizes="(min-width: 768px) 640px, 90vw"
                  className="h-auto w-full"
                />
              </h2>
            </div>
            {/* How-to-play card — same irregular acid-yellow language as the
                planet and origin cards. */}
            <div className="relative w-full max-w-sm -rotate-1 px-7 pb-7 pt-8 text-black md:w-[360px]">
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              >
                <path
                  d="M3 12 C14 4 36 7 58 3 C76 0 92 2 97 10 C100 34 95 62 98 88 C98 96 90 99 78 97 C56 94 32 99 12 96 C4 95 1 90 2 80 C3 58 0 34 3 12 Z"
                  fill="#D9FF12"
                />
              </svg>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-black/55">How to play</p>
              <p className="text-sm font-semibold leading-6">
                Drag the signal tool toward the pocket. It runs from you — trap it in a corner and hold until the bar fills.
              </p>
              <p className="mt-2 text-xs leading-5 text-black/60">Each recovered tool unlocks a song.</p>
            </div>
          </div>

          <div className="relative h-[70svh] min-h-[460px] max-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a14]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(120,90,200,0.18),transparent_60%)]" />

            {signalTools.map((tool, index) => (
              <SignalToolButton
                key={tool.id}
                tool={tool}
                index={index}
                position={toolPositions[index]}
                collected={checkToolCollected(tool.id)}
                focused={focusedToolId === tool.id}
                hiddenForChase={chasedToolId === tool.id}
                onClick={() => onInspect(tool)}
              />
            ))}

            <PocketRecoveryGame
              tools={signalTools}
              checkCollected={checkToolCollected}
              onCollect={(toolId) => {
                const t = signalTools.find((st) => st.id === toolId);
                if (t) onCollect(t);
              }}
              onActiveToolChange={onChasedToolChange}
            />
          </div>

          <SignalSlots tools={signalTools} isCollected={checkToolCollected} onOpenSong={onOpenSong} />
        </section>
  );
}
