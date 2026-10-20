# Angel Creations — Baseline Audit (2026-10-21)

## Repository State

- **Branch:** `arena/cc808b0c-website`
- **Commit:** `e895f95` "Allow gated manual production deployment from main"
- **Working tree:** Dirty — 13 modified files (prior reliability work from PR #9, not yet committed locally), 1 untracked audit doc
- **PR #9:** Open on GitHub at head `9de55f1`, mergeable CLEAN, CI `build-and-verify` passing
- **PRs #5, #6:** Older, open, "Restore the original Angel Creations website and enhance it in place"

## Application Architecture

| Layer | Files | Notes |
|-------|-------|-------|
| Entry | `src/main.tsx` | Renders `<ApplicationErrorBoundary><App /></ApplicationErrorBoundary>` into `#root`; imports `@fontsource` fonts + 3 CSS stylesheets |
| Router | `src/app/App.tsx` | Lazy-loaded pages, `DismissStaticFallback`, route normalization, popstate sync, internal link interception |
| Components | `src/components/*.tsx` | 17 components including pages, layouts, error boundary, legacy renderer |
| Data | `src/data/*.{ts,json}` | `routeSeo.json` (21 routes), `capabilities.ts` (8 capabilities), `slideExperiences.ts` (7 slides), `videoArchive.json` (47 records), legacy captured pages |
| Styles | `src/styles/*.css` | `baseline.css`, `enhancements.css` (design tokens + component styles), `inner-experiences.css` |
| Utils | `src/utils/*.ts` | `routes.ts`, `seo.ts`, `mediaPreferences.ts`, `appleSpring.ts` |
| Types | `src/types/legacy.ts` | `LegacyPage`, `SeoData`, `LegacyNode`, etc. |
| Build | `vite.config.ts`, `scripts/generateStaticFallbacks.mjs` | Vite build + static fallback generation for no-JS delivery |
| CI | `.github/workflows/verify-production-build.yml` | Build, audit, test, artifact upload; deploy gated to `main` + `HOSTINGER_DEPLOY_ENABLED` |

## Public Routes (21 sitemap URLs)

`/`, `/about/`, `/contact/`, `/works/`, `/metaverse/`, `/animation/`, `/augment-reality/`, `/brand-advertisement/`, `/media-production/`, `/mixed-reality/`, `/virtual-reality/`, `/privacy-policy/`, `/terms-of-service/` + 8 `/capabilities/.../` routes.

Retired: `/360-video/` (410). Alias: `/work/` → `/works/`.

## Legacy / WordPress / Fleava Dependencies Found

### Loaded on every page (`index.html`)

1. `/legacy-assets/other/wp-content/themes/fleava/assets/css/app.css` (105,224 bytes) — Fleava theme layout CSS
2. `/legacy-assets/other/wp-content/themes/fleava/assets/css/custom.css` (20,207 bytes) — Fleava theme custom CSS
3. `/legacy-assets/other/wp-content/themes/fleava/style.css` — WordPress theme style.css
4. `/legacy-assets/other/wp-content/themes/fleava/assets/css/style-dark-mode.css` — Fleava dark-mode CSS

**Risk:** These WordPress theme stylesheets are loaded on the React SPA entry document. They can override React component styles, set `visibility: hidden`, `display: none`, or black backgrounds on elements — a likely contributor to the production black-screen incident.

### Referenced in source components

| File | Legacy Reference | Usage |
|------|-----------------|-------|
| `src/components/Header.tsx` | `/legacy-assets/logos/wp-content/uploads/2023/01/logo-rectangle-1.png` | Header logo |
| `src/components/Header.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | Menu background video |
| `src/components/Header.tsx` | `/legacy-assets/images/generated-home-posters/menu-background.jpg` | Menu poster |
| `src/components/AboutPage.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | Hero showreel video |
| `src/components/AboutPage.tsx` | `/legacy-assets/images/generated-home-posters/menu-background.jpg` | Showreel poster |
| `src/components/HomeSlideshow.tsx` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | Fallback video for remote slides |
| `src/components/ContactWizard.tsx` | `/legacy-assets/icons/contact-back.png` | Navigation icon |
| `src/components/ContactWizard.tsx` | `/legacy-assets/icons/contact-forward.png` | Navigation icon |
| `src/components/ContactWizard.tsx` | `/legacy-assets/icons/contact-down.png` | Navigation icon |
| `src/components/LegacyFooter.tsx` | `/legacy-assets/logos/wp-content/uploads/2023/01/logo-rectangle-1.png` | Footer logo |
| `src/styles/enhancements.css` | `@font-face` URLs to `/legacy-assets/fonts/wp-content/themes/fleava/assets/fonts/...` | Fleava theme fonts (Geograph, Graphik, geographweblight) |
| `src/styles/enhancements.css` | Unity CSS `url()` to `/legacy-assets/logos/metaverse/...` and `/legacy-assets/images/metaverse/...` | Unity WebGL shell styling |

### `public/legacy-assets/` archive (169 files, ~75.6 MB)

| Category | Count | Classification |
|----------|-------|----------------|
| fonts (Fleava theme) | 53 | Obsolete theme dependency — replaceable with `@fontsource` packages already in `package.json` |
| icons (contact nav) | 3 | Still referenced by `ContactWizard.tsx` — inline as data URIs or move to `public/assets/` |
| images (about, posters, metaverse) | 15 | Mixed — metaverse TemplateData images needed for `/metaverse/`; about images replaceable |
| logos (Angel + metaverse) | 4 | Angel logo still referenced — move to `public/assets/`; metaverse logos needed for Unity shell |
| other (WP plugins, theme CSS, feeds) | 27 | Obsolete — Contact Form 7, Elementor, Panorama, Fleava CSS, RSS feeds |
| svg (Fleava fonts) | 4 | Obsolete — Fleava font SVGs |
| videos | 7 | Showreel video still referenced — replaceable with `public/` asset or remove |

### Non-legacy public assets (preserve)

- `public/inner-library/` — 151 Angel-branded hero/map/story images (used by components)
- `public/social/og/` — 21 Open Graph social images (referenced by `routeSeo.json`)
- `public/work-thumbnails/` — 90 video archive thumbnails (jpg + webp pairs)
- `public/robots.txt`, `public/sitemap.xml`

## Black Screen Incident — Hypotheses (not yet confirmed)

1. **Fleava theme CSS overrides** — 4 WordPress theme stylesheets loaded on `index.html` may set `visibility: hidden`, `display: none`, `background: #000`, or conflicting `z-index`/`position` on React-injected content.
2. **`.reveal-text { visibility: hidden; }`** — Captured inline About stylesheet hides text nodes (per `docs/FUNCTIONAL-PARITY.md`).
3. **Source `index.html` references `/src/main.tsx`** — TypeScript source path; would 404 on a production server (but `dist/index.html` has the correct hashed Vite asset — this is a dev-entry issue, not production).
4. **JavaScript hydration failure** — `DismissStaticFallback` removes `#static-route-fallback` before React content commits, leaving empty body.

## Existing Quality Work (Preserve)

- `routeSeo.json` — Complete SEO metadata for all 21 routes
- `capabilities.ts` — 8 source-qualified capability definitions
- `slideExperiences.ts` — 7 homepage slide experiences
- `videoArchive.json` — 47 verified public video records
- `ApplicationErrorBoundary.tsx` — Render error boundary with recovery UI
- Static fallback system — No-JS route content via `generateStaticFallbacks.mjs`
- `auditStaticOutput.mjs` / `auditEndToEnd.mjs` — Local build + browser matrix audits
- `verify-production-build.yml` — CI with build, audit, Playwright matrix, deploy safeguards

## Acceptance Criteria (from mission)

- Production build completes successfully
- TypeScript and lint checks pass
- Dependency audit: 0 vulnerabilities
- All intended routes render correctly
- Direct navigation and hard reload work for every route
- Internal navigation and browser history work
- No blank/black screens
- No broken local asset references
- No unexpected JS runtime errors
- No unintended 404/500/incorrect content-type
- No broken internal links
- SEO metadata and canonical URLs correct
- Responsive and keyboard-accessible
- Reduced-motion behavior works
- Retired/unknown routes return intended responses
- No creative assets accidentally removed
- Deployment artifact matches reviewed source commit

## Known Blockers

- Cannot access production `angelcreations.in` from sandbox (outbound TLS blocked, curl exit 35)
- Cannot inspect GitHub secrets/variables/branch protection (token returns 403)
- Cannot trigger `workflow_dispatch` (token returns 403)
- Production deployment requires `main` branch + `HOSTINGER_DEPLOY_ENABLED='true'`
