# Angel Creations — Phase 2 Forensic Audit

**Date:** 2026-10-05  
**Scope:** active local React/Vite implementation, preserved source baseline, generated production build, and live public homepage read.  
**Rule applied:** this document records findings before Phase 2 implementation work. It is not a redesign brief.

## 1. What the original Angel site is doing

The live public homepage still presents the defining Angel proposition: seven numbered full-screen capability slides, low-left captions, dark moving-image media, a sparse Prev/Next control, and a video-backed navigation treatment. The live source sequence is:

1. Metaverse
2. Mixed Reality
3. Virtual Reality
4. Augment Reality
5. Animation
6. Brand Advertisement
7. Media Production

The public homepage inspection confirms the local migration correctly preserves the original hero propositions and ordering. It also confirms a legacy limitation: the original public homepage only supplied a destination for the first two slides; remaining slide labels resolve to the home page. The active local build intentionally corrects those known routes without altering the visual/interaction concept.

## 2. Implementation inventory

| Area | Current implementation | Audit result |
|---|---|---|
| Runtime | React 18 + Vite + TypeScript; no added UI framework | Appropriate. No dependency-led redesign pressure. |
| Source page archive | `src/data/pages.json`, 55 captured routes: 32 status-200, 23 status-404 | Authoritative legacy content source; 833 KB is intentionally code-split. |
| Renderer | `ContentBlocks.tsx` allowlists captured markup and blocks script execution | Good migration safety boundary. Captured style tags still warrant narrow review. |
| Home | `HomeSlideshow.tsx`, 7 numbered original slides | Original composition, slide order, and directional reveal retained. |
| Navigation | `Header.tsx`, logo bar/vertical menu/video-backed overlay | Original navigation philosophy retained; current enhancement adds accessible dialog behavior. |
| About | Legacy markup plus `AboutReveal.tsx` | Original reveal/rotating-word treatment preserved, but needs motion-preference hardening. |
| Contact | `ContactWizard.tsx` | Source-style sequential enquiry flow now captures required qualified fields without pretending to submit to a missing backend. |
| Work | `videoArchive.json`, 47 exact public source records and 47 local thumbnails | Data integrity is good; presentation is lazy-loaded and avoids video iframe overload. |
| Capability depth | Eight new source-qualified capability routes + About index | Added inside Angel’s dark / numbered / thin-rule language, not as a separate service-card system. |
| Static fallback | Post-build generator creates 13 core and 8 capability documents | Semantics/metadata exist; see critical deployment finding below. |
| SEO artifacts | sitemap: 22 distinct URLs; robots allow policy; source JSON-LD parse check | No detected stale `.html` URLs or duplicate sitemap URLs in generated artifacts. |
| Server/API/PHP | None in the local implementation | No endpoint, secrets, PHP warnings, analytics, or third-party tracker executed locally. |

## 3. Skills and design-review references

Installed and reviewed relevant local skills include `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `mobile-native`, `break-ui`, `prototype`, `ui-ux-pro-max`, and `apple-design`.

There is no separate installed `apple-motion` directory. Apple Design’s motion/accessibility guidance is available and is treated as an interaction-quality reference only—not a visual template. The Angel preservation rule overrides any generic recommendation.

## 4. Visual and motion audit

### Preserved visual DNA

- Black/near-black immersive field, white/soft-white typography, restrained warm caption accent.
- Numbered full-viewport progression, low-left caption placement, thin-rule language, and unusual sparse composition.
- Original local font family mapping: Geograph, Geograph Edit, Graphik, and geographweblight.
- Video as the visual authority rather than stock/AI imagery, cards, bento structures, or a new conceptual universe.

### Existing/home enhancement state

- Source-faithful directional width reveal and counter-moving media remains the slide transition.
- Manual navigation is retained; no automatic slide advance was added.
- Keyboard arrows, touch swipe, live slide status, queued interruptions, active/adjacent media lifecycle, focusability, reduced-motion branch, and poster-first behavior for six local hero films are implemented.
- Menu focus containment, Escape, focus return, closed-state inertness, and menu media pausing are implemented.

### Motion risks requiring Phase 2 correction

1. `AboutReveal.tsx` always initializes line/letter choreography and interval-driven rotating words. It does not yet respect `prefers-reduced-motion`, and uses nested timeouts that are not all tracked for cleanup.
2. The retained slider width reveal necessarily changes width during its one intentional cinematic transition. It should remain the exception; all surrounding feedback must stay transform/opacity-first.
3. Real-browser visual verification is still outstanding because the sandbox Chromium runtime lacks `libnspr4.so`. Build/static/curl checks are not substituted for visual or assistive-technology validation.

## 5. Media and performance audit

### Asset reality

- Local hero sources include authentic Angel films.
- Largest local hero media: Metaverse ~35 MB; Augmented Reality Showroom ~14 MB; menu film ~8.8 MB.
- One historic Media Production source remains a remote QuickTime video. A direct HEAD request confirms it is approximately 310 MB. The active build must keep its honest fallback and must never eagerly load it.
- Six local hero posters and the menu poster are extracted from the corresponding authentic local source films.
- Work thumbnails are local and no YouTube iframes are mounted by the archive.

### Current build profile

| Asset | Built size | Interpretation |
|---|---:|---|
| Main entry JS | ~190 KB uncompressed / ~61 KB gzip | Improved from the earlier all-in-one ~1 MB entry. |
| Deferred legacy page data | ~855 KB uncompressed / ~55 KB gzip | Captured source archive is deferred after first paint. |
| Deferred video archive data | ~74 KB uncompressed / ~16 KB gzip | Loaded only for Work/capability detail use. |
| Main CSS | ~22 KB uncompressed / ~5 KB gzip | Acceptable enhancement layer over existing archive CSS. |

### Findings

- The home route remains immediately available before legacy-page content data is requested.
- The lazy request is scheduled after first paint but has a short idle timeout; it may still compete with hero media on constrained networks. This deserves a measured, route-aware preload strategy rather than a broad eager load.
- The work archive correctly uses local thumbnails, `loading="lazy"` after the first two records, and direct YouTube links. No 47-iframe failure is present.
- Original archived CSS remains large/legacy, intentionally linked outside Vite parsing. Do not wholesale replace it; isolate overrides and avoid loading new libraries.

## 6. Responsive/accessibility audit

### Already improved

- Full-stage uses `svh`/`dvh` safeguards and safe-area-aware mobile controls.
- Slider supports arrows, swipe, live status, named controls, and reduced motion.
- Overlay navigation has dialog semantics, focus containment, Escape, focus return, and scroll lock.
- Contact fields have labels, specific input types/autocomplete, focus/error states, 16px-safe input sizing, and progress announcements.
- Work archive media is decorative where the adjacent exact title provides the accessible destination name.

### Remaining risks

- Static source markup may contain duplicate IDs/nested landmarks inherited from legacy captures. The renderer is safe from arbitrary scripts but does not normalize every legacy structural issue.
- About reveal needs a no-motion path that exposes its source text without DOM splitting/hidden state.
- No automated browser, screen-reader, or viewport screenshot suite can execute in this environment yet; all listed responsive viewport targets remain manual QA requirements.
- Color contrast over moving video must be frame-tested in a browser, not assumed from overlays alone.

## 7. SEO / static delivery audit

### Verified

- Production-like Vite preview returned HTTP 200 for `/`, `/about/`, `/works/`, `/contact/`, selected capabilities, `/metaverse/`, `/robots.txt`, and `/sitemap.xml`.
- Generated static core/capability documents contain a title, canonical, robots directive, and exactly one H1.
- Generated JSON-LD blocks: 12 parse successfully. No stale `.html` URL was found in generated HTML/XML/robots artifacts.
- Sitemap has 22 unique URLs and no duplicate `<loc>` values.
- The local app has no live analytics/tracker execution and no active PHP/AJAX form calls.

### Content integrity limitations

- Captured legacy data has sparse descriptions on most source pages. Static fallbacks therefore use only real captured text, not invented SEO paragraphs.
- `/metaverse/` lacks an original captured canonical, so the static generator correctly resolves it to the known canonical route rather than emitting a blank canonical.
- Capability static pages have truthful metadata and content but currently no specific JSON-LD. `WebPage`, `BreadcrumbList`, and narrowly-scoped `Service` schema can be added without inventing proof.

### Critical Phase 2 finding — static fallback delivery

The generated route documents currently contain static no-JavaScript content but **do not include the built React module script or the archived CSS links**. On a conventional static host that prefers `/about/index.html`, a JavaScript-enabled human could receive the fallback document instead of the enhanced interactive React page.

**Required correction:** generated route documents must include the same Vite entry assets and preserved archived stylesheet links as `dist/index.html`, mount React into `#root` when JavaScript is available, and keep the source-qualified content inside `<noscript>` for no-JS/crawler fallback. This preserves crawlability without making the static fallback the degraded default human experience.

## 8. Conversion/enquiry audit

- Required fields and Project type choices are present.
- Validation is client-side and the final state is honest: it prepares a user-triggered mail draft instead of falsely reporting server delivery.
- No server endpoint exists, so true backend sanitization, rate limiting, spam controls, or submission confirmation cannot truthfully be claimed or implemented under the standing no-production/no-form-submission constraint.
- A local-only honeypot can improve accidental/bot friction without implying backend protection, but it cannot provide rate limiting.

## 9. Content/source constraints

- The 47-video data is authoritative and hash-verified against the preserved capture. Exact title/description/URL fields and local thumbnail coverage are intact.
- Existing source material supports immersive capability labels, animation, media production, live-event references, and project-based team language.
- It does **not** yet substantiate newly authored product pages for The Virtual Life or Immersive Wedding Invite in the active source tree. These must remain absent/pending rather than invented.
- No geographic doorway pages, fake offices, testimonials, client outcomes, awards, metrics, or fabricated case studies have been added.

## 10. Phase 2 implementation priorities

1. Correct production static route documents so JavaScript users receive the enhanced app while no-JS users/crawlers retain semantic fallback content.
2. Add truthful `WebPage`/`BreadcrumbList` and tightly scoped `Service` JSON-LD for capability routes, with canonical-only URLs.
3. Harden About motion for reduced motion, visibility, and cleanup; preserve the existing reveal language for users who allow motion.
4. Make legacy content data route-aware to avoid unnecessary post-paint competition on the homepage while keeping direct routes dependable.
5. Add locally safe enquiry honeypot/status refinement; do not claim server-side spam/rate protection.
6. Complete production-like route/asset/metadata checks after every change, then conduct real visual/mobile/assistive QA when an executable browser environment is available.

## 11. Explicit non-actions

No deployment, remote repository change, DNS change, hosting change, PHP endpoint, analytics, Search Console configuration, fake content, fabricated project proof, or new design concept has been introduced.
