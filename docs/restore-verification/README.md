# Restore verification artefacts

## Contents

```
restore-verification/
├── README.md                        this file
├── before/                          screenshots of the rejected redesign (HEAD 4a44117)
├── after/                           screenshots of the restored original + enhancements (current state)
├── original-vs-restored/
│   ├── original/                    screenshots of the original 9d806ca build
│   └── restored/                    screenshots of the restored build, same harness
├── route-audit-original.json        per-route DOM/computed-style audit of the 9d806ca build
└── route-audit-restored.json        per-route DOM/computed-style audit of the current build
```

`original-vs-restored/` was produced by a second, independent harness (see
[`../INDEPENDENT-RESTORE-VERIFICATION.md`](../INDEPENDENT-RESTORE-VERIFICATION.md)), so the
original and the restored build could be compared at the same moment, at the same viewport, with
the same scroll routine. Its route list is the same seven routes the `before/` and `after/` sets
use, and its filenames follow the same `<route>__<viewport>.jpg` pattern.

## How the screenshots were produced

Both `before/` and `after/` were produced by the **same script**, against **the same routes**, at
**the same two viewports**, with **the same wait and scroll routine**:

- Routes: `/`, `/about/`, `/works/`, `/contact/`, `/metaverse/`, `/animation/`, `/privacy-policy/`.
- Viewports: **desktop 1440×900** and **mobile 390×844**, `deviceScaleFactor: 1`.
- Routine: `waitUntil: networkidle2`, 2.5 s settle, then a scripted scroll pass down the whole page
  (0.8 × viewport per step, 120 ms per step), back to top, 1.2 s settle, then a full-page JPEG
  capture at quality 62.

Filename pattern: `<route>__<viewport>.jpg`, e.g. `works__desktop.jpg`.

## Tooling caveat — read this before interpreting the images

The workspace had **no browser binary** and the sandbox cannot reach Debian package mirrors,
Playwright's CDN, or the Chrome-for-Testing bucket. Screenshots were produced with the Chromium
binary shipped inside the npm package `@sparticuz/chromium` (Chromium 153), using the NSS libraries
bundled in the same package (`libnspr4.so`, `libnspr4`-family `libnss3.so`, `libnssutil3.so`) via
`LD_LIBRARY_PATH`.

Consequences:

1. **Video decoding is not reliable in this headless build.** Homepage and inner-page film frames may
   appear black or poster-only. This affects both `before/` and `after/` equally.
2. The two static builds are served from a plain static server with SPA fallback. The Vite dev/preview
   proxy for the preserved remote Unity and 360° artefacts is therefore **not** active; anything that
   depends on `https://angelcreations.in/wp-content/uploads/2023/01` or `/metaverse/Build` will not
   load in these captures (again, identically in both sets).

Because of (1) and (2), the automated comparison in
[`../ROUTE-COMPARISON-REPORT.md`](../ROUTE-COMPARISON-REPORT.md) is **structural and computed-style
evidence**, not a pixel diff. The screenshots are there for human review of layout, composition and
typography.

## Reproducing

```bash
npm ci
npm run build

# serve two builds on two ports, then:
node shot.mjs http://127.0.0.1:<port> <outDir> "/,/about/,/works/" '{"desktop":[1440,900]}' 
node audit.mjs http://127.0.0.1:<port> <outFile>.json
```

`shot.mjs` and `audit.mjs` are the harnesses used; they require `puppeteer-core` and
`@sparticuz/chromium` and the `LD_LIBRARY_PATH` described above.
