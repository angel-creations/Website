// Boot fallback for the published documents.
//
// Two real incidents produced a blank white page on the live domain:
//   1. the host published the repository root instead of the built site, so the
//      development entry (/src/main.tsx) could never execute;
//   2. a cached HTML document pointed at a hashed bundle that a later deploy had
//      replaced, so the entry script returned 404.
// Both leave #root empty and paint nothing. The block keeps the studio's headline,
// description and navigation available: it stays hidden until the watchdog sees that
// the application has not mounted within a few seconds (or that the entry script failed
// to load). src/main.tsx removes it once the app is on screen.
//
// index.html is the single source of truth; the Vite plugin in vite.config.ts and
// scripts/generateStaticFallbacks.mjs both copy this block into the documents they serve.

import { readFileSync } from 'node:fs';

const document = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const block = document.match(/<!-- angel-boot-fallback:start -->[\s\S]*?<!-- angel-boot-fallback:end -->/)?.[0] ?? '';

if (!block.includes('id="boot-fallback"')) {
  throw new Error('index.html is missing the angel-boot-fallback block.');
}
if (!block.includes('data-boot-watchdog')) {
  throw new Error('The angel-boot-fallback block is missing its watchdog script.');
}

export const bootFallbackBlock = block;
export default bootFallbackBlock;
