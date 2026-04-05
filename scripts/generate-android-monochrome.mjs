/**
 * Builds android-icon-monochrome.png from android-icon-foreground.png:
 * same dove mark, flat white on transparent (Android themed icon layer).
 * Uses pngjs only (no native modules) so EAS `npm ci --include=dev` works.
 * Run: node scripts/generate-android-monochrome.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PNG } from "pngjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const foregroundPath = join(root, "assets/images/android-icon-foreground.png");
const outPath = join(root, "assets/images/android-icon-monochrome.png");

const input = PNG.sync.read(readFileSync(foregroundPath));
const data = input.data;
const w = input.width;
const h = input.height;
const ch = 4;

const isOuterBackground = (idx) => {
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  return r > 248 && g > 248 && b > 248;
};

const visited = new Uint8Array(w * h);
const stack = [];
const push = (x, y) => {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const k = y * w + x;
  if (visited[k]) return;
  const i = k * ch;
  if (!isOuterBackground(i)) return;
  visited[k] = 1;
  stack.push(k);
};

push(0, 0);
push(w - 1, 0);
push(0, h - 1);
push(w - 1, h - 1);

while (stack.length) {
  const k = stack.pop();
  const x = k % w;
  const y = (k / w) | 0;
  const neighbors = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
  for (const [nx, ny] of neighbors) {
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const nk = ny * w + nx;
    if (visited[nk]) continue;
    const ni = nk * ch;
    if (!isOuterBackground(ni)) continue;
    visited[nk] = 1;
    stack.push(nk);
  }
}

/** Inside adaptive-icon squircle (not outer canvas): dove is near-white, low saturation vs pastel gradient. */
const MAX_SATURATION = 0.12;
const MIN_LUMA = 0.78;

const bird = new Uint8Array(w * h);
for (let k = 0; k < w * h; k++) {
  if (visited[k]) continue;
  const i = k * ch;
  const r = data[i] / 255;
  const g = data[i + 1] / 255;
  const b = data[i + 2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const hslL = (max + min) / 2;
  const sat =
    max === min ? 0 : (max - min) / (1 - Math.abs(2 * hslL - 1) + 1e-8);
  const yl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (sat < MAX_SATURATION && yl > MIN_LUMA) bird[k] = 1;
}

const dilated = new Uint8Array(bird);
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const k = y * w + x;
    if (visited[k] || bird[k]) continue;
    let any = 0;
    for (let dy = -1; dy <= 1 && !any; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (bird[(y + dy) * w + (x + dx)]) {
          any = 1;
          break;
        }
      }
    }
    if (any) dilated[k] = 1;
  }
}

const outW = 512;
const outH = 512;
const out = new PNG({ width: outW, height: outH });

for (let y = 0; y < outH; y++) {
  for (let x = 0; x < outW; x++) {
    const sx = Math.min(w - 1, Math.floor((x * w) / outW));
    const sy = Math.min(h - 1, Math.floor((y * h) / outH));
    const sk = sy * w + sx;
    const di = (y * outW + x) << 2;
    if (dilated[sk]) {
      out.data[di] = 255;
      out.data[di + 1] = 255;
      out.data[di + 2] = 255;
      out.data[di + 3] = 255;
    } else {
      out.data[di] = 0;
      out.data[di + 1] = 0;
      out.data[di + 2] = 0;
      out.data[di + 3] = 0;
    }
  }
}

writeFileSync(outPath, PNG.sync.write(out));
console.log("Wrote", outPath);
