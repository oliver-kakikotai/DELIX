'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { albumData } from '@/data/albumData';
import { useUnlock } from '@/contexts/UnlockContext';
import { flightPaths, LockedMission, signalTools, SignalTool } from './cosmic-voyage/data';
import { Model3DGate, PhaseWarning } from './cosmic-voyage/ProgressGates';
import { VoyagePlanet } from './cosmic-voyage/VoyagePlanet';
import { OriginFile } from './cosmic-voyage/OriginFile';
import { LockedSignalAlert } from './cosmic-voyage/LockedSignalAlert';
import { SongUnlockedAlert } from './cosmic-voyage/SongUnlockedAlert';
import { AlbumCompleteFinale } from './cosmic-voyage/AlbumCompleteFinale';
import { SignalToolsSection } from './cosmic-voyage/SignalToolsSection';
import StarField from './StarField';
import { starField } from './cosmic-voyage/data';

// Homepage scroll position saved when leaving for a song page, so coming back
// (via "Back to Album", which pushes '/', or the browser back button) lands
// where the visitor left instead of at the top of this very long page.
const RETURN_SCROLL_KEY = 'delix-home-return-scroll';

// Shared voyage-progress scale (see the scroll setup inside the component).
const PORTAL_END = 0.2;
const PLANET_INTRO_START = 0.14;

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
  // The voyage is told in story order across two pinned (sticky) sections
  // with the DELIX origin file between them:
  //   portal (3D rock fly-in) → OriginFile (who DELIX is) → planets (the
  //   songs it wrote on Earth) → signal tools game (unlock the rest).
  //
  // Both sections are mapped onto ONE shared "voyage progress" scale so all
  // the existing timing constants (flightPaths ranges, model fade, beacons…)
  // keep working unchanged: the portal covers 0 → 0.2, the planet section
  // PLANET_INTRO_START → 1 (it opens with a short intro beat before the
  // first planet at 0.22).
  const portalRef = useRef<HTMLElement>(null);
  const planetsRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: portalRaw } = useScroll({
    target: portalRef,
    offset: ['start start', 'end end'],
  });
  const { scrollYProgress: planetsRaw } = useScroll({
    target: planetsRef,
    offset: ['start start', 'end end'],
  });
  const portalProgress = useTransform(portalRaw, [0, 1], [0, PORTAL_END]);
  const planetsProgress = useTransform(planetsRaw, [0, 1], [PLANET_INTRO_START, 1]);
  // Mouse-wheel scrolling delivers position updates in coarse, discrete jumps
  // (unlike a trackpad's much higher-frequency stream). Feeding that directly
  // into the portal model's grow/fade animation makes an otherwise-continuous
  // useTransform curve look like it's snapping between sizes/positions. This
  // spring re-adds motion between those discrete updates so it eases smoothly
  // regardless of how chunky the underlying scroll events are. Scoped to the
  // model only — other scroll-linked elements aren't affected.
  const springConfig = { stiffness: 260, damping: 32, mass: 0.6 };
  const smoothPortalProgress = useSpring(portalProgress, springConfig);
  const smoothVoyageProgress = useSpring(planetsProgress, springConfig);
  const [selectedLocked, setSelectedLocked] = useState<LockedMission | null>(null);
  // The tool just recovered; SongUnlockedAlert shows the song it unlocked.
  const [unlockedTool, setUnlockedTool] = useState<SignalTool | null>(null);
  const closeUnlocked = useCallback(() => setUnlockedTool(null), []);
  // Set once the last tool is recovered: the album-complete finale (with
  // this song marked new) shows instead of the single-song popup.
  const [finaleSongId, setFinaleSongId] = useState<number | null>(null);
  const closeFinale = useCallback(() => setFinaleSongId(null), []);
  const [focusedToolId, setFocusedToolId] = useState(signalTools[0].id);
  // Which tool's static left-side button should duck out of the way because
  // the PocketRecoveryGame's wandering pocket is currently standing in for it.
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
      const allRecovered = signalTools.every((t) => current.includes(t.id));
      if (tool && allRecovered) setFinaleSongId(tool.songId);
      else if (tool) setUnlockedTool(tool);
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
  const modelOpacity = useTransform(smoothPortalProgress, [0, 0.15, 0.2], [1, 1, 0]);
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
  const portalOpacity = useTransform(smoothPortalProgress, [0, 0.08, 0.15], [1, 1, 0]);
  // Bridge from the origin story into the songs — visible as the planet
  // section slides in, gone just before the first planet arrives.
  const introOpacity = useTransform(smoothVoyageProgress, [PLANET_INTRO_START, 0.19, 0.205], [1, 1, 0]);
  const introY = useTransform(smoothVoyageProgress, [PLANET_INTRO_START, 0.205], ['0vh', '-6vh']);
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


  const openSong = (song: typeof songs[number]) => {
    if (song.unlocked) {
      goToSong(song.slug);
      return;
    }
    const requiredTool = signalTools.find((tool) => tool.songId === song.id);
    setSelectedLocked({
      title: song.title,
      toolName: requiredTool?.name || 'UNKNOWN SIGNAL TOOL',
      toolImage: requiredTool?.image,
      clue: requiredTool?.clue || song.unlockCondition?.description || 'A hidden archive tool is required.',
    });
  };

  const scrollToTools = () => {
    setSelectedLocked(null);
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const closeLockedAlert = useCallback(() => setSelectedLocked(null), []);

  const handleCollectTool = (tool: SignalTool) => {
    collectTool(tool.id);
    setSelectedLocked(null);
    // The unlock popup opens from the collectedTools effect above.
  };

  const handleInspectTool = (tool: SignalTool) => {
    if (checkToolCollected(tool.id)) return;
    // Just highlights the tool; the game itself (one instance, in
    // SignalToolsSection) is played by dragging.
    setFocusedToolId(tool.id);
  };

  return (
    <main className="relative bg-black text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(93,115,255,0.18),rgba(7,10,22,0.78)_36%,#000_72%)]" />
        <motion.div
          className="absolute inset-[-20%] opacity-35"
          style={{ y: cameraY }}
        >
          <StarField stars={starField} />
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

      {/* ── 1. Portal: the 3D rock fly-in ── */}
      {/* 260vh: room for the approach, a readable hold on the "Hola, this is
          Delix" engraving, and the dive in (see CameraRig). */}
      <section ref={portalRef} className="relative h-[260svh]">
        <div className="pointer-events-none sticky top-0 h-svh overflow-hidden">
          {/* Full-screen 3D layer; the fly-in itself is camera movement
              inside the scene, only the fade-out is a CSS opacity here. */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ opacity: modelOpacity }}
          >
            <Model3DGate progress={smoothPortalProgress} />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: portalOpacity }}
          >
            <div className="absolute bottom-[16svh] left-1/2 max-w-md -translate-x-1/2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-100/54">
                Scroll to enter orbit
              </p>
            </div>
          </motion.div>

          <PhaseWarning progress={smoothPortalProgress} phaseSet="portal" />
        </div>
      </section>

      {/* ── 2. Who DELIX is ── */}
      <OriginFile />

      {/* ── 3. The songs it wrote on Earth, as planets to fly past ── */}
      <section ref={planetsRef} className="relative h-[500svh]">
        <motion.div
          className="pointer-events-none sticky top-0 flex h-svh items-center justify-center overflow-hidden px-5 pt-24"
          style={{ opacity: voyageOpacity }}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-5 top-1/2 z-20 -translate-y-1/2 text-center"
            style={{ opacity: introOpacity, y: introY }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-100/54">
              Then it landed here
            </p>
            {/* Hand-lettered wordmark (same language as the logo and the
                "Collect the missing keys" heading). */}
            <h2 className="mx-auto mt-4 w-[min(88vw,760px)]">
              <Image
                src="/images/earth-life-was-strange.png"
                alt="Earth life was strange, so was Delix."
                width={2172}
                height={724}
                sizes="(min-width: 768px) 760px, 88vw"
                className="h-auto w-full"
                priority={false}
              />
            </h2>
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
          </motion.div>

          <PhaseWarning progress={smoothVoyageProgress} phaseSet="voyage" />
        </motion.div>
      </section>

      {/* ── 4. Recover the keys to unlock the rest ── */}
      <SignalToolsSection
        sectionRef={toolsRef}
        focusedToolId={focusedToolId}
        chasedToolId={chasedToolId}
        onChasedToolChange={setChasedToolId}
        onInspect={handleInspectTool}
        onCollect={handleCollectTool}
        onOpenSong={goToSong}
      />

      <LockedSignalAlert
        mission={selectedLocked}
        keysFound={signalTools.filter((tool) => checkToolCollected(tool.id)).length}
        keysTotal={signalTools.length}
        onFindKey={scrollToTools}
        onClose={closeLockedAlert}
      />
      <SongUnlockedAlert tool={unlockedTool} onEnter={goToSong} onClose={closeUnlocked} />
      <AlbumCompleteFinale
        open={finaleSongId !== null}
        newSongId={finaleSongId}
        onOpenSong={goToSong}
        onClose={closeFinale}
      />
    </main>
  );
}
