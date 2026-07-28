'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SignalTool } from './data';

export function PocketRecoveryGame({
  tools,
  checkCollected,
  onCollect,
  onActiveToolChange,
}: {
  tools: SignalTool[];
  checkCollected: (id: number) => boolean;
  onCollect: (toolId: number) => void;
  // Reports which tool's static button should be hidden because this
  // instance's wandering pocket is currently standing in for it — driven
  // through React/props instead of an imperative `btn.style.opacity` DOM
  // write, since SignalToolButton now also drives its own opacity off
  // `collected` via framer-motion's `animate`, and the two were fighting
  // (framer would periodically re-assert opacity:1 and pop the "hidden"
  // button back into view while its pocket was still being chased).
  onActiveToolChange?: (id: number | null) => void;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const toolDivRef = useRef<HTMLDivElement>(null);
  // Keep latest callbacks without re-running the effect
  const cbs = useRef({ tools, checkCollected, onCollect, onActiveToolChange });
  useEffect(() => { cbs.current = { tools, checkCollected, onCollect, onActiveToolChange }; });
  // Track collected IDs internally to avoid async state timing issues
  const collectedIds = useRef(new Set(tools.filter(t => checkCollected(t.id)).map(t => t.id)));

  const g = useRef({
    px: 0, py: 0,
    tx: 0, ty: 0,
    phase:       Math.random() * Math.PI * 2,
    pressure:    0,
    status:      'roaming',
    placed:      false,   // current tool just placed into pocket
    successT:    -1,      // 0→1: success glow animation
    needsAdvance: false,  // flag: switch to next tool after success
    allDone:     false,   // all 4 tools placed
    closeT:      -1,      // 0→1: pocket close animation
    shake:       0,
    shakeScale:  1,
    initialized: false,
  });

  const [label, setLabel]       = useState('Chase the pocket');
  const [pressure, setPressure] = useState(0);
  const [toolImg, setToolImg]   = useState('');

  const R      = 32;
  const FLEE   = 160;
  const MARGIN = 58;
  const CAP    = R * 2 + 14;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      if (canvas.width !== r.width || canvas.height !== r.height) {
        canvas.width  = r.width;
        canvas.height = r.height;
      }
    };
    fit();

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y,     x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x,     y + h, r);
      ctx.arcTo(x,     y + h, x,     y,     r);
      ctx.arcTo(x,     y,     x + w, y,     r);
      ctx.closePath();
    };

    // Place the next uncollected tool — starts at the tool button's position
    const spawnTool = (W: number, H: number) => {
      const next = cbs.current.tools.find(t => !collectedIds.current.has(t.id));
      if (!next) {
        g.current.allDone = true;
        g.current.closeT  = 0;
        setLabel('All signals recovered');
        if (toolDivRef.current) toolDivRef.current.style.opacity = '0';
        cbs.current.onActiveToolChange?.(null);
        return;
      }

      cbs.current.onActiveToolChange?.(next.id);

      // Find the button for this tool and use its center position
      const btn = document.getElementById(`signal-tool-${next.id}`);
      const canvasRect = canvas.getBoundingClientRect();
      if (btn && canvasRect.width > 0) {
        const br = btn.getBoundingClientRect();
        g.current.tx = br.left + br.width  / 2 - canvasRect.left;
        g.current.ty = br.top  + br.height / 2 - canvasRect.top;
      } else {
        // Fallback to random if button not found
        const m = R + 24;
        g.current.tx = m + Math.random() * (W - m * 2);
        g.current.ty = m + Math.random() * (H - m * 2);
      }

      g.current.placed     = false;
      g.current.pressure   = 0;
      g.current.status     = 'roaming';
      g.current.shake      = 0;
      g.current.shakeScale = 1;
      setLabel('Chase the pocket');
      setPressure(0);
      setToolImg(next.image);
      if (toolDivRef.current) {
        toolDivRef.current.style.left    = `${g.current.tx}px`;
        toolDivRef.current.style.top     = `${g.current.ty}px`;
        toolDivRef.current.style.opacity = '1';
      }
    };

    let rafId: number;

    const tick = (now: number) => {
      fit();
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const s = g.current;

      // ── Initialize ──
      if (!s.initialized && W > 0 && H > 0) {
        const m = R + 24;
        s.px = m + Math.random() * (W - m * 2);
        s.py = m + Math.random() * (H - m * 2);
        s.initialized = true;
        spawnTool(W, H);
      }
      if (!s.initialized) { rafId = requestAnimationFrame(tick); return; }

      // ── Advance to next tool after success animation ──
      if (s.needsAdvance) {
        s.needsAdvance = false;
        spawnTool(W, H);
      }

      // ── Success animation ──
      if (s.successT >= 0) {
        s.successT += 0.016;
        if (s.successT >= 1) {
          s.successT     = -1;
          s.needsAdvance = true;
        }
      }

      // ── Pocket close animation (all done) ──
      if (s.closeT >= 0) {
        s.closeT += 0.02;
        if (s.closeT >= 1) s.closeT = -2;
      }
      if (s.closeT === -2) { rafId = requestAnimationFrame(tick); return; }

      // ── Physics (skip during success or all done) ──
      if (!s.placed && !s.allDone && s.successT < 0) {
        const dx = s.tx - s.px, dy = s.ty - s.py;
        const dist = Math.hypot(dx, dy);
        let nx = s.px, ny = s.py;

        if (dist < FLEE) {
          const a = Math.atan2(-dy, -dx);
          nx += Math.cos(a) * 4;
          ny += Math.sin(a) * 4;
          if (s.status === 'roaming') { s.status = 'fleeing'; setLabel('It senses you...'); }
        } else {
          s.phase += 0.014;
          const gx  = W * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(s.phase * 1.1)));
          const gy  = H * (0.15 + 0.7 * (0.5 + 0.5 * Math.cos(s.phase * 0.73 + 1.2)));
          const gdx = gx - s.px, gdy = gy - s.py;
          const gd  = Math.hypot(gdx, gdy) || 1;
          nx += (gdx / gd) * Math.min(gd * 0.07, 2.0);
          ny += (gdy / gd) * Math.min(gd * 0.07, 2.0);
          if (s.status === 'fleeing') { s.status = 'roaming'; setLabel('Chase the pocket'); }
        }

        s.px = Math.max(R, Math.min(W - R, nx));
        s.py = Math.max(R, Math.min(H - R, ny));

        const d2       = Math.hypot(s.tx - s.px, s.ty - s.py);
        const cornered = (s.px < MARGIN || s.px > W - MARGIN) && (s.py < MARGIN || s.py > H - MARGIN);

        if (cornered && d2 < FLEE) {
          if (s.status !== 'cornered') { s.status = 'cornered'; setLabel('Cornered — close in!'); }
          s.shake      = Math.sin(now / 45) * 6 * (0.3 + s.pressure / 100);
          s.shakeScale = 1 + Math.abs(s.shake) * 0.012;

          if (d2 < CAP) {
            s.pressure = Math.min(100, s.pressure + 1.8);
            setPressure(Math.round(s.pressure));

            if (s.pressure >= 100) {
              // Capture! Mark tool as collected
              const current = cbs.current.tools.find(t => !collectedIds.current.has(t.id));
              if (current) {
                collectedIds.current.add(current.id);
                cbs.current.onCollect(current.id);
                // Leave the button hidden — SignalToolButton now fades/shrinks
                // it away permanently once `collected` is true, instead of
                // popping back to full opacity.
              }
              s.placed   = true;
              s.successT = 0;
              setLabel('Signal captured!');
              if (toolDivRef.current) toolDivRef.current.style.opacity = '0';
            }
          } else {
            s.pressure = Math.max(0, s.pressure - 0.8);
            setPressure(Math.round(s.pressure));
          }
        } else {
          if (s.status === 'cornered') {
            s.status = d2 < FLEE ? 'fleeing' : 'roaming';
            setLabel(d2 < FLEE ? 'It senses you...' : 'Chase the pocket');
          }
          s.shake      *= 0.84;
          s.shakeScale  = 1 + (s.shakeScale - 1) * 0.84;
          s.pressure    = Math.max(0, s.pressure - 1);
          setPressure(Math.round(s.pressure));
        }
      }

      // ── Draw pocket ──
      const cDraw = (s.px < MARGIN || s.px > W - MARGIN) && (s.py < MARGIN || s.py > H - MARGIN);
      const inSuccess = s.successT >= 0;
      const inClose   = s.closeT >= 0;
      const closeAlpha = inClose ? Math.max(0, 1 - s.closeT) : 1;

      ctx.save();
      ctx.globalAlpha = closeAlpha;
      ctx.translate(s.px, s.py);

      const pw = 58, ph = 52, pr = 13;

      if (inSuccess) {
        // Glowing success state — pocket stays, shows checkmark
        const glow = 0.4 + 0.4 * Math.sin(s.successT * Math.PI * 4);
        ctx.shadowColor = `rgba(165,231,255,${glow})`;
        ctx.shadowBlur  = 24 + glow * 22;
        rr(-pw / 2, -ph / 2, pw, ph, pr);
        ctx.fillStyle   = `rgba(165,231,255,0.2)`;
        ctx.strokeStyle = `rgba(165,231,255,0.88)`;
        ctx.lineWidth   = 2;
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur  = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.lineWidth   = 2.5;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.globalAlpha = closeAlpha * Math.min(1, s.successT * 5);
        ctx.beginPath();
        ctx.moveTo(-11, 0); ctx.lineTo(-3, 9); ctx.lineTo(13, -9);
        ctx.stroke();
        ctx.globalAlpha = closeAlpha;
      } else {
        // Normal or closing pocket
        ctx.rotate((s.shake * Math.PI) / 180);
        ctx.scale(s.shakeScale, s.shakeScale);
        if (cDraw && !inClose) {
          ctx.shadowColor = `rgba(165,231,255,${0.18 + s.pressure / 350})`;
          ctx.shadowBlur  = 16 + s.pressure * 0.2;
        }
        rr(-pw / 2, -ph / 2, pw, ph, pr);
        ctx.fillStyle   = `rgba(165,231,255,${0.07 + s.pressure / 900})`;
        ctx.strokeStyle = `rgba(165,231,255,${0.35 + s.pressure / 280})`;
        ctx.lineWidth   = 1.5;
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(165,231,255,0.45)';
        rr(-15, -5, 30, 8, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(165,231,255,0.28)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(-14, ph / 2 + 1);
        ctx.quadraticCurveTo(0, ph / 2 + 9, 14, ph / 2 + 1);
        ctx.stroke();
      }

      ctx.restore();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onToolDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (g.current.placed || g.current.allDone) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
    e.preventDefault();
  };

  const onToolMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 || g.current.placed || g.current.allDone) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(R, Math.min(rect.width  - R, e.clientX - rect.left));
    const y = Math.max(R, Math.min(rect.height - R, e.clientY - rect.top));
    g.current.tx = x;
    g.current.ty = y;
    e.currentTarget.style.left = `${x}px`;
    e.currentTarget.style.top  = `${y}px`;
  };

  const onToolUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.cursor = 'grab';
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full z-[5] pointer-events-none"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-[6] text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-100/50">
        {label}
      </div>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[6]">
        <div className="mb-1 flex justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">
          <span>Corner pressure</span><span>{pressure}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-cyan-100/70"
            animate={{ width: `${pressure}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>
      </div>
      <div
        ref={toolDivRef}
        className="absolute z-[30] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border border-white/25 bg-black/70 shadow-[0_0_28px_rgba(255,255,255,0.16)] touch-none select-none"
        style={{ left: 0, top: 0, opacity: 0 }}
        onPointerDown={onToolDown}
        onPointerMove={onToolMove}
        onPointerUp={onToolUp}
        onPointerLeave={onToolUp}
      >
        {toolImg && <Image src={toolImg} alt="" width={44} height={44} className="h-11 w-11 object-contain pointer-events-none" />}
      </div>
    </>
  );
}
