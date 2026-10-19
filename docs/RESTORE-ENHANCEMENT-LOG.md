# Enhancement log — layered onto the restored original

Every change below is classified before it was made:

- **Preserve** — existing layout, content, functionality, identity, assets.
- **Enhance** — animation, interaction, performance, accessibility, SEO, conversion.
- **Restore** — an original feature or design removed by the previous implementation.
- **Do not replace** — no existing page architecture or visual composition was substituted.

Total footprint on top of the restored `9d806ca` baseline: **7 files, +299 / −6 lines**.
All 18 restored source files are otherwise byte-identical to the original commit.

---

## RESTORE

| Change | File | Why |
|---|---|---|
| Restore the original header, menu overlay, cursor treatment, copyright and persistent `metaverse` / `360 video` links | `src/components/Header.tsx` | Removed by the "Vision Titanium" global shell redesign |
| Restore the original cream `color_creme` footer and its per-route rendering rules | `src/components/LegacyFooter.tsx`, `src/app/App.tsx` | A new "architectural" footer had replaced it site-wide |
| Restore the source-rendered About page (`LegacyRenderer` + `AboutReveal` + `CapabilityIndex`) | `src/app/App.tsx`, delete `AboutPage.tsx` | The original content pipeline had been bypassed |
| Restore the source-rendered Privacy Policy and Terms of Service | `src/app/App.tsx`, delete `LegalPage.tsx` | Same reason; also restores the original meta descriptions |
| Restore the original homepage slideshow, inner slider pages, works archive, explorers and stories | 5 components + 4 data files | Replaced wholesale by the redesign waves |
| Restore the original captured inner-page hero imagery | `innerHeroVisuals.json`, `explorerVisuals.json`, `slideExperiences.json` | Swapped for 135 generated images |

## ENHANCE — performance

| Change | File | Affected existing component | Why |
|---|---|---|---|
| Split the bundle: `react-runtime`, `legacy-pages`, `video-archive` chunks | `vite.config.ts` | The whole app shell | The home stage was shipping a 200 kB entry that also contained React and the captured WordPress archive. Entry is now 61 kB (17.98 kB gzip); `legacyPages` (854 kB) only loads for routes that need it. |
| Preload the two Graphik WOFF2 faces every route actually renders | `index.html`, `scripts/generateStaticFallbacks.mjs` | Home stage typography | Measured: `Graphik-Regular-Web.woff2` and `Graphik-Light-Web.woff2` were the only fonts requested by `/`. Preloading them from the preserved local font set removes them from the critical path. Same tags are emitted into every generated static route file so a deep link paints as early as the homepage. |
| Lazy + async decoding for captured legacy images | `src/components/LegacyRenderer.tsx` | Captured WordPress page imagery | The first two images keep eager loading (they are usually the hero); every later image gets `loading="lazy"` and `decoding="async"`. React-rendered surfaces already did this. |

## ENHANCE — accessibility

| Change | File | Affected existing component | Why |
|---|---|---|---|
| Skip link ("Skip to content") as the first tab stop on every route | `src/app/App.tsx`, `src/styles/enhancements.css` | The global shell | The original had no skip link, so keyboard users had to traverse the full menu overlay first. Hidden until focused; uses the source's small-caps register. |
| Dependable `:focus-visible` indicator on all interactive elements | `src/styles/enhancements.css` | Captured legacy markup + React surfaces | The captured WordPress CSS has no consistent focus ring. This only standardises the indicator; it never removes focus. |

## ENHANCE — animation / interaction

| Change | File | Affected existing component | Why |
|---|---|---|---|
| Scroll-triggered section reveals | `src/utils/reveal.ts` (new), `src/app/App.tsx`, `src/styles/enhancements.css` | The sections Angel already ships: archive items, capability sections, experience sections, explorer, conversation blocks, and top-level captured-page blocks | Entrance animation on existing sections, without touching markup, class names, spacing or order. Fades + 26 px rise only. |
| Grouped stagger (70 ms, capped at 5 steps) | `src/utils/reveal.ts` | Lists such as the works archive | Keeps the reveal legible in long lists instead of flashing the whole list at once. |
| Pointer-gated hover polish | `src/styles/enhancements.css` | Existing header logo lockup, `metaverse` / `360 video` links, menu trigger | Opacity-only transitions behind `@media (hover: hover) and (pointer: fine)`; no layout property is animated. |

### Reveal safety rules (why this cannot hide the original content)

1. Nothing is hidden by CSS alone — the hidden state is only applied by `reveal.ts` after it has
   decided to animate an element. If the script, the observer or `IntersectionObserver` is absent,
   the page renders exactly as the original.
2. `prefers-reduced-motion: reduce` reveals everything immediately (verified: 0 pending on load).
3. Elements already in the viewport when the scan runs are revealed at once, so a deep link never
   lands on an apparently empty section.
4. If the observer reports no intersection within 2.5 s, every pending element is revealed.
5. `@media print` forces full opacity.
6. The homepage, `/about/` and `/360-video/` are excluded — each already has its own source
   choreography (slide transition, `AboutReveal` line reveals, panorama runtime).

Measured, 1440×900, after a full scroll pass:

| Route | Reveal targets | Pending before scroll | Pending after scroll | Hidden while in view |
|---|---:|---:|---:|---:|
| `/works/` | 17 | 13 | 0 | 0 |
| `/metaverse/` | 14 | 13 | 0 | 0 |
| `/animation/` | 17 | 16 | 0 | 0 |
| `/capabilities/film/` | 9 | 8 | 0 | 0 |
| `/privacy-policy/` | 1 | 0 | 0 | 0 |
| `/terms-of-service/` | 1 | 0 | 0 | 0 |

## ENHANCE — SEO

| Change | File | Affected existing component | Why |
|---|---|---|---|
| `Organization` + `WebSite` JSON-LD on the seven capability routes and the seven slide-experience routes | `src/app/App.tsx` | Capability and experience pages | These routes set `jsonLd: []` in the original, so they shipped no structured data at all. The record only restates what the preserved About copy, menu and footer already publish (name, alternateName, url, description, `business@angelcreations.in`, and the seven capability names) — no invented claim, address, rating or service area beyond "Worldwide". |
| `theme-color` on every document | `index.html`, `scripts/generateStaticFallbacks.mjs` | All routes | Matches the preserved black field; improves mobile browser chrome. |

Existing titles, descriptions, canonicals, robots directives, semantic landmarks and internal link
structure are **preserved unchanged** — they are source-qualified and were not regressions.

## ENHANCE — lead generation

| Change | File | Affected existing component | Why |
|---|---|---|---|
| Draft recovery in `sessionStorage` | `src/components/ContactWizard.tsx` | The existing one-question-at-a-time enquiry | A visitor who leaves and returns no longer loses a part-written enquiry. Cleared on reset; never transmitted. |
| Enter advances the enquiry from single-line controls; the textarea keeps its newline | `src/components/ContactWizard.tsx` | Same | Faster completion. Verified: 10/10 steps completed by keyboard, and Enter inside the project description inserts a newline instead of advancing. |
| Review summary before sending | `src/components/ContactWizard.tsx`, `src/styles/enhancements.css` | The existing "Your enquiry is prepared" state | Lets a visitor check every answer before opening an email draft. Rendered as a reading list with the source's thin rules and cream labels. |
| Copy-enquiry fallback | `src/components/ContactWizard.tsx` | Same | Visitors without a mail client can still send the enquiry; degrades with an explicit instruction rather than silently failing. |

The original conversion journey is otherwise intact: same 10 questions, same order, same `N°`
progress device, same `Prev` / `Next` arrows, same `mailto:business@angelcreations.in` destination,
same support/business email block below the form.

---

## Explicitly NOT done

- No new homepage concept, hero, or design system.
- No new page, route or information-architecture change.
- No invented portfolio projects, testimonials, client logos, team members, addresses or metrics.
- No removal of the 135 unreferenced images (see follow-ups) — deletion is offered, not performed.
- No deployment.
