'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { SignalTool } from './data';

export function SignalToolButton({
  tool,
  index,
  position,
  collected,
  focused,
  hiddenForChase,
  onClick,
}: {
  tool: SignalTool;
  index: number;
  position?: { left: string; top: string };
  collected: boolean;
  focused: boolean;
  // True while the recovery mini-game's wandering pocket is currently
  // standing in for this tool, so the static button ducks out of the way.
  hiddenForChase: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // Drives the intro reveal off useInView + a single `animate` prop (rather
  // than initial/whileInView) so the same prop can also own the
  // collected-driven fade-out below — mixing whileInView with animate on the
  // same values is ambiguous about which one wins once collected changes.
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  const hidden = collected || hiddenForChase;

  return (
    <motion.button
      id={`signal-tool-${tool.id}`}
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={hidden}
      aria-label={collected ? `${tool.name} already collected` : `Scan ${tool.name}`}
      className={`absolute z-20 grid w-[140px] -translate-x-1/2 -translate-y-1/2 justify-items-center text-center group ${hidden ? 'pointer-events-none' : ''}`}
      style={{ left: position?.left, top: position?.top }}
      animate={{
        opacity: !isInView ? 0 : hidden ? 0 : 1,
        scale: !isInView ? 0.82 : collected ? 0.5 : 1,
      }}
      transition={
        !isInView
          ? { duration: 0.65, delay: index * 0.1 } // staggered first reveal
          : { duration: collected ? 0.45 : 0.25, ease: hidden ? 'easeIn' : 'easeOut' } // chase hide/show or collected fade — no stagger
      }
    >
      <span className={`relative grid h-24 w-24 place-items-center rounded-full border bg-black/68 backdrop-blur-xl transition duration-300 ${
        focused
          ? 'border-cyan-100/38 shadow-[0_0_60px_rgba(165,231,255,0.18)]'
          : 'border-white/12 group-hover:border-white/28'
      }`}>
        <span className="absolute inset-[-18%] rounded-full border border-white/8" />
        <Image src={tool.image} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
      </span>
      <span className="mt-3 block rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/46 backdrop-blur-md">
        {collected ? 'Collected' : 'Signal Tool'}
      </span>
      <span className={`mt-2 block max-w-[150px] text-xs font-semibold leading-tight transition ${
        focused ? 'text-white/86' : 'text-white/38'
      }`}>
        {tool.name}
      </span>
    </motion.button>
  );
}
