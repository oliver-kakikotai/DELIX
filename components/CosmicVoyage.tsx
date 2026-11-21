'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { albumData } from '@/data/albumData';
import { useUnlock } from '@/contexts/UnlockContext';
import { flightPaths, LockedMission, signalTools, SignalTool } from './cosmic-voyage/data';
import { Model3DGate, PhaseLabel } from './cosmic-voyage/ProgressGates';
import { VoyagePlanet } from './cosmic-voyage/VoyagePlanet';
import { VoyageToolBeacon } from './cosmic-voyage/VoyageToolBeacon';
import { SignalToolButton } from './cosmic-voyage/SignalToolButton';
import { PocketRecoveryGame } from './cosmic-voyage/PocketRecoveryGame';
import { OriginFile } from './cosmic-voyage/OriginFile';
import { SignalSlots } from './cosmic-voyage/SignalSlots';
import { starField } from './cosmic-voyage/data';

// Homepage scroll position saved when leaving for a song page, so coming back
// (via "Back to Album", which pushes '/', or the browser back button) lands
// where the visitor left instead of at the top of this very long page.
const RETURN_SCROLL_KEY = 'delix-home-return-scroll';

export default function CosmicVoyage() {
  const router = useRouter();

  const goToSong = (slug: string) => {
    try {
      sessionStorage.setItem(RETURN_SCROLL_KEY, String(window.scrollY));
    } catch {
      /* storage unavailable — fall back to normal navigation */
    }
    router.push(`/song/${slug}`);
  };

  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(RETURN_SCROLL_KEY);
      sessionStorage.removeItem(RETURN_SCROLL_KEY);
    } catch {
      return;
    }
    const top = Number(saved);
    if (!saved || !Number.isFinite(top)) return;
    // 'instant' overrides the html `scroll-smooth` class. Re-applied over the
    // next frames because the router's own scroll-to-top on navigation runs
    // after this effect. Deliberately not cancelled on cleanup: under React
    // strict mode the effect re-runs, and the key is already consumed.
    const restore = () => window.scrollTo({ top, behavior: 'instant' });
    restore();
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
    setTimeout(restore, 80);
  }, []);
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

  // Reactively watch collectedTools — most reliable way to trigger the notification.
  // Seeded from the current stats on mount (not []) so that returning to this
  // page — e.g. navigating to a song page and back, which unmounts and
  // remounts CosmicVoyage while UnlockProvider's state survives — doesn't
  // treat every tool collected in an earlier mount as newly collected and
  // re-open the unlock popup.
  const prevCollectedRef = useRef<number[]>(stats.collectedTools ?? []);
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
  // Deep-space drift: the rock starts small and far off, and scrolling flies
  // the 3D camera into it (see CameraRig in Model3DViewer) before handing off
  // to the planet-approach phase. The canvas is full-screen and the motion
  // happens inside the 3D scene — not via a CSS scale on a small canvas,
  // which magnified rendered pixels up to 6x and looked blurry up close.
  // Only the hand-off fade is still done here.
  const modelOpacity = useTransform(smoothVoyageProgress, [0, 0.15, 0.2], [1, 1, 0]);
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

  // Random positions for the 4 tool buttons inside the signal-tools card.
  // Starts from the deterministic fallback layout (same on server and
  // client, so hydration never sees mismatched left/top values), then
  // randomizes once mounted in the browser — a client-only effect runs
  // after hydration, so this DOM update never gets diffed against SSR
  // output.
  const fallbackToolPositions = signalTools.map((_, i) => ({
    left: `${(12 + i * 22).toFixed(1)}%`,
    top: `${(12 + (i % 2) * 65).toFixed(1)}%`,
  }));
  const [toolPositions, setToolPositions] = useState(fallbackToolPositions);

  useEffect(() => {
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
    setToolPositions(placed.map((p) => ({ left: `${p.l.toFixed(1)}%`, top: `${p.t.toFixed(1)}%` })));
  }, []);
  const nextLockedSong = songs.find((song) => !song.unlocked);
  const nextRequiredTool = nextLockedSong
    ? signalTools.find((tool) => tool.songId === nextLockedSong.id)
    : undefined;

  const openSong = (song: typeof songs[number]) => {
    if (song.unlocked) {
      goToSong(song.slug);
      return;
    }
    const requiredTool = signalTools.find((tool) => tool.songId === song.id);
    setSelectedLocked({
      title: song.title,
      toolName: requiredTool?.name || 'UNKNOWN SIGNAL TOOL',
      clue: requiredTool?.clue || song.unlockCondition?.description || 'A hidden archive tool is required.',
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
            // CSS-animated (see .voyage-star in globals.css), not Framer
            // Motion — 96 JS-driven infinite animations were a main-thread cost.
            <span
              key={i}
              className="voyage-star absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                '--star-o': star.opacity,
                '--star-dur': `${3.2 + (i % 5)}s`,
                '--star-delay': `${star.delay}s`,
              } as CSSProperties}
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
          {/* Full-screen 3D layer; the fly-in itself is camera movement
              inside the scene, only the fade-out is a CSS opacity here. */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ opacity: modelOpacity }}
          >
            <Model3DGate progress={smoothVoyageProgress} />
          </motion.div>

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
            {songs.map((song) => (
              <VoyagePlanet
                key={song.id}
                song={song}
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

      <OriginFile />

      <section
        ref={toolsRef}
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

        <div className="relative h-[70vh] min-h-[460px] max-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a14]">
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

        <SignalSlots tools={signalTools} isCollected={checkToolCollected} onOpenSong={goToSong} />
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
              <Image
                src={unlockNotice.songPlanetImage}
                alt=""
                width={176}
                height={176}
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-80 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                style={{ boxShadow: `0 0 80px ${unlockNotice.songColor}44` }}
              />
              {/* tool icon badge */}
              <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-cyan-100/28 bg-black/70 shadow-[0_0_28px_rgba(165,231,255,0.18)] backdrop-blur-xl">
                <Image src={unlockNotice.toolImage} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
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
                    if (unlockNotice.songSlug) goToSong(unlockNotice.songSlug);
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
