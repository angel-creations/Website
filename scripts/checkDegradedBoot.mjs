// Proves the published site never renders blank when its JavaScript cannot run.
//
// The live white screen came from documents whose entry bundle returned 404 (a cached
// page pointing at a replaced asset) and from the repository source being published
// instead of dist/. Both leave #root empty. Each route document carries a hidden boot
// fallback that a watchdog reveals in that situation; this check fails the build if any
// route stays blank.

import { chromium } from 'playwright';
import { startStaticServer } from './static-site-server.mjs';
import { resolveBrowser } from './playwright-browser.mjs';

const routes = ['/', '/about/', '/works/', '/contact/', '/metaverse/', '/capabilities/brand/'];
const server = await startStaticServer({ root: 'dist', port: Number(process.env.PORT ?? 4311) });
const browserOptions = await resolveBrowser();
const browser = await chromium.launch({ headless: true, ...browserOptions });

const failures = [];

async function inspectRoute(route, { blockScripts }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  if (blockScripts) {
    // Exactly the live failure: the document arrives, its bundle does not.
    await page.route('**/assets/*.js', (request) => request.fulfill({ status: 404, body: '' }));
  }
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${server.url}${route}`, { waitUntil: 'load', timeout: 30000 });
  // Watchdog: 250 ms after a script error, 2.5 s after load at the latest.
  await page.waitForTimeout(4000);

  const state = await page.evaluate(() => {
    const fallback = document.getElementById('boot-fallback');
    const root = document.getElementById('root');
    return {
      fallbackPresent: Boolean(fallback),
      fallbackVisible: Boolean(fallback && !fallback.hidden && fallback.getBoundingClientRect().height > 0),
      rootChildren: root ? root.children.length : -1,
      text: (document.body.innerText || '').trim(),
    };
  });

  await context.close();
  return { ...state, errors };
}

try {
  for (const route of routes) {
    const healthy = await inspectRoute(route, { blockScripts: false });
    if (healthy.rootChildren <= 0) {
      failures.push(`${route}: the app did not mount on a healthy load`);
    }
    if (healthy.fallbackVisible) {
      failures.push(`${route}: the boot fallback is still visible although the app mounted`);
    }

    const degraded = await inspectRoute(route, { blockScripts: true });
    if (!degraded.fallbackVisible) {
      failures.push(`${route}: bundle blocked and no fallback was revealed (blank page)`);
    } else if (degraded.text.length < 120) {
      failures.push(`${route}: fallback revealed but shows only ${degraded.text.length} characters`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}

if (failures.length > 0) {
  console.error('Degraded-boot check failed:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(
  `Verified ${routes.length} routes: the app mounts normally, and with every /assets/*.js request forced to 404 each route still reveals readable content instead of a blank page.`,
);
