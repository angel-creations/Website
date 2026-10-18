# Current Angel Design — Preservation Audit

**Audit basis:** restored React/Vite migration baseline, captured first-party HTML/CSS/assets, and current component source. This is an audit of Angel’s existing concept, not a proposal for a replacement.

## Design thesis

Angel is an immersive, dark, moving-image creative/technology studio. The defining interaction is a full-screen numbered sequence of capability films. The interface is intentionally sparse: the media carries the atmosphere; restrained labels, a short proposition, and a vertical menu control orient the visitor.

The site should continue to feel experimental, visual, and slightly unconventional. It should not become a card grid, editorial site, generic agency template, software dashboard, or a new branded design system.

## Homepage structure — preserve

| Existing element | Current implementation | Design role | Preserve / enhancement boundary |
|---|---|---|---|
| Full-screen home | `HomeSlideshow.tsx` renders a 7-slide `#slideshow` | The primary homepage architecture | **Preserve.** Improve loading, control semantics, gesture support, transition interruption, and responsive composition only. |
| Numbered slides | `01`–`07`: Metaverse, Mixed Reality, Virtual Reality, Augment Reality, Animation, Brand Advertisement, Media Production | A capability-led story sequence | **Preserve.** Do not turn into services cards or a different hero. Add truthful destinations and clearer non-intrusive progress. |
| Moving-image background | Six local authentic Angel videos plus one historic remote source | Visual authority and immersion | **Preserve.** Poster-first/lazy video strategy, real source fallbacks, crop treatment, and playback management may improve. No stock/AI replacement imagery. |
| Caption system | Number + `/ capability` label + concise proposition over media | Sparse narrative anchor | **Preserve.** Improve contrast, bounded line length, focus visibility, and mobile positioning. |
| Prev / Next / Scroll Down | Bottom slider controls | The current navigation model | **Preserve.** Add accessible names, keyboard, touch/swipe, status announcement, and dependable active state. |
| Header | Compact logo/Digital lockup, Metaverse and 360 video links, vertical Menu control | Persistent but deliberately quiet | **Preserve.** Improve hit area, focus, Escape behavior, screen-reader state, and mobile safe area. |
| Full-menu overlay | Video-backed dark overlay with three numbered links | A cinematic navigation moment | **Preserve.** Keep its visual form; correct focus containment, menu state, labels, and reduced-motion behavior. |
| Inner pages | Dark editorial/experimental source templates, asymmetric image/text composition, line-reveal treatment | Expansion of the same identity | **Preserve.** Increase real depth and navigation consistency without introducing unrelated page design. |

## Existing visual language

### Palette

The captured theme is fundamentally black/near-black (`#000`, `#111`, `#202020`) with white type, translucent white dividers, and a restrained warm cream/peach signal (`#C5B5A5`, `#FFDBAF`, `#FFCAA7`, `#FFB69C`). The first slide uses a warm muted label; the remaining slides use a soft peach caption. The palette is media-led, not gradient-led.

**Preservation rule:** retain black as the field, white/soft-white as legibility, and the existing warm tint as the small capability/accent signal. Do not add purple/blue AI gradients, glass surfaces, neon, or a new accent color system.

### Typography

- Existing local families: **Geograph**, **Geograph Edit**, **Graphik**, and `geographweblight`.
- Hero typography is controlled rather than oversized: source captions use a viewport-aware display scale and a narrow, minimal copy set.
- Navigation is uppercase/letter-spaced at small sizes; page templates use measured text columns and line-reveal text.

**Preservation rule:** keep the local type family and source hierarchy. Improve line-height, readable mobile sizes, wrapping, and contrast; do not replace the character with an editorial serif or an oversized-type treatment.

### Composition and spacing

- The homepage fills the viewport and keeps text low/left against video.
- Page templates use a 114rem central composition, asymmetric image/text blocks, deep vertical spacing, thin rules, and deliberate empty space.
- Mobile source layouts become single-column with 90% widths and markedly reduced margins.

**Preservation rule:** preserve the compositional asymmetry, isolated captions, and open dark field. Fix clipping, 100vh issues, safe-area collision, and rigid source dimensions without changing the visual grammar.

## Motion and interaction inventory

| Surface | Existing behavior | Current execution risk | Enhancement direction |
|---|---|---|---|
| Slider transition | Directional width-reveal with counter-moving media and staggered caption words; ~1500ms JavaScript animation | Imperative inline styles/rAF, no user interruption model, duration is long for direct controls | Preserve the directional reveal; move orchestration toward interruptible transform/opacity/clip-path behavior, with a motion-reduced crossfade. Keep the cinematic duration only for the rare full slide transition. |
| Video playback | Active video begins after 500ms; outgoing video pauses after 700ms | Multiple source videos load at once; one remote source is not recoverable/local | Load current + adjacent media intentionally, reserve posters, pause noncurrent video, and provide no-motion/static fallback. |
| Header menu | Vertical-line hover transformation; video-backed menu appears using opacity classes | Mouse-only hover assumptions; no Escape/focus return/focus trap | Preserve line language and menu image treatment; add robust modal semantics and pointer-capability gated hover. |
| About | Scroll line reveals and rotating word letters | Source code animates transforms/opacity but no reduced-motion branch; coarse timeout sequencing | Preserve the line-reveal motif; observe once, reduce/stabilise motion for preference, and avoid hidden content if JS/observer fails. |
| Contact wizard | One question at a time with next/previous arrows | Visual flow is Angel-like but it does not actually submit, uses generic text input type, and is keyboard/status incomplete | Preserve sequential form experience while making validation, progress, input type, submission, and recovery real. |

## Existing responsive behavior

- Desktop source slider is a fixed full-screen moving image stage.
- Mobile source CSS positions caption and arrows toward the bottom and changes inner templates to 90% width single-column layouts.
- The baseline currently relies on `100vh`, source CSS with broad selectors, and desktop-oriented persistent hover/cursor effects. These are enhancement targets, not reasons to replace the layout.

## Authenticated source media

The existing home concept is supported by authentic local video assets: Metaverse, Mixed Reality, Virtual Reality, Augmented Reality Showroom, Singing Girl, Brand Advertisement, and the Main Background menu film. The historic Media Production slide points to a source URL that was not locally captured; it must receive an honest fallback rather than a fabricated replacement.

## Baseline preservation record

- Original recovery baseline: `.preservation-snapshot-2026-10-05/`.
- Superseded redesign/build recovery: `.godmode-redesign-recovery-2026-10-05/`.
- This enhancement track restores the original Angel application structure first. The prior rebuild is retained solely as a recovery/reference point and is not the current design direction.
