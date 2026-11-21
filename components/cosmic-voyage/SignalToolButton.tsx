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
      className={`absolute z-20 grid w-[96px] -translate-x-1/2 -translate-y-1/2 justify-items-center text-center group md:w-[140px] ${hidden ? 'pointer-events-none' : ''}`}
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
      <span className={`relative grid h-16 w-16 place-items-center rounded-full border-[3px] border-black bg-[#F4F1E8] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition duration-300 group-hover:-rotate-6 group-hover:scale-105 md:h-24 md:w-24 ${
        focused ? 'ring-4 ring-[#D9FF12]/70' : ''
      }`}>
        <Image src={tool.image} alt="" width={56} height={56} className="h-10 w-10 object-contain md:h-14 md:w-14" />
      </span>
      <span className={`mt-2 block max-w-[150px] text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] transition md:mt-3 md:text-xs md:normal-case md:tracking-normal ${
        focused ? 'text-white/86' : 'text-white/45'
      }`}>
        {tool.name}
      </span>
    </motion.button>
  );
}
