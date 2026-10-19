# Restore investigation — regression report

**Repository:** angel-creations/Website · **Production:** https://angelcreations.in/
**Branch:** `arena/7708303c-website` · **Date:** 2026-10-19

---

## 1. What was inspected

The working checkout arrived shallow (`depth 1`, a single commit `4a44117`). History was
un-shallowed with `git fetch --unshallow` before any conclusion was drawn. The complete history is
12 commits:

| Commit | Date | What it is |
|---|---|---|
| `9d806ca` | 2026-10-18 | **Original website.** Root commit: "rebuild immersive experience pages and fix homepage video playback". A React/Vite port of the live WordPress site, shipped with a forensic preservation snapshot (`docs/live-html/`, `docs/url-inventory.md`, `docs/baseline/`). |
| `7473822` | 2026-10-19 | Merge PR #1 |
| `a7cac46` | 2026-10-18 | "Redesign slider inner pages, works archive, and contact concierge with **135 unique visuals**" — redesign wave 1 |
| `a674f80` | 2026-10-19 | CI + Hostinger deployment documentation (not a design change) |
| `5e54765` | 2026-10-19 | Merge PR #3 |
| `017a917` → `6374887` | 2026-10-19 | Contact page rewritten twice ("N° conversational wizard", "Liquid Glass studio stage", "The Concierge Desk") |
| `4a44117` | 2026-10-19 | Merge PR #4 |
| `e434890` | 2026-10-19 | "Redesign About, Legal pages and **global shell** with zero-gold **Vision Titanium & Astral Iris theme**" — redesign wave 2 |

## 2. Which commit is the original

**`9d806ca` is the original Angel Creations website.** Evidence, not assumption:

- `9d806ca` is the root commit; nothing precedes it that could be a design.
- Its `README.md` describes itself as an "Angel Creations preservation snapshot".
- It carries the captured live HTML (`docs/live-html/…`), the URL inventory, and browser-verified
  `docs/about-verification.json` proving route/content/asset parity with `angelcreations.in`.
- Its own `docs/CURRENT-DESIGN.md` is an audit, not a proposal, and states the preservation rule the
  later commits broke:
  > "It should not become a card grid, editorial site, generic agency template, software dashboard,
  > or a new branded design system."
  > "**Preservation rule:** retain black as the field … Do not add purple/blue AI gradients, glass
  > surfaces, neon, or a new accent color system."

Every commit after `9d806ca` is a redesign wave. `a7cac46` (PR #1), the PR #3 contact rewrites and
`e434890` (PR #4) each replaced parts of the original rather than improving them. `e434890` is the
most damaging because it changed the **global shell** — `Header`, `LegacyFooter`, `App`,
`enhancements.css` — so the replacement was visible on every route at once.

## 3. Regressions found, and the files responsible

### 3.1 Design / information-architecture replacements

| # | Regression | File responsible | Introduced by |
|---|---|---|---|
| R1 | Header lost its `metaverse` and `360 video` links — the original persistent nav was reduced to the logo only | `src/components/Header.tsx` | `e434890` |
| R2 | Full-menu overlay replaced: the numbered cinematic `01/02/03` list + video-backed overlay became a two-column "Navigation / Products" grid | `src/components/Header.tsx` | `e434890` |
| R3 | Two **invented product entries** ("The Virtual Life", "Immersive Wedding Invite") added to the primary menu, linking to a third-party domain | `src/components/Header.tsx` | `e434890` |
| R4 | Original decorative cursor treatment (`.cursor-link`) deleted from the menu | `src/components/Header.tsx` | `e434890` |
| R5 | Copyright changed from `© 2023 Angelcreations.` to `© 2026 Angel Creations` and a phone number added | `src/components/Header.tsx` | `e434890` |
| R6 | A new "architectural" global footer ("Spatial & Creative Studio", "Let's build something extraordinary together") replaced the original cream `color_creme` footer on every route | `src/components/LegacyFooter.tsx`, `src/app/App.tsx` | `e434890` |
| R7 | Source-rendered About page replaced by a hand-built 1,566-line `AboutPage` component (original used `LegacyRenderer` + `AboutReveal` + `CapabilityIndex`) | `src/components/AboutPage.tsx` (new), `src/app/App.tsx` | `e434890` |
| R8 | Source-rendered Privacy Policy / Terms of Service replaced by a hand-built `LegalPage` component, and their meta descriptions rewritten | `src/components/LegalPage.tsx` (new), `src/data/routeSeo.json` | `e434890` |
| R9 | Homepage slideshow rewritten (+658 lines) | `src/components/HomeSlideshow.tsx` | `e434890` |
| R10 | New `FloatingScrollTop` global UI element added | `src/components/FloatingScrollTop.tsx` (new) | `e434890` |
| R11 | Contact page converted into a "Liquid Glass studio stage" / "Concierge Desk" (+964 lines) | `src/components/ContactWizard.tsx` | PR #3 (`017a917`…`6374887`) |
| R12 | Slider inner pages, works archive, explorers and stories rewritten (+4,255 lines across 5 components) | `SliderExperience.tsx`, `ExperienceExplorer.tsx`, `ExperienceStory.tsx`, `MetaverseStory.tsx`, `VideoArchive.tsx` | `a7cac46` |
| R13 | New `inner-experiences.css` (3,559 lines) + `enhancements.css` grown by 3,816 lines — a replacement design system ("Vision Titanium & Astral Iris", "Liquid Glass") | `src/styles/inner-experiences.css`, `src/styles/enhancements.css`, `src/main.tsx` | `a7cac46`, `e434890` |
| R14 | New animation dependency `src/utils/appleSpring.ts` (Apple-spring physics) added to serve the new system | `src/utils/appleSpring.ts` | `a7cac46` |
| R15 | All seven inner-page hero images swapped from the original captured `inner-library` assets to **135 newly generated images** | `src/data/innerHeroVisuals.json`, `src/data/explorerVisuals.json`, `src/data/slideExperiences.json`, `public/inner-library/**` | `a7cac46` |

### 3.2 Functional defect found during verification (present in the original too)

**D1 — every statically generated route file rendered a blank page with JavaScript enabled.**

`scripts/generateStaticFallbacks.mjs` copied the Vite entry tag with the regex
`/<(?:link|script)\b[^>]*>/g`, which matches only the **opening** tag. The emitted
`<script type="module" crossorigin src="/assets/index-*.js">` was never closed, so the HTML parser
swallowed the remainder of `<head>` and the entire `<body>` as script text:

```
dist/about/index.html : <script …> 2   </script> 1     ← unbalanced
Rendered DOM          : document.documentElement.outerHTML 7,741 chars, body.innerHTML 0 chars
```

Confirmed in a real browser on `/about/`, `/works/`, `/privacy-policy/`, `/terms-of-service/`, all
capability routes and `404.html`, on both `9d806ca` and `HEAD`. This is a **build-script defect**,
not a design issue, and it is fixed (see §5).

## 4. What was restored

Files taken byte-for-byte from `9d806ca` (the original), discarding the replacement work:

```
src/app/App.tsx                        src/components/NotFoundPage.tsx
src/components/Header.tsx              src/components/SliderExperience.tsx
src/components/LegacyFooter.tsx        src/components/VideoArchive.tsx
src/components/HomeSlideshow.tsx       src/data/explorerVisuals.json
src/components/ContactWizard.tsx       src/data/innerHeroVisuals.json
src/components/ExperienceExplorer.tsx  src/data/routeSeo.json
src/components/ExperienceStory.tsx     src/data/slideExperiences.json
src/components/MetaverseStory.tsx      src/main.tsx
src/components/LegacyRenderer.tsx      src/styles/enhancements.css
```

Files introduced by the redesigns and removed again (they exist only to serve the replacement):

```
src/components/AboutPage.tsx        (1,566 lines)
src/components/LegalPage.tsx          (643 lines)
src/components/FloatingScrollTop.tsx   (68 lines)
src/styles/inner-experiences.css    (3,559 lines)
src/utils/appleSpring.ts              (214 lines)
```

**Kept** (not design work, still valid): `.github/workflows/verify-production-build.yml`,
`docs/hostinger-deployment-checklist.md`, `.claude/`, all `docs/` forensic material, and every
`public/` asset — including the 135 images added by `a7cac46`, which are now unreferenced. They are
listed in §7 as a follow-up decision rather than deleted unilaterally.

## 5. Verified defect fixed

`scripts/generateStaticFallbacks.mjs` now copies script elements **complete** and fails the build if
the emitted asset tags contain an unclosed `<script>`:

```js
const runtimeAssetTags = [...rootBuild.matchAll(/<(?:link|script)\b[^>]*>(?:<\/script>)?/g)] …
if ((runtimeAssetTags.match(/<script\b/g) ?? []).length !== (runtimeAssetTags.match(/<\/script>/g) ?? []).length) {
  throw new Error('Generated static runtime asset tags contain an unclosed script element.');
}
```

After the fix: `dist/about/index.html` → `<script …> 2`, `</script> 2`; the DOM renders fully.

## 6. Result of the restore

After restoring (before adding enhancements), a headless-Chromium audit of 15 routes compared
against a build of `9d806ca` returned **zero differences** on: page title, meta description,
canonical, robots, `<body>` class, computed body background, computed body font, headings, links,
section order, image sources, video sources, header text, footer text, and every element count.

See [`ROUTE-COMPARISON-REPORT.md`](./ROUTE-COMPARISON-REPORT.md).

## 7. Open items / follow-ups

1. **135 unreferenced images** (~16 MB) under `public/inner-library/{animation,augment-reality,
   brand-advertisement,media-production,metaverse,mixed-reality,virtual-reality}/` were added by
   `a7cac46` for the replaced inner-page designs. No restored component references them. They are
   still deployed inside `dist/`. Removing them is a safe, reviewable follow-up — deliberately not
   done here because it deletes committed work.
2. **Pre-existing console error on `/360-video/`** (`SyntaxError: Unexpected token '<'`) — present
   identically in the original `9d806ca` build. Not a regression; left untouched.
3. **Deployment** was not performed. See [`hostinger-deployment-checklist.md`](./hostinger-deployment-checklist.md).
