# Angel 2.0 Enhancement Log

This log records implementation work against the preservation audit. It is deliberately incremental: an enhancement is not marked complete merely because it builds.

## 2026-10-05 — Baseline and first implementation pass

### Preserved before change

- Restored original React/Vite Angel application, source structure, captured legacy page data, original full-screen 7-slide homepage, menu model, and authentic public asset tree.
- Preserved the former redesign separately at `.godmode-redesign-recovery-2026-10-05/`; it is not used by the active app.
- Documented the original composition, motion, palette, typography, and responsive risks in `CURRENT-DESIGN.md`, `ENHANCEMENT-PLAN.md`, and `DESIGN-TOKENS.md` before visual/interaction changes.

### Implemented

1. **Home slide presentation — enhanced, not replaced**
   - Retained the same seven capability slides, original sequence, low-left captions, number system, Prev/Next form, source width reveal, and counter-moving media choreography.
   - Added poster-first authentic frames for the six locally captured source films, plus the authentic menu film. Posters are generated from those exact local source videos and stored under `public/legacy-assets/images/generated-home-posters/`.
   - Preserved the historic remote Media Production video source. It has an honest black fallback if unavailable rather than a fabricated replacement image.
   - Linked every slide to its corresponding captured Angel route where that route exists: Metaverse, Mixed Reality, Virtual Reality, Augment Reality, Animation, Brand Advertisement, and Media Production.
   - Added touch swipe, ArrowLeft/ArrowRight control within the focused stage, live slide status, accessible control names, queued interruption intent, tab-focusable stage, adjacent metadata preload, inactive-video pausing, document-visibility pause/resume, and reduced-motion poster/static behaviour.

2. **Navigation overlay — same visual language, sounder semantics**
   - Retained the source logo bar, small Metaverse/360 links, vertical Menu control, dark video-backed overlay, primary navigation labels, and source footer links.
   - Added `aria-controls`, modal dialog semantics, focus containment, Escape closure, trigger focus return, inert closed navigation, body scroll locking, focus styles, pointer-safe cursor treatment, and menu-video playback only while open (unless reduced motion is requested).
   - Removed invisible duplicate primary links from the interactive focus order while preserving the source-visible list treatment.

3. **Qualified project enquiry — same sequential interaction**
   - Retained the source’s one-question-at-a-time dark form rhythm and arrow controls.
   - Replaced the generic eight-field simulation with the required qualified fields: Name, Company, Email, Phone, Country, Project type, Project description, Timeline, Investment range, and How they found Angel.
   - Project type uses exactly: Brand, Design, Content, Film, Animation + 3D, Digital, Event / Experience, Creative Technology, Something Else.
   - Added native input semantics/autocomplete, a select and textarea where appropriate, step announcement/focus management, field-specific validation and error association, 16px mobile-safe input sizing, and visible focus states.
   - Kept the user’s no-submission constraint: no fake success and no server endpoint. The final state honestly prepares a user-triggered `mailto:` draft using the existing captured business contact rather than claiming delivery.

4. **Source-qualified capability depth**
   - Added eight crawlable capability routes in the preserved Angel dark/numbered/rule-based language: Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, and Creative Technology.
   - Added a restrained source-capability index to the existing About experience rather than replacing navigation or introducing a services-grid homepage.
   - Every detailed page distinguishes source-qualified capability labels/application contexts from unverified outcomes, keeps related work attached to its original public metadata, includes related capabilities, a truthful insight state, qualified industry contexts only where present in the source, and a contextual project CTA.
   - The eight new routes are lazy-loaded in the interactive app and receive static no-JS fallback pages, unique metadata, canonical URLs, H1s, and sitemap entries.
   - Split the 816 KB captured legacy-page source data out of the initial homepage JavaScript. The built entry now ships at roughly 190 KB unminified before the legacy content chunk is requested after first paint; the authentic home stage remains immediately available.

5. **Works archive and static discoverability**
   - Restored the exact 47-record verified public video archive into the active source (`src/data/videoArchive.json`). Hash-verified against the preserved factual capture: 47 unique source URLs, exact title/description/URL fields, and 47 available thumbnail assets.
   - Added a lazy-loaded, source-led Works extension: an irregular stacked media/index sequence rather than a card grid. It exposes source category/duration/date/views/likes/status only where in the verified record and preserves source descriptions/tags in optional disclosures.
   - Added a post-build static-fallback generator. It creates 13 no-JavaScript documents for existing qualified core routes plus 8 source-qualified capability documents, a 22-URL sitemap, and robots file. The static Works fallback contains all 47 source records and watch URLs. It does not create industry/geographic doorway pages or invent claims.
   - Added a root `noscript` fallback and truthful captured home metadata/canonical seed. Route-level client metadata continues to use captured legacy records.

### Automated checks completed

- `npm run build` passes TypeScript and Vite build, then generates static fallbacks/sitemap/robots.
- Static document check: 13 generated core documents plus 8 capability documents each include title, canonical, robots meta, and H1; sitemap includes 22 qualified URLs.
- Video archive check: 47 preserved app records, 47 unique YouTube source URLs, 47 local thumbnail paths, 47 static Works archive entries.
- Source asset HTTP check through local Vite server: home, key direct routes, all accessed generated poster assets, and original active source video return HTTP 200.
- Slider destination data check: all seven slide destinations resolve to captured status-200 legacy routes.

### Manual/visual QA status

- Local Vite preview is running for browser inspection.
- Automated visual/browser interaction audit could not run in this sandbox because the available Chromium binary cannot start: its required system `libnspr4.so` is absent. This is an environment limitation, not treated as a passing visual test.
- Desktop, tablet, and phone visual review; keyboard/touch real-browser interaction; assistive-technology review; reduced-motion real-browser review; and full red-team review remain required before final completion.

### Phase 2 continuation

See `PHASE-2-FORENSIC-AUDIT.md`, `PHASE-2-IMPLEMENTATION-LOG.md`, and `PHASE-2-RED-TEAM.md` for the later forensic audit, static-route hydration correction, schema additions, motion/performance hardening, work-thumbnail WebP derivative pass, production-like checks, and explicitly qualified review status.

### Known scope still open

- Deeper capability content needs source-qualified expansion for Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, and Creative Technology without authored claims.
- Events/Experiences and product presentation need verified-content mapping before adding material.
- Static fallback selection intentionally excludes captured test/search/author/404 pages and does not create new industry or location pages.
- No hosting, DNS, production deployment, form endpoint, analytics, or Search Console changes have been made.
