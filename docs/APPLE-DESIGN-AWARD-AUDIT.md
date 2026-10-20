# Angel Creations — Whole-Website International Award & Beyond-Apple Design Audit

**Audit Date:** 2026-10-18  
**Frameworks & Skills Applied:**
1. **`dickwu/apple-design-skill`** — Apple Human Interface Guidelines (123 HIG reference pages + `liquid-glass.md`, `accessibility.md`, `typography.md`, `color.md`, `layout.md`, `motion.md`, `materials.md`, `buttons.md`, `scroll-views.md`, `writing.md`, `feedback.md`, `dark-mode.md`).
2. **`emilkowalski/skills/skills/apple-design`** — Apple WWDC Fluid Interface Design (*Designing Fluid Interfaces*, *The Details of UI Typography*, *Principles of Great Design*), translated for the Web.

---

## Executive Summary

**Overall Website Rating (Outside the Newly Redesigned 7 Slider Inner Pages):** **Critical Issues / Needs Work**  
While the **7 Homepage Slider Inner Pages** (`/metaverse/`, `/mixed-reality/`, `/virtual-reality/`, `/augment-reality/`, `/animation/`, `/brand-advertisement/`, `/media-production/`) have now been rebuilt from scratch with an interruptible harmonic spring engine (`src/utils/appleSpring.ts`), 1:1 direct-manipulation drag and momentum projection, Liquid Glass functional wayfinding chrome, WCAG AAA dark-mode contrast tokens, and bespoke spatial room architectures, **the rest of the website still carries severe legacy WordPress/Elementor technical debt, uninterruptible fixed-duration timers, 2.2:1 contrast failures, 33×13 px touch targets, dead `#` links, and non-responsive fixed-pixel layouts** that would immediately disqualify it from an Apple Design Award, Awwwards Site of the Year, FWA, or Cannes Lions Digital Craft Lion.

---

## 1. Critical Issues (Blocking International Award & Apple HIG Standards)

### C-01. Homepage Slider (`HomeSlideshow.tsx`) Locks Out User Input for 1,500 ms and Cannot Be Interrupted
- **Where:** `src/components/HomeSlideshow.tsx:4`, `src/components/HomeSlideshow.tsx:114–120`, `src/components/HomeSlideshow.tsx:194–226`
- **What:**
  - `TRANSITION_MS = 1500` runs a hard-coded `expoInOut` `requestAnimationFrame` tween over 1.5 seconds.
  - While `isWaitingRef.current === true`, all user input is locked out and queued (`queuedOffsetRef.current = offset`), setting `cursor: wait` on `.slideshow .arrows[aria-busy='true'] .arrow` (`src/styles/enhancements.css:93`).
  - Horizontal touch swipes (`onPointerDown` / `onPointerUp`, lines 242–253) provide **zero 1:1 visual tracking during the drag**—nothing moves under the user's finger until `pointerup` crosses a 48 px threshold, and mouse dragging is completely disabled (`event.pointerType === 'mouse' ? null`).
- **Why (Citations):**
  - `emilkowalski/apple-design › §3 Interruptibility — the single most important principle`: *"Never lock out input during a transition. Always animate from the presentation (current) value, never the target value."*
  - `emilkowalski/apple-design › §1 Response — kill latency`: *"Feedback must be continuous during the interaction, not just at the end. For a drag, slider, or drawer, update the UI 1:1 with the pointer the whole way through — never animate only when the gesture completes."*
  - `motion.md › Providing feedback`: *"Let people cancel motion. As much as possible, don't make people wait for an animation to complete before they can do anything."*
- **Beyond-Apple Fix:** Replace the 1,500 ms `expoInOut` lock-out tween with an interruptible `InterruptibleSpring` (`damping: 1.0, response: 0.48`) coupled with 1:1 `pointermove` tracking (`setPointerCapture`), rubber-banding, and `projectMomentum()` velocity handoff on release.

---

### C-02. Severe Color Contrast Failures (`2.23:1`) Across Global Menu, Footer, and Contact Support
- **Where:**
  - `public/legacy-assets/other/wp-content/themes/fleava/assets/css/custom.css:67–84`
  - `src/styles/baseline.css:62–65`
- **What:**
  - Footer links (`.menu_footer ul li a`), copyright text (`.footer_inner p`, `.copyright p`), social icons (`.footer_inner .soical a`), and global menu legal links (`.terms-link ul li a`) use `color: rgba(255, 255, 255, 0.3)` (`#4D4D4D`) on `#000000` — a contrast ratio of **`2.23:1`**, failing WCAG AA (`4.5:1`) by more than 50%.
  - Contact page support headings and email wrappers (`.supportmail h4`, `.downicon p` in `src/styles/baseline.css:62–65`) also use `rgba(255, 255, 255, 0.3)` (`2.23:1`).
  - Global menu trigger text (`span.text` in `custom.css:54–59`) is `font-size: 10px` with `opacity: 0` until hover, making it invisible to touch users and below the 11 pt / 10 pt platform minimum.
- **Why (Citations):**
  - `accessibility.md › Vision`: *"Up to 17 pts: All weights require 4.5:1 minimum contrast ratio; 18 pts+ or Bold require 3:1."*
  - `dark-mode.md › Dark Mode colors`: *"At a minimum, make sure the contrast ratio between colors is no lower than 4.5:1. For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text."*
  - `typography.md › Ensuring legibility`: *"iOS, iPadOS default 17 pt, minimum 11 pt; macOS default 13 pt, minimum 10 pt."*
- **Beyond-Apple Fix:** Replace all `rgba(255, 255, 255, 0.3)` text tokens with semantic secondary/tertiary dark-mode tokens (`#C8C8D2` at `12.1:1` and `#9E9EAA` at `7.5:1`) and raise micro-labels to at least `12px` (`0.75rem`) Semibold (`font-weight: 600`).

---

### C-03. Contact Wizard Navigation Buttons Are `33 × 13 px` (`src/styles/baseline.css:71`)
- **Where:** `src/styles/baseline.css:71`, `src/components/ContactWizard.tsx:169–171`
- **What:**
  - `button.prev-btn, .next-btn { width: 33px; height: 13px; }` creates a tiny `33 × 13 px` hit target (`429 sq px` vs Apple's required `44 × 44 px = 1,936 sq px`—less than **23%** of the minimum accessible target area).
  - Error text `span.error` (`src/styles/baseline.css:69`) uses `#D6041D` on `#000000`, which has a contrast ratio of **`3.78:1`** at `12px` (below the mandatory `4.5:1` for 12 px text).
  - The 10-step wizard forces users through 10 mandatory sequential screens (`name`, `company`, `email`, `phone`, `country`, `projectType`, `description`, `timeline`, `investment`, `referral`) with no overview, no ability to skip optional fields like `referral` or `investment`, and ends with a static `mailto:` link ("This preview has no delivery endpoint").
- **Why (Citations):**
  - `accessibility.md › Mobility`: *"iOS, iPadOS default control size: 44x44 pt, minimum 28x28 pt. Consider spacing between controls as important as size."*
  - `design-principles.md › Agency`: *"Give people the freedom to explore. When a guided flow is necessary, make it easy to skip or escape."*
  - `entering-data.md` & `writing.md › Best practices`: *"Show hints in text fields... Show errors right next to the field, and instruct people how to enter the information correctly."*
- **Beyond-Apple Fix:** Redesign `ContactWizard.tsx` into an Apple-grade interactive project configurator with `>= 48 × 48 px` pill controls, interactive budget/timeline segmented selectors (choices over typing), optional-step skipping, live progress scrubber, and accessible `#FF6961` (`5.6:1`) inline validation.

---

### C-04. Broken / Dead Anchor Links (`href="#"`) and Outdated 2023 Copyright in `SiteFooter.tsx` & `Header.tsx`
- **Where:**
  - `src/components/SiteFooter.tsx:5–7`
  - `src/components/Header.tsx:177–180`
- **What:**
  - In `SiteFooter.tsx`, the Privacy Policy link is `<a href="#">Privacy Policy</a>` (a dead `#` anchor instead of `/privacy-policy/`), and both social links (`Instagram`, `Facebook`) are `<a href="#">` dead links!
  - Furthermore, `.fa-brands.fa-instagram` and `.fa-brands.fa-square-facebook` rely on FontAwesome icon fonts that fail to render when the font is not loaded, leaving invisible empty `<a>` tags.
  - Both `SiteFooter.tsx` (`copyright 2023`) and `Header.tsx` (`© 2023 Angelcreations`) display stale 2023 copyright dates and inconsistent brand spelling (`Angelcreations` vs `Angel Creations`).
  - `Header.tsx:179–180` links to `/terms-of-service` and `/privacy-policy` without trailing slashes, forcing a history replacement on load.
- **Why (Citations):**
  - `design-principles.md › Craft`: *"Quality sets the tone. Every element of your design shows people how much you care."*
  - `accessibility.md › Vision`: Every icon-only or interactive link must resolve to a valid destination and render perceivable graphics.

---

### C-05. Global Navigation (`Header.tsx`) Missing 6 of the 7 Core Experiences & Uses Inline `width: '40vw'`
- **Where:** `src/components/Header.tsx:10–14`, `src/components/Header.tsx:127–131`, `src/components/Header.tsx:169`
- **What:**
  - The top bar (`link_flex`) hard-codes only two lowercase links: `metaverse` and `360 video`.
  - Opening the full-screen Menu (`#menuNav`) shows only three items (`About Us 01`, `Works 02`, `Contact 03`) with a hard-coded inline style `style={{ width: '40vw' }}` (`Header.tsx:169`) that crushes long labels on compact mobile viewports (`320px–479px`).
  - None of the other 6 homepage slider experiences (`Mixed Reality`, `Virtual Reality`, `Augment Reality`, `Animation`, `Brand Advertisement`, `Media Production`) or the 8 `Capabilities` are reachable from the global menu!
  - The custom cursor follower in `Header.tsx:52–60` mutates `style.left` and `style.top` on every `mousemove` event without `requestAnimationFrame` or `transform: translate3d(...)`, triggering layout recalculations on every pointer tick.
- **Why (Citations):**
  - `emilkowalski/apple-design › §16 Wayfinding`: *"Every screen should answer: Where am I? Where can I go? What's there? How do I get out?"*
  - `layout.md › Size classes`: *"Determine layout based on size classes, not device type or fixed widths."*

---

## 2. High-Severity Issues (Visual Craft, Performance, and Platform Architecture)

### H-01. `index.html` Loads 8 Monolithic Legacy WordPress & Elementor Stylesheets (~180 kB Unminified Blocking CSS)
- **Where:** `index.html:11–18`
- **What:**
  - Every page load fetches 8 legacy WordPress/Elementor CSS files (`app.css` 103 KB, `custom.css` 20 KB, `style.css`, `style-dark-mode.css`, `contact-form-7/styles.css`, `elementor/frontend.min.css`, `elementor-pro/frontend.min.css`, `post-594.css`).
  - `custom.css:60` even contains literal syntax typos (`posiion: relative; font-size: 4.5vw; font-size: 2.5vw;`) and `padding: 0 px;` (`custom.css:79`), plus `!important` overrides fighting across 4 files.
  - `body` in `index.html:21` starts with `class="is-light-theme no-js"` on a permanently dark website!
- **Why (Citations):**
  - `emilkowalski/apple-design › §1 Response — kill latency`: *"Be vigilant about every latency."*
  - `dark-mode.md › Best practices`: Consistent semantic dark appearance tokens without conflicting light-theme classes.

### H-02. `ContentBlocks.tsx` & `pages.json` (854 kB Bundle) Render Raw Captured WordPress DOM on `/about/`, `/works/`, `/privacy-policy/`, and `/terms-of-service/`
- **Where:** `src/app/App.tsx:66–68`, `src/components/ContentBlocks.tsx:1–74`, `src/data/pages.json`
- **What:**
  - `pages.json` is an **854.58 kB** raw AST dump of old WordPress/Elementor HTML (`<div class="elementor-element ...">`, dead `<div id="load_overlay">`, `<div class="cursor">`).
  - Even on `/` (Homepage), `usePageDocuments` schedules a background download of this 854 kB JSON blob after 3.5–5 seconds (`App.tsx:83–84`).
  - On `/about/`, `AboutReveal.tsx` has to manually scrape `.reveal-text` and `.worded` DOM nodes out of the legacy WordPress HTML and animate individual `<span>` letters every 4,000 ms with `setTimeout` chains (`AboutReveal.tsx:111–128`).
  - On `/privacy-policy/` and `/terms-of-service/`, raw WordPress prose renders without the site's modern editorial grid or navigation chrome.
- **Why (Citations):**
  - `design-principles.md › Simplicity`: *"A well-designed experience removes the unnecessary, with every element earning its place."*

### H-03. `PanoramaPage.tsx` (`/360-video/`) Mutates Global `window.React`, Fakes `DOMContentLoaded`, and Autoplays Unmuted Video Without Controls
- **Where:** `src/components/PanoramaPage.tsx:10–25`, `src/components/PanoramaPage.tsx:62–72`
- **What:**
  - `attributes.options` sets `autoplay: true, muted: false, controlBar: false` (`PanoramaPage.tsx:12–15`), which modern browsers block for unmuted autoplay and which violates Apple's accessibility mandate that users must have visible playback controls.
  - `layout.width` and `layout.height` are hard-coded to `1920px` and `1080px` across desktop, tablet, and mobile (`PanoramaPage.tsx:22–24`).
  - It attaches `window.React = React` globally and dispatches a synthetic `document.dispatchEvent(new Event('DOMContentLoaded'))` (`PanoramaPage.tsx:71`), which can re-trigger any third-party or browser listeners listening for initial document load.
- **Why (Citations):**
  - `accessibility.md › Cognitive`: *"Let people control audio and video playback. Avoid autoplaying audio and video content without also providing controls to start and stop it."*
  - `layout.md › Adaptability`: Never hard-code `1920px × 1080px` across mobile, tablet, and desktop.

### H-04. `MetaversePage.tsx` (`MetaverseRuntime`) Injects a Viewport Meta Tag That Disables Pinch-to-Zoom (`user-scalable=no`)
- **Where:** `src/components/MetaversePage.tsx:33–38`, `src/styles/baseline.css:79–81`
- **What:**
  - On mobile devices, `MetaverseRuntime` dynamically injects `<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes">`, locking out pinch-to-zoom for the entire SPA session even after navigating away from `/metaverse/`!
  - Desktop Unity container is hard-coded to `width: 960px; height: 600px` (`baseline.css:79`), overflowing tablets between `601px` and `959px`.
- **Why (Citations):**
  - `accessibility.md › Vision`: *"Support larger text sizes... Make sure people can adjust the size of your text or icons to make them more legible."* Disabling `user-scalable` is a Critical WCAG 2.1 AA (1.4.4) and Apple HIG violation.

---

## 3. Medium & Craft Issues Across Secondary Routes

### M-01. Homepage Slide 01 Has Inline Color Mismatch (`#ccc` vs `#FFD5C2` vs `#ddc89d`) and Inconsistent Route Label ("Augment Reality")
- **Where:** `src/components/HomeSlideshow.tsx:314–320`, `src/data/slideExperiences.json:112`
- **What:**
  - `HomeSlideshow.tsx:314` sets inline `style={{ color: index === 0 ? '#ccc' : '#FFD5C2' }}` on `.caption`, and then immediately overrides it on the child `<a>` with inline `style={{ color: '#ddc89d' }}` (`line 319`).
  - Slide 04 is titled `"Augment Reality"` instead of `"Augmented Reality"`, and Slide 01's heading `"Dive into new world, live the world you want."` misses the article *"a"* (*"Dive into a new world"*).
  - The homepage renders `<div className="scroll" aria-hidden="true">Scroll Down</div>` (`HomeSlideshow.tsx:369`) even though the homepage is a locked `100dvh` single-screen carousel with nothing to scroll down to!
- **Why (Citations):**
  - `writing.md › Best practices`: *"Be clear... Check each word to be sure it needs to be there."*
  - `design-principles.md › Familiarity`: Never display a "Scroll Down" affordance on a view that cannot scroll.

### M-02. Global Reduced-Motion Rule Uses Nuclear `* { transition-duration: .01ms !important }` (`src/styles/enhancements.css:159–164`)
- **Where:** `src/styles/enhancements.css:159–164`
- **What:**
  - Setting `animation-duration: .01ms !important; transition-duration: .01ms !important;` on `*` kills even non-vestibular opacity cross-fades and color/focus transitions that help users understand state changes.
- **Why (Citations):**
  - `emilkowalski/apple-design › §14 Reduced motion & accessibility`: *"Reduced motion doesn't mean no feedback — it means a gentler, non-vestibular equivalent. Replace slides/springs/parallax with short opacity cross-fades or static transitions. Keep opacity/color changes that aid comprehension."*

### M-03. `VideoArchive.tsx` (`/works/`) and `CapabilityDetail.tsx` (`/capabilities/*`) Lack Search, Filtering Transitions, and In-Place Preview
- **Where:** `src/components/VideoArchive.tsx:41–124`, `src/components/CapabilityDetail.tsx:36–136`
- **What:**
  - `/works/` has 47 archive records but no instant search field (`searching.md`), no sort control, and category filtering abruptly swaps the DOM without layout/opacity continuity.
  - `CapabilityDetail.tsx` repeats boilerplate disclaimer sentences in every section (*"Current public Angel source material lists:"*, *"These are application contexts named in the captured Angel source. They are not claimed as case-study outcomes."*, *"No separate authored insight record is asserted here..."*), reading like a legal audit log rather than an international award-winning creative studio.
- **Why (Citations):**
  - `writing.md › Getting started`: *"Determine your app's voice... Avoid robotic messages."*
  - `apple-design-skill › Lens 5 (Content and writing)`: *"Names come from what people control and recognize, not from how the system is built. No jargon, no filler."*

---

## 4. Summary Comparison Matrix: Before vs. Redesigned Inner Pages vs. Remaining Site

| Dimension | Redesigned 7 Slider Inner Pages (`/metaverse/` .. `/media-production/`) | Remaining Legacy Routes (`/`, `/about/`, `/works/`, `/contact/`, `/360-video/`) |
|---|---|---|
| **Motion Physics** | Interruptible 1D/2D harmonic springs (`damping`, `response`), velocity handoff, `projectMomentum()`, `rubberBand()` (`src/utils/appleSpring.ts`) | Locked 1,500 ms `expoInOut` tween (`HomeSlideshow.tsx`), 4,000 ms `setInterval` letter flips (`AboutReveal.tsx`) |
| **Direct Manipulation** | 1:1 pointer tracking (`setPointerCapture`) on Experience Map & Application Explorer stages | Swipe only triggers after `pointerup` >= 48 px (`HomeSlideshow.tsx`); mouse drag disabled |
| **Material Hierarchy** | True Apple Two-Layer Model: Liquid Glass floating dock + scroll-edge mask over elevated obsidian content surfaces | Flat `#000` legacy WordPress wrappers + 8 blocking Elementor CSS files |
| **Contrast & Legibility** | Verified `18.8:1` primary, `12.1:1` secondary, `7.5:1` tertiary; `17px–19px` body copy; size-specific optical tracking | `2.23:1` (`rgba(255,255,255,0.3)`) in footer, menu legal links, and contact support |
| **Touch Target Sizing** | All interactive controls `>= 44×44 px` (`48×48 px` on coarse pointers) with instant `:active` `scale(0.97)` feedback | `33 × 13 px` prev/next buttons in `ContactWizard.tsx`; `10px` menu label |
| **Wayfinding** | Persistent Liquid Glass HUD with live scroll progress ring, section jumper, Slide return, and 01–07 Room Switcher | Top bar only shows 2 links (`metaverse`, `360 video`); menu hides 6 of 7 core experiences |
