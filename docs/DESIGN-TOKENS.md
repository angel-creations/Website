# Angel Enhancement Design Tokens

These tokens formalise the captured Angel system so implementation becomes more precise without changing its identity. They are an enhancement layer over the archived source CSS, not a replacement design system.

## Core visual tokens

```css
:root {
  /* Existing Angel field and text */
  --angel-void: #000000;
  --angel-ink: #ffffff;
  --angel-ink-soft: rgba(255, 255, 255, 0.70);
  --angel-ink-muted: rgba(255, 255, 255, 0.50);
  --angel-rule: rgba(255, 255, 255, 0.20);
  --angel-rule-soft: rgba(255, 255, 255, 0.10);

  /* Existing warm caption family */
  --angel-cream: #C5B5A5;
  --angel-peach: #FFD5C2;
  --angel-warm-light: #FFDBAF;
  --angel-warm-mid: #FFCAA7;
  --angel-warm-deep: #FFB69C;

  /* Existing type families */
  --angel-font-display: 'Geograph', Arial, sans-serif;
  --angel-font-display-edit: 'Geograph Edit', Arial, sans-serif;
  --angel-font-ui: 'Graphik', Arial, sans-serif;
  --angel-font-light: 'geographweblight', 'Geograph', Arial, sans-serif;

  /* Existing layout language, refined for a robust responsive implementation */
  --angel-content-max: 114rem;
  --angel-page-gutter: clamp(1.75rem, 5vw, 5.4rem);
  --angel-space-1: clamp(0.8rem, 1vw, 1.2rem);
  --angel-space-2: clamp(1.5rem, 2vw, 2.5rem);
  --angel-space-3: clamp(3rem, 5vw, 5rem);
  --angel-space-4: clamp(5rem, 8vw, 10rem);
  --angel-space-5: clamp(8rem, 12vw, 15rem);

  /* Motion: strong but controlled; use only on the related Angel surfaces */
  --angel-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --angel-ease-move: cubic-bezier(0.77, 0, 0.175, 1);
  --angel-duration-press: 140ms;
  --angel-duration-ui: 220ms;
  --angel-duration-menu: 380ms;
  --angel-duration-slide: 1200ms;
}
```

## Type roles

| Role | Existing source character | Enhancement rule |
|---|---|---|
| Home/capability display | Geograph/Geograph Edit with concise sentence-like headings | Keep within its original compositional area. Use fluid clamp bounds, not huge type for spectacle. |
| Navigation/control labels | Graphik, compact uppercase/letter-spaced treatment | Minimum readable/tappable sizing, visible focus, no visual rebrand. |
| Body/detail | Geograph / light variant | 16px minimum on coarse pointers and form inputs; maintain generous line-height. |
| Numbered markers | Source numeric caption language | Continue only where it communicates actual slide/section sequence. |

## Layout rules

| Surface | Existing grammar | Tokenised rule |
|---|---|---|
| Home slider | Viewport stage, low-left caption, bottom controls | `min-height: 100svh`; preserve composition with safe-area-aware padding. |
| Inner page | 114rem central field with offset columns | `max-width: var(--angel-content-max)` and fluid page gutters; stack intentionally below tablet. |
| Menu overlay | Full-viewport media field with large numbered links | Full `100dvh` dialog/sheet layer; use `env(safe-area-inset-*)` around actionable content. |
| Work | Asymmetric rhythm and media emphasis | Use the source staggered/asymmetric sequence; no uniform card grid. |

## Interaction states

| Component | Default | Hover (fine pointer only) | Press | Focus | Reduced motion |
|---|---|---|---|---|---|
| Vertical menu | Existing crossed-line control | Existing line extension/text reveal may remain | Subtle 0.97 transform or opacity response | 2px high-contrast outline with safe offset | No positional flourish; retain clear open/close state. |
| Slider arrows | Existing text and line | Colour/opacity or small transform only | Immediate 140ms feedback | Persistent clear outline/ring | No media/caption movement; state updates immediately. |
| Menu links | Existing large numbered words | Opacity/underline/light transform only | Immediate state feedback | Clear outline | No staggered entering text. |
| Form controls | Existing underlined questionnaire | Fine-pointer label/line response | Native press | Field-level ring/error text | No spatial step motion. |

## Media behavior

- Use authentic local Angel video/image assets only.
- Present video with `object-fit: cover`; caption contrast is provided by the source overlay/controlled black scrim—not a new visual effect language.
- Current slide: `preload="metadata"` or a controlled first source preload; adjacent slide can be prepared after idle time; distant slides must not all contend for bandwidth.
- No motion preference: poster/static media remains visible and meaningful; moving media/parallax/staggers are disabled or reduced.
- Images carry intrinsic dimensions or reserved aspect ratios to prevent layout shift.

## Accessibility thresholds

- Normal text contrast target: 4.5:1; large text target: 3:1. Verify overlays against actual video frames rather than assuming black media is always dark.
- Interactive target: 44×44 CSS px minimum on touch-capable contexts where the visual form permits; use transparent hit-area expansion rather than visibly redesigning small Angel controls.
- Never remove the visitor’s zoom. Inputs are 16px minimum on coarse pointer contexts.
- Use semantic native buttons/links, labels, `aria-current`/selected state, status announcements, and Escape/focus return for overlays.

## Explicit exclusions

These do not belong in the enhancement token system: border-radius card families, bento layout spacing, glass/blur materials, purple/blue AI gradients, neon/cyberpunk accents, radial diagrams, floating 3D objects, giant editorial type, stock/AI images, or generic SaaS interaction patterns.
