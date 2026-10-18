# Angel Creations — Homepage Slider → Inner Pages Red Team

**Completed:** 2026-10-05  
**Method:** map first, implement second, then attack route/data/static output. Phase 2/3 findings remained relevant and were not assumed away.

## Environment blocker

Browser QA is **BLOCKED**. Both installed Playwright Chromium executables terminate before launch with:

```text
error while loading shared libraries: libnspr4.so: cannot open shared object file
```

Therefore no browser screenshot, exact viewport render, touch swipe, actual Back button, keyboard focus traversal, media-query toggle, console, network waterfall, screen-reader or live video-crop result is claimed below. Source/static/HTTP checks are identified as such.

## Attack scorecard

| ID | Severity | Attack / reproduction | Finding and repair | Retest status |
|---|---:|---|---|---|
| HP-001 | P1 | Compare the current homepage source against proposed route data. | Created a single seven-record map from the existing slider. It preserves exact order, slide labels, captions, videos/posters and routes. Home reads that map rather than a second hard-coded sequence. | **PASS** — 7 records, 0 field gaps, 0 duplicate routes, exact existing route order. |
| HP-002 | P1 | Load each slider route’s generated static document without relying on React. | Existing captured route bodies were thin Featured Stories shells or, for AR, an unrelated legacy work-list shell. Replaced fallback bodies with source-qualified inner-experience content. | **PASS** — all seven documents contain H1, source content, Work/related-area logic, CTA and adjacent journey links. |
| HP-003 | P1 | Trace Home → slide destination → browser Back state through source/history. | Homepage state previously lived only in the mounted slider, so a Back return would initialize at slide 01. Home now writes `angelSlide` to its current history entry before a doorway navigation; initial state reads it back. | **SOURCE PASS / BROWSER BLOCKED** — state plumbing is present on slider change/caption click and inner navigation; live Back action cannot run. |
| HP-004 | P1 | Inspect direct inner-route media behavior, especially slide 07. | Route-level inner pages now keep local slide posters/film language. Remote Media Production remains dormant behind an explicit activation action with `preload="none"`; inactive homepage slide guard is unchanged. | **PASS (source/HTTP)** — 6 local poster/video pairs return 200; remote asset was deliberately not fetched. Browser playback remains blocked. |
| HP-005 | P2 | Search inner source/data for fabricated projects, iframe embeds, and non-title work matching. | Work matching is limited to explicit published-title terms. No YouTube iframe was added; source thumbnail/description/URL are retained. No match means no displayed project. | **PASS** — no iframe/embed literals; Metaverse/Mixed Reality make no unsupported work assertion. |
| HP-006 | P2 | Crawl titles, description, canonical, H1, schema and links for all seven output paths. | Each route now emits route-specific metadata and WebPage/BreadcrumbList JSON-LD, rather than the stale captured page title/shell. | **PASS** — 7/7 return local HTTP 200; 1 H1 each; non-empty unique description; canonical exact; valid schema; no sitemap orphans. |
| HP-007 | P2 | Inspect route loading graph for an archive/data regression. | The new inner experience initially made the archive data reachable through the main component graph. It was moved behind the existing route-level lazy experience chunk. | **PASS** — main entry 200.40 kB / 62.50 kB gzip; `SliderExperience` is an 8.77 kB / 2.95 kB gzip lazy chunk; long-form route content is deferred in `MetaverseStory` (8.08 kB / 2.81 kB gzip) and `ExperienceStory` (30.89 kB / 8.66 kB gzip); archive data remains its deferred 73.86 kB / 16.06 kB gzip chunk. |
| HP-008 | P2 | Review visual implementation for a generic service template or prohibited visual layer. | Inner pages use a media doorway, number, thin rules, sequential source lists, staggered archive rows and the existing warm/dark language. No card grid, bento, glass, gradient, generic hero framework, WebGL decoration or new navigation system was added. | **SOURCE PASS / VISUAL BROWSER BLOCKED**. |
| HP-009 | P2 | Verify keyboard/reduced-motion/mobile styles from source. | Links/buttons are semantic, focus styles are supplied, remote activation is a button, page media hides under reduced motion, and a single-column mobile treatment preserves number, stage and sequence. | **SOURCE PASS / INTERACTION BROWSER BLOCKED**. |
| HP-010 | P2 | Check static fallback’s meaningfulness and asset wiring. | All seven generated documents include Vite module/CSS assets and no-JS sequence content. | **PASS** — 7/7 direct documents have live module/CSS assets and `<noscript>` content. |
| HP-011 | P2 | Verify optional preserved Unity source artifact does not become a false product claim or automatic heavy load. | MetaScore remains explicitly labelled as a captured Unity source artifact. Its runtime is lazy-loaded only after the visitor requests it. | **PASS (source)** — no new product/case-study claim and no automatic Unity loader on inner route entry. |
| HP-012 | P1 | Integrate the supplied Metaverse narrative without collapsing it into a generic card page or dropping it from no-JS delivery. | Added a dedicated lazy Metaverse story sequence: 9 experience forms, 6 experience-layer prompts, 15 contexts, source progression and 7 requested related capabilities. The generator emits the same meaningful long-form fallback. | **PASS** — `/metaverse/` has 1 H1, 9 H2s, 18 internal links, canonical/OG/schema and all supplied landmark copy in its generated fallback. |
| HP-013 | P1 | Integrate supplied route-specific long-form copy for MR, VR, AR, Animation, Brand Advertisement and Media Production; verify it does not become six generic page copies or disappear without JavaScript. | Added six distinct long-form sequences: spatial interaction, immersion/simulation, real-world discovery, moving-image creation, campaign ecosystems and production disciplines. They use one deferred renderer with their own structures, capability subsets, CTAs and static fallbacks. | **PASS** — 6/6 supplied-copy phrase probes pass in emitted HTML; H2 counts range from 9–11; no iframe/card/bento/glass literals were introduced. |

## Final machine checks

### Seven slider destinations

| Route | HTTP | H1 | Description length | Static internal links | Schema |
|---|---:|---:|---:|---:|---|
| `/metaverse/` | 200 | 1 | 167 | 18 | WebPage, BreadcrumbList |
| `/mixed-reality/` | 200 | 1 | 170 | 17 | WebPage, BreadcrumbList |
| `/virtual-reality/` | 200 | 1 | 163 | 17 | WebPage, BreadcrumbList |
| `/augment-reality/` | 200 | 1 | 170 | 17 | WebPage, BreadcrumbList |
| `/animation/` | 200 | 1 | 181 | 17 | WebPage, BreadcrumbList |
| `/brand-advertisement/` | 200 | 1 | 169 | 18 | WebPage, BreadcrumbList |
| `/media-production/` | 200 | 1 | 161 | 18 | WebPage, BreadcrumbList |

Sitewide after generation:

- 0 missing descriptions
- 0 duplicate titles
- 0 missing canonicals
- 0 H1 errors
- 0 JSON-LD parsing errors
- 0 sitemap orphan routes
- 0 static fallback images without alt attribute
- 0 inner-experience iframe/YouTube embed literals

## Required browser/host follow-up

1. Install `libnspr4.so` or use a browser-capable environment.
2. Execute the supplied mobile, tablet and desktop viewport matrix.
3. Test actual slide Prev/Next, rapid input queue, caption doorway, touch swipes, keyboard arrows, Menu focus trap, direct route media, inner Prev/Next/Home, and browser Back restoration.
4. Toggle `prefers-reduced-motion` while on home and an inner experience.
5. Inspect console and network: particularly remote Media Production and optional Unity load paths.
6. Test no-JavaScript rendering in a real browser, including all seven direct URLs.
7. Validate final deployment host 404/headers separately; local Vite preview cannot prove production server policy.

## Scope confirmation

No new industries, SEO landing pages, products, case studies, client proof, awards, statistics, testimonials, brand system, homepage architecture, alternate navigation system, backend, deployment, DNS/Hostinger change, analytics change or remote-infrastructure modification was introduced.
