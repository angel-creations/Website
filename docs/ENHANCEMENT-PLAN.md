# Angel 2.0 Enhancement Plan — Same Concept, Higher Craft

## Non-negotiable guardrail

The homepage remains the existing seven-part full-screen moving-image slider. The black field, warm caption treatment, numbering, low-left caption composition, vertical menu control, video menu overlay, and inner-page visual language remain Angel. This plan improves reliability, depth, accessibility, responsiveness, and search usefulness **inside that concept**.

## Workstreams

| Priority | Workstream | What changes | What explicitly does not change |
|---:|---|---|---|
| 1 | Slider reliability and feel | Keyboard/gesture controls, accessible slide status, active/adjacent preload, posters, pause/resume, interruption safety, current-slide link destinations, reduced-motion crossfade | 7-slide full-screen sequence, numbered structure, directional cinematic transition, media-led hero. |
| 2 | Header/menu precision | Larger tap target, focus styling, Escape, focus return/trap, scroll locking, correct link labels, safe-area padding | Logo position/treatment, vertical menu language, video-backed overlay, navigation concept. |
| 3 | Mobile-native refinement | `svh`/safe areas, 16px form inputs, touch-action, hover gating, no sticky mobile hover, no horizontal overflow, phone/tablet caption composition | Dark, full-screen visual experience and bottom controls. |
| 4 | Inner-page system | Preserve existing asymmetry, thin rules, image/text rhythm, and reveals; add concise verified content modules where source material exists | No separate “premium agency” template, no bento/cards, no editorial rebrand. |
| 5 | Work and proof | Integrate the factual 47-video source archive into the existing works language with original category/filter behavior, source-linked showcase details, and local posters | No generic portfolio grid, no invented cases/results/client proof. |
| 6 | Capability depth | Expand current capability routes around the existing page language with overview, problems, outputs, approach, relevant source records, adjacent discipline, insight, and project CTA | No radial diagrams or detached service landing-page visual system. |
| 7 | Contact conversion | Keep the sequential Angel questionnaire feel while making submitted data, input semantics, errors, direct contact, and fallbacks real and respectful | No aggressive sales funnel or generic multi-card form. |
| 8 | SEO/static delivery | Unique route metadata, static crawlable fallback content, sitemap/robots, precise schema, redirects/404 review, internal links | No doorways, location spam, fake local/international locations, or schema inflation. |

## Slider enhancement specification

### The retained story

The current slide order remains the hero story. Each slide remains a number, short slash label, concise proposition, and authentic moving image. Existing composition is preserved.

### Interaction improvements

- Prev/Next remains visible. Add a readable live status (`Slide 2 of 7: Mixed Reality`) and a direct focusable slide label/action.
- Add ArrowLeft/ArrowRight support only when focus is inside the slider; do not hijack keys while somebody is typing elsewhere.
- Add horizontal swipe handling on coarse pointers with a measured threshold and `touch-action: pan-y`; vertical scroll remains the browser’s responsibility.
- Prevent repeated click/tap transition corruption. A new command should either be safely queued once or retarget from the current visual state—never leave a blank/slipped slide.
- Preserve no autoplay advance. A cinematic hero should never remove the visitor’s agency.
- Keep slide media muted and without autoplay audio. Do not add an audio control unless an accessible, user-initiated audio experience can be verified.

### Motion decision

- **Frequency:** occasional when intentionally exploring the home sequence.
- **Purpose:** spatial consistency and narrative continuity.
- **Tool:** CSS/WAAPI/React class orchestration; properties limited to transform, opacity, and permitted clip/mask reveal.
- **Feel:** directional continuity; content exits opposite incoming direction. The existing long, cinematic transition may remain only for slide change—not for menu opening, focus, or generic UI.
- **Reduced motion:** immediate/dignified media replacement with an opacity transition; no parallax/counter-motion or word stagger.

## Inner-page enhancement specification

Each existing/legacy route stays visually related to the homepage through the same black field, local typography, warm/cream labels, thin-rule cadence, and source media. Content depth will be added only where verified sources support it.

1. **About:** retain the existing “Who we are / Capabilities / Global / Clients” source rhythm. Improve source copy clarity, client/list provenance, loading/reveal resiliency, and project CTA.
2. **Capabilities:** current routes become substantive source-consistent pages for Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, and Creative Technology. Events/Experiences stays prominent.
3. **Work:** maintain irregular/asymmetric visual rhythm, factual source metadata, and watch/view actions. Do not call a video a case study unless the public source supports a project story.
4. **Products:** retain individual identity for The Virtual Life and Immersive Wedding Invite; improve explanation and enquiry connection without fabricated availability/price/features.
5. **Insights:** use the existing visual language for finite, useful authored material, not a magazine redesign.

## Technical implementation stages

### Stage A — baseline hardening

1. Restore and build the original migration baseline.
2. Replace source-only inline style fragility with a small enhancement layer loaded after archived CSS.
3. Add global mobile, focus, motion, font, safe-area, image/video, and semantic defaults that do not alter the original composition.
4. Fix router/route aliases only where they preserve known current intent.

### Stage B — slider and navigation

1. Refactor slider state to preserve its current DOM/class vocabulary and media composition.
2. Add accessible controls/announcements, keyboard, swipe, no-motion behavior, media lifecycle, and source fallback handling.
3. Upgrade menu semantics without visually redesigning it.
4. Test at 390×844, 430×932, 768×1024, 834×1194, 1024×1366, 1280×720, 1440×900, 1920×1080, and 2560×1440.

### Stage C — content and conversion depth

1. Add source-qualified data components that adopt the existing black/asymmetric/reveal language.
2. Expand validated capabilities and authentic archive views.
3. Upgrade the sequential contact experience and static-host delivery mechanism.
4. Add contextual, sparse CTAs—not repeated conversion blocks.

### Stage D — search delivery and QA

1. Generate static, crawlable route fallbacks; apply truthful metadata/schema/sitemap/robots.
2. Review legacy mapping without touching live hosting configuration.
3. Run responsive, keyboard, touch, reduced-motion, empty/long-data, direct-route, asset, SEO markup, performance, and static form-endpoint QA.
4. Complete red-team review from creative, Angel-client, enterprise, UX, mobile, SEO, sales, performance, and accessibility perspectives.

## Acceptance checks for every change

A change is rejected if it:

- replaces a slider with another homepage architecture;
- makes an inner page look like a different brand;
- adds generic cards/bentos, giant display type, gradient/glass/cyberpunk styling, fake visual work, or new spatial/3D concepts;
- reduces page accessibility or static crawlability;
- adds unverified claims; or
- adds motion without a purpose, motion preference response, and interruption model.

A change passes only if an existing Angel visitor still recognises the site immediately while experiencing a more composed, reliable, cinematic, responsive, and useful implementation.
