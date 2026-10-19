# Independent restore verification — original vs restored

**Repository:** `angel-creations/Website` · **Production:** https://angelcreations.in/
**Branch:** `arena/15f87568-website` · **Date:** 2026-10-19

This is a second, independent verification of the restore performed on `arena/7708303c-website`
(PR #5) and carried onto this branch, plus the work added on top of it. It was produced with a
different harness from the one used for
[`ROUTE-COMPARISON-REPORT.md`](./ROUTE-COMPARISON-REPORT.md), so the two reports corroborate each
other rather than repeat each other.

---

## 1. Which commit is the original, and how that was established

The checkout arrived **shallow** — a single grafted commit `4a44117`. Before drawing any
conclusion the history was un-shallowed:

```bash
git fetch --unshallow --tags origin \
  '+refs/heads/*:refs/remotes/origin/*' '+refs/pull/*:refs/remotes/pull/*'
```

That revealed **16 commits** and five branches, which are all redesign waves on top of one
preservation snapshot:

| Commit | Date | What it is |
|---|---|---|
| `9d806ca` | 2026-10-18 | **The original website.** Root commit: *"feat: rebuild immersive experience pages and fix homepage video playback"* — the React/Vite port of the live WordPress site, shipped with the forensic preservation snapshot. |
| `a7cac46` | 2026-10-18 | *"Redesign slider inner pages, works archive, and contact concierge with **135 unique visuals**"* — PR #1, merged. |
| `954b388` / `9b6566b` | 2026-10-19 | CI validation and the Hostinger deployment checklist — PR #2, merged. Not a design change. |
| `017a917`…`6374887` | 2026-10-19 | The Contact page rewritten three times (*"N° conversational wizard"*, *"Liquid Glass studio stage"*, *"The Concierge Desk"*) — PR #3, merged. |
| `e434890` | 2026-10-19 | *"Redesign About, Legal pages and **global shell** with zero-gold **Vision Titanium & Astral Iris theme**"* — PR #4, merged. |
| `4a44117` | 2026-10-19 | Merge of PR #4 — the tree this task started from. |
| `9fbc775` | 2026-10-19 | *"Restore the original Angel Creations website and enhance it in place"* — PR #5, **open and unmerged**; the restore under review. |

`9d806ca` is the original because, not by assumption:

- it is the **root commit** — nothing precedes it that could be a design;
- its `README.md` describes itself as the *"Angel Creations preservation snapshot — 2026-10-05 …
  Created before the Godmode global transformation begins"*;
- it carries the captured live HTML, the URL inventory, the SHA-256 asset manifest, and the
  browser-verified `docs/about-verification.json` proving route/content/asset parity with the
  live site;
- its own `docs/CURRENT-DESIGN.md` states the rule the later commits broke:
  > *"It should not become a card grid, editorial site, generic agency template, software
  > dashboard, or a new branded design system."*
  > *"**Preservation rule:** retain black as the field … Do not add purple/blue AI gradients,
  > glass surfaces, neon, or a new accent color system."*

Every commit after `9d806ca` is a redesign wave. `e434890` is the most damaging because it changed
the **global shell** (`Header`, `LegacyFooter`, `App`, `enhancements.css`), so the replacement was
visible on every route at once. The full regression list (R1–R15) with the file responsible for
each is in [`RESTORE-REGRESSION-REPORT.md`](./RESTORE-REGRESSION-REPORT.md).

## 2. What was restored

`src/` is byte-identical to `9d806ca` apart from five additive files:

```
$ git diff --stat 9d806ca HEAD -- src/
 src/app/App.tsx                   |  74 +++++++++++++++-
 src/components/ContactWizard.tsx  |  67 +++++++++++++-
 src/components/LegacyRenderer.tsx |  11 +++
 src/styles/enhancements.css       | 109 +++++++++++++++++++++
 src/utils/reveal.ts               | 123 ++++++++++++++++++++++
 5 files changed, 380 insertions(+), 4 deletions(-)
```

The replacement-only files are gone: `AboutPage.tsx` (1,566 lines), `LegalPage.tsx` (643),
`FloatingScrollTop.tsx`, `inner-experiences.css` (3,559) and `appleSpring.ts`.

## 3. Verification method (this report)

A separate harness was written for this pass — `puppeteer-core` driving the Chromium binary
shipped inside `@sparticuz/chromium`, with the NSS libraries from that same package's
`al2023.tar.br` on `LD_LIBRARY_PATH`. Playwright's CDN and Debian mirrors are unreachable from the
sandbox, so no system browser is available.

Two builds were produced with the repository's own supported process (`npm ci` → `vite build` →
`scripts/generateStaticFallbacks.mjs`):

- **original** — a `git worktree` at `9d806ca`;
- **restored** — the current tree.

Each build was served two ways, because the two answer different questions:

| Server | Serves | Question it answers |
|---|---|---|
| static (directory index first) | `dist/about/index.html` … | *What does the Hostinger deployment actually serve?* |
| SPA (root `index.html` for every path) | the React app, routed client-side | *Does the application itself still match the original?* |

For each of the **22 routes × 2 viewports** (1440×900 and 390×844) the harness captured
`document.title`, the description / robots / canonical / Open Graph / Twitter tags, the `<body>`
class and computed `background-color` / `color` / `font-family`, every `h1`–`h3` in document
order, the ordered list of `main > *` blocks, every `img[src]`, every `video[src]` / `poster`,
every internal `href`, the header and footer text, per-tag element counts and the rendered text
length — plus a full-page JPEG.

## 4. Result — the application matches the original

Serving both builds as the SPA and comparing the 22 routes field by field:

| Comparison | Result |
|---|---|
| `title`, `description`, `robots`, `canonical` | **identical on 22 / 22** |
| `og:title`, `og:description` | **identical on 22 / 22** |
| `<body>` class and computed background / colour / font | **identical on 22 / 22** |
| `h1`–`h3` list and order | **identical on 22 / 22** |
| `main > *` block order | **identical on 22 / 22** |
| `img[src]` list, `video[src]` / `poster` list | **identical on 22 / 22** |
| internal link set | **identical on 22 / 22** |
| header text, footer text | **identical on 22 / 22** |
| rendered text length | **+15 characters on every route** |
| element count | **+5 to +7 on every route** |

The only differences are the ones the enhancement log declares. Counted by tag across all 22 routes:

| Tag | Δ per route | What it is |
|---|---:|---|
| `a` | **+1** | the `Skip to content` skip link — the first tab stop, translated off-screen until focused, invisible at rest. |
| `link` | **+3** | two `rel="preload"` font links for the Graphik faces the site actually renders, and one `rel="modulepreload"` for the split-out React runtime chunk. |
| `meta` | **+2** | `theme-color`, and `twitter:image` (Twitter does not fall back to `og:image`, so no route rendered a Twitter card without it). |
| `script` | **+1** on the 8 capability routes and the 7 slide-experience routes | an `Organization` + `WebSite` JSON-LD record. Those routes previously shipped **no** structured data at all. It only restates what the preserved About, menu and footer content already publish. |

Two `og:` **values** change, both deliberately: `og:image` on every route (the captured upload was not
served by the static build — see §6.1) and `og:description` on `/privacy-policy/` and
`/terms-of-service/` (the captured value was a ~380-character truncated page excerpt — see §6.2).
Nothing else differs.

Text volume, side by side:

| Route | Original | Restored | Δ |
|---|---:|---:|---:|
| `/` | 2,373 | 2,388 | +15 |
| `/about/` | 49,843 | 49,858 | +15 |
| `/contact/` | 1,935 | 1,950 | +15 |
| `/works/` | 29,820 | 29,835 | +15 |
| `/metaverse/` | 8,307 | 8,322 | +15 |
| `/animation/` | 9,006 | 9,021 | +15 |
| `/privacy-policy/` | 7,739 | 7,754 | +15 |
| `/capabilities/film/` | 3,628 | 3,643 | +15 |

The homepage screenshot pair below is the clearest single piece of evidence: the original and the
restored build render the same composition — same wordmark, same `METAVERSE` / `360 VIDEO` links,
same slide, same `01 / Metaverse` index, same headline position and type, same `Prev` / `Next`
controls. The only visible difference between the two captures is the film frame, because the
homepage stage is a playing video.

**No route lost content, gained invented content, changed heading or section order, changed its
media, or changed its canonical, robots or body styling.**

## 5. Result — the static deployment was broken, and is now fixed

This is the finding that matters most for production, and it reproduces exactly.

The captured source references a handful of uploads under the original `/wp-content` path, which
the static build does not serve. The static generator copied the Vite entry tag with a regex that
matched only the **opening** tag:

```js
/<(?:link|script)\b[^>]*>/g
```

so the emitted entry was `<script type="module" … src="/assets/index-*.js">` with no closing
tag. The HTML parser therefore swallowed the rest of `<head>` and the whole `<body>` as script
text, and every statically generated route rendered **blank** for JavaScript visitors.

Measured on the two static builds, same routes, same viewports:

| Route | original build | restored build |
|---|---:|---:|
| `/` | 236 elements | 241 elements |
| `/about/` | **23 elements, 0 characters of text** | **6,335 elements, 51,352 characters** |
| `/works/` | **23 elements, 0 characters of text** | **556 elements, 103,376 characters** |
| `/contact/` | **23 elements, 0 characters of text** | **154 elements, 1,845 characters** |
| `/metaverse/` | **23 elements, 0 characters of text** | **476 elements, 15,865 characters** |
| `/privacy-policy/` | **23 elements, 0 characters of text** | **160 elements, 7,754 characters** |
| all eight `/capabilities/*/` | **22 elements, 0 characters** | full page |

The fix in `scripts/generateStaticFallbacks.mjs` copies script tags as complete elements and fails
the build if the result is unbalanced. All 24 generated documents now balance:

```
$ for f in dist/**/*.html; do …; done
OK  dist/404.html                     open=1 close=1
OK  dist/about/index.html             open=2 close=2
OK  dist/capabilities/film/index.html open=2 close=2
… 24 files, 0 unbalanced
```

## 6. Work added on top of the restore

Three metadata defects were found in the restored build that the restore itself had not addressed.
All three are invisible to a visitor and affect only the head.

### 6.1 The captured social card was never published

The captured source published a full Open Graph / Twitter card set on every route. The static
generator kept only four tags, so every inner route shipped without `og:locale`, `og:type`,
`og:site_name`, `og:image:width` / `height` / `type`, `twitter:card` or `twitter:site` — and the
eight capability routes had no share image at all. Twitter does not fall back to `og:image`, so
**no route rendered a Twitter card**.

Worse, the captured site-wide share image

```
https://angelcreations.in/wp-content/uploads/2023/08/59c9d53b-…-1024x660.png
```

was never duplicated into the preservation snapshot, and `/wp-content` is not served by the static
build, so it resolved to an HTML fallback rather than an image. The same applied to the
`ImageObject` records inside the captured structured data — including the `Organization` logo that
appears 14 times.

**Fix.** The captured social metadata is re-emitted on every route, keeping the source's own
values (a page that recorded `og:type` `article` keeps it) and filling only what is missing. A
share card was built from assets the site already ships — the preserved *Angel Creations* wordmark
on the site's own black field — at **1024×660, the captured image's own geometry**, so the
`og:image:width` / `height` / `type` the source declared stay truthful.
`scripts/generateSocialCard.sh` regenerates it; it is deliberately **not** part of `npm run
build`, so CI and the Hostinger build keep no ImageMagick dependency.

Captured upload URLs inside the structured data are rewritten to the preserved copies the build
actually serves, using the mapping recorded in `docs/asset-manifest.json` together with each
file's SHA-256 digest. The one upload that was never captured — the 64×64 site icon
`logo-1-e1673178398663.webp` — is replaced by the manifest-verified 64×64 *Angel Creations* icon,
which matches the width, height and caption the source declared for that record.

Result:

| Route | `og:image` | `twitter:card` | `twitter:image` | `og:site_name` |
|---|---|---|---|---|
| `/` | `…/social/angel-creations-card.png` | `summary_large_image` | card | set |
| `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/` | card | set | card | set |
| all eight `/capabilities/*/` | card | set | card | set |
| `/metaverse/`, `/animation/`, `/augment-reality/`, `/brand-advertisement/`, `/media-production/`, `/mixed-reality/`, `/virtual-reality/` | the route's own preserved hero visual | set | same | set |

### 6.2 The served head and the hydrated head disagreed

The runtime re-applied the captured `og:description`, while the static document published the
resolved one. On the legal routes the captured value is a ~380-character truncated page excerpt
ending in *"Continue reading …"*, so a crawler reading the served HTML and a crawler executing
the application saw two different descriptions for the same page. The runtime now uses the same
resolved description the static document publishes; the captured text itself is untouched in
`src/data/legacyPages.json`.

Verified in a headless browser across `/`, `/about/`, `/works/`, `/contact/`, `/metaverse/`,
`/capabilities/brand/` and `/privacy-policy/`: **no social metadata tag changes between the
served document and the hydrated document**, and no `/wp-content` reference and no dead upload
survives in the JSON-LD.

### 6.3 Every local asset reference resolves

```
$ every absolute angelcreations.in URL in dist/**/*.html that names a file
→ all resolve inside dist/   (73 distinct URLs checked)
$ every /wp-content reference in dist/
→ 0
```

## 7. Validation run on the final tree

| Check | Result |
|---|---|
| `npm ci` | 72 packages, 0 vulnerabilities |
| `npm run build` (`tsc -b` → `vite build` → `generateStaticFallbacks.mjs`) | passes — 13 enhanced core + 8 capability static fallbacks, `sitemap.xml`, `robots.txt` |
| repository's production-build verification (the CI block) | *Verified 22 routes, 8 stylesheet links and 12 media references* |
| script-tag balance across all 24 generated documents | 0 unbalanced |
| every local asset reference in `dist/` | resolves |
| SEO audit (`scripts/auditStaticOutput.mjs`) | 24 documents, 22 sitemap URLs, **no** status issues, **no** missing descriptions, **no** h1 issues, **no** schema issues, **no** orphan sitemap routes, **no** duplicate titles or descriptions |
| entry bundle | 292 kB → 61 kB after chunk splitting |

## 8. Screenshots

`docs/restore-verification/` holds three matched sets, all captured with the same script, the same
routes and the same two viewports (**1440×900** and **390×844**), full-page, after the same
scripted scroll pass:

| Directory | Subject |
|---|---|
| `before/` | the rejected redesign, `4a44117` |
| `after/` | the restored original plus enhancements |
| `original-vs-restored/original/` | the original `9d806ca`, captured by this report's harness |
| `original-vs-restored/restored/` | the restored tree, same harness, same moment |

> **Tooling caveat.** There is no system browser and the sandbox cannot reach apt, the Playwright
> CDN or the Chrome-for-Testing bucket, so the Chromium binary inside `@sparticuz/chromium` is
> used. Video decoding is unreliable in that headless build, so film frames may read as black or
> poster-only — identically in every set. The automated comparison above is therefore
> structural and computed-style evidence, not a pixel diff; the screenshots are for human review
> of layout, composition and typography.

## 9. Deployment and rollback

**Nothing has been deployed.** Production still runs the previous build, so the site remains
recoverable.

When the change is approved:

1. build with the repository's supported process — `npm ci && npm run build`;
2. upload the **contents of `dist/`** (not the source repository) to the Hostinger static host;
3. keep `dist/` for the previous release so the deployment can be reverted by re-uploading it.

The rollback target is the commit the production host is currently serving from, `4a44117`. Both
that tree and this one build with the same command, so a rollback is a re-upload of a previously
saved `dist/`.

**One production change could not be verified from here and is stated plainly:** the 360° video
and the Unity WebGL `.data` / `.wasm` binaries for `/metaverse/` are not in the repository, and
`https://angelcreations.in` is unreachable from this sandbox, so those artefacts cannot be
exercised against the real origin. The dev/preview proxy for them is unchanged, and the route
records the limitation rather than substituting content.

## 10. What was not done

- No deployment, and no change to the production host.
- No new artwork, copy, project, testimonial, client logo or business claim. Every added
  attribute restates something the preserved site already publishes, and the only new binary is
  a correctly sized rendering of the site's own wordmark.
- No change to the homepage slideshow choreography, the About line-reveal, the inner-page
  explorers, the works archive, the contact wizard flow, the header, the footer, the navigation
  or the route structure.
- The captured source data in `src/data/legacyPages.json` is unchanged.
