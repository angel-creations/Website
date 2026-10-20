// Resolves a Chromium executable for Playwright.
//
// 1. PLAYWRIGHT_BROWSER_PATH when provided.
// 2. Playwright's own bundled/downloaded Chromium.
// 3. @sparticuz/chromium, for sandboxes that cannot reach the Playwright CDN.
//
// In the fallback case Chromium is statically opinionated about NSS/NSPR, so if
// those shared libraries are missing from the machine we compile the tiny ABI
// shim in scripts/playwright/nss-shim.c and put it on LD_LIBRARY_PATH. Chrome
// only reaches those symbols for its client-certificate database; normal page
// rendering is unaffected.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const shimDirectory = path.join(scriptDirectory, '..', '.playwright-artifacts', 'nss-shim');
const shimSource = path.join(scriptDirectory, 'playwright', 'nss-shim.c');
const versionScript = path.join(scriptDirectory, 'playwright', 'nss-versions.map');

function hasSystemNss() {
  try {
    execFileSync('sh', ['-c', 'ldconfig -p 2>/dev/null | grep -q libnss3.so'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function libraryPathIncludes(directory) {
  return (process.env.LD_LIBRARY_PATH ?? '')
    .split(':')
    .filter(Boolean)
    .includes(directory);
}

async function ensureNssShim() {
  if (hasSystemNss()) return;
  const libraries = ['libnss3.so', 'libnssutil3.so', 'libnspr4.so'];
  if (!libraries.every((library) => existsSync(path.join(shimDirectory, library)))) {
    await mkdir(shimDirectory, { recursive: true });
    execFileSync('gcc', [
      '-shared', '-fPIC', '-O2',
      '-o', path.join(shimDirectory, 'libnss3.so'),
      shimSource,
      `-Wl,--version-script=${versionScript}`,
      '-Wl,-soname,libnss3.so',
    ], { stdio: 'inherit' });
    for (const library of ['libnssutil3.so', 'libnspr4.so']) {
      execFileSync('cp', [path.join(shimDirectory, 'libnss3.so'), path.join(shimDirectory, library)]);
    }
  }
  if (!libraryPathIncludes(shimDirectory)) {
    process.env.LD_LIBRARY_PATH = [shimDirectory, process.env.LD_LIBRARY_PATH]
      .filter(Boolean)
      .join(':');
  }
}

export async function resolveBrowser() {
  if (process.env.PLAYWRIGHT_BROWSER_PATH) {
    return { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH, args: ['--no-sandbox'] };
  }

  let bundled = null;
  try {
    const { chromium } = await import('playwright');
    bundled = chromium.executablePath();
  } catch {
    bundled = null;
  }
  if (bundled && existsSync(bundled)) return { args: [] };

  try {
    const { default: sparticuz } = await import('@sparticuz/chromium');
    const executablePath = await sparticuz.executablePath();
    await ensureNssShim();
    // Playwright supplies its own launch flags; Sparticuz's extra flags (single
    // process, GPU emulation) conflict with Playwright's automation profile.
    return { executablePath, args: ['--no-sandbox'] };
  } catch (error) {
    throw new Error(
      'No Chromium available. Run `npx playwright install chromium`, or set PLAYWRIGHT_BROWSER_PATH.\n' +
        `Fallback attempt failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
