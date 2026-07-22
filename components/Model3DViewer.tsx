'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

const BASE_SCALE = 1.5;

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
}

function Model3DViewer({
  modelPath = '/models/hitem3d.glb',
  className = '',
  autoRotate = true,
  autoRotateSpeed = 2,
  active = true
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
        // R3F sizes its WebGL drawing buffer by calling getBoundingClientRect()
        // on this wrapper (via react-use-measure), which reports the box
        // *after* CSS transforms — including the ancestor `scale()` the voyage
        // page uses to grow this model up to 6x. Without this override, the
        // canvas kept resizing its actual render target to match the scaled-up
        // size (measured up to ~4250x4250 physical pixels at scale 6 with
        // antialiasing on), which is both wasteful and appears to blow past a
        // GPU/driver limit and render blank at the largest sizes — exactly the
        // "rock disappears once it's big" bug. `offsetSize: true` makes it use
        // offsetWidth/offsetHeight instead, which are untouched by transforms,
        // so the canvas's real resolution stays fixed and the ancestor scale
        // purely magnifies the already-rendered pixels as intended.
        resize={{ offsetSize: true }}
        camera={{
          position: [0, 0, 4],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{
          background: 'transparent',
          pointerEvents: 'none',
          touchAction: 'none'
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        eventSource={typeof window !== 'undefined' && !isTouchDevice ? undefined : document.createElement('div')}
        eventPrefix="client"
      >
        {/* 光照设置 */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2}
          castShadow
        />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4299e1" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#ed64a6" />
        
        {/* 环境贴图 - 夜晚环境 */}
        <Environment preset="night" />
        
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