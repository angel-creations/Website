// Playwright checks for the preserved Angel Creations site.
//
// Usage:
//   npm run test:smoke     against a running dev/preview server
//   npm run test:static    builds nothing: serves dist/ like a static host first
//
// Environment:
//   BASE_URL                target server (default http://127.0.0.1:5173)
//   PLAYWRIGHT_BROWSER_PATH optional Chromium executable override
//   SHOT_DIR                screenshot directory (default .playwright-artifacts)
//
// Exits non-zero when any route fails to render or a script throws.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { resolveBrowser } from './playwright-browser.mjs';
import { startStaticServer } from './static-site-server.mjs';

const staticMode = process.argv.includes('--static');
const shotDir = process.env.SHOT_DIR ?? '.playwright-artifacts';
let staticServer = null;
let baseUrl = (process.env.BASE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');

if (staticMode) {
  staticServer = await startStaticServer({ root: 'dist', port: Number(process.env.PORT ?? 4173) });
  baseUrl = staticServer.url;
}

const routes = [
  { name: 'home', url: '/' },
  { name: 'about', url: '/about/' },
  { name: 'works', url: '/works/' },
  { name: 'works-alias', url: '/work/' },
  { name: 'animation', url: '/animation/' },
  { name: 'augment-reality', url: '/augment-reality/' },
  { name: 'brand-advertisement', url: '/brand-advertisement/' },
  { name: 'media-production', url: '/media-production/' },
  { name: 'metaverse', url: '/metaverse/' },
  { name: 'mixed-reality', url: '/mixed-reality/' },
  { name: 'virtual-reality', url: '/virtual-reality/' },
  { name: 'contact', url: '/contact/' },
  { name: 'privacy-policy', url: '/privacy-policy/' },
  { name: 'terms-of-service', url: '/terms-of-service/' },
  { name: 'capability-brand', url: '/capabilities/brand/' },
  { name: 'capability-film', url: '/capabilities/film/' },
  { name: 'capability-digital', url: '/capabilities/digital/' },
  { name: 'capability-creative-technology', url: '/capabilities/creative-technology/' },
  { name: 'domains', url: '/domains/' },
  { name: 'domain-metaverse-virtual-worlds', url: '/metaverse/virtual-worlds/' },
  { name: 'domain-vr-healthcare', url: '/virtual-reality/healthcare/' },
  { name: 'domain-animation-visual-effects', url: '/animation/visual-effects/' },
  { name: 'domain-media-film-production', url: '/media-production/film-production/' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(shotDir, { recursive: true });

const browserOptions = await resolveBrowser();
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
    let rendered = null;
    let error = null;
    try {
      const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      status = response?.status() ?? null;
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      title = await page.title();
      // The white-screen regression: the route document parsed, but the app never
      // mounted, so the page is blank. Measure the mounted output, not just the status.
      rendered = await page.evaluate(() => {
        const root = document.getElementById('root');
        return {
          rootChildren: root ? root.children.length : -1,
          textLength: (document.body.innerText || '').trim().length,
        };
      });
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

    const mounted = (rendered?.rootChildren ?? 0) > 0 && (rendered?.textLength ?? 0) > 40;
    const ok = !error && status !== null && status < 400 && mounted && pageErrors.length === 0;
    if (!ok) failures += 1;

    results.push({
      viewport: viewport.name,
      route: route.url,
      status,
      ok,
      title,
      heading: heading.replace(/\s+/g, ' ').slice(0, 90),
      rendered,
      error,
      pageErrors,
      consoleErrors: consoleErrors.slice(0, 5),
      failedRequests: meaningfulFailures.slice(0, 5),
    });
  }

  await context.close();
}

await browser.close();
await staticServer?.close();

const rows = results.map((result) => ({
  viewport: result.viewport,
  route: result.route,
  status: result.status,
  ok: result.ok ? 'PASS' : 'FAIL',
  mounted: result.rendered ? `${result.rendered.textLength} chars` : 'no',
  heading: result.heading,
}));
console.table(rows);

for (const result of results) {
  const problems = [
    ...(result.error ? [`navigation: ${result.error}`] : []),
    ...(result.ok ? [] : ['the route did not render any content']),
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
  `${JSON.stringify({ baseUrl, mode: staticMode ? 'static' : 'server', generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
);

console.log(`\n${results.length - failures}/${results.length} checks passed. Screenshots and report in ${shotDir}/`);
process.exit(failures === 0 ? 0 : 1);
