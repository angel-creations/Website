import dimensions from '../data/imageDimensions.json';

/**
 * Intrinsic size of a shipped image, keyed by its public path.
 *
 * `src/data/imageDimensions.json` is generated from the real file headers by
 * `scripts/generateImageDimensions.mjs` during `npm run build`, so the numbers
 * can never drift from the files. Spreading the result onto an `<img>` gives the
 * browser an aspect ratio before the bytes arrive, which is what stops late
 * image loads from moving the layout.
 *
 * Unknown paths return an empty object rather than invented numbers: a wrong
 * width/height reserves the wrong box, which is worse than reserving none. This
 * keeps dynamic sources safe — a missing entry simply degrades to today's
 * behaviour.
 */
export function imageSize(src?: string | null): { width?: number; height?: number } {
  if (!src) return {};
  const path = src.split('#')[0].split('?')[0];
  const entry = (dimensions as unknown as Record<string, [number, number]>)[path];
  if (!entry) return {};
  return { width: entry[0], height: entry[1] };
}
