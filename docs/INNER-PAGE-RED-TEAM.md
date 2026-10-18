# Angel Creations — Inner-Page Red Team

**Godmode review — 2026-10-05**  
**Scope:** seven inner routes only. No homepage/slider architecture, order, composition, navigation concept or visual identity was intentionally changed in this phase.

## Exact browser blocker

Browser automation remains **BLOCKED**. Both installed Chromium executables fail at process launch because `libnspr4.so` is unavailable. The following are therefore not claimed as passed: visual comparison, supplied viewport matrix, touch swipe/tap, actual keyboard focus traversal, screen-reader output, live reduced-motion switching, DevTools console/network waterfall, direct video playback and actual browser Back restoration.

## Red-team findings and repairs

| ID | Severity | Attack | Finding | Repair | Status |
|---|---:|---|---|---|---|
| ID-001 | P1 | Compare seven current inner routes side by side. | Long-form copy was present, but six routes used a similar numbered-list rhythm and did not sufficiently reward exploration after entry. | Added route-specific experience maps and progressive application explorers with seven distinct vocabularies/spatial modes. | **SOURCE PASS / VISUAL BROWSER BLOCKED** |
| ID-002 | P1 | Inspect whether application lists become a generic card grid or hide essential copy. | Long use-case lists risked becoming either a wall of text or a generic grid. | Explorer uses semantic tabs/buttons and one active discovery panel; all panels remain in the runtime DOM and complete content remains in each route’s static no-JS fallback. | **PASS (source/static)** |
| ID-003 | P1 | Test supplied-copy persistence in generated documents. | A rich runtime-only explorer would make direct/no-JS routes thin. | Static generator now emits route map stages, all supplied long-form sections, all application entries, source Work links, capabilities, CTA and journey links. | **PASS** — phrase probes pass for all seven static documents. |
| ID-004 | P2 | Generic-design scan. | Card/bento/gradient/glass/radial patterns would break Angel’s identity. | Used rule-bound rails, numbered linear stages, source-slide media and anchored panels; no prohibited generic patterns or new visual language introduced. | **SOURCE PASS / VISUAL BROWSER BLOCKED** |
| ID-005 | P2 | Accessibility interaction audit. | Custom explorer controls could exclude keyboard users. | Native buttons, `tablist`/`tab`/`tabpanel`, selected state, arrow/Home/End keys, focus management and visible focus styles are implemented. | **SOURCE PASS / BROWSER BLOCKED** |
| ID-006 | P2 | Reduced-motion/performance audit. | New interaction could add a motion library, heavyweight media, iframe storm or homepage bundle regression. | No new dependency/library; controlled CSS-only feedback disables under reduced motion; explorer and stories are deferred; no iframe added; remote Media Production remains `preload="none"`. | **PASS (source/build)** |
| ID-007 | P2 | Direct-route SEO/static audit. | Deep interaction must not damage canonical, H1, schema or static route accessibility. | Retained emitted static documents and source-qualified WebPage/BreadcrumbList schema. | **PASS** — all seven local production-preview routes return 200 with one H1, canonical, JSON-LD, CSS/module assets and `<noscript>`. |
| ID-008 | P2 | Source-integrity audit. | Richer application copy could be mistaken for claimed past work. | Existing approved wording remains framed as possible/potential/application language; Work still uses exact title matching only. | **PASS** |
| ID-009 | P2 | Work-context audit. | A generic “Show the work” section can feel bolted on even when its archive evidence is correct. | Each room now has a route-specific non-claim bridge (for example **Frame by frame** and **From idea to final frame**) while retaining the explicit “Show the work” landmark and archive rule. | **PASS (source/static)** |
| ID-010 | P1 | Godmode immersion audit. | The first redesign still let the supplied copy read as similarly weighted long-form sections. | Rebuilt the room rhythm around route-specific entry postures, spatial existing-media fields, active crops, chapter choreography, next-stage controls and different map modes. | **SOURCE/BUILD PASS / VISUAL BROWSER BLOCKED** |
| ID-011 | P2 | Motion-safety audit. | A maximal direction can regress accessibility or become a WebGL/scroll-jack spectacle. | Motion is CSS-only, optional, bounded to entry/selection/chapter composition, disabled by reduced motion, and uses no scroll interception or new library. | **SOURCE/BUILD PASS / RUNTIME BROWSER BLOCKED** |
| ID-012 | P1 | Responsive composition audit. | A single 700px breakpoint left compact phones, tablets, short landscape screens and ultra-wide displays under-specified. | Added explicit compact-phone, larger-phone, tablet, desktop, large, ultra-wide and short-landscape compositions; touch controls have a 44px floor and safe-area-aware gutters. | **SOURCE/BUILD PASS / VIEWPORT BROWSER BLOCKED** |
| ID-013 | P1 | Topic-image relevance audit. | Explorer selections only changed a crop of the route poster, so the visual did not always help explain the chosen subject. | Replaced inner-page homepage slide media and archive thumbnails with online-library photography. The seven heroes are unique, and no image repeats inside a route’s map/application selector; each selection exposes a visible Unsplash source label. | **SOURCE/BUILD PASS / VISUAL BROWSER BLOCKED** |

## Experience differentiation matrix

| Route | Distinct map | Progressive explorer | CTA question |
|---|---|---|---|
| Metaverse | World → Story → Interaction → People → Content → Return | Virtual worlds, events, brand environments, gaming, education, workspaces and more | Have a world in mind? |
| Mixed Reality | Real World + Digital Layer + Interaction + Purpose | Training, education, entertainment, gaming, marketing, architecture, collaboration, retail, media | What could become possible if the physical and digital worked together? |
| Virtual Reality | Enter → Discover → Interact → Understand → Remember | VR content, conferencing, gaming, simulation, education, marketing, architecture, healthcare, streaming | What would you like people to step inside? |
| Augment Reality | See → Point → Discover → Interact → Continue | Industrial, tourism, navigation, retail, marketing, gaming, education, healthcare, entertainment, art | What could your audience discover in the real world? |
| Animation | Idea → Design → Motion → Frame → Story | Concept, pre-vis, 2D/3D, motion, VFX, character, interactive, explainer, AR | What should we bring to life? |
| Brand Advertisement | Idea → Message → Identity → Content → Experience → Audience | Campaigns, digital, launches, films, explainers, social/digital content | What should your audience remember? |
| Media Production | Idea → Script → Pre-production → Production → Post → Delivery | Video, film, television, animation, photography, live, audio, post, storyboarding, consulting | What are we making? |

## Machine verification after final build

```text
npm run build: PASS
```

| Route | HTTP | H1 | H2 | Canonical | JSON-LD | Static module/CSS/no-JS |
|---|---:|---:|---:|---|---|---|
| `/metaverse/` | 200 | 1 | 10 | PASS | WebPage, BreadcrumbList | PASS |
| `/mixed-reality/` | 200 | 1 | 10 | PASS | WebPage, BreadcrumbList | PASS |
| `/virtual-reality/` | 200 | 1 | 11 | PASS | WebPage, BreadcrumbList | PASS |
| `/augment-reality/` | 200 | 1 | 10 | PASS | WebPage, BreadcrumbList | PASS |
| `/animation/` | 200 | 1 | 11 | PASS | WebPage, BreadcrumbList | PASS |
| `/brand-advertisement/` | 200 | 1 | 12 | PASS | WebPage, BreadcrumbList | PASS |
| `/media-production/` | 200 | 1 | 12 | PASS | WebPage, BreadcrumbList | PASS |

Build boundary after this phase:

- main entry: **200.41 kB / 62.50 kB gzip**
- `SliderExperience`: **13.42 kB / 4.54 kB gzip**
- `ExperienceExplorer`: **14.09 kB / 2.58 kB gzip** — includes the local topic-to-image map, not image binaries
- `MetaverseStory`: **8.33 kB / 2.95 kB gzip**
- `ExperienceStory`: **31.37 kB / 8.87 kB gzip**
- online-library image set: **12 WebP files / 812 kB total**, loaded only as the active hero/explorer image
- deferred archive data: **73.86 kB / 16.06 kB gzip**

The pre-existing deferred legacy source archive warning remains the only Vite size warning.

## Known limitations and required follow-up

1. Provide a browser-capable environment with `libnspr4.so` and run the exact mobile/tablet/desktop matrix.
2. Test every map/explorer with mouse, touch, Tab, Enter, Space, arrows, Home, End and reduced motion.
3. Compare homepage → inner transition visually at each of the seven routes.
4. Test actual Back state restoration and direct deep links in a browser.
5. Inspect console/network behavior, especially remote Media Production activation and optional Unity loading.
6. Test static fallback with JavaScript disabled in a real browser.

No deployment, DNS/Hostinger, analytics, Search Console, form-delivery or remote-infrastructure modification was made.
