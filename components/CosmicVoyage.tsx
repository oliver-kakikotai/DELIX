'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, MotionValue, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { albumData } from '@/data/albumData';
import { useUnlock } from '@/contexts/UnlockContext';
import Model3DViewer from './Model3DViewer';
import Planet from './Planet';

const starField = Array.from({ length: 96 }, (_, i) => ({
  left: (i * 47 + 11) % 100,
  top: (i * 83 + 19) % 100,
  size: 1 + ((i * 13) % 3),
  opacity: 0.22 + ((i * 17) % 55) / 100,
  delay: ((i * 29) % 80) / 10,
}));

const flightPaths = [
  {
    x: ['-72vw', '-42vw', '-30vw', '-30vw', '-74vw'],
    y: ['-46vh', '-18vh', '0vh', '0vh', '46vh'],
    scale: [0.06, 0.86, 3.28, 3.28, 0.12],
    range: [0.22, 0.255, 0.29, 0.34, 0.37],
    infoPlacement: 'right',
  },
  {
    x: ['76vw', '42vw', '31vw', '31vw', '76vw'],
    y: ['-42vh', '-16vh', '-1vh', '-1vh', '40vh'],
    scale: [0.06, 0.78, 3.12, 3.12, 0.12],
    range: [0.38, 0.415, 0.45, 0.5, 0.53],
    infoPlacement: 'left',
  },
  {
    x: ['-54vw', '-24vw', '-2vw', '-2vw', '58vw'],
    y: ['58vh', '26vh', '4vh', '4vh', '-42vh'],
    scale: [0.06, 0.9, 3.36, 3.36, 0.14],
    range: [0.54, 0.575, 0.61, 0.66, 0.69],
    infoPlacement: 'right',
  },
  {
    x: ['78vw', '38vw', '24vw', '24vw', '-48vw'],
    y: ['44vh', '17vh', '0vh', '0vh', '-38vh'],
    scale: [0.06, 0.82, 3.18, 3.18, 0.12],
    range: [0.7, 0.735, 0.77, 0.82, 0.85],
    infoPlacement: 'left',
  },
  {
    x: ['8vw', '2vw', '-20vw', '-20vw', '-118vw'],
    y: ['-64vh', '-24vh', '0vh', '0vh', '72vh'],
    scale: [0.05, 0.76, 3.05, 3.05, 0.04],
    range: [0.86, 0.895, 0.915, 0.94, 0.965],
    infoPlacement: 'right',
  },
];

type VoyageSong = (typeof albumData.songs)[number] & {
  unlocked: boolean;
  path: (typeof flightPaths)[number];
};

type LockedMission = {
  title: string;
  toolName: string;
  clue: string;
};

const missionPrinciples = [
  {
    label: '01 / ALBUM WORLD',
    title: 'Songs are planets',
    text: 'Every DELIX track is treated as a place in orbit, not a flat item in a list.',
  },
  {
    label: '02 / SIGNAL TOOLS',
    title: 'Locked songs need keys',
    text: 'Hidden tracks open when the listener collects the matching signal tool.',
  },
  {
    label: '03 / ARCHIVE MEMORY',
    title: 'The IP is discovered in pieces',
    text: 'Lyrics, tools, visual fragments, and song pages build the Runaway Rabbit universe over time.',
  },
];

// Keeps the WebGL portal model's render loop paused whenever the voyage has
// scrolled past the portal phase, instead of leaving it rendering every frame
// for the whole 560vh scroll journey. Isolated in its own component so the
// per-frame scroll updates only re-render this small gate, not all of
// CosmicVoyage.
function Model3DGate({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest <= 0.22;
    setActive((prev) => (prev === next ? prev : next));
  });
  return <Model3DViewer modelPath="/models/hitem3d.glb" className="relative z-10" autoRotateSpeed={1.1} active={active} />;
}

// Same isolation trick for the phase label — it used to be top-level state,
// so every phase change re-rendered the entire CosmicVoyage tree.
function PhaseLabel({ progress, className }: { progress: MotionValue<number>; className: string }) {
  const [phase, setPhase] = useState('PORTAL');
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest < 0.14 ? 'PORTAL' : latest < 0.92 ? 'PLANET APPROACH' : latest < 1 ? 'EXIT VECTOR' : 'ARCHIVE';
    setPhase((prev) => (prev === next ? prev : next));
  });
  return <div className={className}>{phase}</div>;
}

function VoyagePlanet({
  song,
  index,
  progress,
  onClick,
}: {
  song: VoyageSong;
  index: number;
  progress: MotionValue<number>;
  onClick: () => void;
}) {
  const holdStart = song.path.range[2];
  const holdEnd = song.path.range[3];
  const holdSpan = holdEnd - holdStart;
  const infoIn = holdStart + holdSpan * 0.18;
  const infoOut = holdEnd - holdSpan * 0.18;
  // The fixed, backdrop-blurred info card is expensive to keep painting on
  // every scroll frame (backdrop-filter re-samples the whole screen behind
  // it). Only mount it while this song's window is anywhere near active, so
  // a fast scroll isn't recomputing blur for all 5 songs' cards at once.
  const [isNear, setIsNear] = useState(false);
  useMotionValueEvent(progress, 'change', (latest) => {
    const next = latest >= song.path.range[0] - 0.02 && latest <= song.path.range[4] + 0.02;
    setIsNear((prev) => (prev === next ? prev : next));
  });
  const x = useTransform(progress, song.path.range, song.path.x);
  const y = useTransform(progress, song.path.range, song.path.y);
  const planetScale = useTransform(progress, song.path.range, song.path.scale);
  const planetOpacity = useTransform(
    progress,
    [song.path.range[0], song.path.range[1], song.path.range[3], song.path.range[4]],
    [0, 1, 1, 0]
  );
  const infoOpacity = useTransform(
    progress,
    [holdStart, infoIn, infoOut, holdEnd],
    [0, 1, 1, 0]
  );
  const infoY = useTransform(
    progress,
    [holdStart, infoIn, infoOut, holdEnd],
    ['28vh', '0vh', '0vh', '-34vh']
  );
  const depthGlow = useTransform(progress, song.path.range, [0, 0.12, 0.28, 0.28, 0]);
  const infoPlacementClass = song.path.infoPlacement === 'left'
    ? 'left-[7vw]'
    : 'right-[7vw]';

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={song.unlocked ? `Open ${song.title}` : `${song.title} is locked`}
        className="pointer-events-auto absolute left-1/2 top-1/2 z-20 grid h-[28vmin] min-h-40 w-[28vmin] min-w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center"
        style={{ x, y, scale: planetScale, opacity: planetOpacity }}
      >
        <motion.span
          className="absolute h-[30vmin] w-[30vmin] rounded-full"
          style={{
            opacity: depthGlow,
            background: `radial-gradient(circle, ${song.color || '#ffffff'}44, transparent 72%)`,
            filter: 'blur(34px)',
          }}
        />
        <motion.span
          className="relative grid h-full w-full overflow-hidden rounded-full"
        >
          {song.planetImage ? (
            <img
              src={song.planetImage}
              alt={song.title}
              className="h-full w-full scale-[1.055] rounded-full object-cover"
            />
          ) : (
            <Planet alt={song.title} className="h-full w-full" />
          )}
        </motion.span>
      </motion.button>

      {isNear && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={song.unlocked ? `Open ${song.title}` : `${song.title} is locked`}
          className={`pointer-events-auto fixed bottom-[12vh] z-40 w-[min(42vw,480px)] rounded-2xl border border-white/18 bg-white/[0.075] px-6 py-5 text-left shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${infoPlacementClass}`}
          style={{ y: infoY, opacity: infoOpacity }}
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/58">
            {song.unlocked ? 'UNLOCKED SIGNAL' : 'LOCKED SIGNAL'}
          </p>
          <h2 className="text-3xl font-black leading-none text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.38)] md:text-5xl">{song.title}</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
            {song.intro || song.description?.en || 'A passing world in the DELIX archive.'}
          </p>
        </motion.button>
      )}
    </>
  );
}

const signalTools = [
  {
    id: 5,
    songId: 1,
    name: 'COSMIC AMPLIFIER',
    unlocksSong: 'Tomorrow',
    image: '/images/egg.png',
    clue: 'Recovered in the final transmission after the first orbit pass.',
    range: [0.345, 0.365, 0.385],
    x: ['66vw', '52vw', '36vw'],
    y: ['28vh', '6vh', '-18vh'],
  },
  {
    id: 1,
    songId: 2,
    name: 'STELLAR NAVIGATOR',
    unlocksSong: 'The Real Reason',
    image: '/images/NS.png',
    clue: 'Found in the navigation log where the route first breaks open.',
    range: [0.505, 0.525, 0.55],
    x: ['-62vw', '-48vw', '-28vw'],
    y: ['24vh', '4vh', '-22vh'],
  },
  {
    id: 3,
    songId: 4,
    name: 'TEMPORAL DECODER',
    unlocksSong: 'Salmon and Potatoes',
    image: '/images/stone.png',
    clue: 'Buried in a memory fragment from the archive corridor.',
    range: [0.665, 0.685, 0.71],
    x: ['58vw', '42vw', '24vw'],
    y: ['-24vh', '-2vh', '20vh'],
  },
  {
    id: 4,
    songId: 5,
    name: 'ASCENSION CORE',
    unlocksSong: 'The Ascension',
    image: '/images/diamond.png',
    clue: 'Held at the far edge of the ship log, close to the exit vector.',
    range: [0.825, 0.845, 0.87],
    x: ['-56vw', '-36vw', '-18vw'],
    y: ['-28vh', '-4vh', '24vh'],
  },
];

type SignalTool = (typeof signalTools)[number];

function VoyageToolBeacon({
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
      <img src={tool.image} alt="" className="h-14 w-14 object-contain" />
      <span className="sr-only">{tool.name}</span>
    </motion.button>
  );
}

function SignalToolButton({
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
        <img src={tool.image} alt="" className="h-14 w-14 object-contain" />
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

function PocketRecoveryGame({
  tools,
  checkCollected,
  onCollect,
  onActiveToolChange,
}: {
  tools: typeof signalTools;
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
        {toolImg && <img src={toolImg} alt="" className="h-11 w-11 object-contain pointer-events-none" />}
      </div>
    </>
  );
}

function MissionBrief({
  unlockedCount,
  collectedCount,
  nextLockedTitle,
  nextToolName,
  onEnterOrbit,
  onOpenTools,
}: {
  unlockedCount: number;
  collectedCount: number;
  nextLockedTitle?: string;
  nextToolName?: string;
  onEnterOrbit: () => void;
  onOpenTools: () => void;
}) {
  const signalBands = signalTools.slice(0, 4);

  return (
    <section className="relative z-30 min-h-screen overflow-hidden px-5 py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_48%,rgba(80,132,180,0.16),transparent_32%),radial-gradient(circle_at_20%_72%,rgba(126,155,255,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute left-[58%] top-1/2 h-[92vmin] w-[92vmin] -translate-y-1/2 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute left-[63%] top-1/2 h-[62vmin] w-[62vmin] -translate-y-1/2 rounded-full border border-cyan-100/10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-100/18 to-transparent" />

      <motion.div
        className="pointer-events-none absolute right-[-12vmin] top-1/2 h-[68vmin] w-[68vmin] -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.86, x: 80 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: false, amount: 0.34 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-[7%] rounded-full bg-cyan-100/8 blur-3xl" />
        <motion.img
          src="/images/planet2.png"
          alt=""
          className="relative h-full w-full rounded-full object-cover opacity-90 shadow-[0_0_120px_rgba(125,190,255,0.16)]"
          animate={{ rotate: [0, 2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="relative mx-auto grid min-h-[78vh] max-w-7xl grid-cols-1 gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
      <motion.div
        className="relative z-20 max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.75 }}
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-cyan-100/52">Recovered Signal / DELIX IP</p>
        <h2 className="text-6xl font-black leading-[0.86] md:text-8xl">
          Music worlds drifting in one archive.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-9 text-white/62">
          DELIX opens like a flight record. Songs pass as planets, locked tracks answer to signal tools, and the listener slowly reconstructs Runaway Rabbit's orbit from fragments.
        </p>
        <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">Songs</p>
            <p className="mt-3 text-4xl font-black">{unlockedCount}/{albumData.totalSongs}</p>
          </div>
          <div className="border-x border-white/10 px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">Tools</p>
            <p className="mt-3 text-4xl font-black">{collectedCount}/{signalTools.length}</p>
          </div>
          <div className="pl-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">Mode</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/62">Explore</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onEnterOrbit}
            className="rounded-full border border-cyan-100/24 bg-black/36 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/76 backdrop-blur-xl transition hover:border-cyan-100/46 hover:bg-cyan-100/10 hover:text-white"
          >
            Enter Orbit
          </button>
          <button
            type="button"
            onClick={onOpenTools}
            className="rounded-full border border-white/12 bg-black/24 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/54 backdrop-blur-xl transition hover:border-white/26 hover:text-white"
          >
            Trace Signal Tools
          </button>
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 min-h-[620px]"
        initial={{ opacity: 0, y: 70, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.75, delay: 0.08 }}
      >
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/12" />
        <div className="absolute left-1/2 top-1/2 h-px w-[620px] -translate-x-1/2 bg-white/8" />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-px -translate-y-1/2 bg-white/8" />

        <div className="absolute left-1/2 top-1/2 w-[min(72vw,360px)] -translate-x-1/2 -translate-y-1/2 text-center">
          <img src="/images/runaway.png" alt="" className="mx-auto mb-5 h-24 w-24 object-contain opacity-90" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-100/46">Next Signal</p>
          {nextLockedTitle && nextToolName ? (
            <>
              <h3 className="mt-4 text-4xl font-black leading-none text-white">{nextLockedTitle}</h3>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/56">
                Collect <span className="text-cyan-100/86">{nextToolName}</span> and the locked planet becomes audible.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-4 text-4xl font-black leading-none text-white">Archive complete</h3>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/56">
                Every current signal is open. Enter any planet to listen and inspect the world inside.
              </p>
            </>
          )}
        </div>

        <div className="absolute left-[2%] top-[18%] w-[min(42vw,260px)] border-y border-white/10 bg-black/20 py-4 backdrop-blur-sm">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.26em] text-cyan-100/42">Signal Frequencies</p>
          <div className="space-y-4">
            {signalBands.map((tool, index) => {
              const isNext = tool.name === nextToolName;
              return (
                <div key={tool.id} className="grid grid-cols-[52px_1fr] items-center gap-3">
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isNext ? 'text-cyan-100/78' : 'text-white/28'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={`truncate text-[10px] font-semibold uppercase tracking-[0.18em] ${isNext ? 'text-white/78' : 'text-white/36'}`}>
                        {tool.unlocksSong}
                      </span>
                      <span className={`h-1.5 w-1.5 rounded-full ${isNext ? 'bg-cyan-100 shadow-[0_0_18px_rgba(207,250,254,0.9)]' : 'bg-white/20'}`} />
                    </div>
                    <div className="h-px overflow-hidden bg-white/10">
                      <motion.div
                        className={`h-px ${isNext ? 'bg-cyan-100/80' : 'bg-white/28'}`}
                        initial={{ x: '-100%' }}
                        whileInView={{ x: isNext ? '0%' : '-28%' }}
                        viewport={{ once: false, amount: 0.35 }}
                        transition={{ duration: 0.8, delay: index * 0.12 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 grid w-[min(94vw,620px)] -translate-x-1/2 grid-cols-3 border-y border-white/10 bg-black/30 backdrop-blur-xl">
          {missionPrinciples.map((item) => (
            <div key={item.label} className="px-4 py-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">{item.label}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-white/66">{item.title}</p>
            </div>
          ))}
        </div>
      </motion.div>
      </div>
    </section>
  );
}

export default function CosmicVoyage() {
  const router = useRouter();
  const { checkUnlock, collectTool, checkToolCollected, stats } = useUnlock();
  const voyageRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: voyageProgress } = useScroll({
    target: voyageRef,
    offset: ['start start', 'end end'],
  });
  // Mouse-wheel scrolling delivers position updates in coarse, discrete jumps
  // (unlike a trackpad's much higher-frequency stream). Feeding that directly
  // into the portal model's grow/fade animation makes an otherwise-continuous
  // useTransform curve look like it's snapping between sizes/positions. This
  // spring re-adds motion between those discrete updates so it eases smoothly
  // regardless of how chunky the underlying scroll events are. Scoped to the
  // model only — other scroll-linked elements aren't affected.
  const smoothVoyageProgress = useSpring(voyageProgress, { stiffness: 260, damping: 32, mass: 0.6 });
  const [selectedLocked, setSelectedLocked] = useState<LockedMission | null>(null);
  const [unlockNotice, setUnlockNotice] = useState<{
    toolName: string;
    toolImage: string;
    songName: string;
    songGenre: string;
    songIntro: string;
    songColor: string;
    songPlanetImage: string;
    songSlug: string;
  } | null>(null);
  const [focusedToolId, setFocusedToolId] = useState(signalTools[0].id);
  const [recoveryToolId, setRecoveryToolId] = useState<number | null>(null);
  // Which tool's static left-side button should duck out of the way because
  // a PocketRecoveryGame's wandering pocket is currently standing in for it.
  const [chasedToolId, setChasedToolId] = useState<number | null>(null);

  // Reactively watch collectedTools — most reliable way to trigger the notification
  const prevCollectedRef = useRef<number[]>([]);
  useEffect(() => {
    const current = stats.collectedTools ?? [];
    const newId = current.find((id) => !prevCollectedRef.current.includes(id));
    if (newId !== undefined) {
      const tool = signalTools.find((t) => t.id === newId);
      if (tool) {
        const song = albumData.songs.find((s) => s.id === tool.songId);
        setUnlockNotice({
          toolName: tool.name,
          toolImage: tool.image,
          songName: tool.unlocksSong,
          songGenre: song?.genre ?? 'Unknown Genre',
          songIntro: song?.intro ?? '',
          songColor: song?.color ?? '#ffffff',
          songPlanetImage: song?.planetImage ?? '/images/planet1.png',
          songSlug: song?.slug ?? '',
        });
      }
    }
    prevCollectedRef.current = current;
  }, [stats.collectedTools]);

  const cameraY = useTransform(scrollYProgress, [0, 1], ['0vh', '-24vh']);
  // Deep-space drift: starts small and far off, grows as you scroll until it
  // overflows the frame, then hands off to the planet-approach phase.
  //
  // This grow effect is done with a single CSS `transform: scale()` on the
  // wrapper — deliberately NOT by animating its width/height (that makes the
  // R3F canvas inside it resize its actual render target every frame via a
  // ResizeObserver, which fires a frame or two *after* the CSS change; during
  // that lag the still-old aspect/resolution briefly renders skewed toward a
  // corner, which is exactly the transient "runs to the corner, then snaps
  // back" glitch this was causing). A `scale` transform only magnifies the
  // already-rendered pixels — the canvas's own layout size never changes, so
  // there's nothing for a resize observer to react to, and it stays perfectly
  // in sync with scroll every frame. The wrapper's base size is small enough
  // that the rock sits well inside it with margin to spare, so once the
  // scaled-up box exceeds the viewport, its own edges are off-screen and
  // never show up as a hard clip.
  const wrapperScale = useTransform(smoothVoyageProgress, [0, 0.15], [1, 6]);
  const modelOpacity = useTransform(smoothVoyageProgress, [0, 0.15, 0.2], [1, 1, 0]);
  // Plain vh units (not a percentage) — safe to combine with `scale` on the
  // same element, since only percentage-based translate offsets have the
  // stale-reference-size problem described above.
  const modelY = useTransform(smoothVoyageProgress, [0, 0.15], ['8vh', '0vh']);
  // These all use the spring-smoothed progress, not the raw scroll value —
  // see smoothVoyageProgress above. The planets' own flight paths (x/y/scale
  // in flightPaths, further below) span nearly the whole viewport and were
  // originally driven by raw voyageProgress directly; a single coarse
  // mouse-wheel tick could jump the raw progress far enough within a
  // planet's narrow range window to make it visually teleport across the
  // screen instead of flying across it, which got much worse on a fast
  // reverse scroll. Keeping every transform in this phase (opacities,
  // planets, tool beacons, phase label) on the same smoothed value keeps
  // them moving together and eases out those jumps instead of snapping.
  const orbitOpacity = useTransform(smoothVoyageProgress, [0.2, 0.26, 0.92, 1], [0, 0.36, 0.24, 0]);
  const portalOpacity = useTransform(smoothVoyageProgress, [0, 0.08, 0.15], [1, 1, 0]);
  const planetLayerOpacity = useTransform(smoothVoyageProgress, [0.2, 0.22, 0.965, 0.99], [0, 1, 1, 0]);
  const voyageOpacity = useTransform(smoothVoyageProgress, [0, 0.94, 1], [1, 1, 0]);

  const songs = useMemo(() => (
    albumData.songs
      .map((song) => ({
        ...song,
        unlocked: checkUnlock(song.id),
      }))
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
      .map((song, index) => ({
        ...song,
        path: flightPaths[index],
      }))
  ), [checkUnlock]);

  const unlockedCount = songs.filter((song) => song.unlocked).length;
  const collectedCount = signalTools.filter((tool) => checkToolCollected(tool.id)).length;

  // Random positions for the 4 tool buttons inside the signal-tools card
  const toolPositions = useMemo(() => {
    const placed: { l: number; t: number }[] = [];
    const MIN_SEP = 28; // minimum % distance between tool centers
    for (let i = 0; i < 4; i++) {
      let best = { l: 12 + i * 22, t: 12 + (i % 2) * 65 }; // safe fallback
      for (let attempt = 0; attempt < 120; attempt++) {
        const l = 10 + Math.random() * 80;
        const t = 10 + Math.random() * 80;
        // avoid center panel zone (~30-70% left, ~22-78% top)
        if (l > 28 && l < 72 && t > 20 && t < 78) continue;
        if (placed.some((p) => Math.hypot(p.l - l, p.t - t) < MIN_SEP)) continue;
        best = { l, t };
        break;
      }
      placed.push(best);
    }
    return placed.map((p) => ({ left: `${p.l.toFixed(1)}%`, top: `${p.t.toFixed(1)}%` }));
  }, []);
  const focusedTool = signalTools.find((tool) => tool.id === focusedToolId) || signalTools[0];
  const focusedToolCollected = checkToolCollected(focusedTool.id);
  const nextLockedSong = songs.find((song) => !song.unlocked);
  const nextRequiredTool = nextLockedSong
    ? signalTools.find((tool) => tool.songId === nextLockedSong.id)
    : undefined;

  const openSong = (song: typeof songs[number]) => {
    if (song.unlocked) {
      router.push(`/song/${song.slug}`);
      return;
    }
    const requiredTool = signalTools.find((tool) => tool.songId === song.id);
    setSelectedLocked({
      title: song.title,
      toolName: requiredTool?.name || 'UNKNOWN SIGNAL TOOL',
      clue: requiredTool?.clue || song.unlockCondition?.description.en || 'A hidden archive tool is required.',
    });
  };

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCollectTool = (tool: SignalTool) => {
    const wasAlreadyCollected = checkToolCollected(tool.id);
    collectTool(tool.id);
    setSelectedLocked(null);
    setRecoveryToolId(null);
    if (!wasAlreadyCollected) {
      const song = albumData.songs.find((s) => s.id === tool.songId);
      setUnlockNotice({
        toolName: tool.name,
        toolImage: tool.image,
        songName: tool.unlocksSong,
        songGenre: song?.genre ?? 'Unknown Genre',
        songIntro: song?.intro ?? '',
        songColor: song?.color ?? '#ffffff',
        songPlanetImage: song?.planetImage ?? '/images/planet1.png',
        songSlug: song?.slug ?? '',
      });
    }
  };

  const handleInspectTool = (tool: SignalTool) => {
    if (checkToolCollected(tool.id)) return;
    setFocusedToolId(tool.id);
    setRecoveryToolId(tool.id);
  };

  return (
    <main className="relative min-h-[460vh] bg-black text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(93,115,255,0.18),rgba(7,10,22,0.78)_36%,#000_72%)]" />
        <motion.div
          className="absolute inset-[-20%] opacity-35"
          style={{ y: cameraY }}
        >
          {starField.map((star, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
              animate={{ opacity: [star.opacity, 1, star.opacity], scale: [1, 1.8, 1] }}
              transition={{ duration: 3.2 + (i % 5), delay: star.delay, repeat: Infinity }}
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          style={{ opacity: orbitOpacity }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[112vmin] w-[112vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10"
          style={{ opacity: orbitOpacity }}
        />
      </div>

      <section ref={voyageRef} className="relative h-[560vh]">
        <motion.div
          className="pointer-events-none fixed inset-0 flex h-screen items-center justify-center px-5 pt-24"
          style={{ opacity: voyageOpacity }}
        >
          {/* Centered with CSS Grid (place-items-center) rather than
              absolute + left/top-50% + -translate-50%, so grid alignment is
              computed from the child's untransformed layout box and the
              `scale`/`y` transform below can't disturb it. */}
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <motion.div
              className="h-[44vmin] w-[44vmin] min-h-64 min-w-64"
              style={{ y: modelY, opacity: modelOpacity, scale: wrapperScale }}
            >
              <Model3DGate progress={smoothVoyageProgress} />
            </motion.div>
          </div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: portalOpacity }}
          >
            <div className="pointer-events-none absolute bottom-[16vh] left-1/2 max-w-md -translate-x-1/2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-100/54">
                Scroll to enter orbit
              </p>
            </div>
          </motion.div>

          <motion.div
            className="pointer-events-auto absolute inset-0 z-10"
            style={{ opacity: planetLayerOpacity }}
          >
            {songs.map((song, index) => (
              <VoyagePlanet
                key={song.id}
                song={song}
                index={index}
                progress={smoothVoyageProgress}
                onClick={() => openSong(song)}
              />
            ))}
            {signalTools.map((tool) => (
              <VoyageToolBeacon
                key={tool.id}
                tool={tool}
                progress={smoothVoyageProgress}
                collected={checkToolCollected(tool.id)}
                onInspect={() => handleInspectTool(tool)}
              />
            ))}
          </motion.div>

          <div className="pointer-events-none absolute bottom-7 left-7 z-50 hidden w-56 border border-white/10 bg-black/40 px-4 py-3 text-white/54 backdrop-blur-xl md:block">
            <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-cyan-100/42">Archive Status</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>Song worlds</span><span>{unlockedCount}/{albumData.totalSongs}</span></div>
              <div className="flex justify-between"><span>Signal tools</span><span>{collectedCount}/{signalTools.length}</span></div>
              <div className="flex justify-between"><span>Next key</span><span className="max-w-[92px] truncate text-right">{nextRequiredTool?.name || 'Complete'}</span></div>
              <div className="h-px bg-white/10" />
              <PhaseLabel progress={smoothVoyageProgress} className="text-[10px] uppercase tracking-[0.22em] text-white/32" />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center">
            <PhaseLabel progress={smoothVoyageProgress} className="text-[10px] uppercase tracking-[0.38em] text-white/36" />
            <div className="mx-auto mt-3 h-10 w-px overflow-hidden bg-white/10">
              <motion.div
                className="h-5 w-px bg-white/80"
                animate={{ y: [-20, 44] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section
        ref={toolsRef}
        id="signal-tools"
        className="relative z-30 mx-auto max-w-6xl px-5 py-28"
      >
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-100/42">SIGNAL TOOLS</p>
            <h2 className="text-5xl font-black leading-none md:text-7xl">Collect the missing keys.</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-white/58">
            Locked planets are opened by collecting their matching signal tool. Choose a tool below to add it to the ship archive and unlock its song.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative min-h-[780px] flex-1 overflow-hidden border border-white/10 bg-black/35 backdrop-blur-xl">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[74vmin] max-h-[640px] w-[74vmin] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[46vmin] max-h-[410px] w-[46vmin] max-w-[410px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/10" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(126,155,255,0.12),transparent_38%)]" />

          {signalTools.map((tool, index) => (
            <SignalToolButton
              key={tool.id}
              tool={tool}
              index={index}
              position={toolPositions[index]}
              collected={checkToolCollected(tool.id)}
              focused={focusedToolId === tool.id}
              hiddenForChase={chasedToolId === tool.id}
              onClick={() => handleInspectTool(tool)}
            />
          ))}

          <PocketRecoveryGame
            tools={signalTools}
            checkCollected={checkToolCollected}
            onCollect={(toolId) => {
              const t = signalTools.find((st) => st.id === toolId);
              if (t) handleCollectTool(t);
            }}
            onActiveToolChange={setChasedToolId}
          />
        </div>

        {/* Right: collected tools log */}
        <div className="w-full shrink-0 border border-white/10 bg-black/30 p-6 backdrop-blur-xl md:w-64">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/38">Signal Log</p>
          <div className="space-y-5">
            {signalTools.map((tool) => {
              const collected = checkToolCollected(tool.id);
              return (
                <div key={tool.id} className={`flex items-center gap-3 transition-opacity duration-500 ${collected ? 'opacity-100' : 'opacity-28'}`}>
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                    collected ? 'border-cyan-100/38 bg-cyan-100/8 shadow-[0_0_24px_rgba(165,231,255,0.14)]' : 'border-white/10 bg-black/40'
                  }`}>
                    <img src={tool.image} alt="" className="h-7 w-7 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white/80">{collected ? tool.name : '???'}</p>
                    <p className="mt-0.5 truncate text-[10px] text-white/38">
                      {collected ? `Unlocks ${tool.unlocksSong}` : 'Not yet collected'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/28">Progress</p>
            <p className="mt-3 text-3xl font-black">{collectedCount}<span className="text-lg text-white/28">/{signalTools.length}</span></p>
          </div>
        </div>

        </div>
      </section>

      {selectedLocked && (
        <div
          className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,680px)] -translate-x-1/2 border border-white/15 bg-black/85 px-5 py-4 text-left shadow-2xl backdrop-blur-xl"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/42">Locked Planet</p>
          <h3 className="text-2xl font-black text-white">{selectedLocked.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/66">
            Required tool: <span className="text-white">{selectedLocked.toolName}</span>
          </p>
          <p className="mt-1 text-sm leading-6 text-white/46">{selectedLocked.clue}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scrollToTools}
              className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Go to Signal Tools
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocked(null)}
              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/36 transition hover:text-white/70"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {recoveryToolId !== null && (
        <div className="fixed bottom-6 left-1/2 z-[78] w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-cyan-100/20 bg-black/88 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {(() => {
            const recoveryTool = signalTools.find((tool) => tool.id === recoveryToolId);
            if (!recoveryTool) return null;
            return (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/48">Signal detected / Recovery game</p>
                <h3 className="mt-2 text-2xl font-black text-white">{recoveryTool.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">Unlocks {recoveryTool.unlocksSong}</p>
                <p className="mt-4 text-sm leading-6 text-white/58">{recoveryTool.clue}</p>
                <PocketRecoveryGame
                  tools={signalTools}
                  checkCollected={checkToolCollected}
                  onCollect={(toolId) => {
                    const t = signalTools.find((st) => st.id === toolId);
                    if (t) handleCollectTool(t);
                  }}
                  onActiveToolChange={setChasedToolId}
                />
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryToolId(null);
                    setChasedToolId(null);
                  }}
                  className="mt-3 w-full text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 transition hover:text-white/70"
                >
                  Cancel scan
                </button>
              </>
            );
          })()}
        </div>
      )}
      {unlockNotice && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setUnlockNotice(null)}
          />

          {/* modal card */}
          <motion.div
            className="relative z-10 w-[min(92vw,480px)] overflow-hidden border border-white/14 bg-black/90 shadow-[0_40px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* planet image banner */}
            <div className="relative h-52 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 60% 50%, ${unlockNotice.songColor}28, transparent 70%)` }}
              />
              <img
                src={unlockNotice.songPlanetImage}
                alt=""
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-80 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                style={{ boxShadow: `0 0 80px ${unlockNotice.songColor}44` }}
              />
              {/* tool icon badge */}
              <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-cyan-100/28 bg-black/70 shadow-[0_0_28px_rgba(165,231,255,0.18)] backdrop-blur-xl">
                <img src={unlockNotice.toolImage} alt="" className="h-7 w-7 object-contain" />
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
              <h2 className="text-4xl font-black leading-none text-white">{unlockNotice.songName}</h2>

              {/* genre badge */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{ borderColor: `${unlockNotice.songColor}44`, background: `${unlockNotice.songColor}12` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: unlockNotice.songColor }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: unlockNotice.songColor }}>
                  {unlockNotice.songGenre}
                </span>
              </div>

              {unlockNotice.songIntro && (
                <p className="mt-5 text-sm leading-7 text-white/55">{unlockNotice.songIntro}</p>
              )}

              <div className="mt-3 text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Recovered via: {unlockNotice.toolName}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUnlockNotice(null);
                    if (unlockNotice.songSlug) router.push(`/song/${unlockNotice.songSlug}`);
                  }}
                  className="flex-1 rounded-full border border-white/18 bg-white/[0.08] py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/[0.14] hover:text-white"
                >
                  Enter this world →
                </button>
                <button
                  type="button"
                  onClick={() => setUnlockNotice(null)}
                  className="rounded-full border border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/36 transition hover:text-white/70"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
