# Angel Creations — Phase 2 Implementation Log

This log follows the forensic audit in `PHASE-2-FORENSIC-AUDIT.md`. It records only implemented, locally verified work.

## Preserved

- The original black/near-black environment, warm caption accents, local Angel typography, numbered full-screen homepage progression, thin-rule language, video-led media, logo treatment, vertical menu concept, and unusual sparse composition.
- The seven-slide order, propositions, directional reveal, and manual Prev/Next model.
- Existing source routes and captured legacy content remain the migration evidence; no generic homepage/services/portfolio reconstruction has been introduced.

## Implemented in Phase 2

### 1. Production-safe static fallback delivery

The audit found that static route documents were semantic but could become the degraded human experience on static hosting because they lacked the React entry and archived CSS links.

The post-build generator now creates route documents that:

- retain source-qualified fallback content inside `<noscript>`;
- expose unique title, description, canonical, robots, OG metadata, and H1 to non-JS/crawler contexts;
- include the generated Vite module and CSS assets plus original archived local CSS, so JavaScript-capable direct visitors boot the same enhanced React application on every route;
- preserve direct static delivery for core routes and the eight capability routes;
- maintain the unique 22-URL sitemap and robots file.

### 2. Truthful capability structured data

Each static capability route now emits parseable, canonical-only JSON-LD for:

- `WebPage`
- `BreadcrumbList`
- `Service`

The Service schema states only the named source-qualified Angel capability and its existing overview. It contains no client, outcome, award, location, or performance claims.

### 3. About motion hardening

`AboutReveal.tsx` now:

- respects `prefers-reduced-motion` without splitting or hiding source text;
- exposes the original About content immediately for no-motion users;
- uses transform-only line movement for motion-enabled visitors;
- reduces source-style line timing to a more deliberate 900 ms / 120 ms stagger;
- unobserves content after revelation;
- clears every tracked timeout, animation frame, interval, observer, and visibility listener;
- pauses rotating-word work while the document is hidden.

The visual motif is retained; its implementation is more disciplined and less fragile.

### 4. Critical-route data loading

The 833 KB captured legacy page dataset remains source-of-truth, but no longer competes with the initial Angel home stage:

- Home delays loading the legacy archive until true idle (5 s fallback), rather than beginning immediately after first paint.
- The eight standalone capability routes do not request the legacy capture at all.
- Captured data loads immediately only when a legacy source route requires it.

Current build profile: main entry ~192 KB uncompressed / ~61 KB gzip; the legacy capture remains an on-demand ~855 KB / ~55 KB gzip chunk.

### 5. Work archive media discipline

- Generated local WebP versions for all 47 authentic work thumbnails.
- The source JPEG set is ~4.01 MB; WebP derivatives are ~1.85 MB, a 53.8% byte reduction while retaining original dimensions.
- Work and capability visual examples now use `<picture>` with a WebP source and original JPEG fallback.
- The interactive archive initially renders 12 source records and reveals further records in 12-item increments; filtering resets the exploration window.
- Exact titles, descriptions, URLs, categories, dates, duration, view/like/status data, and 47 source URLs remain intact internally and in the static archive.
- No YouTube iframe is mounted by the archive.

### 6. Hero remote-media guard

The historic Media Production slide is a verified remote QuickTime source of approximately 310 MB. It is explicitly marked remote and receives `preload="none"` until it is the active selected slide. The six local authentic slide films remain poster-first.

### 7. Slider semantic correction

The slider accepts a one-intent queue while its cinematic transition completes. The controls are therefore no longer marked `aria-disabled` during transition; their container now exposes `aria-busy` instead. This avoids claiming a control is unavailable while it remains intentionally operable.

### 8. Local enquiry honeypot

A visually/inert hidden honeypot was added to the existing source-style sequential enquiry flow. It provides modest local automated-fill friction and avoids including the trap in a prepared mail draft. It does **not** claim to provide backend rate limiting, sanitization, or delivery because no endpoint is configured under the standing no-submission constraint.

## Build and production-like validation

- `npm run build` passes TypeScript, Vite, and static generation.
- 22 generated HTML documents: root plus 13 core and 8 capability route documents.
- Every static route document contains `#root`, a Vite module asset, generated CSS asset, archived CSS link, `<noscript>` fallback, canonical, and semantic H1.
- Vite production preview returned HTTP 200 for root, core routes, every capability route, `robots.txt`, and `sitemap.xml`.
- Direct route documents reference live HTTP-200 module/CSS assets.
- Generated JSON-LD parses without errors; detected schema types include `WebPage`, `BreadcrumbList`, `Service`, and preserved source schema types. No generated stale `.html` URL or duplicate sitemap entry was found.
- Work audit: 47 records, 47 exact unique YouTube URLs, 47 WebP thumbnail counterparts, and no archive iframe.

## Remaining source-/environment-dependent work

- A real endpoint is required before server-side validation, true sanitization, rate limiting, email delivery, spam verification, and honest sent-message confirmation can exist.
- The active source tree does not substantiate additional standalone product pages for The Virtual Life or Immersive Wedding Invite; none were fabricated.
- Browser-based screenshot, touch, assistive-technology, contrast-over-video, and supplied viewport QA remains blocked in this sandbox by the installed Chromium runtime’s missing `libnspr4.so`. Build, route, asset, metadata, and static-delivery checks are complete but are not falsely presented as visual/accessibility certification.
- No deployment, hosting, DNS, analytics, Search Console, remote repository, or production configuration has been touched.
