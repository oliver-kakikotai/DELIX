'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, Lightformer } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

const BASE_SCALE = 1.5;

// ── Scroll-driven fly-in ─────────────────────────────────────────────────
// The canvas fills the whole screen and scrolling physically dollies the
// camera toward the rock. (It used to be a small canvas magnified up to 6x
// with a CSS scale, which could only ever look soft/blurry up close.)
const CAMERA_FOV = 45;
// Rock's on-screen size at the start, as a fraction of the viewport's
// shorter side — matches the old 44vmin-wrapper framing (~20vmin rock).
const START_SIZE_FRACTION = 0.22;
// Camera distance at the end of the dolly: just off the surface, so the
// rock fills the frame (the rock's radius is ~0.75 after BASE_SCALE).
const END_DISTANCE = 1.0;
// The rock starts a bit below center (the old 8vh offset) and rises to
// center as the camera closes in. Expressed as a fraction of view height.
const START_Y_OFFSET_FRACTION = 0.08;
// Voyage-progress span the fly-in covers. The parent fades the canvas out
// over 0.15–0.2, so the dolly keeps moving underneath that fade.
const FLY_IN_END = 0.17;

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

    const raw = progress ? progress.get() : 0;
    const t = THREE.MathUtils.clamp(raw / FLY_IN_END, 0, 1);
    // Interpolated in log-distance, so each scroll step is a constant
    // zoom ratio (apparent size ∝ 1/distance; a linear lerp of distance
    // barely grows the rock until the very end). The t^1.5 adds a gentle
    // build-up so it drifts first, then rushes in — and the rock already
    // overflows the screen by ~0.15, when the parent starts fading it out.
    const eased = Math.pow(t, 1.5);
    const z = startDistance * Math.pow(END_DISTANCE / startDistance, eased);
    // Camera sits above the rock's center so the rock reads lower on screen;
    // the offset scales with the visible height at the current distance.
    const yOffset = START_Y_OFFSET_FRACTION * 2 * z * halfFovTan * (1 - t);

    camera.position.set(0, yOffset, z);
    camera.updateProjectionMatrix();
  });

  return null;
}

// 3D模型组件
function Model3DObject({
  modelPath,
  autoRotateSpeed,
}: {
  modelPath: string;
  autoRotateSpeed: number;
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Object3D>(null);

  // Re-centers the cloned mesh on its own bounding-box center rather than
  // whatever pivot the GLB happened to be exported with. Previously we spun
  // the *camera* around the scene origin (OrbitControls autoRotate); if the
  // mesh's visual bulk isn't centered on that origin, orbiting around it
  // makes the object appear to swing off toward one corner and back as it
  // rotates. Rotating the (now re-centered) object itself in place, with a
  // fixed camera, keeps the framing stable regardless of the source pivot.
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    modelRef.current.rotation.y += delta * autoRotateSpeed * 0.3;
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
        
        {/* 3D模型 - 物体自身缓慢自转，相机固定不动，纯装饰性，无需交互控制器 */}
        <Suspense fallback={<LoadingFallback />}>
          <Model3DObject modelPath={modelPath} autoRotateSpeed={autoRotate ? autoRotateSpeed : 0} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// 预加载模型
useGLTF.preload('/models/hitem3d.glb');

export default Model3DViewer;