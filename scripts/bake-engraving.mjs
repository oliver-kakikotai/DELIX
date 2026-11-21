// Bakes the "Hola, this is Delix" engraving decal for the homepage rock.
//
//   node scripts/bake-engraving.mjs
//
// Projecting a decal onto the ~100k-triangle rock (DecalGeometry) blocked the
// main thread for 100–250 ms on every page load. It only depends on the model
// and components/engravingConfig.json, so it's computed once here and saved to
// public/models/hitem3d-engraving.bin, which Model3DViewer just loads.
// Re-run this whenever the model or engravingConfig.json changes.
//
// Output (little-endian Float32): [vertexCount, positions(3n), normals(3n), uvs(2n)],
// in the model's own local space (before re-centering / BASE_SCALE).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const glbPath = path.join(root, 'public/models/hitem3d.glb');
const outPath = path.join(root, 'public/models/hitem3d-engraving.bin');
const config = JSON.parse(fs.readFileSync(path.join(root, 'components/engravingConfig.json'), 'utf8'));

// Minimal GLB reader for this model: a single indexed triangle primitive.
const buf = fs.readFileSync(glbPath);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
const bin = buf.subarray(20 + jsonLen + 8);
const prim = gltf.meshes[0].primitives[0];
const read = (accessorIndex, Ctor, comps) => {
  const acc = gltf.accessors[accessorIndex];
  const view = gltf.bufferViews[acc.bufferView];
  const off = bin.byteOffset + view.byteOffset + (acc.byteOffset || 0);
  return new Ctor(bin.buffer.slice(off, off + acc.count * comps * Ctor.BYTES_PER_ELEMENT));
};
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(read(prim.attributes.POSITION, Float32Array, 3), 3));
geometry.setIndex(new THREE.BufferAttribute(read(prim.indices, Uint32Array, 1), 1));
// DecalGeometry needs vertex normals; the GLB ships without them.
geometry.computeVertexNormals();
const mesh = new THREE.Mesh(geometry);
mesh.updateMatrixWorld(true);

const phi = THREE.MathUtils.degToRad(config.azimuthDeg);
const el = THREE.MathUtils.degToRad(config.elevationDeg);
const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(el), Math.sin(el), Math.cos(phi) * Math.cos(el)).normalize();
const hit = new THREE.Raycaster(dir.clone().multiplyScalar(3), dir.clone().negate()).intersectObject(mesh, false)[0];
if (!hit) throw new Error('Engraving ray missed the model');

// Projector basis: x = text right, y = text up, z = outward normal.
const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
const up = new THREE.Vector3().crossVectors(dir, right).normalize();
const orientation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, dir));
const decal = new DecalGeometry(mesh, hit.point, orientation, new THREE.Vector3(config.width, config.height, config.depth));

const n = decal.attributes.position.count;
const out = new Float32Array(1 + n * 8);
out[0] = n;
out.set(decal.attributes.position.array, 1);
out.set(decal.attributes.normal.array, 1 + n * 3);
out.set(decal.attributes.uv.array, 1 + n * 6);
fs.writeFileSync(outPath, Buffer.from(out.buffer));
console.log(`Wrote ${path.relative(root, outPath)}: ${n} vertices, ${out.byteLength} bytes, surface radius ${hit.point.length().toFixed(4)}`);
