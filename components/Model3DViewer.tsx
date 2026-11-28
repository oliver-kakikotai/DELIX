'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, Lightformer } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import engravingConfig from './engravingConfig.json';
import RockDust from './RockDust';
import type { MotionValue } from 'framer-motion';

const BASE_SCALE = 1.5;

// ── Scroll-driven fly-in ─────────────────────────────────────────────────
// The canvas fills the whole screen and scrolling physically dollies the
// camera toward the rock. (It used to be a small canvas magnified up to 6x
// with a CSS scale, which could only ever look soft/blurry up close.)
//
// The fly-in has three beats, on the portal's progress scale (0 → 0.2):
//   approach  0 → HOLD_START      the rock grows from far away; it stops
//                                 spinning and turns its engraved face
//                                 ("Hola, this is Delix") toward you
//   hold      HOLD_START → HOLD_END  a slow drift, long enough to read it
//   rush      HOLD_END → 0.2      dives in while the parent fades the canvas
const CAMERA_FOV = 45;
// Rock's on-screen size at the start, as a fraction of the viewport's
// shorter side — matches the old 44vmin-wrapper framing (~20vmin rock).
const START_SIZE_FRACTION = 0.22;
// Final camera distance: just off the surface (the rock's radius is ~0.75
// after BASE_SCALE), reached under the fade-out.
const END_DISTANCE = 0.95;
// The rock starts a bit below center (the old 8vh offset) and rises to
// center as the camera closes in. Expressed as a fraction of view height.
const START_Y_OFFSET_FRACTION = 0.08;
const HOLD_START = 0.1;
const HOLD_END = 0.145;
const RUSH_END = 0.2;
// How much closer the camera drifts during the hold (ratio of distances).
const HOLD_DRIFT = 0.86;
// Spin → face-the-camera blend window (portal progress).
const LOCK_START = 0.05;
const LOCK_END = 0.095;

// ── Engraving ────────────────────────────────────────────────────────────
// "Hola, this is Delix", placed on the flattest patch of the rock (found by
// ray-sampling depth variation around the model). Its placement lives in
// engravingConfig.json, shared with scripts/bake-engraving.mjs, which
// pre-computes the decal mesh into ENGRAVING_PATH — projecting it at
// runtime blocked the main thread for 100–250 ms on every page load.
// Re-run the bake script after changing the config or the model.
const ENGRAVING_PATH = '/models/hitem3d-engraving.bin';
const ENGRAVE_AZIMUTH_DEG = engravingConfig.azimuthDeg;
const ENGRAVE_ELEVATION_DEG = engravingConfig.elevationDeg;
// Decal footprint width in model units (the model spans ~1.0 before BASE_SCALE).
const ENGRAVE_WIDTH = engravingConfig.width;
// The camera holds where the engraving spans this much of the view width.
const ENGRAVE_VIEW_FRACTION_LANDSCAPE = 0.42;
const ENGRAVE_VIEW_FRACTION_PORTRAIT = 0.8;

// Rotation about Y that turns the engraved face toward the camera (+Z).
const ENGRAVE_FACING_ANGLE = -THREE.MathUtils.degToRad(ENGRAVE_AZIMUTH_DEG);

const smoothstep = (x: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Wraps an angle difference into [-π, π].
const wrapPi = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function CameraRig({ progress }: { progress?: MotionValue<number> }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);

  useFrame(() => {
    const aspect = size.width / Math.max(1, size.height);
    const halfFovTan = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));
    // Distance at which the rock (diameter 2*0.75) spans START_SIZE_FRACTION
    // of the shorter viewport side. On portrait screens width is the short
    // side, so the vertical framing has to be widened by 1/aspect.
    const rockDiameter = BASE_SCALE;
    const visibleHeight = (rockDiameter / START_SIZE_FRACTION) * Math.max(1, 1 / aspect);
    const startDistance = visibleHeight / (2 * halfFovTan);

    // Hold distance: where the engraving spans a readable share of the
    // view width (wider share on portrait phones, which are narrow).
    const surface = ENGRAVE_SURFACE_RADIUS * BASE_SCALE;
    const engraveWorldWidth = ENGRAVE_WIDTH * BASE_SCALE;
    const fraction = aspect >= 1 ? ENGRAVE_VIEW_FRACTION_LANDSCAPE : ENGRAVE_VIEW_FRACTION_PORTRAIT;
    const holdDistance = surface + engraveWorldWidth / (fraction * 2 * halfFovTan * aspect);
    const holdEndDistance = holdDistance * HOLD_DRIFT;

    const raw = progress ? progress.get() : 0;
    let z: number;
    if (raw <= HOLD_START) {
      // Log-distance interpolation: each scroll step is a constant zoom
      // ratio (apparent size ∝ 1/distance); the eased t starts gently.
      const t = THREE.MathUtils.clamp(raw / HOLD_START, 0, 1);
      const eased = 1 - Math.pow(1 - t, 1.6);
      z = startDistance * Math.pow(holdDistance / startDistance, eased);
    } else if (raw <= HOLD_END) {
      const t = (raw - HOLD_START) / (HOLD_END - HOLD_START);
      z = THREE.MathUtils.lerp(holdDistance, holdEndDistance, t);
    } else {
      const t = THREE.MathUtils.clamp((raw - HOLD_END) / (RUSH_END - HOLD_END), 0, 1);
      z = holdEndDistance * Math.pow(END_DISTANCE / holdEndDistance, t * t);
    }
    // Camera sits above the rock's center early on so the rock reads lower
    // on screen; levelled out by the time the engraving is in view.
    const approachT = THREE.MathUtils.clamp(raw / HOLD_START, 0, 1);
    // …and lowered to the engraving's height (it sits slightly below the
    // rock's equator), so the text is centred on screen during the hold.
    const engraveY =
      ENGRAVE_SURFACE_RADIUS * Math.sin(THREE.MathUtils.degToRad(ENGRAVE_ELEVATION_DEG)) * BASE_SCALE;
    const yOffset =
      START_Y_OFFSET_FRACTION * 2 * z * halfFovTan * (1 - approachT) + engraveY * smoothstep(approachT, 0.4, 1);

    camera.position.set(0, yOffset, z);
    camera.updateProjectionMatrix();
  });

  return null;
}

// Distance from the rock's center to the engraved patch, in model units
// (printed by the bake script). Used for the camera framing above.
const ENGRAVE_SURFACE_RADIUS = 0.44;

// Draws the engraving onto a transparent canvas: the text cut into the
// stone (dark, softened) with a faint lit lower lip, like a carved groove
// catching light from above. Uses the site's handwritten logo face.
function drawEngraving(canvas: HTMLCanvasElement, fontFamily: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = [
    { text: 'Hola,', size: H * 0.34, y: H * 0.3 },
    { text: 'this is Delix', size: H * 0.34, y: H * 0.68 },
  ];
  for (const line of lines) {
    ctx.font = `${line.size}px ${fontFamily}`;
    // Lit lower lip of the groove.
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillText(line.text, W / 2 + 2, line.y + 4);
    // The cut itself: translucent so the stone's own shading shows through.
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'rgba(52, 50, 64, 0.7)';
    ctx.fillText(line.text, W / 2, line.y);
  }
}

// 3D模型组件
function Model3DObject({
  modelPath,
  autoRotateSpeed,
  progress,
}: {
  modelPath: string;
  autoRotateSpeed: number;
  progress?: MotionValue<number>;
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Object3D>(null);
  const freeAngle = useRef(0);

  // Re-centers the cloned mesh on its own bounding-box center rather than
  // whatever pivot the GLB happened to be exported with. Rotating the
  // (re-centered) object itself in place, with a fixed camera, keeps the
  // framing stable regardless of the source pivot.
  //
  // Also adds the (initially empty) engraving mesh; its baked geometry and
  // its text texture are filled in asynchronously below.
  const { clonedScene, engraving } = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 800;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        roughness: 0.9,
        metalness: 0,
      })
    );
    // Baked in the model's local space, same as the rock mesh.
    clone.add(mesh);
    clone.position.sub(center);
    return { clonedScene: clone, engraving: { mesh, texture } };
  }, [scene]);

  // Load the pre-baked decal geometry (see scripts/bake-engraving.mjs).
  useEffect(() => {
    const controller = new AbortController();
    fetch(ENGRAVING_PATH, { signal: controller.signal })
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        const data = new Float32Array(buf);
        const n = data[0];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(data.slice(1, 1 + n * 3), 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(data.slice(1 + n * 3, 1 + n * 6), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(data.slice(1 + n * 6, 1 + n * 8), 2));
        engraving.mesh.geometry.dispose();
        engraving.mesh.geometry = geometry;
      })
      .catch(() => {
        /* aborted, or missing file — the rock just shows without the text */
      });
    return () => controller.abort();
  }, [engraving]);

  // Draw the text once the handwritten logo font has loaded (next/font
  // exposes its generated family name through the --font-yellowtail var).
  useEffect(() => {
    let cancelled = false;
    const family =
      getComputedStyle(document.body).getPropertyValue('--font-yellowtail').trim() || 'cursive';
    document.fonts
      .load(`120px ${family}`)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        drawEngraving(engraving.texture.image as HTMLCanvasElement, family);
        engraving.texture.needsUpdate = true;
      });
    return () => {
      cancelled = true;
    };
  }, [engraving]);

  useEffect(() => () => {
    engraving.texture.dispose();
    engraving.mesh.geometry.dispose();
    (engraving.mesh.material as THREE.Material).dispose();
  }, [engraving]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    // Free spin while far away; as the camera closes in, spinning stops and
    // the rock turns its engraved face to the camera. The free angle is
    // frozen during the blend so the lock target can't jump mid-turn, and
    // scrolling back up resumes the spin from where it stopped.
    const p = progress ? progress.get() : 0;
    const w = smoothstep(p, LOCK_START, LOCK_END);
    if (w === 0) freeAngle.current += delta * autoRotateSpeed * 0.3;
    const lock = freeAngle.current + wrapPi(ENGRAVE_FACING_ANGLE - freeAngle.current);
    // A tiny sway while locked keeps it from looking frozen.
    const sway = w * 0.035 * Math.sin(state.clock.elapsedTime * 0.6);
    modelRef.current.rotation.y = THREE.MathUtils.lerp(freeAngle.current, lock, w) + sway;
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0}
      floatIntensity={0}
    >
      <primitive
        ref={modelRef}
        object={clonedScene}
        scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </Float>
  );
}

// 加载状态组件
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#4a5568" 
        wireframe 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
}

// 3D模型查看器组件
interface Model3DViewerProps {
  modelPath?: string;
  className?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  // When false, the WebGL render loop is paused entirely (not just hidden via
  // opacity) — the scene keeps rendering every frame otherwise, even while
  // scrolled far off the visible portal phase.
  active?: boolean;
  // Scroll progress driving the camera fly-in (see CameraRig). Read inside
  // the render loop via .get(), so scrolling never re-renders React.
  progress?: MotionValue<number>;
}

function Model3DViewer({
  modelPath = '/models/hitem3d.glb',
  className = '',
  autoRotate = true,
  autoRotateSpeed = 2,
  active = true,
  progress,
}: Model3DViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 检测是否为触摸设备
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full h-full ${className} flex items-center justify-center`}>
        <div className="text-white/60 text-sm">Loading 3D Model...</div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{
        pointerEvents: 'none',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <Canvas
        frameloop={active ? 'always' : 'never'}
        // Size the drawing buffer from offsetWidth/offsetHeight (layout size,
        // untouched by CSS transforms) rather than getBoundingClientRect().
        // Defensive: if an ancestor is ever transform-scaled again, the
        // render target won't balloon to the scaled size.
        resize={{ offsetSize: true }}
        camera={{
          position: [0, 0, 9],
          fov: CAMERA_FOV,
          near: 0.05,
          far: 100
        }}
        style={{
          background: 'transparent',
          pointerEvents: 'none',
          touchAction: 'none'
        }}
        // Capped at 1.5x: the canvas is full-screen, and full 2x retina
        // resolution roughly doubles GPU fill cost for little visible gain.
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          // Not needed (nothing reads pixels back from the canvas) and it
          // forces an extra buffer copy every frame.
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance'
        }}
        eventSource={typeof window !== 'undefined' && !isTouchDevice ? undefined : document.createElement('div')}
        eventPrefix="client"
      >
        <CameraRig progress={progress} />

        {/* 光照设置 */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2}
          castShadow
        />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4299e1" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#ed64a6" />
        
        {/* 环境贴图 - 本地生成的暗色夜晚环境。之前用的 preset="night" 会在
            运行时从外部 CDN 下载一张 HDR 贴图，首次加载时会卡顿；这里用几块
            Lightformer 在本地烘焙一次，效果接近，且不需要网络请求。 */}
        <Environment resolution={64} frames={1}>
          <color attach="background" args={['#05070f']} />
          <Lightformer form="rect" intensity={0.8} color="#8fa8ff" position={[0, 5, -5]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={0.4} color="#ffd9b0" position={[-5, 1, 2]} scale={[3, 6, 1]} />
          <Lightformer form="rect" intensity={0.3} color="#4299e1" position={[5, -2, 2]} scale={[3, 6, 1]} />
        </Environment>
        
        {/* Star dust orbiting the rock (see RockDust) */}
        <RockDust />

        {/* 3D模型 - 物体自身缓慢自转，相机固定不动，纯装饰性，无需交互控制器 */}
        <Suspense fallback={<LoadingFallback />}>
          <Model3DObject modelPath={modelPath} autoRotateSpeed={autoRotate ? autoRotateSpeed : 0} progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// 预加载模型
useGLTF.preload('/models/hitem3d.glb');

export default Model3DViewer;