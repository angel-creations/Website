// Playwright smoke check for the preserved Angel Creations site.
//
// Usage:
//   npm run dev            # in one terminal
//   node scripts/playwright-smoke.mjs
//
// Environment:
//   BASE_URL                target server (default http://127.0.0.1:5173)
//   PLAYWRIGHT_BROWSER_PATH optional Chromium executable override
//   SHOT_DIR                screenshot directory (default .playwright-artifacts)
//
// Exits non-zero when any route fails to render or logs a page error.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { resolveBrowser } from './playwright-browser.mjs';

const baseUrl = (process.env.BASE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const shotDir = process.env.SHOT_DIR ?? '.playwright-artifacts';
const browserOptions = await resolveBrowser();

const routes = [
  { name: 'home', url: '/' },
  { name: 'about', url: '/about/' },
  { name: 'works', url: '/works/' },
  { name: 'animation', url: '/animation/' },
  { name: 'mixed-reality', url: '/mixed-reality/' },
  { name: 'contact', url: '/contact/' },
  { name: 'metaverse', url: '/metaverse/' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: true, ...browserOptions });

const results = [];
let failures = 0;

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`);
  });

  for (const route of routes) {
    consoleErrors.length = 0;
    pageErrors.length = 0;
    failedRequests.length = 0;

    const url = `${baseUrl}${route.url}`;
    let status = null;
    let title = '';
    let heading = '';
    let error = null;
    try {
      const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      status = response?.status() ?? null;
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      title = await page.title();
      heading = (await page.locator('h1, h2').first().textContent().catch(() => ''))?.trim() ?? '';
      await page.screenshot({
        path: path.join(shotDir, `${viewport.name}-${route.name}.png`),
        fullPage: true,
      });
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    // Videos abort their own range requests while the slideshow swaps sources;
    // those are media-player behaviour, not page failures.
    const meaningfulFailures = failedRequests.filter(
      (failure) => !(failure.includes('net::ERR_ABORTED') && /\.(mp4|webm|ogg)(\?|$)/.test(failure)),
    );

    const ok = !error && status !== null && status < 400 && pageErrors.length === 0;
    if (!ok) failures += 1;

    results.push({
      viewport: viewport.name,
      route: route.url,
      status,
      ok,
      title,
      heading: heading.replace(/\s+/g, ' ').slice(0, 90),
      error,
      pageErrors,
      consoleErrors: consoleErrors.slice(0, 5),
      failedRequests: meaningfulFailures.slice(0, 5),
    });
  }

  await context.close();
}

await browser.close();

const rows = results.map((result) => ({
  viewport: result.viewport,
  route: result.route,
  status: result.status,
  ok: result.ok ? 'PASS' : 'FAIL',
  title: result.title,
  heading: result.heading,
}));
console.table(rows);

for (const result of results) {
  const problems = [
    ...(result.error ? [`navigation: ${result.error}`] : []),
    ...result.pageErrors.map((problem) => `pageerror: ${problem}`),
    ...result.failedRequests.map((problem) => `requestfailed: ${problem}`),
  ];
  if (problems.length > 0) {
    console.log(`\n${result.viewport} ${result.route}`);
    for (const problem of problems) console.log(`  - ${problem}`);
  }
}

await writeFile(
  path.join(shotDir, 'report.json'),
  `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
);

console.log(`\n${results.length - failures}/${results.length} checks passed. Screenshots and report in ${shotDir}/`);
process.exit(failures === 0 ? 0 : 1);
