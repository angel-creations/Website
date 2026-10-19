# Angel 2.0 Enhancement Log

This log records implementation work against the preservation audit. It is deliberately incremental: an enhancement is not marked complete merely because it builds.

## 2026-10-05 — Baseline and first implementation pass

### Preserved before change

- Restored original React/Vite Angel application, source structure, captured legacy page data, original full-screen 7-slide homepage, menu model, and authentic public asset tree.
- Preserved the former redesign separately at `.godmode-redesign-recovery-2026-10-05/`; it is not used by the active app.
- Documented the original composition, motion, palette, typography, and responsive risks in `CURRENT-DESIGN.md`, `ENHANCEMENT-PLAN.md`, and `DESIGN-TOKENS.md` before visual/interaction changes.

### Implemented

1. **Home slide presentation — enhanced, not replaced**
   - Retained the same seven capability slides, original sequence, low-left captions, number system, Prev/Next form, source width reveal, and counter-moving media choreography.
   - Added poster-first authentic frames for the six locally captured source films, plus the authentic menu film. Posters are generated from those exact local source videos and stored under `public/legacy-assets/images/generated-home-posters/`.
   - Preserved the historic remote Media Production video source. It has an honest black fallback if unavailable rather than a fabricated replacement image.
   - Linked every slide to its corresponding captured Angel route where that route exists: Metaverse, Mixed Reality, Virtual Reality, Augment Reality, Animation, Brand Advertisement, and Media Production.
   - Added touch swipe, ArrowLeft/ArrowRight control within the focused stage, live slide status, accessible control names, queued interruption intent, tab-focusable stage, adjacent metadata preload, inactive-video pausing, document-visibility pause/resume, and reduced-motion poster/static behaviour.

2. **Navigation overlay — same visual language, sounder semantics**
   - Retained the source logo bar, small Metaverse/360 links, vertical Menu control, dark video-backed overlay, primary navigation labels, and source footer links.
   - Added `aria-controls`, modal dialog semantics, focus containment, Escape closure, trigger focus return, inert closed navigation, body scroll locking, focus styles, pointer-safe cursor treatment, and menu-video playback only while open (unless reduced motion is requested).
   - Removed invisible duplicate primary links from the interactive focus order while preserving the source-visible list treatment.

3. **Qualified project enquiry — same sequential interaction**
   - Retained the source’s one-question-at-a-time dark form rhythm and arrow controls.
   - Replaced the generic eight-field simulation with the required qualified fields: Name, Company, Email, Phone, Country, Project type, Project description, Timeline, Investment range, and How they found Angel.
   - Project type uses exactly: Brand, Design, Content, Film, Animation + 3D, Digital, Event / Experience, Creative Technology, Something Else.
   - Added native input semantics/autocomplete, a select and textarea where appropriate, step announcement/focus management, field-specific validation and error association, 16px mobile-safe input sizing, and visible focus states.
   - Kept the user’s no-submission constraint: no fake success and no server endpoint. The final state honestly prepares a user-triggered `mailto:` draft using the existing captured business contact rather than claiming delivery.

4. **Source-qualified capability depth**
   - Added eight crawlable capability routes in the preserved Angel dark/numbered/rule-based language: Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, and Creative Technology.
   - Added a restrained source-capability index to the existing About experience rather than replacing navigation or introducing a services-grid homepage.
   - Every detailed page distinguishes source-qualified capability labels/application contexts from unverified outcomes, keeps related work attached to its original public metadata, includes related capabilities, a truthful insight state, qualified industry contexts only where present in the source, and a contextual project CTA.
   - The eight new routes are lazy-loaded in the interactive app and receive static no-JS fallback pages, unique metadata, canonical URLs, H1s, and sitemap entries.
   - Split the 816 KB captured legacy-page source data out of the initial homepage JavaScript. The built entry now ships at roughly 190 KB unminified before the legacy content chunk is requested after first paint; the authentic home stage remains immediately available.

5. **Works archive and static discoverability**
   - Restored the exact 47-record verified public video archive into the active source (`src/data/videoArchive.json`). Hash-verified against the preserved factual capture: 47 unique source URLs, exact title/description/URL fields, and 47 available thumbnail assets.
   - Added a lazy-loaded, source-led Works extension: an irregular stacked media/index sequence rather than a card grid. It exposes source category/duration/date/views/likes/status only where in the verified record and preserves source descriptions/tags in optional disclosures.
   - Added a post-build static-fallback generator. It creates 13 no-JavaScript documents for existing qualified core routes plus 8 source-qualified capability documents, a 22-URL sitemap, and robots file. The static Works fallback contains all 47 source records and watch URLs. It does not create industry/geographic doorway pages or invent claims.
   - Added a root `noscript` fallback and truthful captured home metadata/canonical seed. Route-level client metadata continues to use captured legacy records.

### Automated checks completed

- `npm run build` passes TypeScript and Vite build, then generates static fallbacks/sitemap/robots.
- Static document check: 13 generated core documents plus 8 capability documents each include title, canonical, robots meta, and H1; sitemap includes 22 qualified URLs.
- Video archive check: 47 preserved app records, 47 unique YouTube source URLs, 47 local thumbnail paths, 47 static Works archive entries.
- Source asset HTTP check through local Vite server: home, key direct routes, all accessed generated poster assets, and original active source video return HTTP 200.
- Slider destination data check: all seven slide destinations resolve to captured status-200 legacy routes.

### Manual/visual QA status

- Local Vite preview is running for browser inspection.
- Automated visual/browser interaction audit could not run in this sandbox because the available Chromium binary cannot start: its required system `libnspr4.so` is absent. This is an environment limitation, not treated as a passing visual test.
- Desktop, tablet, and phone visual review; keyboard/touch real-browser interaction; assistive-technology review; reduced-motion real-browser review; and full red-team review remain required before final completion.

### Phase 2 continuation

See `PHASE-2-FORENSIC-AUDIT.md`, `PHASE-2-IMPLEMENTATION-LOG.md`, and `PHASE-2-RED-TEAM.md` for the later forensic audit, static-route hydration correction, schema additions, motion/performance hardening, work-thumbnail WebP derivative pass, production-like checks, and explicitly qualified review status.

### Known scope still open

- Deeper capability content needs source-qualified expansion for Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, and Creative Technology without authored claims.
- Events/Experiences and product presentation need verified-content mapping before adding material.
- Static fallback selection intentionally excludes captured test/search/author/404 pages and does not create new industry or location pages.
- No hosting, DNS, production deployment, form endpoint, analytics, or Search Console changes have been made.

## 2026-10-19 — Motion, delivery, enquiry, and search hardening

### Implemented

- Added a shared reduced-motion/data-saver preference helper. The home slide films, About hero film, and menu background now pause or defer ambient playback when reduced motion/data is requested or the document is hidden; the About showreel is user-started. Static posters remain the low-bandwidth fallback.
- Prioritised the local home poster, lazy-loaded non-active home posters and later Works thumbnails, and removed unused Contact Form 7 / Elementor stylesheet links from the active app shell while retaining the archived assets.
- Made Company, Phone, Timeline, and Investment optional in the enquiry wizard, constrained free-text lengths, clarified step semantics, and added a permission-aware clipboard fallback. The form still prepares a user-controlled `mailto:` draft; it does not claim server delivery.
- Reworked route SEO metadata and canonical/social/schema updates. Static core and capability documents now use the same route-specific titles/descriptions as the app, local Open Graph/Twitter images where available, and a local home image sized accurately at 1280×720.
- Restored a compatibility fallback only for explicitly whitelisted public routes. Its source markup is stored as 13 per-route JSON files and fetched only if no dedicated route component handles a whitelisted route; unknown paths continue to render the 404 screen without downloading the legacy data.
- Extended the static-output audit to check decoded title/description lengths and route-fallback payload availability/route matching.

### Validation

- `npm run build` passed TypeScript, Vite, and static generation with no chunk-size warning. The app entry is 206.37 kB (63.50 kB gzip); the fallback renderer is 2.49 kB (1.29 kB gzip), with route data fetched on demand.
- `node scripts/auditStaticOutput.mjs` passed: 24 HTML documents, 22 sitemap URLs, and 13 route-fallback payloads; no HTTP, missing description, title/description length, H1, schema, or fallback-payload issues. `/work/` → `/works/` remains the documented alias exception.
- Generated route metadata matches `src/data/routeSeo.json`. Homepage poster preload and local social image metadata were checked; unused plugin stylesheet links and external Open Graph image URLs are absent from generated HTML.
- `npm audit --omit=dev`: zero vulnerabilities.
- Browser, mobile-device, keyboard/screen-reader, Core Web Vitals, and production-host checks remain unperformed because browser automation is unavailable here. No ranking or performance score is claimed.

## 2026-10-19 — Supplied Aurora theme integration

### Implemented

- Added locally bundled Playfair Display and Montserrat weights, with the supplied typography tokens and dark Aurora palette.
- Preserved page structure and layout while applying the requested Pearl surfaces to About/Legal story sections, route-specific accent gradients to the seven capability pages, and the Works archive accent.
- Added animated aurora lighting, card-edge accents, hover/tactile feedback, and focus-visible, reduced-motion, reduced-transparency, high-contrast, and print treatments from the supplied theme rules.
- Applied the Aurora palette and Montserrat typography to the existing spatial inner-page system; no page composition was replaced.

### Validation

- `npm run build` passed TypeScript, Vite, and static generation with no chunk-size warning. Emitted CSS is 172.85 kB (27.68 kB gzip); Montserrat and Playfair Display are emitted as local font assets.
- `node scripts/auditStaticOutput.mjs` passed: 24 HTML documents, 22 sitemap URLs, and 13 route-fallback payloads; the `/work/` → `/works/` canonical alias is the only documented exception.
- `npm audit --omit=dev` reported zero vulnerabilities; `git diff --check` passed.
- Real-browser/device visual review is still outstanding because Chromium cannot launch in this environment (`libnspr4.so` is unavailable).

## 2026-10-19 — Follow-up reliability and lead-path validation

### Implemented

- Kept SPA route matching pathname-only while preserving query strings and fragments in browser URLs. Internal-link interception now respects modifier/middle clicks; About, menu, footer, and slideshow links retain normal browser behavior.
- Connected both CTAs on each of the seven capability routes to the existing enquiry flow with a validated `discipline` prefill. The enquiry remains a user-controlled `mailto:` draft; no server endpoint, fake submission, or delivery claim was added.
- Completed the menu/media coordination work: background page regions become inert while the menu dialog is open, ambient media pauses for reduced motion/data, 3G, and hidden tabs, and playback resumes only when preferences allow.
- Added optimized WebP hero derivatives for four capability routes while retaining source-image fallbacks.
- Replaced the 360° page's missing WordPress `view.js` dependency with route-local Three.js/Panolens initialization and a responsive, accessible viewer stage. Its browser rendering and remote video playback still require real-browser QA.
- Made static-output audit issues machine-failing, expanded fallback and metadata checks, and refreshed the generated SEO report. The sole documented canonical alias remains `/work/` → `/works/`.

### Latest validation

- `npm run build` passed TypeScript, Vite, and static generation. The initial JS entry is 207.39 kB (63.76 kB gzip), with route-specific code split into chunks; emitted CSS is 173.23 kB (27.76 kB gzip).
- `node scripts/auditStaticOutput.mjs` passed against the local production preview: 24 HTML documents, 22 sitemap URLs, 13 fallback payloads, and no configured audit failures. The `/work/` alias remains explicitly recorded.
- A source-asset reference scan found 221 existing local references and no missing assets.
- Full `npm audit` reported zero vulnerabilities; `git diff --check` passed.

### Remaining QA limits

- Chromium still cannot launch because `libnspr4.so` is absent, so no browser/device/keyboard/screen-reader/visual or Core Web Vitals result is claimed. Production-host behavior remains unverified. The remote Media Production `.mov` resource's cross-browser codec/MIME behavior also remains open; no substitute media has been invented.

## 2026-10-19 — Public sitemap and 360° viewer removal

### Implemented

- Added a tracked `public/sitemap.xml` generated from the same route records as the production build, plus `public/robots.txt` with a sitemap declaration. The build keeps the public and deployed copies synchronized.
- Removed the standalone `/360-video/` panorama viewer from route loading, SEO metadata, static fallbacks, and the sitemap. Requests to `/360-video` and `/360-video/` now return HTTP 404 in the local preview. The captured legacy source/assets remain archived; other relevant 360° service descriptions were not removed.
- Extended the static audit to verify that the public sitemap matches the build output, `/sitemap.xml` and `/robots.txt` are served, and the retired route is absent.

### Validation

- `npm run build` passed (69 modules); initial JS entry is 206.88 kB (63.64 kB gzip), emitted CSS is 172.50 kB (27.60 kB gzip).
- `node scripts/auditStaticOutput.mjs` passed: 23 HTML documents, 21 sitemap URLs, and 12 fallback payloads. Sitemap and robots endpoints return HTTP 200; the removed viewer route is not listed.
- Direct preview checks confirmed `/360-video` and `/360-video/` both return HTTP 404. Full `npm audit` found zero vulnerabilities; `git diff --check` passed.

## 2026-10-19 — Custom not-found experience

### Implemented

- Replaced the basic 404 text state with a bespoke Aurora-themed orbit scene, clear requested-path display, and direct Home, Works, and Contact recovery links.
- Applied the same visual system to the generated no-JavaScript `404.html`; kept the page responsive, keyboard-focus visible, and static when reduced motion is requested.
- Added a static-output audit check for the error page’s visual structure and recovery links. Healthy routes and their layouts are unchanged.

### Validation

- `npm run build` passed with 69 modules; the initial app entry remains 206.88 kB (63.64 kB gzip), the 404 chunk is 2.31 kB (0.77 kB gzip), and CSS is 179.57 kB (29.38 kB gzip).
- `node scripts/auditStaticOutput.mjs` passed, including the 404 structure check, sitemap/robots delivery, and 360° route retirement checks.
- Full `npm audit` found zero vulnerabilities; `git diff --check` passed. Visual browser QA remains unavailable because Chromium cannot launch in this environment.

## 2026-10-19 — Comprehensive route, link, asset, and error audit

### Implemented

- Added local preview handling for unknown paths and the intentionally retired `/360-video/` route. The local server serves the branded no-JavaScript error document while preserving HTTP 404 or 410; unknown routes are not redirected to Home.
- Added explicit response-title and branded error-body marker checks to the end-to-end audit. Regenerated the URL inventory and human-readable report from the updated preview.
- Completed active route, static-anchor, internal-target, local-asset, route-specific social-preview, external-link, contact-protocol, remote-media, target-blank security, and error-status inventories. The report keeps production, remote destination, browser, and host-mapping limitations explicit.
- Recorded deployment/rollback guidance without applying host-specific production error configuration.

### Latest validation

- `npm run build` passed after the local 404/410 middleware change.
- `node scripts/auditStaticOutput.mjs` passed: 29 generated documents, 21 sitemap routes, 12 legacy fallbacks, no audit failures.
- `node --check scripts/auditEndToEnd.mjs` passed. The local end-to-end audit passed: 21/21 sitemap routes; 293 static anchors; 21/21 unique internal targets; 0 broken links; 305 local asset references with 0 missing; 21 unique social previews with 0 metadata issues; 53 external web targets and 4 contact protocol targets inventoried; 0 local status or branded error-body issues.
- Unknown route returned HTTP 404 with its branded page title/body marker; `/360-video/` and `/360-video` returned HTTP 410 with the matching branded title/body marker. `/about` returned HTTP 301 to `/about/`.
- `git diff --check` passed.

### Remaining QA limits

- Production curl failed with exit 35 (`OpenSSL SSL_ERROR_SYSCALL`); production/CDN/Hostinger status behavior and external destination availability remain unverified.
- Chromium cannot launch because `libnspr4.so` is unavailable. No visual, device, keyboard/touch, screen-reader, browser history, or enquiry-client test is claimed.
- The generated 403/404/410/500/502/503/504 documents still require host-specific mapping to return those HTTP statuses in production. No production hosting configuration was applied.
- The remote 310 MB QuickTime media was not re-fetched; its recorded status/MIME evidence is historical only.

## 2026-10-19 — Final production QA and deployment verification

### Production diagnostics

- DNS resolution for `angelcreations.in` and `www.angelcreations.in` succeeded, with differing IPv4/IPv6 answer sets across resolver calls. This was not an authoritative DNS audit.
- Repeated HTTPS and direct TLS probes failed in this sandbox with curl exit 35 / `SSL_ERROR_SYSCALL` after the TLS ClientHello; OpenSSL received an unexpected EOF and no server certificate. Curl TLS to `github.com` returned 200 with certificate verification enabled; this does not establish production TLS.
- The sandbox’s outbound network policy blocks requests to the production hostname. The observed failure therefore establishes that production testing is blocked here; it does **not** establish a live origin/CDN/TLS defect. Certificate validity, redirects, live headers/statuses, and the currently deployed output remain unverified.
- The production QA JSON records 50 Angel-domain targets, 53 external web URLs, and four contact protocol targets. Only the root HTTPS transport was attempted; the other production URLs were not individually requested. No external link is classified as broken.
- Hostinger’s current product/document root/rewrite rules could not be inspected. No production configuration or file was changed. The generated static 404/410 documents are not proof that Hostinger returns those statuses.
- Browser QA remains blocked: no Chromium/Chrome/Firefox or Playwright/Puppeteer package was found, and `libnspr4.so` is absent. No screenshots or interaction results are claimed.

### Repository/CI discrepancy corrected

- Replaying the existing production-build workflow’s route check found it still required a generated `/360-video/` document, although that route is intentionally retired. This was the sole missing route.
- Updated `.github/workflows/verify-production-build.yml` to remove that retired-route requirement and assert that generated 404/410 documents exist and the retired URL is absent from the sitemap. The equivalent local route/document/sitemap/assets check now passes. The remote Actions workflow itself was not rerun because this branch’s change is uncommitted.
- GitHub `main` was at `4a441179dbaddeb688cbd002e4936c75b479a960` during the audit. The listed **Verify production build** workflow builds and uploads an artifact but has no deployment step. The current local changes were not deployed and live build comparison is inconclusive.

### Revalidation

- `npm run build` passed (70 modules).
- `node scripts/auditStaticOutput.mjs` passed: 29 documents, 21 sitemap routes, 12 fallbacks, no failures.
- `node --check scripts/auditEndToEnd.mjs` and the local E2E audit passed: 21/21 routes, 293 static anchors, 21/21 unique internal targets, 305 assets with none missing, 21 unique social previews with no metadata issues, and no local status/body-marker issues.
- `npm audit` and `npm audit --omit=dev` each reported zero vulnerabilities; `git diff --check` passed.
- Full findings and explicit `Passed` / `Failed` / `Inconclusive` / `Blocked` labels are in `docs/audits/PRODUCTION-QA-2026-10-19.md` and the companion JSON matrix.
