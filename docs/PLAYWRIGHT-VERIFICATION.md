# Playwright local verification

Browser smoke checks for the preserved site, run against the Vite dev server.

## Setup

```bash
npm install
npx playwright install chromium   # once per machine
npm run dev                       # terminal 1
npm run test:smoke                # terminal 2
```

`npm run test:smoke` loads seven routes at desktop (1440×900) and mobile
(390×844), writes a full-page screenshot per route to
`.playwright-artifacts/`, and fails non-zero when a route does not render or a
script throws. `BASE_URL` overrides the target (default
`http://127.0.0.1:5173`), `SHOT_DIR` moves the screenshots.

Routes checked: `/`, `/about/`, `/works/`, `/work/`, `/animation/`, `/augment-reality/`,
`/brand-advertisement/`, `/media-production/`, `/metaverse/`, `/mixed-reality/`,
`/virtual-reality/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/` and four
capability pages, at both viewports.

## Production rehearsal

`npm run test:static` serves `dist/` through `scripts/static-site-server.mjs` the way a
static host does — directory index, no SPA fallback — and fails when a route returns a
document the application cannot mount. This is the check that catches the white screen
described in [PRODUCTION-WHITE-SCREEN.md](./PRODUCTION-WHITE-SCREEN.md); the dev server
cannot, because Vite answers every route with `index.html`.

`npm run test:fallback` serves the repository root and asserts that the source `index.html`
renders readable content when `/src/main.tsx` cannot execute.

`npm run test:prod` runs the build plus both rehearsals.

## Sandboxes without Playwright CDN access

`scripts/playwright-browser.mjs` falls back to `@sparticuz/chromium` when the
Playwright browser download is unavailable or cannot be reached. That Chromium
build links against `libnss3`/`libnspr4`; where those packages are absent, the
resolver compiles `scripts/playwright/nss-shim.c` (versioned stubs for the
client-certificate database symbols Chrome imports) into
`.playwright-artifacts/nss-shim/` and puts it on `LD_LIBRARY_PATH` for the
browser process only. Normal page rendering is unaffected. Set
`PLAYWRIGHT_BROWSER_PATH` to point at any other Chromium build.

## Notes

- `.playwright-artifacts/` is generated output and ignored by Git.
- Aborted `video` range requests are expected: the homepage slideshow swaps
  poster videos while they preload, so the browser cancels them. They are
  recorded in `report.json` but do not fail the run.
