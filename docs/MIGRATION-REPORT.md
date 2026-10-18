# ANGEL CREATIONS — MIGRATION REPORT

**Phase:** 1 — Forensic Copy + React Migration  
**Principle applied:** Preserve first. Redesign later.  
**Live site inspected read-only:** `https://angelcreations.in/`  
**Capture date:** 2026-10-05

## 1. Live Site Inventory

- **Total URL records discovered:** 57
- **HTTP 200 records:** 34
- **HTTP 404 records:** 23
- **HTML route records reconstructed:** 55
- **Utility XML records preserved:** 2 (`/feed/`, `/comments/feed/`)
- Discovery used robots, sitemap index/children, WordPress REST page/post/custom-type discovery, internal navigation/source links, and an intentional 404 check.

See [URL Inventory](./URL-INVENTORY.md), [Site Structure](./SITE-STRUCTURE.md), [raw HTML/XML](./live-html/), and [page records JSON](./page-records.json).

## 2. Pages Migrated

All 55 captured HTML path/query records are represented in the React static route data, including:

- Home; About; Contact; Works; six published Work entries
- Metaverse; 360 video; Metaverse/Mixed/Virtual/Augment Reality; Animation; Brand Advertisement; Media Production
- Privacy Policy; Terms of Service; Test; Enter Metabox; Hello World
- Search root/pagination, category/author archives, existing slashless aliases
- Existing linked legacy `.html` and work-slug paths that return live 404 templates
- Existing literal-space taxonomy-like paths that return homepage-like content live

The two RSS XML responses are retained as source evidence, not reinvented as React HTML pages.

## 3. Assets

| Kind | Downloaded |
|---|---:|
| Images | 15 |
| Videos | 7 |
| Fonts | 53 |
| SVG | 4 |
| Logos | 4 |
| Icons (decoded from captured original inline data URIs) | 3 |
| Other CSS/JS/template files | 27 |

- **Archived first-party asset bytes:** 75,598,135 bytes.
- Assets live under `public/legacy-assets/`, retaining their filename/path wherever feasible.
- Asset URL, local path, type, bytes, dimensions where applicable, and page references: [Asset Inventory](./ASSET-INVENTORY.md). Video/autoplay/panorama/Unity details: [Video Inventory](./VIDEO-INVENTORY.md).

## 4. Scripts

- **Distinct external/local script source URLs:** 20
- **Local source assets archived:** theme bundle, WordPress helpers, Contact Form 7, panorama/Three/Panolens assets, and related local JS.
- **External sources recorded:** Google Analytics/Tag Manager, jQuery, jQuery Validate, Slick, Owl Carousel, Font Awesome and Google Fonts.
- Critical legacy behaviours identified: custom theme animation bundle (Modernizr, GSAP/ScrollTrigger, Barba, Locomotive-like scrolling, Splitting), contact wizard, panorama block, Unity WebGL page.
- The local baseline does **not** run analytics, GTM, or the original untrusted legacy script bundle.

See [Script Inventory](./SCRIPT-INVENTORY.md) and [External Dependencies](./EXTERNAL-DEPENDENCIES.md).

## 5. Forms

- **Contact:** source is an eight-step Contact Form 7-flavoured form posted to `/contact-us/#wpcf7-f518-p519-o1`; it has client-side required/email validation and a client-side 1-second success replacement. No production submission was sent.
- **Local React baseline:** reproduces the visible eight-step flow/validation/success state but prevents network submission, preserving the local-only safety requirement.
- **Other forms:** the test page and WordPress comment/404 templates are represented in captured page data; no backend/comment endpoint was recreated.

## 6. SEO Baseline

- Original page titles, descriptions, canonicals, robots values, Open Graph/Twitter values, and captured JSON-LD are stored per page.
- React applies the captured page SEO fields when client route changes, without adding an SEO redesign/fix.
- Original `robots.txt`, sitemap discovery, Yoast indicator, schema observations, H1s and canonical inconsistencies are documented in [SEO Inventory](./SEO-INVENTORY.md).

## 7. Responsive Baseline

- CSS-observed breakpoints: 1727, 1400, 1200, 1199, 1024, 991, 767 and 600px.
- Original responsive CSS is preserved locally and linked untransformed so historical syntax is not cleaned up by Vite.
- **Screenshot/browser validation is unresolved:** no browser binary/automation was available. No screenshots were fabricated. See [baseline limitation and capture matrix](./baseline/README.md).

## 8. Legacy Dependencies

- WordPress + Fleava theme + Elementor + Yoast SEO Premium + Contact Form 7
- Panorama plugin, Three.js and Panolens for 360 media
- Unity WebGL build for Metaverse
- Legacy jQuery, Slick, Owl Carousel, jQuery Validate, Font Awesome, Google Fonts

## 9. Routes

- Direct production-server checks passed for **55/55** HTML route records.
- Original → React route mapping and route recommendations are in [Redirect Inventory](./REDIRECT-INVENTORY.md).
- No production redirects were changed or decided.

## 10. Known Legacy Issues

Preserved, not corrected:

- Empty homepage anchor destinations for five service slides.
- Blank/placeholder service templates and repeated generic work copy.
- Live sitemap entry with literal space returns 404.
- Dead service `about.html`/`awards.html` links and many work-slug links return 404.
- Literal-space taxonomy paths return homepage-like content.
- Existing duplicate slash/no-slash legal routes.
- Contact source endpoint mismatch and no recreated backend.

See the complete list in [Migration Notes](./MIGRATION-NOTES.md).

## 11. React Architecture

```text
src/
├── app/App.tsx                 # route selection, page shell, SEO/body class lifecycle
├── components/
│   ├── Header.tsx              # preserved global header/overlay-menu interaction
│   ├── HomeSlideshow.tsx       # seven original text/video slides + Prev/Next
│   ├── ContactWizard.tsx       # local non-submitting eight-step legacy form behaviour
│   ├── PanoramaPage.tsx        # source-preserving 360 fallback
│   ├── MetaversePage.tsx       # original Unity shell/loader bridge
│   ├── LegacyRenderer.tsx      # allowlisted typed source DOM renderer
│   └── LegacyFooter.tsx
├── data/legacyPages.json       # generated typed-safe capture representation
├── styles/baseline.css         # local font mapping + minimal React state parity
├── types/legacy.ts
└── utils/{routes,seo}.ts
```

No UI library, animation library, router package, CMS, state manager, backend, or database was introduced.

## 12. Build Result

- `npm install`: passed.
- `npm run build`: passed with TypeScript and Vite 6.4.3.
- `npm audit --json`: 0 vulnerabilities.
- Vite has one non-fatal bundle-size advisory because page capture data is deliberately included locally.
- Complete details: [Validation](./VALIDATION.md).

## 13. Visual Parity Result

**Not fully verified.**

Preserved visual ingredients include original local CSS, original locally archivable fonts/assets/videos, original page structure/content, legacy breakpoint rules, and a React recreation of the menu and slideshow state classes. However, pixel/viewport comparison was not possible in this workspace because browser automation was unavailable. The required original-vs-local captures at 390×844, 834×1194, 1440×900 and 1920×1080 remain a follow-up verification task.

## 14. Functional Parity Result

**Partially verified.**

- HTTP-level direct routing verified: 55/55 HTML route records return the local app.
- Implemented in React: global overlay navigation, page-local route navigation, homepage Prev/Next slideshow, local contact wizard validation/progression/success state, source page content rendering, and local asset references.
- Not browser-verified: animation timing, hover/cursor behaviour, mobile interaction, video playback, actual Unity loading, panorama controls, and console cleanliness.

## 15. Missing / Unresolved Items

1. **310,558,720-byte homepage MOV:** exact first-party source recorded; omitted from local archive due an archival size safeguard.
2. **Unity data/wasm binaries:** loader/framework identified, but `.data`/`.wasm` binaries could not be safely archived because size was not exposed and would exceed workspace safeguards. The local route uses the original remote build URL as a best-effort bridge; it may be CORS/network dependent.
3. **360 panorama media/runtime:** config/source is inventoried; local archive lacks the required panorama media bundle. A visible source-preserving fallback is used and limitation documented.
4. **Third-party resources:** external sources are recorded but not bundled; no third-party tracking runs locally.
5. **Screenshots, visual diff, browser console:** not available in this workspace; explicitly not claimed complete.
6. **RSS exact serving:** preserved in raw source evidence; Vite SPA does not reproduce the original XML response content type at `/feed/`/`/comments/feed/`.

## Stop Condition

Stopped after forensic preservation, React/Vite/TypeScript reconstruction, build validation, and explicit issue documentation. **No redesign work was begun.**
