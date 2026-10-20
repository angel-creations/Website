# Angel Creations — full-stack audit and repair report

**Audit date:** 2026-10-19 UTC
**Repository:** `angel-creations/Website`
**Branch:** `arena/cc808b0c-website`
**Starting revision:** `e895f9566615f4e1189a89aa6eec0d158943d7ab`
**Production deployment:** **BLOCKED / NOT DEPLOYED** — see below.
**Scope:** repository, built static artifact, local Vite preview, and available production page-fetch observations. This report distinguishes local verification from production/browser verification.

## Executive summary

The repository has a production-ready Vite/React static-site build, route-specific source content, a large local asset archive, and extensive pre-existing SEO, route, and content-preservation work. I found a concrete resilience defect in its HTML delivery: all route pages had useful fallback content inside `<noscript>` while the active application started from an empty `#root`. With scripting enabled but JavaScript delayed or failing, users therefore had no meaningful route content until React and its route chunk rendered. That delivery behavior is consistent with the reported long blank/footer-only interval, but the inaccessible production response prevents proving it is the deployed site's sole cause.

I changed the build to serve visible, route-specific HTML immediately, keep it available while a route chunk is pending, and remove it only after the matching React page commits. A React render failure now replaces it with the existing actionable application error screen. Loading states are now semantic, prominent, and reduced-motion aware. Local validation found all 21 public sitemap routes, 305 referenced local asset URLs, and their recognized MIME types healthy in the production build/preview.

The live fetch tool parsed the homepage but returned an HTTP 500 error for each of 12 requested inner routes. It did not expose response headers, body, request timing, or distinguish origin/CDN behavior from fetch-service failure. The production origin, Hostinger document root, deployed asset set, and current TLS/deployment revision therefore remain **UNVERIFIED**. No deployment was attempted.

## Evidence-based defect inventory

| Severity | Finding | Evidence / root cause | Change and verification |
|---|---|---|---|
| **P1** | Meaningful content waited for JavaScript on route documents | Before repair, `scripts/generateStaticFallbacks.mjs` emitted the route's useful HTML only inside `<noscript>`; active script-capable browsers received an empty `#root`. React page components are route-level dynamic imports. A slow entry bundle or route chunk could therefore leave the real content unavailable, even though the fallback data already existed in the build. | Emit a visible, styled `#static-route-fallback` before `#root` in every public static document and home entry. Keep it over the application while loading; remove it only after the eager home page or the route's lazy content commits. Static audit and end-to-end audit now assert this on **21/21** sitemap pages. |
| **P1 (production)** | User-reported inner-page delay / missing media | Available production page-fetch attempts: homepage parsed; `/about/`, `/works/`, `/contact/`, `/metaverse/`, `/mixed-reality/`, `/virtual-reality/`, `/augment-reality/`, `/animation/`, `/brand-advertisement/`, `/media-production/`, `/privacy-policy/`, and `/terms-of-service/` each reported **HTTP 500** from the fetch tool. No response body, headers, or network waterfall was exposed, so this does not identify whether the origin, CDN, deployment, or fetch service generated the errors. | Local fault-tolerance repaired and verified; production root cause and live asset failures **UNVERIFIED** pending an approved production HTTP/browser path. The fetch-tool result is not represented as a confirmed Hostinger 500. |
| **P1** | Asset delivery could not be proven against production | Source tree contains 437 public files (about 100 MB). Git presence alone does not verify Hostinger publication. | Existing e2e audit now records local content types as well as status. In preview, **305/305** local referenced URLs returned successfully; **0** missing/unserved assets and **0** recognized-extension MIME mismatches. Production publish/existence remains **UNVERIFIED**. |
| **P2** | Suspense feedback was a single line and easy to overlook | Several route boundaries showed only a plain paragraph while the footer rendered separately. This offers weak status feedback and is fragile if route initialization is delayed. | A reusable main-content loading state now exposes a heading, status text, and nonessential spinner; `aria-live`, `role="status"`, `aria-busy`, and `prefers-reduced-motion` handling are provided. TypeScript/build passed. Browser timing/announcement QA remains **UNVERIFIED**. |
| **P2** | Production 404/410 and alias mapping depends on the host | The repository can generate the error documents and the local Vite middleware returns tested statuses, but static files do not configure Hostinger. | No speculative Hostinger rewrite or cache configuration was added. Local 404/410/301 checks passed; production status behavior remains **UNVERIFIED**. |
| **P2** | Visual, interaction, and field-performance claims could not be tested here | No usable Chromium/Firefox binary is installed and production browser traffic is restricted. No RUM/Lighthouse data was supplied. | Claims are withheld. All required viewport matrix runs, visual screenshots, keyboard/touch/SR QA, Lighthouse, Core Web Vitals field data, and production console/network captures are **UNVERIFIED**. |

## Implemented changes

- `index.html`
  - Adds a small, independently usable home hero with Angel's existing headline, existing 70.5 KB Metaverse poster, and links to all public core/legal routes.
  - Gives the fallback dark responsive styling, visible focus, and at-least-44-pixel navigation controls. It remains usable with JavaScript disabled or delayed.
- `scripts/generateStaticFallbacks.mjs`
  - Moves route-specific source fallback HTML out of `<noscript>` into a visible fixed, scrollable shell above the React root.
  - Scopes fallback presentation to that shell to avoid leaking fallback styles into React once it takes over.
  - Preserves the page's existing route title, description, canonical, social metadata, JSON-LD, module/CSS references, and original fallback content.
- `src/app/App.tsx`
  - Adds a shared fallback-dismissal marker after each route's resolved content. The shell stays visible while a lazy import is unresolved and is removed after that page commits.
  - Replaces bare Suspense text with an accessible loading state. Loading fallback markup avoids nested `<main>` elements on About, capability, works, contact, experience, and legal routes.
- `src/components/ApplicationErrorBoundary.tsx`
  - Removes the temporary route shell when the existing recovery/error screen is shown, so it cannot cover the actionable error UI.
- `src/styles/enhancements.css`
  - Adds typography/layout and a reduced-motion-aware indicator for route loading.
- `scripts/auditStaticOutput.mjs`
  - Fails the build audit if any public sitemap document lacks an H1 in visible pre-hydration HTML.
- `scripts/auditEndToEnd.mjs`
  - Verifies that every public route has visible pre-hydration content; checks local HTTP status and recognized MIME types for asset references.
- `docs/audits/END-TO-END-AUDIT.md`, `docs/audits/END-TO-END-LINK-INVENTORY.json`, `docs/PHASE-3-SEO-REPORT.json`
  - Refreshed local generated evidence for routes, links, pre-hydration content, assets, and MIME types.

No new runtime dependencies were introduced and no original portfolio imagery was fabricated or replaced.

## Route-by-route local verification

The production build's static preview returned HTTP 200 for every sitemap route. All have route-specific visible H1 content before React. The route list below is exhaustive for the 21 sitemap routes:

| Core route | Local HTTP | Visible pre-hydration H1 | Local route/assets status |
|---|---:|---:|---|
| `/` | 200 | Yes | Pass |
| `/about/` | 200 | Yes | Pass |
| `/works/` | 200 | Yes | Pass |
| `/contact/` | 200 | Yes | Pass |
| `/metaverse/` | 200 | Yes | Pass |
| `/mixed-reality/` | 200 | Yes | Pass |
| `/virtual-reality/` | 200 | Yes | Pass |
| `/augment-reality/` | 200 | Yes | Pass |
| `/animation/` | 200 | Yes | Pass |
| `/brand-advertisement/` | 200 | Yes | Pass |
| `/media-production/` | 200 | Yes | Pass |
| `/privacy-policy/` | 200 | Yes | Pass |
| `/terms-of-service/` | 200 | Yes | Pass |
| `/capabilities/brand/` | 200 | Yes | Pass |
| `/capabilities/design/` | 200 | Yes | Pass |
| `/capabilities/content/` | 200 | Yes | Pass |
| `/capabilities/film/` | 200 | Yes | Pass |
| `/capabilities/animation-3d/` | 200 | Yes | Pass |
| `/capabilities/digital/` | 200 | Yes | Pass |
| `/capabilities/experiences/` | 200 | Yes | Pass |
| `/capabilities/creative-technology/` | 200 | Yes | Pass |

Additional local status probes passed: `/about` → 301 to `/about/`; `/work/` resolves to the works archive; unknown test path → branded 404; retired `/360-video[/]` → branded 410; feeds, sitemap, and robots respond locally. Hostinger's behavior is not inferred from Vite preview.

## Responsive and accessibility status

- **Viewport matrix:** 320×568, 360×640, 375×812, 390×844, 430×932, 600×960, 768×1024, 820×1180, 1024×1366, 1280×720, 1366×768, 1440×900, 1600×900, 1920×1080, 2560×1080, and 3440×1440 — **UNVERIFIED** in a browser. Portrait/landscape, zoom 80–200%, high DPI, touch, keyboard, and slow-device/network rendering also **UNVERIFIED**.
- The new static fallback uses fluid `clamp()` typography, wraps links, retains semantic headings/navigation, provides focus indication, and uses 44px-minimum touch links on home. Source inspection only; WCAG 2.2 AA conformance is **not claimed**.
- The new loading state supports screen-reader status announcement and disables its spinner under reduced motion. Actual assistive-technology and media-query behavior **UNVERIFIED**.
- Existing application accessibility, forms, menus, Back/Forward, and all motion behaviors were not browser-tested in this environment.

## Build, assets, performance, SEO, and security results

Commands completed:

```text
npm ci
npm run build
PREVIEW_BASE=http://127.0.0.1:4175 node scripts/auditStaticOutput.mjs
PREVIEW_BASE=http://127.0.0.1:4175 node scripts/auditEndToEnd.mjs
npm audit --audit-level=moderate
npm audit --omit=dev --audit-level=moderate
git diff --check
```

- **Build:** passed (TypeScript + Vite); 71 modules transformed; static fallbacks generated.
- **Static output audit:** passed — 29 documents, 21 sitemap routes, 12 legacy fallback payloads; metadata/schema, canonical, sitemap, error-document, and pre-hydration checks had no failures.
- **End-to-end local audit:** passed — 21/21 routes; 293 static anchors; 21/21 unique internal targets; 0 broken internal links; 305 local asset URLs; 0 missing/unserved assets; 0 MIME mismatches; 21 unique social previews; 0 unexpected local status/error-body issues.
- **Production dependency audit / full dependency audit:** both passed; 0 vulnerabilities reported.
- **Measured build transfer sizes (Vite gzip estimate, not network RUM):** initial JS 213.67 KB raw / 65.28 KB gzip; CSS 182.73 KB raw / 30.07 KB gzip. Representative route chunks: About 43.73 KB / 11.12 KB gzip; Slider Experience 41.62 KB / 11.78 KB gzip; Contact 22.13 KB / 6.90 KB gzip; Works archive 18.75 KB / 5.54 KB gzip. Build splitting remains active.
- **Lighthouse / LCP / INP / CLS / TBT / constrained mobile test:** **UNVERIFIED**. Bundle byte sizes are not Core Web Vitals or a performance score.
- **Remote 310 MB QuickTime source:** historical MIME/status exists in repository evidence only; it was not fetched or decoded for this audit.

## Deployment and production verification

- The current workflow deploy job is restricted to `refs/heads/main` and requires `HOSTINGER_DEPLOY_ENABLED == 'true'`. The user supplied `/home/u747717869/domains/angelcreations.in/public_html`, but it has not been checked against Hostinger; the read-only SSH preflight has not yet been run. The deploy job includes backup/rollback protections, but no staging target or verified production context is available.
- No Hostinger file, DNS record, production setting, credential, or deployment artifact was changed. The branch is **not deployed**, and no production revision/workflow run is claimed.
- `fetch_page` parsed the homepage. The 12 inner-route fetches listed above reported HTTP 500 but exposed no diagnostic response. Separate repository production QA also records outbound TLS as blocked. Production status, assets, redirects, response MIME/cache/security headers, current served revision, and actual missing-media root cause are **UNVERIFIED**.

## Remaining blockers and follow-up (ranked)

1. **P0 — Production verification/deployment:** from an authorized network and Hostinger context, fetch all routes/assets and inspect the actual response body/status/headers, identify the live document root and serving product, stage the verified `dist/` artifact, back up the current site, deploy through the protected workflow, and verify/record the production revision and rollback path.
2. **P1 — Browser QA:** provide a browser-capable runner (Chromium requires its missing system libraries) to exercise all routes, delayed/failing chunk cases, forms, image decoding, keyboard/touch, reduced motion, and the requested responsive viewport matrix; save screenshots and console/network captures.
3. **P1 — Lab performance:** run Lighthouse or equivalent on constrained mobile and desktop against the staging deployment. Use field data for Core Web Vitals only when real-user telemetry becomes available.
4. **P2 — Host-owned delivery:** after confirming Hostinger product and existing config, validate direct-route fallback, true 404/410 status, content-type, cache policy, compression, and security headers without overwriting unrelated files.
5. **P2 — Remote media:** verify the historic remote MOV endpoint and consider a source-authorized, smaller poster/stream strategy if production checks confirm it affects initial rendering.

## Follow-up — October 20, 2026

- Re-requested all 12 inner routes through the available page-fetch service. It again reported HTTP 500 for each route; the homepage parsed successfully. Because the sandbox cannot make independent outbound requests to the production host and the fetch service exposes no response headers/body, this remains **inspection-service evidence**, not independent proof of Hostinger/origin failure.
- The user supplied `/home/u747717869/domains/angelcreations.in/public_html` as the production document root. This value has **not** been checked against the Hostinger account/server. No SSH preflight or production write has been performed.
- Updated `.github/workflows/verify-production-build.yml` so pushes to `arena/**` run non-deploying verification, `npm audit` checks both full and production dependency trees, and CI starts the built Vite preview and runs static-output plus end-to-end route/asset audits before artifact upload. The production deploy condition remains restricted to `main` plus `HOSTINGER_DEPLOY_ENABLED == 'true'`; its backup/rollback safeguards are unchanged.
- Locally replayed the workflow route/asset preflight and both preview audits after the changes; all passed. This includes 21 unique visible pre-hydration headings, 305 local assets with matching recognized MIME types, and zero link/status/SEO failures. The workflow YAML parser accepted the updated file. A GitHub Actions run for this revision is still **pending** until its commit is pushed.
