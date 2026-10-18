# Functional Parity — final repair record

**Audit date:** 2026-10-05  
**Scope:** functional parity repair only. No production changes, redesign, new feature work, form submission, deployment, Git initialization, or source-host modification.

## Final status

| Area | Status | Executed evidence |
|---|---|---|
| Homepage slider | **PASS, with live-defect caveat** | `slider-functional-after-repair.json`; `slider-wrap-dispatch-compare.json`; `slider-style-after-repair.log` |
| Generic inner-page rendering | **PASS** | 57 inventory URLs direct-loaded/refreshed in `route-browser-after-repair.json` |
| Direct route/refresh/status behavior | **PASS — 228/228** | 57 routes × desktop/mobile × direct/refresh; expected 200/404 response statuses verified |
| Clicked internal links | **PASS — 82/82** | `clicked-link-audit-after-repair.json` |
| Logo and browser history | **PASS — 108/108 logos; 2/2 history flows** | `logo-history-after-repair.json` |
| Contact wizard step behavior | **PASS** | `contact-wizard-after-repair.json` |
| 360 panorama runtime | **PASS** | `panorama-runtime-after-repair.log` |
| Unity same-origin local runtime bridge | **PASS** | final Unity desktop and iPhone-UA probes; see `NETWORK-PARITY.md` |

## Homepage slider

### Browser-confirmed source behavior

Live and local were compared at 1440×900 and 390×844. Both have:

- **7 slides**, in the same order and with the same label/copy order.
- Initial active slide 0 and all seven slides marked `is-loaded`.
- No `autoplay` attribute and no automatic slide change after the idle observation period.
- No ArrowRight keyboard behavior and no slider-specific synthetic touch-swipe behavior.
- Next/previous controls, forward/backward wrap (0 ↔ 6), and a `wait="true"` concurrency guard.
- Incoming video play approximately 500 ms after navigation and outgoing video pause approximately 700 ms after navigation.
- A 1.5-second temporary `is-new` reveal layer followed by a 300 ms wait-guard release.

The final local test shows the same state pattern: active 0 during a next transition with incoming slide 1 `is-new`; active 1 after completion with `wait="false"`; Previous reaches 0; previous-wrap reaches 6; next-wrap reaches 0. The dedicated deterministic click-listener comparison validates all wrap steps at desktop for both local and live.

### Fixed slider root causes

1. **Control placement:** the source desktop control placement depends on LocomotiveScroll’s runtime transform for `data-scroll-speed="-9"`. The migration retained the CSS (`top:85vh` and `padding-top:60vh`) but removed that runtime, placing local controls around y=1305 rather than source y≈754. A narrow desktop transform restoration produces the live-computed `matrix(..., -551.25)` at 1440×900. Mobile keeps the source `transform:none` geometry.
2. **Lifecycle/transition:** the prior React state swap was an instantaneous generic carousel. `HomeSlideshow` now reproduces the source `slideShow()` semantics: initial `is-loaded`, directional zero-width reveal, image-container parallax/opacity, caption staggering, exact guard lifecycle, delayed video start/pause, and wrap direction. No carousel library was introduced.
3. **Controls:** the local controls are physically on-screen and pointer-clickable at desktop and mobile after the placement repair.

### Live caveat retained

Current live production’s `#loader-wrapper` intermittently covers the desktop slider control hit-test even though the control geometry is in viewport. Its listener still produces the source state transition when invoked. This legacy/live overlay issue was observed and recorded, not copied into the local repair; the requested local control-placement regression is fixed.

## Inner pages

### Fixed root cause

The generic archived-page renderer passed extractor-retained whitespace children into HTML void tags such as `<br>` and `<source>`. React throws invariant **#137** for that invalid tree. Browser evidence before repair showed blank roots on `/about/`, `/works/`, `/animation/`, and work entries, with the minified React error naming `br`/`source`.

`LegacyRenderer` now emits void tags with props only. After the change, the final desktop/mobile direct and refresh audit reports no root-render failure and no unexpected local console/page error across all rendered inventory routes.

### Additional functional repairs found during browser testing

- WordPress empty-search pagination aliases (`?s` versus captured `?s=`) now render the captured result page without rewriting the clicked address.
- The two captured RSS documents are served as preserved XML at their original routes.
- The archived Panorama runtime is initialized instead of a flat-video replacement.
- The local Unity bridge preserves source paths while eliminating the local cross-origin fetch failure.
- Captured 404 routes now carry HTTP 404 as well as the source 404 content; unknown URLs are not routed to home.

## Navigation, menu, responsive behavior

- The primary visible menu links are the source `mobile_link` items. About, Works, and Contact were explicitly clicked at desktop/mobile; Terms and Privacy were clicked at desktop. Their mobile physical-hit-test limitation is the observed source defect recorded below.
- Every header-bearing page context was tested for menu-to-About navigation at desktop/mobile (108 checks); 106 standard contexts completed physically. The two mobile exceptions are current-live layout defects listed below.
- 108 logo interactions and desktop/mobile Back/Forward are verified in the route evidence.
- The source form was not submitted. Local contact navigation/validation behavior was exercised only through safe client-side steps.

## Preserved current-live defects / unresolved deployment work

These are real observed source behaviors, not local migration regressions:

1. Mobile `/360-video/`: the source 1920×1080 panorama canvas covers the menu hit target.
2. Mobile `/hello-world/`: a legacy footer covers the menu hit target.
3. Opened mobile-menu legal links are beyond the viewport horizontally in local and live.
4. Current live Unity sends its WASM under an incorrect MIME type and reports a warning; the local preview bridge corrects the local response only.
5. The final Vite preview behavior for RSS, captured 404 statuses, and remote runtime bridges requires analogous server rules when hosted elsewhere. No hosting/server configuration was changed here.

## Files changed for this repair

- `src/components/LegacyRenderer.tsx`
- `src/components/HomeSlideshow.tsx`
- `src/components/PanoramaPage.tsx`
- `src/components/MetaversePage.tsx`
- `src/app/App.tsx`
- `src/styles/baseline.css`
- `vite.config.ts`
- `public/legacy-assets/other/feeds/feed.xml`
- `public/legacy-assets/other/feeds/comments/feed.xml`

## Broken URLs

**Local migration:** none in the final 57-route direct/refresh audit. The 23 source-captured 404 URLs intentionally remain 404 and are counted as correct behavior.

**Not inventable as clicked content links:** raw feed endpoints, the forensic 404 URL, and several legacy extension endpoints have no source-rendered anchor. They were direct/refresh-tested instead of being added to the UI.

---

## About page — verified repair (2026-10-05)

**Status: PASS.** This focused repair was completed after the baseline audit. The complete machine-readable execution record is [`about-verification.json`](./about-verification.json); source/local request and asset evidence is [`about-assets-probe.json`](./about-assets-probe.json), with the mapping in [`ABOUT-ASSET-MAP.md`](./ABOUT-ASSET-MAP.md).

### Diagnosed cause and minimal repair

`/about/` was not missing from the local React data and was not a root-render exception after the previous void-element fix. Browser inspection found the exact source About DOM, seven non-empty source headings, source video, and 101 `.reveal-text` nodes in the local document. The remaining visual defect was source CSS: the captured inline About stylesheet sets `.reveal-text { visibility: hidden; }`. On live, the page’s own inline `window.load` script splits these nodes and a GSAP/ScrollTrigger timeline changes them to visible as they enter the viewport. Extracted inline scripts are intentionally not run by `LegacyRenderer`, so that initializer never ran locally.

`src/components/AboutReveal.tsx` is a narrow, About-scoped equivalent of the captured behavior. It:

- preserves the source split-to-line/word DOM behavior and reveal timing shape only inside `[data-about-page-reveal]`;
- reveals in-viewport content and exposes all 101 source reveal nodes during a complete scroll;
- restores the current live letter rotation between `Braintree, UK` and `Jaipur, IN` that was also otherwise left at source CSS `opacity:0`;
- does not execute arbitrary captured scripts or introduce an animation dependency.

The About-only render branch also appends the existing source-shaped footer, which is outside the archived page-content fragment, and the preview middleware now mirrors live WordPress’s `/about` → `/about/` HTTP 301 canonical redirect. No unrelated route/content was changed.

### Required browser matrix

At **390×844, 430×932, 834×1194, 1440×900, and 1920×1080**, all of the following passed:

| Check | Result |
|---|---|
| Fresh direct `/about/` | HTTP 200, source title/copy/video/footer present |
| Direct `/about` | HTTP 301 `Location: /about/`, then the HTTP-200 About page, matching live canonical behavior |
| Refresh | Source content and initial in-viewport reveal restored |
| New browser context | Passed at every listed viewport |
| Actual homepage menu click to About | Passed |
| Browser Back then Forward | About → Home → About passed |
| Full reveal scroll | 101/101 source `.reveal-text` nodes visible after scroll at each viewport |
| Source/local visual layout comparison | Header, all About sections, and footer geometry matched within <1 px at all five viewports |
| Local console/network | 0 page errors, 0 console errors, 0 HTTP ≥400, 0 unexpected failed requests |

The only recorded local request cancellations were `net::ERR_ABORTED` media requests when navigation/reload deliberately interrupted the source MP4 stream. They are expected browser cancellation behavior; range media requests otherwise returned `206 video/mp4` and the video reached ready state 4.

| About acceptance area | Explicit status |
|---|---|
| Route (`/about/`, `/about` canonical alias, refresh, fresh context) | **PASS** |
| Content / section order / metadata | **PASS** |
| Assets / video / source footer | **PASS** |
| Navigation / homepage click / Back-Forward | **PASS** |
| Reveal and rotating-location interactions | **PASS** |
| Responsive five-viewport geometry | **PASS** |
| Local console | **PASS — zero errors** |
| Local network | **PASS — no unexpected failure or HTTP ≥400** |
