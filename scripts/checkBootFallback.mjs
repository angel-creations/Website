// Guards the "white screen" failure mode at the source document.
//
// The repository root index.html is the Vite development entry: it loads /src/main.tsx,
// which only resolves while Vite is running. If a host publishes the repository root
// instead of the built dist/ directory, that module cannot execute. This check serves
// the repository root the way such a host would and asserts the visitor still sees
// content instead of a blank page.

import { chromium } from 'playwright';
import { startStaticServer } from './static-site-server.mjs';
import { resolveBrowser } from './playwright-browser.mjs';

const server = await startStaticServer({ root: '.', port: Number(process.env.PORT ?? 4310) });
const browserOptions = await resolveBrowser();
const browser = await chromium.launch({ headless: true, ...browserOptions });

let failure = null;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${server.url}/`, { waitUntil: 'load', timeout: 30000 });
  // The watchdog reveals the fallback 2.5s after load when the app has not mounted.
  await page.waitForTimeout(4000);

  const state = await page.evaluate(() => {
    const fallback = document.getElementById('boot-fallback');
    return {
      fallbackVisible: Boolean(fallback && fallback.getBoundingClientRect().height > 0),
      visibleText: (document.body.innerText || '').trim(),
      heading: (document.querySelector('h1')?.textContent || '').trim(),
    };
  });

  if (!state.fallbackVisible) failure = 'the boot fallback is not visible when the development entry cannot execute';
  else if (state.visibleText.length < 100) failure = 'the boot fallback shows too little readable content';
  else if (!/Dive into a new world/i.test(state.heading)) failure = 'the boot fallback headline is missing';

  console.log(
    failure
      ? `FAIL: ${failure}`
      : `Verified the source-document fallback: "${state.heading}" plus ${state.visibleText.length} characters of readable content render even when /src/main.tsx cannot load.`,
  );
} finally {
  await browser.close();
  await server.close();
}

process.exit(failure ? 1 : 0);
