'use client';

import { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import { SignalTool } from './data';

export function VoyageToolBeacon({
  tool,
  progress,
  collected,
  onInspect,
}: {
  tool: SignalTool;
  progress: MotionValue<number>;
  collected: boolean;
  onInspect: () => void;
}) {
  const x = useTransform(progress, tool.range, tool.x);
  const y = useTransform(progress, tool.range, tool.y);
  const opacity = useTransform(progress, tool.range, collected ? [0, 0, 0] : [0, 1, 0]);
  const scale = useTransform(progress, tool.range, [0.62, 1, 0.62]);
  const [isNear, setIsNear] = useState(false);
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest >= tool.range[0] - 0.02 && latest <= tool.range[2] + 0.02;
    setIsNear((prev) => (prev === next ? prev : next));
  });

  if (!isNear) return null;

  return (
    <motion.button
      type="button"
      onClick={onInspect}
      aria-label={`Scan ${tool.name}`}
      className="pointer-events-auto absolute left-1/2 top-1/2 z-40 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/18 bg-black/50 shadow-[0_0_42px_rgba(165,231,255,0.18)] backdrop-blur-xl"
      style={{ x, y, opacity, scale }}
    >
      <span className="absolute inset-[-22%] rounded-full border border-cyan-100/12" />
      <Image src={tool.image} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
      <span className="sr-only">{tool.name}</span>
    </motion.button>
  );
}
