'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// 3D模型组件
function Model3DObject({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Object3D>(null);

  // 复制场景以避免共享问题
  const clonedScene = scene.clone();

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.3}
      floatIntensity={0.2}
    >
      <primitive 
        ref={modelRef}
        object={clonedScene} 
        scale={[1.5, 1.5, 1.5]}
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
}

function Model3DViewer({
  modelPath = '/models/hitem3d.glb',
  className = '',
  autoRotate = true,
  autoRotateSpeed = 2
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
        pointerEvents: isTouchDevice ? 'none' : 'auto',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{
          background: 'transparent',
          pointerEvents: isTouchDevice ? 'none' : 'auto',
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
        
        {/* 3D模型 */}
        <Suspense fallback={<LoadingFallback />}>
          <Model3DObject modelPath={modelPath} />
        </Suspense>
        
        {/* 自动旋转控制器 - 移动端禁用手动旋转 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!isTouchDevice} // 移动端禁用手动旋转
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minDistance={3}
          maxDistance={6}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
          touches={{ ONE: 0, TWO: 0 }} // 禁用触摸控制
        />
      </Canvas>
    </div>
  );
}

// 预加载模型
useGLTF.preload('/models/hitem3d.glb');

export default Model3DViewer;