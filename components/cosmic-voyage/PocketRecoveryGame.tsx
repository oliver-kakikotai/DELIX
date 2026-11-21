'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SignalTool } from './data';

// ── Pocket drawing (canvas, centered on 0,0, ~64×60) ──

// U-shaped pouch body with a dark opening across the top and a stitched seam.
function drawPocket(ctx: CanvasRenderingContext2D, fill: string) {
  ctx.beginPath();
  ctx.moveTo(-30, -20);
  ctx.lineTo(30, -20);
  ctx.quadraticCurveTo(35, 12, 22, 28);
  ctx.quadraticCurveTo(0, 38, -22, 28);
  ctx.quadraticCurveTo(-35, 12, -30, -20);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();

  // Stitched seam just inside the outline.
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-25, -13);
  ctx.quadraticCurveTo(-28, 10, -18, 22);
  ctx.quadraticCurveTo(0, 30, 18, 22);
  ctx.quadraticCurveTo(28, 10, 25, -13);
  ctx.stroke();
  ctx.restore();

  // Opening.
  ctx.beginPath();
  ctx.ellipse(0, -20, 30, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1f4a';
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Two dot eyes and a mouth that change with the chase state; sweat drops
// when cornered.
function drawFace(ctx: CanvasRenderingContext2D, status: string, now: number) {
  ctx.fillStyle = '#111';
  ctx.strokeStyle = '#111';
  ctx.lineCap = 'round';

  if (status === 'cornered') {
    // Squeezed-shut eyes: > <
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-13, 0); ctx.lineTo(-7, 4); ctx.lineTo(-13, 8);
    ctx.moveTo(13, 0);  ctx.lineTo(7, 4);  ctx.lineTo(13, 8);
    ctx.stroke();
    // Wobbly mouth
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, 17);
    ctx.quadraticCurveTo(-3.5, 13, 0, 17);
    ctx.quadraticCurveTo(3.5, 21, 7, 17);
    ctx.stroke();
    // Sweat drops, bobbing
    const bob = Math.sin(now / 120) * 2;
    for (const [x, y] of [[30, -10 + bob], [-31, -4 - bob]] as const) {
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.quadraticCurveTo(x + 4, y + 1, x, y + 3);
      ctx.quadraticCurveTo(x - 4, y + 1, x, y - 6);
      ctx.fillStyle = '#9fd8ff';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    return;
  }

  // Eyes — wider when it senses you.
  const r = status === 'fleeing' ? 3.6 : 2.8;
  ctx.beginPath();
  ctx.arc(-9, 4, r, 0, Math.PI * 2);
  ctx.arc(9, 4, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.beginPath();
  if (status === 'fleeing') {
    // Small "o" of alarm
    ctx.arc(0, 16, 3, 0, Math.PI * 2);
  } else {
    // Smug little smile
    ctx.moveTo(-6, 14);
    ctx.quadraticCurveTo(0, 19, 6, 14);
  }
  ctx.stroke();
}

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
  // Shows a pulsing "Drag me" hint on the tool until the first grab.
  const [hasDragged, setHasDragged] = useState(false);

  const R      = 32;
  const FLEE   = 160;
  const MARGIN = 58;
  const CAP    = R * 2 + 14;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size is cached from a ResizeObserver rather than read with
    // getBoundingClientRect() inside the render loop — that forced a layout
    // recalculation on every single frame for the whole life of the page.
    let cssW = canvas.clientWidth;
    let cssH = canvas.clientHeight;
    const fit = () => {
      if (canvas.width !== cssW || canvas.height !== cssH) {
        canvas.width  = cssW;
        canvas.height = cssH;
      }
    };
    fit();
    const ro = new ResizeObserver(([entry]) => {
      cssW = Math.round(entry.contentRect.width);
      cssH = Math.round(entry.contentRect.height);
    });
    ro.observe(canvas);


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

    // The loop only runs while the game is actually on screen. It used to
    // draw (with expensive canvas shadowBlur glows) every frame from page
    // load onward, even while the visitor was still up in the 3D/planet
    // section and nowhere near the game.
    let rafId = 0;
    let visible = false;
    const schedule = () => {
      rafId = visible ? requestAnimationFrame(tick) : 0;
    };

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
      if (!s.initialized) { schedule(); return; }

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
      if (s.closeT === -2) { schedule(); return; }

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

      if (inSuccess) {
        // Captured — pocket turns acid yellow with a check, pulsing.
        const glow = 0.4 + 0.4 * Math.sin(s.successT * Math.PI * 4);
        ctx.shadowColor = `rgba(217,255,18,${glow})`;
        ctx.shadowBlur  = 24 + glow * 26;
        drawPocket(ctx, '#D9FF12');
        ctx.shadowBlur  = 0;
        ctx.strokeStyle = '#111';
        ctx.lineWidth   = 3.5;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.globalAlpha = closeAlpha * Math.min(1, s.successT * 5);
        ctx.beginPath();
        ctx.moveTo(-11, 4); ctx.lineTo(-3, 13); ctx.lineTo(13, -5);
        ctx.stroke();
        ctx.globalAlpha = closeAlpha;
      } else {
        // Normal or closing pocket — a little cream pouch creature in the
        // same thick-outline style as the DELIX artwork.
        ctx.rotate((s.shake * Math.PI) / 180);
        ctx.scale(s.shakeScale, s.shakeScale);
        if (cDraw && !inClose) {
          ctx.shadowColor = `rgba(217,255,18,${0.25 + s.pressure / 200})`;
          ctx.shadowBlur  = 14 + s.pressure * 0.3;
        }
        drawPocket(ctx, '#F4F1E8');
        ctx.shadowBlur = 0;
        drawFace(ctx, s.status, now);
      }

      ctx.restore();
      schedule();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !rafId) rafId = requestAnimationFrame(tick);
    });
    io.observe(canvas);
    return () => {
      visible = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onToolDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (g.current.placed || g.current.allDone) return;
    setHasDragged(true);
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
      <div className="pointer-events-none absolute left-4 top-4 z-[6] -rotate-1 rounded-full bg-[#D9FF12] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
        {label}
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[6]">
        <div className="mb-1.5 flex justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span>Corner pressure</span><span>{pressure}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[#D9FF12]"
            animate={{ width: `${pressure}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>
      </div>
      <div
        ref={toolDivRef}
        className="absolute z-[30] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border-[3px] border-black bg-[#F4F1E8] shadow-[0_10px_30px_rgba(0,0,0,0.5)] touch-none select-none"
        style={{ left: 0, top: 0, opacity: 0 }}
        onPointerDown={onToolDown}
        onPointerMove={onToolMove}
        onPointerUp={onToolUp}
        onPointerLeave={onToolUp}
      >
        {!hasDragged && (
          <>
            <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[#D9FF12] motion-safe:animate-ping" />
            <span className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#D9FF12] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black">
              Drag me
            </span>
          </>
        )}
        {toolImg && <Image src={toolImg} alt="" width={44} height={44} className="h-11 w-11 object-contain pointer-events-none" />}
      </div>
    </>
  );
}
