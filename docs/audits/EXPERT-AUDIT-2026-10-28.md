# Angel Creations — Full Expert Website Audit

**Date:** 28 October 2026  
**Branch:** `arena/7cdd060f-website`  
**Status:** Passed audit; ready for stakeholder review. Nothing was committed or pushed.

## Executive verdict

The website passed the full multi-expert audit with **no blocking functional, responsive, SEO, accessibility, content, security-dependency, or build defects remaining**.

One genuine production-content defect was found and fixed during the audit: the `/domains/` social-sharing image contained a watermark. It was replaced with a clean screenshot of the actual branded `/domains/` page at 1200×630. The capture was then polished again to remove the page's floating scroll-to-top control from the social artwork.

The remaining recommendations are optimization and hardening opportunities—not release blockers:

1. Re-encode the largest videos and oversized photographic images.
2. Add production security-response headers through a staged server/CDN rollout.
3. Add genuinely relevant case-study evidence to the 12 domain pages that currently have no precise related-work match.
4. Plan major framework/tooling upgrades separately; the current dependency set has zero known npm vulnerabilities.
5. Continue monitoring small inline-link target sizes against WCAG target-size guidance.

## Audit scope

The rendered crawl covered **85 canonical site routes**:

| Route group | Count |
| --- | ---: |
| Homepage | 1 |
| Core and legal pages | 5 |
| Parent experience pages | 7 |
| Capability detail pages | 8 |
| `/domains/` directory | 1 |
| Dedicated domain detail pages | 63 |
| **Total** | **85** |

The 63 domain pages are distributed as follows:

- Metaverse: 9
- Mixed Reality: 9
- Virtual Reality: 9
- Augmented Reality: 10
- Animation: 10
- Brand Advertisement: 6
- Media Production: 10

The production build generated **85 route documents** and **93 HTML files**, including compatibility/status documents.

Also covered:

- Desktop and mobile rendering for every route.
- Homepage restoration and logo-click slideshow restart.
- Header labels and non-home immersive behaviour.
- Seven parent experience pages and their hero calls to action.
- Whole-card domain navigation from all seven parent pages.
- Domain directory search and experience filtering.
- All 63 dedicated domain inner pages.
- Contact form structure and labels.
- Keyboard-focus visibility and domain blueprint tabs.
- Reduced-motion behaviour.
- Static/no-JavaScript and degraded-boot behaviour.
- Sitemap, robots, canonicals, metadata, structured data, social metadata, internal links, local assets, and route status behaviour.
- Dependency vulnerabilities and outdated packages.
- Source hygiene, placeholders, debug logging, insecure URL patterns, and whitespace errors.
- Production bundle and media-weight analysis.

## Expert panel results

| Expert lens | Result | Summary |
| --- | --- | --- |
| UX / UI | **Pass** | Complete journeys from parent cards to domain pages; directory search/filter works; restored homepage and current hero treatments preserved. |
| Responsive design | **Pass** | All 85 routes passed desktop and mobile rendering with no horizontal overflow. |
| Accessibility | **Pass with minor watch items** | Names, labels, heading structure, focus visibility, tab state, and reduced motion passed. A small number of inline/breadcrumb links are shorter than 24 px and remain a minor watch item. |
| SEO | **Pass** | Unique titles/descriptions, valid canonicals, valid structured data, complete sitemap, and zero broken internal targets or missing local assets. |
| Content | **Pass** | Domain pages contain substantial unique visible copy and metadata. Twelve pages intentionally show no weakly related work rather than misleading matches. |
| Performance | **Pass with optimisation opportunities** | Code bundles are reasonable when compressed; the largest risk is media weight, especially two large MP4 files and nine oversized domain visuals. |
| Security | **Pass with hardening recommendation** | Zero npm vulnerabilities; no unsafe blank-target links, insecure HTTP targets, remote media type issues, or exposed-status issues in the audit. Security headers should be added at the production edge in stages. |
| Code quality | **Pass** | TypeScript and the full production build pass; no TODO/FIXME/XXX/HACK markers; only one intentional runtime `console.error` in the application error boundary; `git diff --check` is clean. |
| QA / release confidence | **Pass** | Production build, full rendered crawl, dedicated domain suite, official SEO/end-to-end audits, smoke suites, static-host suite, fallback suite, and degraded-boot suite all pass. |

## Defect found and fixed

### Watermarked `/domains/` social image

**Before:** `public/media/social/og/domains.jpg` was a 1200×630 image containing a visible watermark and did not accurately represent the final branded page.

**Fix:**

- Captured the real `/domains/` page from the current site.
- Produced a clean 1200×630 JPEG showing Angel Creations branding and “Every domain. Every world we can build.”
- Recaptured it with the floating scroll-to-top button hidden so the social artwork contains no accidental interface control.
- Final file size: **60,870 bytes**.
- Rebuilt production and confirmed the same file was copied into `dist/media/social/og/domains.jpg`.
- Reran the official static SEO and end-to-end audits after the final capture; both passed with zero social-metadata issues.

## Detailed findings

### 1. UX and interaction

- All **63 linked domain entries** on the seven parent pages use a single whole-card anchor.
- Clicking anywhere on a domain card opens the correct dedicated inner page.
- No separate “View Domain Page” button remains inside the cards.
- Dedicated domain pages do **not** show the removed sticky `.angel-domain__local-nav` section bar.
- Parent pages retain their separate approved section-jump navigation.
- `/domains/` search for “healthcare” returned **2** domain cards.
- `/domains/` Animation filtering returned **10** domain cards.
- Domain blueprint tabs changed the active tab correctly and exposed the correct `aria-selected` state.

### 2. Responsive design and rendering

- **85 routes × desktop and mobile** completed with:
  - 0 bad response statuses
  - 0 page errors
  - 0 failed requests
  - 0 horizontal-overflow failures
  - 0 duplicate IDs
  - 0 broken loaded images
- Representative full-page and mobile screenshots were visually inspected.
- Domain pages maintain readable hierarchy, clear breadcrumbs, large touch-friendly primary actions, and contained media on mobile.

### 3. Homepage and slider-page regression checks

- The restored homepage presentation remains intact.
- The enlarged logo and logo-click slideshow restart still work.
- Header-label verification passed.
- The non-home immersive/world-class regression suite passed.
- All seven slider inner-page hero CTAs use **3–4 words**:
  - “Let’s Build a World”
  - “Create Mixed Reality”
  - “Create Virtual Reality”
  - “Create Augmented Reality”
  - “Make Something Move”
  - “Launch Your Campaign”
  - “Start Your Production”
- Hero button text computes to **13.12 px** (`0.82rem`). Button heights remain approximately **48 px on desktop** and **54 px on mobile**.

### 4. Accessibility

Verified strengths:

- Exactly one H1 per rendered route in the whole-site crawl.
- No heading-order issues were reported.
- No missing image alt text was found.
- No unnamed interactive controls were found.
- The contact form exposes an accessible name for both the honeypot and the visible name field.
- Keyboard focus reached the sampled Copy button with a visible `2px solid rgba(125, 211, 252, 0.95)` outline.
- Domain tabs exposed one active tab with `aria-selected="true"` and inactive tabs with `aria-selected="false"`.
- With reduced motion enabled, sampled animation and transition durations reduced to `1e-05s`.

Minor watch items:

- Breadcrumb and some prose/contact links are 16–22 px high. These are inline text links and should be reviewed against the WCAG 2.5.8 inline exception and spacing context rather than treated automatically as standalone-control failures.
- One vertical range control reports a 4 px width and 70 px height; verify the draggable thumb itself remains comfortable on touch hardware during a future device-lab pass.
- Domain tabs are all included in the tab order. They are keyboard reachable, but a future refinement could adopt a roving-tabindex pattern.

### 5. SEO and discoverability

- Titles: **29–65 characters**, all unique.
- Meta descriptions: **118–158 characters**, all unique.
- Canonical coverage passed for all routes.
- The only canonical alias exception is intentional: `/work/` canonicalises to `https://angelcreations.in/works/`.
- Structured data parsed successfully with no invalid schema reported.
- Every route has a unique social image according to the end-to-end inventory.
- `sitemap.xml` and `robots.txt` returned HTTP 200, and robots references the sitemap.
- The removed 360 route is absent from the sitemap and returns 404 in preview probing.
- A non-existent route returns 404 in preview probing; Apache is configured with `ErrorDocument 404 /404.html`.

Official end-to-end inventory:

| Check | Result |
| --- | ---: |
| Sitemap routes responding correctly | 85 / 85 |
| Static anchor instances inventoried | 2,643 |
| Unique internal targets | 85 |
| Broken internal targets | 0 |
| Empty anchor hrefs | 0 |
| Local asset references | 303 |
| Missing/unserved local assets | 0 |
| Unique social images | 85 |
| Social metadata issues | 0 |
| External web targets inventoried | 53 across 5 hosts |
| Contact-protocol targets | 4 |
| Remote media assets | 0 |
| Status/security issues | 0 |

### 6. Content quality and domain depth

- Domain-page visible text length:
  - Minimum: **4,644 characters**
  - Median: **4,960 characters**
  - Maximum: **5,663 characters**
- Each dedicated domain page includes a dedicated visual/subtitle, contextual H1 where needed, unique metadata, Service and BreadcrumbList schema, at least two blueprint tabs, four FAQs, and three sibling-domain cards.
- Related-work distribution:
  - 26 pages: 3 related works
  - 11 pages: 2 related works
  - 14 pages: 1 related work
  - 12 pages: 0 related works

The 12 zero-match pages are:

- `/metaverse/virtual-worlds/`
- `/metaverse/virtual-events/`
- `/metaverse/virtual-brand-experiences/`
- `/metaverse/gaming/`
- `/metaverse/virtual-marketplaces/`
- `/metaverse/virtual-economies/`
- `/metaverse/virtual-workspaces/`
- `/mixed-reality/training/`
- `/mixed-reality/entertainment/`
- `/mixed-reality/gaming/`
- `/mixed-reality/remote-collaboration/`
- `/mixed-reality/retail/`

This is preferable to showing inaccurate portfolio matches. The content recommendation is to add real case-study records for these areas when available, rather than loosening the matching rules.

### 7. Performance

Production bundle snapshot:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Main JavaScript | 291,832 bytes | 87,060 bytes |
| Main CSS | 368,315 bytes | 60,263 bytes |
| `DomainDetail` chunk | 12,709 bytes | 3,514 bytes |
| `DomainIndex` chunk | 4,336 bytes | 1,548 bytes |
| `SliderExperience` chunk | 21,465 bytes | 6,852 bytes |

Production output details:

- 499 files
- 60,995,927 bytes total
- 93 HTML documents, median 12,949 bytes each
- 16 JavaScript chunks, 582,937 raw bytes total
- Media dominates total output weight:
  - MP4: 28,914,579 bytes
  - JPG/JPEG: 17,180,207 bytes
  - WebP: 4,520,306 bytes
  - PNG: 4,247,495 bytes

Largest files:

| File | Bytes |
| --- | ---: |
| `media/videos/Metaverse.mp4` | 11,902,866 |
| `media/videos/Augmented-Reality-Showroom.mp4` | 6,689,609 |
| `media/videos/Mixed-Reality.mp4` | 3,357,856 |
| `media/videos/Virtual-Reality.mp4` | 3,169,445 |
| `media/videos/Main-Background-with-sound.mp4` | 2,075,181 |
| `media/library/brand-advertisement/app-01-brand-campaigns.jpg` | 1,520,421 |
| `media/library/mixed-reality/map-03-interaction.png` | 1,369,102 |
| `media/library/media-production/app-02-film-production.jpg` | 1,087,686 |

Nine of the 63 domain visuals exceed 250 KB. The domain-visual library totals 9,054,336 bytes across 50 JPG, 10 WebP, and 3 PNG files.

Rendered local-lab measurements against the development preview:

- Desktop median transferred bytes per route: 1,597,743
- Mobile median transferred bytes per route: 1,223,961
- Median route resources: 65 on both desktop and mobile
- Heaviest rendered routes included `/`, `/about/`, `/mixed-reality/`, `/brand-advertisement/`, and `/domains/`

These figures were collected from a Vite development preview and should be used for relative route comparison—not as production Core Web Vitals field data.

Performance recommendations:

1. Produce smaller responsive MP4/WebM encodes and mobile-specific variants for the five videos above 2 MB.
2. Convert photo-like PNG assets to WebP/AVIF and add responsive image sizes for the largest JPG/PNG artwork.
3. Keep non-critical video loading deferred and provide strong poster frames.
4. Consider WOFF2-only delivery if legacy WOFF support is not required; the current dist contains both formats.
5. Run production Lighthouse and real-device checks after deployment, then monitor field Core Web Vitals.

### 8. Security and dependencies

- `npm audit` result:
  - Critical: 0
  - High: 0
  - Moderate: 0
  - Low: 0
  - Info: 0
  - **Total vulnerabilities: 0**
- Dependency inventory: 145 total dependencies reported by npm audit.
- End-to-end audit found:
  - 0 insecure HTTP targets
  - 0 unsafe `target="_blank"` links
  - 0 remote-media type issues
  - 0 status-probe issues
- The production Apache configuration:
  - disables directory indexes with `Options -Indexes`
  - blocks source, scripts, docs, Git, package, TypeScript, and Vite configuration paths
  - prevents stale HTML caching
  - applies long-lived immutable caching to build/static assets
  - enables DEFLATE for text-like formats

Security hardening recommendation:

- Add response headers at the production server or CDN edge in a staged rollout:
  - `Content-Security-Policy` (start in report-only mode because the site uses inline boot content and embedded media)
  - `Strict-Transport-Security` after confirming HTTPS/subdomain behaviour
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - A framing policy compatible with required previews/embeds
- Verify the final headers against the deployed host; local Vite responses are not representative of production Apache/CDN headers.

Outdated major versions are available for React, React DOM, React types, `@vitejs/plugin-react`, TypeScript, and Vite. They are not treated as defects because the installed/wanted versions are internally consistent and vulnerability-free. Major upgrades should be handled as a separate compatibility-tested change.

### 9. Code quality and maintainability

- `npm run build` passed, including TypeScript compilation and static-output verification.
- `git diff --check` is clean.
- No TODO/FIXME/XXX/HACK markers were found in runtime source, scripts, `index.html`, or `vite.config.ts`.
- Runtime source contains one `console.error`, located in `ApplicationErrorBoundary`, where error logging is intentional.
- The obsolete inspect-only domain-card verifier was excluded from sign-off; current whole-card and dedicated-domain verifiers were used instead.

## Verification log

| Verification | Result |
| --- | --- |
| `npm run build` | **Passed** — 85 route documents, 93 HTML files |
| Whole-site rendered audit | **Passed** — 85 routes on desktop and mobile |
| Dedicated domain verifier | **Passed** — all 63 domain pages plus directory |
| Domain-card link verifier | **Passed** — all parents, desktop/mobile navigation, no floating local nav |
| Hero-button verifier | **Passed** — 7 routes, desktop/mobile, 3–4-word labels and 13.12 px text |
| Homepage restore verifier | **Passed** |
| Header-label verifier | **Passed** |
| World-class / immersive verifier | **Passed** |
| Accessibility spot-check | **Passed with minor watch items** |
| Official static SEO audit | **Passed** — 93 documents, 85 sitemap routes, all failure lists empty |
| Official end-to-end audit | **Passed** — 85/85 routes, 0 broken internal targets/assets/social issues |
| `npm run test:smoke` | **Passed** — 46/46 |
| `npm run test:static` | **Passed** — 46/46 |
| `npm run test:fallback` | **Passed** |
| `npm run test:degraded` | **Passed** — six routes with JavaScript assets forced to 404 |
| `npm audit` | **Passed** — 0 vulnerabilities |
| `git diff --check` | **Passed** |

## Supporting evidence

Generated or refreshed audit evidence includes:

- `docs/PHASE-3-SEO-REPORT.json`
- `docs/audits/END-TO-END-AUDIT.md`
- `docs/audits/END-TO-END-LINK-INVENTORY.json`
- `.playwright-artifacts/whole-site/audit.json`
- `.playwright-artifacts/domains/audit.json`
- `.playwright-artifacts/expert-audit/metrics.json`
- `.playwright-artifacts/expert-audit/accessibility-spotcheck.json`
- `.playwright-artifacts/expert-audit/npm-audit.json`
- `.playwright-artifacts/expert-audit/npm-outdated.json`
- Representative screenshots under `.playwright-artifacts/domains/` and `.playwright-artifacts/hero-buttons/`

## Prioritised next actions

### Priority 1 — Performance media pass

Re-encode the largest videos and convert/resize the nine oversized domain images, then rerun the domain verifier and rendered whole-site audit.

### Priority 2 — Production security headers

Introduce CSP in report-only mode, correct any legitimate violations, then enforce it with HSTS and the lower-risk browser headers at the deployed edge.

### Priority 3 — Evidence depth for sparse domains

Add accurate portfolio records for the 12 domain pages without a precise related-work match. Do not broaden matching merely to fill the UI.

### Priority 4 — Planned dependency modernisation

Upgrade Vite, React, the React plugin, related types, and TypeScript in a separate branch/change set with the full production and Playwright suites rerun.

### Priority 5 — Production measurement

After deployment, run Lighthouse against representative routes, test on physical Android/iOS hardware, and collect real-user Core Web Vitals for Home, parent experiences, `/domains/`, Works, and Contact.

## Final sign-off

**UX/UI:** Pass  
**Responsive:** Pass  
**Accessibility:** Pass with minor watch items  
**SEO:** Pass  
**Content:** Pass  
**Performance:** Pass with optimisation opportunities  
**Security:** Pass with staged header hardening recommended  
**Code quality:** Pass  
**QA:** Pass  

**Overall:** ✅ **Approved for review. No blocking defects remain.**
