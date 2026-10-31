// Reads intrinsic pixel dimensions straight out of image file headers and writes
// src/data/imageDimensions.json, which components use to emit width/height
// attributes. No image decoding library: every format we ship stores its size in
// a fixed, well-documented place near the start of the file.
//
// PNG  : IHDR width/height at byte 16.
// JPEG : walk the segment chain to the SOFn marker.
// WebP : VP8 (lossy), VP8L (lossless) or VP8X (extended) chunk headers.
// GIF  : logical screen descriptor.
// SVG  : width/height attributes, else the viewBox.
//
// Run before tsc so the manifest is always in step with public/ and the build
// stays deterministic (entries are sorted by path).

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = join(root, 'public');
const output = join(root, 'src/data/imageDimensions.json');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);

function pngSize(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(12) !== 0x49484452) return null; // 'IHDR'
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegSize(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    // SOF0..SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }
  return null;
}

function webpSize(buffer) {
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  }
  return null;
}

function gifSize(buffer) {
  if (buffer.length < 10) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function svgSize(text) {
  const width = text.match(/\bwidth="([\d.]+)(?:px)?"/);
  const height = text.match(/\bheight="([\d.]+)(?:px)?"/);
  if (width && height) return { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) };
  const viewBox = text.match(/\bviewBox="([-\d.\s]+)"/);
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
    }
  }
  return null;
}

async function dimensionsFor(file, extension) {
  const buffer = await readFile(file);
  switch (extension) {
    case '.png':
      return pngSize(buffer);
    case '.jpg':
    case '.jpeg':
      return jpegSize(buffer);
    case '.webp':
      return webpSize(buffer);
    case '.gif':
      return gifSize(buffer);
    case '.svg':
      return svgSize(buffer.toString('utf8'));
    case '.avif':
      // ISOBMFF too; not shipped today, skip rather than guess.
      return null;
    default:
      return null;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const files = (await walk(publicDir)).sort();
const dimensions = {};
const inventory = [];
let resolved = 0;

for (const file of files) {
  const extension = file.slice(file.lastIndexOf('.')).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) continue;
  const publicPath = `/${relative(publicDir, file).split('\\').join('/')}`;
  const size = await dimensionsFor(file, extension);
  const bytes = (await stat(file)).size;
  inventory.push({ path: publicPath, bytes, format: extension.slice(1), ...(size ?? { width: null, height: null }) });
  if (size && size.width > 0 && size.height > 0) {
    dimensions[publicPath] = [size.width, size.height];
    resolved += 1;
  }
}

const sorted = Object.fromEntries(Object.keys(dimensions).sort().map((key) => [key, dimensions[key]]));
await writeFile(output, `${JSON.stringify(sorted, null, 0)}\n`);

console.log(
  `Image dimensions: ${resolved}/${inventory.length} public images measured, ${Object.keys(sorted).length} entries written to src/data/imageDimensions.json`,
);
const missing = inventory.filter((entry) => entry.width === null);
if (missing.length > 0) {
  console.warn(`  could not read dimensions for ${missing.length} file(s): ${missing.slice(0, 5).map((entry) => entry.path).join(', ')}`);
}
