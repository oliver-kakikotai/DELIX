'use client';

// Star dust drifting around the 3D rock (rendered inside Model3DViewer's
// scene). It introduces the particle language the planet titles use later
// (ParticleTitle): same white square grains, same size range, twinkling — so
// when the song titles gather out of dust, it's dust the visitor has been
// flying through since the start.
//
// One THREE.Points (one draw call). Positions are fixed attributes; the
// orbit and twinkle happen in the vertex shader from a single uTime uniform,
// so there's no per-particle JavaScript per frame.
//
// Layout: a loose, tilted ring plus a sparse halo, all at radius ≥
// INNER_RADIUS. That keeps the dust outside the camera's hold distance (~1.3)
// so no grain ever sits between the camera and the "Hola, this is Delix"
// engraving; as the camera flies in, the dust streams past around the edges.

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 2400;
const INNER_RADIUS = 1.7;
const OUTER_RADIUS = 6;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSpeed;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    // Orbit about the ring's axis; inner grains move faster.
    float a = uTime * aSpeed;
    float c = cos(a), s = sin(a);
    vec3 p = vec3(c * position.x + s * position.z, position.y, -s * position.x + c * position.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Same 1–2.2 css px grains as the particle titles; a little bigger when
    // the camera passes close, for depth.
    float near = clamp(2.5 / -mv.z, 0.7, 2.2);
    gl_PointSize = aSize * near * uPixelRatio;
    vAlpha = (0.45 + 0.4 * aSeed) * (0.65 + 0.35 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 6.283));
  }
`;

// Square grains (no round mask), matching the fillRect grains of ParticleTitle.
const fragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha);
  }
`;

export default function RockDust() {
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(5);
    const pos = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const ring = rand() < 0.65;
      const r = INNER_RADIUS + Math.pow(rand(), ring ? 1.4 : 0.8) * (OUTER_RADIUS - INNER_RADIUS);
      const theta = rand() * Math.PI * 2;
      // Ring grains hug the plane; halo grains spread over a flattened sphere.
      const y = ring ? (rand() - 0.5) * 0.35 * r * 0.25 : (rand() * 2 - 1) * r * 0.55;
      const flat = Math.sqrt(Math.max(0, r * r - y * y));
      pos[i * 3] = Math.cos(theta) * flat;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * flat;
      speed[i] = (0.12 + rand() * 0.06) * Math.pow(INNER_RADIUS / r, 1.2);
      seed[i] = rand();
      size[i] = 0.9 + rand() * 1.3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    // Orbiting moves grains outside the static bounds; never frustum-cull.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), OUTER_RADIUS + 1);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 } }), []);

  useFrame((state) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    // Tilted so the ring reads as an orbit seen slightly from above.
    <points geometry={geometry} rotation={[0.38, 0, 0.18]}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
