# Migration Notes

## Preservation decisions

- Live page copy, URL inventory, scripts, original CSS/JS, locally available original media, fonts, and raw HTML are retained before React implementation.
- No production site, Hostinger, DNS, WordPress, analytics settings, forms, databases, repositories, or Search Console settings were changed.
- React is intentionally dependency-light: React, ReactDOM, Vite, and TypeScript only. No UI, animation, router, CMS, or backend package was added.
- The React implementation renders captured source content through a typed, allowlisted DOM data renderer rather than injecting arbitrary HTML. This preserves content/structure without `dangerouslySetInnerHTML`.
- A hard-linked compatibility mirror at `public/legacy-assets/other/wp-content/themes/fleava/assets/fonts/` satisfies the original relative `custom.css` font URLs while the canonical categorised copies remain in `public/fonts/`. This avoids browser 404s without changing the preserved CSS source.

## Responsive forensic baseline

### CSS-observed breakpoints

- `1727px`, `1400px`, `1200px`, `1199px`, `1024px`, `991px`, `767px`, and `600px` were found in theme/custom styles.
- Examples preserved in legacy CSS: header/logo/menu offsets at ≤1024/600, about grids changing from 3 to 2 to 1 columns at 1199/991, work/detail columns stacking at 991, and contact/menu changes at 767.

### Screenshot limitation

- Browser automation/browser binary was not available in this workspace (`chromium`, Chrome, Firefox, Playwright, and wkhtmltoimage were absent). No original-site screenshots were invented. See [`baseline/README.md`](./baseline/README.md).
- The required viewport matrix is documented for follow-up capture: mobile 320×568, 375×667, 390×844, 430×932; tablet 768×1024, 820×1180, 834×1194, 1024×1366; desktop 1280×720, 1366×768, 1440×900, 1920×1080; wide 2560×1440.

## Known legacy issues intentionally not fixed

- Several homepage slide links are literally empty (`href=""`) for Virtual Reality, Augment Reality, Animation, Brand Advertisement, and Media Production; retained in captured markup/behaviour rather than “fixed”.
- Service-detail templates have empty sources/links in captured source and render mostly numbered/placeholder sections.
- The live sitemap advertises `works types-sitemap.xml`, whose literal-space URL returns HTTP 404.
- `/works/<legacy-slug>` and several `/[service]/about.html` / `awards.html` template links are live 404 pages; local route table preserves the captured 404 result.
- Malformed current taxonomy URL paths containing a literal space (`/works%20types/...`) return homepage-like content; preserved as routes.
- Contact endpoint/action is `/contact-us/` while source form metadata represents Contact Form 7; no backend was recreated and no submission was performed.
- One homepage MOV (310 MB) and Unity data/wasm build artifacts are not archived locally; exact original sources are recorded.
- Tracking IDs exist in source but are intentionally not included in the local app runtime.

## Security note

- No credentials, API keys, or secrets were found/copied. Analytics identifiers are not runtime configuration.
- Remote raw markup is not injected as HTML. Script/event attributes are dropped by the renderer. Forms prevent network submission in this local-only baseline.

---

## About page repair notes — 2026-10-05

### Root cause, evidence, and scope

The active `/about/` investigation first disproved a blank-root diagnosis: five-viewport browser probes found HTTP 200, a non-empty local root, the source H1/copy, 101 About `.reveal-text` elements, and the source background video. Computed-style comparison with live then identified the actual issue. The captured live inline About CSS hides `.reveal-text`; live later runs its page-inline split-text + GSAP/ScrollTrigger initializer, setting in-viewport items visible. The safe allowlisted React renderer correctly excludes arbitrary extracted scripts, so that one page initializer had no local equivalent.

The repair is deliberately page-scoped:

- `src/components/AboutReveal.tsx` reproduces the captured line splitting, viewport reveal, and rotating-location behavior only when the `/about/` content root carries `data-about-page-reveal`.
- `src/app/App.tsx` uses that initializer and the existing source-shaped `SiteFooter` only for `/about/`; it does not alter another legacy page’s markup or lifecycle.
- `vite.config.ts` adds the observed WordPress canonical `/about` HTTP 301 to `/about/`. Before this About-specific correction the no-slash address reached the generic React 404 record; live returns that 301.
- No animation library, arbitrary HTML/script execution, tracker, form handling, server-side feature, redesign, or production change was added.

The source About inline page scripts were inspected in `docs/live-html/about/index.html`. The local equivalent keeps the two visual behaviors needed for content visibility without enabling the live page’s unrelated third-party/plugin/analytics script stack. Asset paths, MIME/status evidence, and the content boundary are recorded in [`ABOUT-ASSET-MAP.md`](./ABOUT-ASSET-MAP.md).

### Verification

`about-verification.json` is the completed browser record. It covers direct `/about/`, refreshed `/about/`, a fresh-context `/about` 301 alias, real homepage menu navigation, Back/Forward, complete reveal scrolling, local console/network assertions, and live/local section geometry at 390×844, 430×932, 834×1194, 1440×900, and 1920×1080. All listed checks passed. The saved `baseline/about-verified-*` images are the corresponding comparison and Around-section captures.

| About acceptance area | Verified status |
|---|---|
| Route: `/about/` 200; `/about` canonical 301 → `/about/`; refresh/new context | **PASS** |
| Content: title, source copy, section order, header/footer | **PASS** |
| Assets: logo, source video, fonts/stylesheets | **PASS** |
| Navigation: homepage click and Back/Forward | **PASS** |
| Interactions: reveal and rotating locations | **PASS** |
| Responsive: 390×844, 430×932, 834×1194, 1440×900, 1920×1080 | **PASS** |
| Local console / network | **PASS — zero local errors; no unexpected failed request or HTTP ≥400** |
