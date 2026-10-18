# Angel Creations — Phase 3 Godmode / Red-Team / Production-Hardening

**Completed:** 2026-10-05 (Asia/Kolkata)  
**Method:** Attack first, then make only source-faithful, surgical repairs. Phase 2 reports were treated as leads—not proof.

## 1. Test environment and non-negotiable blockers

| Capability | Status | Exact result |
|---|---|---|
| Playwright Chromium / headless shell | **BLOCKED** | Both installed executables fail before launch: `error while loading shared libraries: libnspr4.so: cannot open shared object file`. |
| Browser visual, responsive, touch, keyboard, focus-order, screen-reader, live animation, contrast-over-video and DevTools console/network QA | **BLOCKED** | Requires a working browser; none can start in this sandbox. No browser results are claimed. |
| Production HTTP status / server-header behavior | **BLOCKED** | Local `vite preview` is not the target host and uses SPA fallback. No remote infrastructure or headers were changed. |
| Form delivery, server spam/rate limiting, mail reception | **BLOCKED by approved scope** | No submission endpoint is shipped or exercised. The contact experience explicitly prepares an email draft only. |

## 2. Attack record and fixes

| ID | Severity | Area | Reproduction / root cause | Surgical fix | Retest / status |
|---|---:|---|---|---|---|
| P3-001 | P1 | SEO metadata | Crawl of 22 sitemap documents found 13 empty meta descriptions; root had no emitted OG properties or JSON-LD. The fallback generator copied empty legacy values and did not enrich root output. | Added source-qualified descriptions only for those exact legacy routes in `src/data/routeSeo.json`; applied them in React SEO and static generation. Generator now emits captured home OG/Twitter fields and captured home JSON-LD. | **PASS** — 24 emitted documents: 0 missing/duplicate descriptions, root has WebPage/BreadcrumbList/WebSite/Organization/Place/ImageObject schema. |
| P3-002 | P1 | Static internal links | Static crawl found 16 orphan sitemap paths: capability routes and several core/legal source routes lacked an inbound static link. | Added a source-qualified capability index to the static About fallback; broadened the home `noscript` path list and static legal footer links. | **PASS** — 0 orphan sitemap routes; 179 static internal links; no broken local static targets. |
| P3-003 | P1 | About reduced-motion transition | State trace: turning reduced motion on marked all elements visible; turning it off then moved already-revealed lines down, while `reveal()` correctly refused a second reveal. Copy could remain clipped. | `AboutReveal` now observes only unrevealed entries, keeps revealed copy visible, and clears only rotating-word reduced-motion overrides on return to motion. | **SOURCE PASS / BROWSER BLOCKED** — TypeScript/build pass and adverse state path code-reviewed; live media-query toggle cannot be executed without Chromium. |
| P3-004 | P2 | Alias and not-found delivery | `/work/`, `/404.html`, and an unknown route returned HTTP 200 under Vite preview. `/work/` was a duplicate spelling; no emitted 404 document existed. | Normalised `/work[/]` to `/works/`; emitted a `noindex` static `/work/` canonical/meta-refresh document; emitted semantic `dist/404.html`; added an Angel-native React 404; non-core captured CMS/test/search/duplicate paths now resolve to it. | **PARTIAL PASS / HOST BLOCKED** — `/work/` has canonical `/works/` and static continuation; `/404.html` has semantic fallback. Vite still returns root HTML/200 for arbitrary unknown paths before JS. Target host must map unknown paths to `404.html` with HTTP 404. |
| P3-005 | P2 | Structured data | Root had no generated JSON-LD even though its captured source has valid schema. | Static generator injects only the captured root schema. Capability schema remains service-specific and source-qualified. | **PASS** — no JSON-LD parse errors or stale `.html` schema URLs. |
| P3-006 | P2 | Work archive integrity | Required exactly 47 records, unique source URLs, property coverage and JPEG/WebP pairs. Source capture includes 10 blank descriptions and only 9 available likes. | No missing values were invented. | **PASS** — 47 records/47 unique exact URLs; all required keys; 47 JPEG + 47 WebP files; 0 archive iframes. Missing source values remain visibly unavailable. |
| P3-007 | P2 | Static/no-JS fallback | Semantic fallback markup exists, but actual no-JS rendering is browser-dependent. | Generated all core/capability documents with modules, styles, `<noscript>`, H1 and source fallback. | **STRUCTURAL PASS / BROWSER BLOCKED** — all 24 checked emitted documents include module assets, styles and noscript; live JS-disabled rendering unverified. |
| P3-008 | P2 | Security headers | Local preview sends only Vite headers, not production CSP/HSTS/XFO/etc. | No speculative host config was added, and no remote server was modified. | **BLOCKED** — deployment owner must configure host headers. |
| P3-009 | P1 | Accidental executable form endpoint | `public/contact.php` could send mail when copied to a PHP host, contradicting the no-backend/no-submission constraint. It was not wired from React but remained deployable. | Removed `public/contact.php`; contact remains client validation + inert honeypot + explicit email-draft path only. | **PASS** — 0 PHP files in `public` or `dist`; no application endpoint call. Delivery still intentionally unavailable. |
| P3-010 | P2 | Browser console/network | Runtime console errors, actual requests, touch/slider gesture behavior and waterfall cannot be inspected. | No false pass issued. HTTP document/module/CSS asset probes were run instead. | **BLOCKED** — missing `libnspr4.so`. |
| P3-011 | P2 | Business contact address | Three active links used malformed `business@angelcreations`. Existing local endpoint configuration established `business@angelcreations.in` as the intended address. | Corrected header, displayed contact link and `mailto:` draft recipient. | **PASS** — no malformed active business `mailto:` literal remains. |
| P3-012 | P2 | Legacy route hygiene | The captured CMS archive includes `hello-world`, test, search, author, forensic and duplicate-copy paths that are not part of the current site architecture. | Allowlisted the actual Angel core in `App`; all non-core capture records use the 404 state rather than rendering stale forms/duplicate content. | **SOURCE PASS / BROWSER BLOCKED** — route policy builds; in-browser transition verification remains unavailable. |

## 3. Final scorecard

| Area | Final status | Evidence / limitation |
|---|---|---|
| Brand preservation / homepage architecture | **PASS** | No replacement of Angel’s dark, numbered, immersive slider architecture. |
| Build / typecheck / static generation | **PASS** | Final `npm run build` completed. Only Vite’s generic deferred-chunk-size warning remains. |
| Homepage and slider behavior | **BLOCKED** | Browser execution unavailable; source checks confirm the original slider remains and inactive remote slide uses `preload="none"`. |
| Navigation, focus trap, keyboard and mobile menu | **BLOCKED** | Source behavior inspected; physical keyboard/focus test unavailable. |
| About / motion | **SOURCE PASS / BROWSER BLOCKED** | P3-003 repaired; cannot live-toggle media preference. |
| Work data/media | **PASS** | 47/47/47 archive, URL and JPEG/WebP checks pass; archive begins at 12 and reveals in batches. |
| Capability routes | **PASS (static)** | Eight capability route documents, metadata, canonical and schemas emitted; rendered browser behavior blocked. |
| Static/no-JS structure | **STRUCTURAL PASS / BROWSER BLOCKED** | H1, fallback and live asset references exist for every tested emitted document. |
| SEO / canonical / sitemap / robots | **PASS** | 22 sitemap URLs map to emitted route docs; no description/title duplication, missing canonical, sitemap gap or sitemap orphan. |
| JSON-LD | **PASS** | All parse; root and capability schema checks pass. |
| Internal links | **PASS** | 179 static links; no broken local target; no sitemap orphan. |
| Image alt coverage | **PASS (static output)** | 0 static fallback images requiring alt; dynamic archive images are decorative thumbnails with empty alt inside labelled links. Browser/AT verification blocked. |
| Form correctness / delivery | **PASS for stated behavior** | Validation/honeypot/email-draft behavior is clearly local; no executable PHP submission endpoint. Mail-client and delivery behavior are blocked by scope/environment. |
| Security source scan | **PASS** | No scanned secrets, `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `new Function`; legacy renderer does not render script tags and intercepts legacy forms. |
| Security headers | **BLOCKED** | Host-owned; local Vite response is not production proof. |
| 404 / unknown-route HTTP semantics | **BLOCKED** | Application/static documents are present; production host must issue actual 404 status/fallback mapping. |
| Responsive / visual / accessibility QA | **BLOCKED** | Exact missing library prevents browser launch. |
| Performance | **CONDITIONAL** | Main bundle 195.84 kB / 61.96 kB gzip; deferred legacy chunk 854.58 kB / 54.54 kB gzip; WebP work derivatives exist. Lab/field/browser metrics blocked. |

## 4. Machine-verifiable final results

- Machine-readable full-route report: [`PHASE-3-SEO-REPORT.json`](./PHASE-3-SEO-REPORT.json)
- 24 emitted HTML documents checked: 22 sitemap documents plus `/404.html` and `/work/` alias.
- 22 sitemap entries; zero missing emitted sitemap documents.
- 0 missing meta descriptions, 0 duplicate non-empty titles/descriptions, 0 missing canonical tags, 0 H1-count errors, 0 JSON-LD parser errors, 0 static sitemap orphans.
- `/work/` is intentionally reported by the machine crawl as canonicalising to `/works/`; it is a `noindex` alias, not a duplicate indexable route.
- 24/24 HTTP document/module/style/no-JS structural checks returned success against local preview.
- No `public` or built PHP file remains. A Vite fallback returning `200` for `/contact.php` is not a PHP endpoint and must not be interpreted as delivery behavior.

## 5. Production handoff required

1. Install `libnspr4.so` (or provide a runnable browser image) and repeat the blocked desktop/mobile/touch/keyboard/screen-reader/console/network tests.
2. Configure the chosen host—not this repository—to serve `dist/404.html` with HTTP 404 for unknown paths, while retaining SPA deep-link support for actual routes.
3. Configure host security headers after validating them against Angel’s local/external video/media requirements: HTTPS/HSTS, CSP, frame policy, MIME sniffing and referrer policy.
4. If form delivery is approved later, implement and independently attack a real server-side endpoint with rate limiting, CSRF/origin controls, logging, validation and mail-delivery monitoring. Do not represent the current email draft as delivery.
5. Re-check public contact addresses and captured organization schema facts with the business owner before remote deployment.

No commits, pushes, deployments, DNS/Hostinger changes, analytics/Search Console changes, form submission attempts or remote infrastructure modifications were made.
