# Angel Creations — Changes Summary (2026-10-21)

## Branch: `arena/cc808b0c-website`

This summary documents material changes made during the codebase purification and architectural review.

## 1. Production Black-Screen Fix (Critical)

**Root cause:** `index.html` loaded 4 WordPress Fleava theme stylesheets on every page load. WordPress theme CSS can override React component styles, set `visibility: hidden`, `display: none`, or black backgrounds on mounted content — causing blank/black screens on direct page loads.

**Fix:** Removed all 4 Fleava `<link rel="stylesheet">` tags from `index.html`. Angel-owned styles are imported by `src/main.tsx` (baseline.css, enhancements.css, inner-experiences.css).

**Files changed:**
- `index.html` — Removed Fleava CSS links; updated preload and static-fallback background image to `/assets/` paths

## 2. Legacy WordPress/Fleava Dependency Removal

**Active source code — zero remaining `legacy-assets`/`fleava`/`wp-content` references** (excluding `legacyPages.json` which is archived capture data, and `slideExperiences.json` which retains one intentional remote media URL marked `remote: true`).

**Component path replacements:**
| File | Old Path | New Path |
|------|----------|----------|
| `src/components/Header.tsx` | `/legacy-assets/logos/wp-content/uploads/2023/01/logo-rectangle-1.png` | `/assets/logos/angel-creations-logo.png` |
| `src/components/Header.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | `/assets/videos/menu-background.mp4` |
| `src/components/Header.tsx` | `/legacy-assets/images/generated-home-posters/menu-background.jpg` | `/assets/images/menu-background.jpg` |
| `src/components/AboutPage.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | `/assets/videos/menu-background.mp4` |
| `src/components/AboutPage.tsx` | `/legacy-assets/images/generated-home-posters/menu-background.jpg` | `/assets/images/menu-background.jpg` |
| `src/components/HomeSlideshow.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | `/assets/videos/menu-background.mp4` |
| `src/components/ContactWizard.tsx` | `/legacy-assets/icons/contact-*.png` | `/assets/icons/contact-*.png` |
| `src/components/LegacyFooter.tsx` | `/legacy-assets/logos/wp-content/uploads/2023/01/logo-rectangle-1.png` | `/assets/logos/angel-creations-logo.png` |

**CSS path replacements (`src/styles/baseline.css`):**
- 4 `@font-face` rules: Fleava font URLs → `/assets/fonts/` (Graphik-Black, GeographEdit, Geograph-Regular, geographweblight)
- 5 Unity CSS `url()` rules: Fleava TemplateData URLs → `/assets/metaverse/`

**Data file (`src/data/slideExperiences.json`):**
- 6 slide video paths: `/legacy-assets/videos/...` → `/assets/videos/`
- 6 slide poster paths: `/legacy-assets/images/generated-home-posters/...` → `/assets/images/generated-home-posters/`
- Slide 7 (Media Production) retains intentional remote `https://angelcreations.in/...` URL (marked `remote: true`)

**Asset copies (`public/assets/`)** — Creative assets copied from `public/legacy-assets/` to clean Angel-owned paths. Originals remain in `legacy-assets/` as archived evidence:
- `/public/assets/logos/angel-creations-logo.png`
- `/public/assets/videos/menu-background.mp4` + 6 slide videos
- `/public/assets/images/menu-background.jpg` + 6 slide posters
- `/public/assets/icons/contact-*.png` (3 icons)
- `/public/assets/fonts/*.woff2` (4 Fleava family fonts)
- `/public/assets/metaverse/*.png` (5 Unity TemplateData images)

**`public/legacy-assets/` (169 files)** — Retained as archived evidence. Not referenced by active source code.

## 3. Dead Code Removal

| File | Reason |
|------|--------|
| `src/components/AboutReveal.tsx` | Exports `AboutReveal` which returns `null`. Zero imports in any source file. |
| `src/components/CapabilityIndex.tsx` | Exports `CapabilityIndex` component. Zero imports in any source file. |

## 4. Black-Screen Regression Tests

Added to `scripts/auditStaticOutput.mjs`:
- `sourceIndexFleavaCss` — source `index.html` must not load Fleava CSS
- `builtIndexFleavaCss` — built `dist/index.html` must not load Fleava CSS
- `sourceIndexMissingRoot` — source `index.html` must have `#root`
- `builtIndexMissingRoot` — built `dist/index.html` must have `#root`

All four checks pass (`auditPassed: true`).

## 5. Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | Pass (213.47 kB JS / 65.25 kB gzip, 183.02 kB CSS) |
| `npx tsc -b` | Pass |
| `npm audit` (full + prod) | 0 vulnerabilities |
| `scripts/auditStaticOutput.mjs` | `auditPassed: true`, 21/21 routes, 293 anchors, 305 assets, 0 issues |
| Browser matrix (Playwright) | Not run — no browser binary available in sandbox (documented limitation) |

## 6. Preserved Assets (Not Removed)

- `public/inner-library/` — 151 Angel-branded images (heroes, maps, stories)
- `public/social/og/` — 21 Open Graph social images
- `public/work-thumbnails/` — 90 video archive thumbnails
- `public/legacy-assets/` — 169 archived WordPress/Fleava files (evidence, not referenced)
- `src/data/legacyPages.json` — Captured legacy page data (reference)
- `.htaccess`, `.well-known/` — Not present in repo; no hosting config changes

## 7. Remaining Issues & Owner Decisions

1. **Production deployment blocked:** Cannot trigger `workflow_dispatch` (GitHub token returns 403). Cannot inspect `HOSTINGER_*` secrets or `HOSTINGER_DEPLOY_ENABLED` variable. Deploy workflow is gated to `main` branch + `HOSTINGER_DEPLOY_ENABLED='true'`.

2. **Production verification blocked:** Sandbox cannot reach `angelcreations.in` (TLS blocked, curl exit 35). Production status, TLS, error-page mapping, and field Core Web Vitals are unverified.

3. **Browser matrix not re-run:** Playwright Chromium cannot be downloaded (sandbox blocks cdn.playwright.dev). Custom Chromium from earlier session was lost on environment reset.

4. **`legacyPages.json`** still contains `wp-content` URLs and `wp-theme-fleava` body class in captured data. This is historical archive data rendered by `LegacyRenderer`, not active asset references. Owner may choose to strip or retain.

5. **`slideExperiences.json` slide 7** references remote `https://angelcreations.in/...` `.mov` file (310 MB QuickTime). Marked `remote: true`; not fetched locally. Owner may choose to replace with local asset.

6. **PR #9** on GitHub is at head `9de55f1` (pushed earlier), mergeable CLEAN. Local branch needs commit+push to align.
