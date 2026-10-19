# Local Validation

**Validation date:** 2026-10-05 (local-only)

## Commands run

```bash
npm install
npm run build
npm audit --json
npm run preview -- --port 4173
```

## Results

| Check | Result |
|---|---|
| TypeScript build | Passed (`tsc -b`) |
| Vite production build | Passed (Vite 6.4.3) |
| Production dependency audit | 0 vulnerabilities |
| Full dependency audit | 0 vulnerabilities |
| Preview server | Started on `0.0.0.0:4173` and accepts the sandbox preview host |
| Direct HTML route checks | 55/55 React route records returned HTTP 200 and the React root |
| Archived asset checks | 113/113 inventoried downloaded asset URLs returned HTTP 200 |
| CSS font-compatibility mirror | 4/4 representative legacy relative font paths returned HTTP 200 |
| Feed source documents | Preserved under `docs/live-html/feed/` and `docs/live-html/comments/feed/`; not rendered as SPA pages |

## Route-test scope

The direct route test covered every captured `text/html` source record: all content pages, search/pagination paths, work entries, alias paths, captured linked legacy `.html`/work paths that currently produce an HTTP 404 template, taxonomy-like literal-space paths, and the intentional live 404 test route.

## Runtime/visual limitation

This workspace did not contain a browser binary or browser automation runtime. Therefore console output, click-through visual interaction, original-vs-local screenshots, and pixel comparison were **not** claimed as browser-verified. The local production server was tested at HTTP level only. The exact screenshot follow-up matrix is in [`baseline/README.md`](./baseline/README.md).

## Build observation retained, not optimised

Vite emitted a chunk-size advisory because the React bundle embeds typed representations of the captured page content. It is a non-fatal build warning. No code-splitting/content optimisation was applied in this preservation phase.

## 2026-10-19 follow-up validation

### Commands run

```bash
npm run build
node scripts/auditStaticOutput.mjs
npm audit --omit=dev
```

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; no chunk-size warning |
| Initial app JS | 206.37 kB (63.50 kB gzip) |
| Route fallback renderer | 2.49 kB (1.29 kB gzip); fetched route JSON is separate and on-demand |
| Generated HTML | 24 documents; all audited route requests returned HTTP 200 through the local production preview |
| Static SEO | 22 sitemap URLs; no missing descriptions, title/description length issues, H1 issues, schema issues, or sitemap orphans |
| Route fallback payloads | 13 JSON payloads; all parse, match a public route, and return HTTP 200 |
| Canonical alias | `/work/` correctly canonicalizes to `/works/` |
| Homepage image optimization | Local metaverse poster preload and 1280×720 JPEG Open Graph/Twitter image verified |
| Active stylesheet payload | Contact Form 7 / Elementor plugin stylesheets absent from generated route HTML |
| External social image URLs | None in generated route HTML |
| Production dependency audit | 0 vulnerabilities |
| Git whitespace check | Passed after cleanup |

### Remaining QA limits

No browser, real-device, screen-reader, Core Web Vitals, or production-host QA was run. The previously recorded Chromium launch failure (`libnspr4.so` unavailable) remains the reason; HTTP/static generation checks are not a substitute for those tests.

## 2026-10-19 Aurora theme integration

### Commands run

```bash
npm run build
node scripts/auditStaticOutput.mjs
npm audit --omit=dev
git diff --check
```

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; no chunk-size warning |
| Theme CSS | 172.85 kB (27.68 kB gzip) |
| Typography assets | Playfair Display and Montserrat weights bundled locally |
| Static HTML / SEO audit | Passed: 24 documents, 22 sitemap URLs, 13 fallback payloads; only the documented `/work/` → `/works/` alias exception |
| Production dependency audit | 0 vulnerabilities |
| Git whitespace check | Passed |

The Aurora pass updates colors, typography, gradients, and motion treatments without changing page structure or layout. Real-browser, device, keyboard/screen-reader, reduced-motion, and production-host QA remain unperformed because Chromium cannot start in this environment (`libnspr4.so` unavailable).

## 2026-10-19 reliability follow-up

### Commands and checks run

```bash
npm run build
node scripts/auditStaticOutput.mjs
npm audit
git diff --check
```

A separate static-reference scan checked source/public asset paths.

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; 70 modules transformed; no chunk-size warning |
| Initial JS entry | 207.39 kB (63.76 kB gzip) |
| Emitted CSS | 173.23 kB (27.76 kB gzip) |
| Static output / SEO audit | Passed against local production preview: 24 HTML documents, 22 sitemap URLs, 13 route-fallback payloads; no configured audit failures |
| Canonical alias | `/work/` → `/works/` intentionally canonicalizes to `/works/` |
| Local asset references | 221 existing references checked; zero missing |
| Full dependency audit | 0 vulnerabilities |
| Git whitespace check | Passed |

The updated route matching preserves query and fragment strings, capability CTAs prefill the existing enquiry wizard, and ambient media honors reduced-motion/data preferences. The removed 360° page had not been visually verified; Chromium remains unable to launch here (`libnspr4.so` unavailable). Desktop/mobile, keyboard/screen-reader, Core Web Vitals, and production-host checks remain open. The remote Media Production `.mov` codec/MIME behavior is also not verified.

## 2026-10-19 sitemap and retired viewer

### Commands and checks run

```bash
npm run build
node scripts/auditStaticOutput.mjs
npm audit
git diff --check
```

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; 69 modules transformed, no chunk-size warning |
| Initial JS entry | 206.88 kB (63.64 kB gzip) |
| Emitted CSS | 172.50 kB (27.60 kB gzip) |
| Public sitemap source | `public/sitemap.xml` is generated alongside the deployed `dist/sitemap.xml` |
| Robots discovery | `public/robots.txt` and `/robots.txt` point to `https://angelcreations.in/sitemap.xml` |
| Static audit | Passed: 23 HTML documents, 21 sitemap URLs, 12 fallback payloads; sitemap and robots are served with HTTP 200 |
| Removed viewer route | `/360-video` and `/360-video/` return HTTP 404 and are absent from the sitemap |
| Full dependency audit | 0 vulnerabilities |
| Git whitespace check | Passed |

Archived source records and other 360° service references remain; only the standalone interactive panorama page was removed.

## 2026-10-19 custom 404 design

### Commands run

```bash
npm run build
node scripts/auditStaticOutput.mjs
npm audit
git diff --check
```

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; 69 modules transformed, no chunk-size warning |
| Initial JS entry | 206.88 kB (63.64 kB gzip) |
| 404 route chunk | 2.31 kB (0.77 kB gzip) |
| Emitted CSS | 179.57 kB (29.38 kB gzip) |
| Static 404 document | Custom no-JavaScript design includes recovery links; audit passed |
| Static SEO/delivery audit | Passed: 23 HTML documents, 21 sitemap URLs, 12 fallback payloads; `/sitemap.xml` and `/robots.txt` return HTTP 200 |
| Full dependency audit | 0 vulnerabilities |
| Git whitespace check | Passed |

The React 404 uses the same responsive visual system and displays the attempted path. The orbital motion stops under `prefers-reduced-motion`. Browser screenshot/visual QA remains unavailable because Chromium cannot launch here (`libnspr4.so` unavailable).

## 2026-10-19 comprehensive local end-to-end audit

### Commands and checks run

```bash
npm run build
PREVIEW_BASE=http://127.0.0.1:4175 node scripts/auditStaticOutput.mjs
node --check scripts/auditEndToEnd.mjs
PREVIEW_BASE=http://127.0.0.1:4175 node scripts/auditEndToEnd.mjs
git diff --check
```

### Results

| Check | Result |
|---|---|
| TypeScript + Vite + static generation | Passed; generated output contains 29 documents, 21 sitemap routes, and 12 legacy fallback documents |
| Static output audit | Passed; sitemap/robots delivery, route metadata, error documents, and fallback checks reported no failures |
| Sitemap routes | 21/21 returned HTTP 200 in the local preview |
| Static links | 293 anchor instances; 21 unique internal targets tested; 0 broken targets or empty hrefs |
| Local assets | 305 references checked; 0 missing or unserved |
| SEO/social previews | 21 unique page-specific social images; 0 metadata issues |
| Local status behavior | Unknown route returned branded HTTP 404; retired `/360-video/` route returned branded HTTP 410; both titles and expected body markers matched. `/about` returned 301 to `/about/`. |
| External/contact targets | 53 web URLs across 5 hosts and 4 `mailto:`/`tel:` targets inventoried; remote destination responses were not tested |
| Remote video | 1 QuickTime URL inventoried; MIME evidence is historical only and was not re-fetched |
| Audit script | `node --check` passed; status and branded error-body assertions passed |
| Whitespace | `git diff --check` passed |

Full URL, asset, route, error-status, and social-preview details are in [`audits/END-TO-END-AUDIT.md`](./audits/END-TO-END-AUDIT.md) and [`audits/END-TO-END-LINK-INVENTORY.json`](./audits/END-TO-END-LINK-INVENTORY.json).

### Still unverified

A production HTTPS request failed with curl exit 35 (`OpenSSL SSL_ERROR_SYSCALL`), so live production/CDN/Hostinger routing and error-status mappings remain unknown. Chromium cannot start because `libnspr4.so` is unavailable; visual, responsive, keyboard/touch, screen-reader, Back/Forward, and form-client behavior were not browser-tested. Static HTML error documents do not prove a host returns their corresponding HTTP statuses. The existing enquiry flow remains a user-controlled `mailto:` draft; no server submission is claimed.

## 2026-10-19 final production QA and deployment verification

See [`audits/PRODUCTION-QA-2026-10-19.md`](./audits/PRODUCTION-QA-2026-10-19.md) for the status-labeled report and [`audits/PRODUCTION-QA-2026-10-19.json`](./audits/PRODUCTION-QA-2026-10-19.json) for every production target with request status, final URL, content type, and error fields.

### Results and status

| Check | Status | Finding |
|---|---|---|
| DNS resolution | **Passed** | IPv4/IPv6 addresses were returned for `angelcreations.in` and `www.angelcreations.in`; observed records varied between resolver calls. No authoritative DNS diagnosis was possible. |
| Production HTTPS | **Blocked** | Reproducible curl exit 35 / `SSL_ERROR_SYSCALL` after TLS ClientHello; no peer certificate or HTTP response. The host is not reachable under the sandbox's outbound network restrictions. This establishes an environment access block, not a production-origin defect. |
| TLS trust control | **Passed** | `https://github.com/` returned 200 with curl certificate verification result 0. This does not validate the production host. |
| Production certificate/redirect attribution | **Inconclusive** | No certificate or HTTP `Location` header was received; CDN/origin/TLS configuration remains undiagnosed. |
| Production routes, internal targets, sitemap/robots, OG images, 404/410 | **Blocked** | 50 production targets are recorded. Only the root TLS transport was attempted; no production HTTP responses were received. The other targets were not individually requested and have null status/final URL/content type. |
| External destinations | **Blocked** | 53 URLs across five hosts were inventoried but not requested; none is labelled broken. Login, bot-protection, rate-limit, and availability results remain unknown. |
| Contact protocol links | **Blocked** | Four `mailto:`/`tel:` targets are present in source; no browser or external handler could be launched. |
| Production remote video | **Blocked** | Not re-fetched; recorded QuickTime status/type is historical only. |
| Hostinger production errors/configuration | **Blocked** | Unknown-path 404, retired-route 410, visible body, hosting plan, document root, and rewrite settings could not be inspected. No production rule was applied or recommended. |
| Browser and interaction QA | **Blocked** | No browser binary or automation package is installed; `libnspr4.so` is absent. No visual screenshot or interaction result is claimed. |
| Live deployed-build comparison | **Inconclusive** | GitHub `main` SHA and latest successful build artifact are recorded in the JSON report, but the only workflow builds/uploads an artifact; it does not deploy. Local session changes are uncommitted, and live output could not be fetched. |
| Local production build | **Passed** | `npm run build` completed; 70 modules transformed. |
| Local static and end-to-end audits | **Passed** | Static: 29 documents, 21 sitemap routes, 12 fallbacks, no failures. E2E: 21/21 routes, 293 anchors, 21/21 internal targets, 305 assets, 21 unique previews, no local issues. |
| Dependency audits | **Passed** | `npm audit`: 0 vulnerabilities; `npm audit --omit=dev`: 0 vulnerabilities. |
| Updated CI route check | **Passed locally** | Removed a stale `/360-video/` generated-route requirement and now check generated 404/410 files plus sitemap exclusion. Equivalent local checks pass; the GitHub Actions run itself is not available for this uncommitted branch. |
| `git diff --check` | **Passed** | No whitespace errors. |

No production files, DNS records, Hostinger settings, or deployment artifacts were overwritten. Do not interpret the local preview as proof of production behavior. Production verification requires an approved egress path and an operator with Hostinger access; browser QA requires a compatible browser environment.
