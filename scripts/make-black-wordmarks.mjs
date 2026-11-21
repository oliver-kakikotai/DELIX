// Makes black copies of the white-on-transparent wordmarks (song titles in
// data/albumData.ts, plus the DELIX logo) for use on light backgrounds.
//
//   node scripts/make-black-wordmarks.mjs
//
// Why files instead of CSS `filter: brightness(0)`: that filter didn't render
// on mobile Safari for these images (inside animated parents), leaving the
// title/logo invisible. Re-run after adding or changing a wordmark image.
// Output: public/images/black/<slug>.png (alpha kept, RGB set to black).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/images/black');
fs.mkdirSync(outDir, { recursive: true });

// Pull slug → titleImage pairs out of albumData.ts without compiling TS.
const album = fs.readFileSync(path.join(root, 'data/albumData.ts'), 'utf8');
const jobs = [];
const songRe = /slug:\s*["']([^"']+)["'][\s\S]*?titleImage:\s*["']([^"']+)["']/g;
for (const m of album.matchAll(songRe)) jobs.push({ name: m[1], src: m[2] });
jobs.push({ name: 'delix-logo', src: '/images/delix-logo.png' });

for (const job of jobs) {
  const input = path.join(root, 'public', job.src);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) data[i] = data[i + 1] = data[i + 2] = 0;
  const out = path.join(outDir, `${job.name}.png`);
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(out);
  console.log(`${job.src} -> ${path.relative(root, out)}`);
}
