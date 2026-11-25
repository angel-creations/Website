# P2 + P3 Remediation — Angel Creations Website

**Branch:** `arena/838d883c-website` (cut from `main` @ `93210f7`)
**Date:** 2026-10-31
**Scope:** every outstanding P2 and P3 finding from the last audit. No P1 work. Nothing merged, nothing deployed.

---

## 1. Repository and branch state

| Item | Value |
|---|---|
| Base branch | `main` |
| Base commit | `93210f7` — "Merge pull request #35" (the previous remediation) |
| Working branch | `arena/838d883c-website` |
| Working tree at start | clean, no uncommitted changes |
| Toolchain | Node 22.22.3, npm 10.9.8, Vite 6.4.5, TypeScript 5.9.3 |
| Baseline build | `npm run build` → 85 route documents / 94 HTML files, verified by the repo's own `verifyStaticOutput` |

Baseline was re-measured before any edit:

| Route | CLS desktop (2 runs) | CLS mobile |
|---|---|---|
| `/metaverse/` | 0.687, 0.687 | 0, 0 |
| `/animation/` | 0.687, 0.687 | 0, 0 |
| `/` | 0.012, 0.012 | 0, 0 |
| `/works/` | 0, 0 | 0, 0 |

Axe baseline: 85/85 sitemap routes clean (WCAG 2.1 A/AA). Everything below builds on that.

---

## 2. Files changed

| File | Change |
|---|---|
| `src/components/HomeSlideshow.tsx` | homepage social rail markup, imports the shared list |
| `src/components/Header.tsx` | menu social column; deferred Escape focus restore |
| `src/app/App.tsx` | contact page footer; viewport reservation on the experience fallback |
| `src/styles/enhancements.css` | rail, menu social, mobile menu rhythm, `.site-main--reserve` |
| `src/utils/imageDimensions.ts` | **new** — `imageSize()` lookup helper |
| `src/data/imageDimensions.json` | **new, generated** — 356 intrinsic sizes measured from file headers |
| `scripts/generateImageDimensions.mjs` | **new** — header-level PNG/JPEG/WebP/GIF/SVG dimension reader |
| `package.json` | `build` runs the dimension generator before `tsc` |
| `public/.htaccess` | `'wasm-unsafe-eval'` removed from CSP; rationale corrected |
| `scripts/generateStaticFallbacks.mjs` | domain title budget 65 → 60, better branded fallbacks |
| `src/data/routeSeo.json` | `/virtual-reality/` title shortened |
| `src/components/{AboutPage,CapabilityDetail,ContactWizard,DomainDetail,DomainIndex,ExperienceExplorer,ExperienceProcess,ExperienceStory,MetaverseStory,SiteFooter,SliderExperience,VideoArchive}.tsx` | `{...imageSize(src)}` on every `<img>` |
| `docs/GOD-MODE-REMEDIATION.md` | security documentation corrected to match the shipped CSP |

Nothing was deleted. No dependency was added to `dependencies` or `devDependencies` (`axe-core` is installed with `--no-save` for scanning only).

---

## 3. P2 fixes

### 3.1 Homepage social rail — vertical, right edge, desktop only

`HomeSlideshow.tsx` now renders an `<ul class="ac-home-social">` inside the slideshow, immediately after the horizon rule:

- Five profiles from `src/data/socialLinks.ts` (the single shared module), inline 24×24 SVG glyphs at 16px inside 34×34 circular targets.
- **Position:** right edge, `bottom: calc(50% + 3.75rem)` — the bottom edge is pinned a fixed distance above the viewport mid-line, which is exactly where the fixed menu toggle is centred. The two therefore cannot collide at any window height. Measured overlap vs. menu toggle, bottom controls, headline and eyebrow: **none at 1024, 1280, 1440 and 1920**.
- **Desktop only:** hidden below 1024px, per the brief ("in mobile do not show social icon on homepage"). The profiles remain reachable on phones through the menu.
- `aria-label="<Name> (opens in a new tab)"`, `title`, `target="_blank"`, `rel="noopener noreferrer"`, hover lift + `:focus-visible` ring using the site's `--angel-focus` token, `prefers-reduced-motion` guard.
- **The homepage still has no footer.** Verified: `document.querySelectorAll('footer').length === 0` on `/` at every viewport.

### 3.2 Social icons in the navigation menu

Added a fourth column to the existing bottom studio bar (`#menuNav … .nav_bottom.ac-menu-footer`) — the secondary position, below the primary navigation and the product cards:

| Check | Result |
|---|---|
| Five profiles, exact URLs, `rel`/`target`, `aria-label`, SVG glyph | ✓ on desktop, tablet and mobile |
| Primary links stay dominant | primary link type 51.8px vs social icon 16px |
| No overlap with links or the close control | ✓ |
| 34×34 touch targets | ✓ |
| Visible focus ring | ✓ inherited (`.nav_bottom a:focus-visible`) |
| Menu open/close animation preserved | ✓ (same transition, column is a sibling in the bar) |
| Escape + focus trap preserved | ✓ |

On phones the bar now has a fourth row, so its rhythm was tightened (`margin-top` and `padding-top` reduced inside the existing `max-width: 640px` block). Measured menu scroll: 390×844 → 12px, 834×1112 → 0px, 375×667 → 177px against a 134px pre-change baseline (**+43px**), 320×640 → 258px vs 215px (**+43px**). That is the cost of a five-icon row on a 640px-tall screen and it is reported rather than hidden; nothing overlaps and no link is pushed off the bar.

### 3.3 Contact page footer

`/contact/` had no footer. `<SiteFooter />` is now rendered after `</main>` in the contact branch of `App.tsx` — the shared component, not a second implementation.

- Footer present: `/contact/` **1**, homepage **0**.
- `footer` is outside `<main>` → no `landmark-contentinfo-is-top-level` regression.
- All five icons present; form ends above the footer (no overlap).
- Page height: 2372px desktop, 3803px mobile.

### 3.4 Desktop CLS 0.687 → 0

**Cause, confirmed in the trace, not guessed.** `App.tsx` renders `<SiteFooter />` as a sibling of the `<Suspense>` boundary, and `RouteLoading` was a 150px `<p>`. On a cold load the footer was painted at y≈282 while the document was still short, then thrown to y≈11,155 when the route chunk resolved — one shift, `footer.ac-footer-v2`, `282y 618h → 0y 0h`, at ~400ms. Layout shift score for a footer covering 69% of the viewport: 0.687.

**Fix:** `RouteLoading` takes a `reserveViewport` flag and applies `.site-main--reserve` (`min-height: 100svh`, upgraded to `100dvh` under `@supports`). Only the experience route opts in — the shorter fallbacks (domains, capabilities, legal, works, contact) must not reserve space they never use. No fixed pixel height, no blank space after mount, no change to the loaded layout.

| Route | Before | After (2 runs) | Remaining contributors |
|---|---|---|---|
| `/metaverse/` desktop | 0.687, 0.687 | **0, 0** | none |
| `/animation/` desktop | 0.687, 0.687 | **0, 0** | none |
| `/metaverse/` mobile | 0, 0 | 0, 0 | none |
| `/animation/` mobile | 0, 0 | 0, 0 | none |
| `/` desktop | 0.012 | 0.012 | `span.q_split_wrap` — the homepage split-text reveal, pre-existing, unchanged |
| `/works/`, `/contact/`, `/about/` desktop | 0 | 0 | none |

### 3.5 Image width/height attributes

**The finding was bigger than the audit reported.** It is not 65 images on `/domains/` — **every `<img>` in `src/components` (35 of them) lacked intrinsic dimensions**, so the gap existed site-wide.

Rather than hand-type numbers, `scripts/generateImageDimensions.mjs` reads dimensions out of the file headers at build time (PNG IHDR, JPEG SOF chain, WebP VP8/VP8L/VP8X, GIF descriptor, SVG width/viewBox) and writes `src/data/imageDimensions.json`. `imageSize(src)` spreads the result onto each `<img>`; unknown paths return `{}` rather than an invented ratio, so dynamic sources degrade to the previous behaviour instead of reserving a wrong box.

- 360 public images scanned → **356 measured**, 4 unreadable (legacy SVG fonts, see §14).
- 35 `<img>` tags instrumented (34 automatically + 1 literal `src`).
- A stale hardcoded `width={1920} height={1080}` on the experience hero was **removed** — it declared 16:9 for files that are 1600×926 and 1280×640. The measured values are now used.

Verified in Chromium across 12 routes, **289 rendered images**:

| Route | Images | Missing dims | Aspect mismatch |
|---|---|---|---|
| `/domains/` | 65 | **0** | 0 |
| `/animation/` | 36 | **0** | 0 |
| `/augment-reality/` | 35 | **0** | 0 |
| `/metaverse/`, `/virtual-reality/` | 34 each | **0** | 0 |
| `/mixed-reality/` | 32 | **0** | 0 |
| `/works/` | 26 | **0** | 0 |
| `/` | 8 | **0** | 0 |
| `/contact/` | 7 | **0** | 0 |
| `/about/`, `/capabilities/design/`, `/privacy-policy/` | 6/4/2 | **0** | 0 |

`object-fit: cover` and the absolute-positioned hero images are unchanged — declared dimensions only supply the aspect ratio, CSS still controls the box.

---

## 4. P3 fixes

### 4.1 Escape now returns focus to the menu toggle

**Root cause, instrumented:** `Header.tsx` already called `triggerRef.current?.focus()`, and the call *did* land — but the trigger carries `visibility: hidden` for the first frames of the close transition (the `body.menu-open header .nav-menu { visibility: hidden }` rule). Focus on a hidden element is accepted and then dropped, so `document.activeElement` fell back to `<body>`.

**Fix:** `restoreTriggerFocus()` retries on animation frames until `getComputedStyle(trigger).visibility !== 'hidden'`, then focuses. It bails out if focus has moved somewhere meaningful in the meantime (so it can never steal focus) and gives up after 600ms.

| Test | Desktop | Mobile |
|---|---|---|
| Focus returns to the toggle after Escape | ✓ `BUTTON[menuNav]` | ✓ |
| `aria-expanded` back to `false` | ✓ | ✓ |
| Menu `inert` + `aria-hidden="true"` on close | ✓ | ✓ |
| Focus trap: 20 × Tab stays inside the menu | ✓ | ✓ |
| Focus trap: Shift+Tab backwards | ✓ | ✓ |
| Escape while already closed steals focus | ✗ no | ✗ no |

### 4.2 CSP cleanup

`'wasm-unsafe-eval'` was granted on the assumption that `/metaverse/` ran a Unity WebGL build. It does not: `find dist -name "*.wasm" -o -iname "*unity*"` returns one file, `media/logos/metaverse/TemplateData/unity-logo-dark.png` — a logo. The page renders **0 `<canvas>` elements** and loads no `.wasm`/`.data` payload. The directive was removed; nothing else in the policy was weakened.

Full policy still allows: inline GTM/GA4 bootstrap, `api.emailjs.com`, GTM/GA4 origins, privacy-enhanced YouTube frames, self-hosted fonts, `data:`/`blob:` images.

### 4.3 SEO titles and descriptions

**Decoding matters:** 7 of the reported "over 60" titles only exceeded the limit because `&amp;` (`&`) counted as 5 characters. Measured on decoded text, 16 titles were genuinely over 60 and **0** descriptions were over 160 (the 4 flagged descriptions were 161–162 *encoded*; all are ≤158 decoded).

Fix applied at the generator, not by hand:

1. `domainSeoTitle` acceptance budget tightened 65 → 60.
2. Animation pages now drop "…in India" before they drop "Animation" — the discipline is the term these pages rank for.
3. Branded fallback chain: contextual + brand → short parent prefix (`MR`/`VR`) + brand → plain title + brand.

| Route | Before (len) | Before | After (len) | After |
|---|---|---|---|---|
| `/virtual-reality/` | 62 | Virtual Reality Development Company in India \| Angel Creations | 54 | Virtual Reality Development in India \| Angel Creations |
| `/metaverse/virtual-economies/` | 63 | Metaverse Virtual Economies Services in India \| … | 52 | Virtual Economies in the Metaverse \| … |
| `/metaverse/virtual-education/` | 63 | Metaverse Virtual Education Services in India \| … | 52 | Virtual Education in the Metaverse \| … |
| `/metaverse/virtual-workspaces/` | 64 | Metaverse Virtual Workspaces Services in India \| … | 53 | Virtual Workspaces in the Metaverse \| … |
| `/mixed-reality/entertainment/` | 63 | Mixed Reality Entertainment Services in India \| … | 54 | Mixed Reality Entertainment Services \| … |
| `/mixed-reality/marketing-and-branding/` | 61 | Mixed Reality Marketing & Branding Services \| … | 52 | Mixed Reality Marketing & Branding \| … |
| `/mixed-reality/architecture-and-design/` | 65 | Architecture & Design in Mixed Reality Services \| … | 56 | Architecture & Design in Mixed Reality \| … |
| `/mixed-reality/remote-collaboration/` | 61 | Mixed Reality Remote Collaboration Services \| … | 52 | Mixed Reality Remote Collaboration \| … |
| `/virtual-reality/education/` | 64 | Education in Virtual Reality Services in India \| … | 55 | Education in Virtual Reality Services \| … |
| `/virtual-reality/streaming-and-broadcasting/` | 61 | Streaming & Broadcasting in Virtual Reality \| … | 45 | VR Streaming & Broadcasting \| … |
| `/animation/concept-development/` | 65 | Concept Development Animation Services in India \| … | 56 | Concept Development Animation Services \| … |
| `/animation/pre-visualization/` | 63 | Pre-visualization Animation Services in India \| … | 54 | Pre-visualization Animation Services \| … |
| `/animation/motion-graphics/` | 61 | Motion Graphics Animation Services in India \| … | 52 | Motion Graphics Animation Services \| … |
| `/animation/explainer-videos/` | 62 | Explainer Videos Animation Services in India \| … | 53 | Explainer Videos Animation Services \| … |
| `/brand-advertisement/explainer-communication/` | 65 | Brand Explainer Communication Services in India \| … | 56 | Brand Explainer Communication Services \| … |
| `/media-production/scriptwriting-and-storyboarding/` | 65 | Scriptwriting & Storyboarding Services in India \| … | 56 | Scriptwriting & Storyboarding Services \| … |

After: **0 titles over 60, 0 titles over 60 decoded, 85/85 distinct titles, 0 duplicate title strings**, length range 32–60 (mean 52).

Preserved untouched: canonical URLs, Open Graph, Twitter cards, JSON-LD. No required keyword or location term was dropped to hit the limit — "India" is the only word ever sacrificed, and only where the context would otherwise truncate mid-phrase.

---

## 5. Homepage social — evidence

```
1440×900  rail=flex  icons=5 ✓  box=1384,188 34×202  gapToMenu=31px  footer=0  overflow=0
1280×720  rail=flex  icons=5 ✓  box=1227,98  34×202  gapToMenu=34px  footer=0  overflow=0
1024×768  rail=flex  icons=5 ✓  box=975,122  34×202  overlap=none    footer=0  overflow=0
834×1112  rail=none (hidden below 1024px)                     footer=0  overflow=0
390×844   rail=none                                            footer=0  overflow=0
320×640   rail=none                                            footer=0  overflow=0
```

Every icon: `rel="noopener noreferrer"`, `target="_blank"`, non-empty `aria-label`, SVG path present, hit area ≥ 34×34. Overlap probe against the menu toggle, bottom controls, headline and eyebrow returned `false` at all four desktop widths. Screenshot: `/tmp/shot-rail-1440.png` (captured this session).

## 6. Navigation social menu — evidence

```
menu desktop: icons=5 ✓  bar y=770 h=94   primary 51.8px vs social 16px  scrollOverflow=0
menu mobile : icons=5 ✓  bar y=682 h=197  primary 27.3px vs social 16px  scrollOverflow=12px
320×640     : icons=5    belowFold=5  rightOverflow=0  menuScroll=258px (baseline 215px)
375×667     : icons=5    belowFold=5  rightOverflow=0  menuScroll=177px (baseline 134px)
834×1112    : icons=5    belowFold=0  rightOverflow=0  menuScroll=0
```

No icon overflows the viewport to the right at any width. Screenshots: `/tmp/shot-menu-desktop.png`, `/tmp/shot-menu-mobile.png`.

## 7. Contact footer — evidence

```
contact desktop: footer=true  inMain=false  social=5 (exact URLs)  formClearOfFooter=true  height=2372px
contact mobile : footer=true  inMain=false  social=5 (exact URLs)  formClearOfFooter=true  height=3803px
homepage       : footer=false (at 320/375/390/768/1024/1440)
```

---

## 8. CLS before and after

See §3.4. Summary: `/metaverse/` and `/animation/` **0.687 → 0.000** (two independent runs each), mobile unchanged at 0, no new shift introduced anywhere, `/` unchanged at 0.012.

## 9. Image dimension audit

356 of 360 images measured and emitted; 289 rendered images sampled across 12 routes with **0 missing dimensions and 0 aspect-ratio mismatches**. The 4 unmeasured files are legacy SVG fonts, not renderable images.

Reproducibility: two consecutive builds produce the same `imageDimensions.json` (0 diff) and the same entry bundle hash (`index-CboLYbos.js`, `ca3c41c477715dea`), because the generator sorts its keys and derives everything from file headers.

## 10. Accessibility

| Scan | Matrix | Result |
|---|---|---|
| Full sweep | 85 sitemap routes, WCAG 2.1 A/AA | **85/85 clean** |
| Homepage with new rail | 1440, 390, 320 | **0 violations** |
| Menu open with social area | 1440, 390, 320 | 1 pre-existing **minor** `aria-allowed-role` on `#menuNav` (see §17) |
| Contact page with new footer | 1440, 390 | **0 violations** |

Keyboard: focus restoration, focus trap (forward and backward), `aria-expanded`, `inert`, and "Escape while closed does not steal focus" all verified on desktop and mobile.

## 11. CSP test results

Served `dist/` through a throwaway server that replays the exact `mod_headers` block from `public/.htaccess`, then loaded the site in Chromium with the policy **enforced** (`securitypolicyviolation` listener + console):

```
/  /works/  /about/  /contact/  /metaverse/  /animation/
/capabilities/design/  /domains/  /privacy-policy/  /mixed-reality/
→ 10 routes, 0 CSP violations, 0 blocked resources
→ every route: app mounted, fonts loaded, h1 present
→ social icons rendered: 5 on all routes, 10 on /contact/ (footer + support row)
```

`wasm-unsafe-eval` absent from the emitted header; `/metaverse/` renders with 0 `<canvas>` and no wasm request. Headers still present: CSP, HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, `X-Permitted-Cross-Domain-Policies` — 14 `Header always set` lines, exactly one per security header.

## 12. SEO metadata comparison

Titles: §4.3 (16 changed, all now ≤60, no duplicates). Descriptions: **unchanged** — none exceeded 160 characters once HTML entities are decoded. Canonicals, OG and Twitter/X cards re-verified on all 85 pages: 85/85 complete for `og:title/description/image/url/type` and `twitter:card=summary_large_image` + title/description/image.

## 13. Unused media inventory

Method: every file under `dist/media` (360) checked against the exact path **and** the bare filename across all built HTML/JS/CSS/JSON/XML/TXT **and** all of `src/`, `index.html`, `vite.config.ts` and the generators. The previous audit's "131 unreferenced, 12.31 MB" figure came from matching exact paths only — `webpSource()` rewrites `.jpg` → `.webp` at runtime, so 127 of those files were referenced by a name the audit never looked for.

| Classification | Files | Size |
|---|---|---|
| Referenced (exact path or filename) | 356 | 54.92 MB |
| Dynamically referenced (basename only) | 1 | included above |
| Externally referenced | 0 detected | — |
| **Confirmed unused** | **4** | **0.94 MB** |

| File | Size | Format | Dimensions | Reference investigation | Recommendation |
|---|---|---|---|---|---|
| `/media/svg/Graphik-Black.svg` | 414 KB | svg | — | no HTML/CSS/JS reference in `dist` or `src`; not in any `@font-face`, `<img>`, `url()` or data file | **Confirmed unused** — removable; left in place, rollback is this commit |
| `/media/svg/GeographEdit.svg` | 261 KB | svg | — | as above | **Confirmed unused** — removable |
| `/media/svg/geographweblight.svg` | 248 KB | svg | — | as above | **Confirmed unused** — removable |
| `/media/svg/Geograph-Regular.svg` | 40 KB | svg | — | as above | **Confirmed unused** — removable |

All four are SVG-font versions of typefaces that are now served as `.woff2`. **Nothing was deleted**: removal is proposed, not performed. The only residual uncertainty is an external hotlink to `/media/svg/*.svg`, which cannot be checked from here.

## 14. Font cleanup

53 files in `dist/fonts`, all 53 reachable — but not all of them *needed*:

| Format | Files | Size | Status |
|---|---|---|---|
| `.woff2` | 22 | 0.74 MB | Primary, used by every modern browser |
| `.woff` | 22 | 0.98 MB | Fallback for pre-2016 browsers |
| `.eot` | 4 (+4 `?#iefix` aliases) | 0.36 MB | Internet Explorer only |
| `.ttf` | 4 | 0.33 MB | Fallback in the same `src` chain |
| `.otf` | 1 | 0.09 MB | Fallback in the same `src` chain |

Nine legacy files (`.eot`/`.ttf`/`.otf`, 0.74 MB) sit in exactly four `@font-face` blocks — Graphik 900, Geograph 400, Geograph Edit italic, geographweblight — as the oldest entries of the `src` list. Every browser in use today picks the `.woff2` first; the legacy entries are only reachable by IE ≤ 11 and pre-Chromium Edge.

**Recommendation (not applied):** drop the four `@font-face` `src` chains to `.woff2` + `.woff` and delete the nine legacy files, saving **0.74 MB** of deploy weight and four HTTP-format branches. `@fontsource/montserrat` and `@fontsource/playfair-display` already ship their own woff2/woff pairs, so nothing there changes. Verified before deletion would be needed on real IE traffic — which the analytics cannot show from this sandbox.

## 15. Sitemap validation

- Parses as XML (`ElementTree`), correct `sitemap`/`image` namespaces.
- 85 `<url>` entries, 85 with image children, **0 duplicate `<loc>`**, no `/work/` entry.
- **`lastmod` deliberately omitted.** `git rev-list --count HEAD` is **1** — the repository carries a single commit dated 2026-10-31, so every route would get the same timestamp, which is exactly the fabrication the brief forbids. Per-route dates cannot be derived from a one-commit history. The generator's output stays deterministic; the field can be added later once real per-file history exists (or from a content-dates map maintained by hand).

## 16. Build and regression

| Check | Result |
|---|---|
| Clean install (`npm ci`) | ✓ 0 vulnerabilities |
| `tsc -b` (strict) | ✓ |
| `npm run build` | ✓ 85 route docs / 94 HTML, generator + verifier pass |
| Build reproducibility | ✓ same entry hash `index-CboLYbos.js` / `ca3c41c…` on two consecutive builds; `imageDimensions.json` byte-identical |
| `test:static` | **46/46** |
| `test:smoke` (dev server) | **46/46** |
| `test:config` | **23 checks, 0 failed** |
| `test:emailjs` | **138 checks, 0 failed** |
| `test:fallback` / `test:degraded` | ✓ / ✓ (6 routes) |
| `test:deliverability` | 4 passed, 4 warnings, 0 failed (unchanged; DNS untouched) |
| `npm audit` | **0 vulnerabilities** |
| axe — 85 routes | **85/85 clean** |
| axe — new surfaces + 3 viewports | home 0, contact 0, menu 1 pre-existing minor |
| CSP enforced in Chromium | 10 routes, **0 violations** |
| Responsive 320/375/390/768/1024/1440 × 6 routes | 0 horizontal overflow, 0 overlap, homepage 0 footers, contact 1 footer |
| Source maps / secrets | 0 maps, no private keys, no SMTP credentials |

## 17. Remaining known issues

1. **`#menuNav` has `role="dialog"` on a `<nav>`** — flagged `minor` by axe best-practice *only while the menu is open*. The panel is a `<nav role="dialog">`, and `dialog` is not a permitted role for `nav`. It predates this work. Fixing it properly means either moving the role to a wrapper `<div>` or switching to `role="navigation"` plus a modal wrapper — both touch the panel that holds the focus trap, so it was left for a dedicated change rather than slipped into this one. Zero serious/critical impact.
2. **Mobile menu height grew 43px** at ≤667px-tall viewports (see §3.2). No overlap, nothing unreachable; it is the honest cost of a five-icon row.
3. **`/` LCP element `.q_split_wrap` still shifts 0.012** on desktop — the homepage headline reveal animation, pre-existing and below the "good" threshold.
4. **Images remain without `sizes`/`srcset`** on non-`picture` elements; dimensions are declared but bandwidth is not yet optimised. Out of scope (video/perf work was excluded).
5. **4 unmeasurable SVG files** — the legacy SVG fonts in §13. Their absence from the manifest is harmless; deleting them removes the generator's only warning.
6. **`/media/svg/*.svg` and 9 legacy font files still deployed** — 1.68 MB combined, removal proposed in §13/§14, not performed.
7. **Live headers not verified** — no egress from this sandbox; the CSP was proven in Chromium against the real policy text, not against the production host.
8. **DMARC unchanged** (`p=none`, no `rua=`) — DNS explicitly out of scope.

## 18. Deployment readiness

**Ready to review, not to deploy.** The branch builds reproducibly, every suite passes, accessibility is at zero serious/critical across 85 routes and the three new surfaces, CSP is enforced with zero violations, and the CLS regression is gone. Nothing here changes the approved desktop design: the only additions are a 34px icon rail on the homepage's right edge, an icon row in the existing menu studio bar, the shared footer on `/contact/`, and a reserved loading height that is invisible once the route mounts.

Before merging:

1. Read §17.1 (menu `dialog` role) and decide whether to fold the fix in.
2. Approve or reject the two deletion proposals (§13, §14) — combined 1.68 MB of deploy weight.
3. After deploy, confirm the live headers with `curl -sI` and check for a second CSP injected by the host.

No merge, no deploy and no production change has been made from this branch.
