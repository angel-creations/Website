# Route-by-route comparison — original vs restored + enhanced

> A second, independent verification of the same restore — using a different harness, different
> servers and a fresh rebuild of both trees — is in
> [`INDEPENDENT-RESTORE-VERIFICATION.md`](./INDEPENDENT-RESTORE-VERIFICATION.md). It reaches the
> same conclusion and additionally measures what the **static deployment** serves, which exposed
> the blank-page defect (R15 / D1) in the original build's generated route documents.

**Baseline ("original"):** production build of commit `9d806ca`.
**Subject ("restored"):** production build of the current working tree on `arena/7708303c-website`.

## Method

Both trees were built with the repository's supported process (`npm ci` → `vite build` →
`scripts/generateStaticFallbacks.mjs`) and served from identical static servers. A headless
Chromium (153) instance loaded each route at 1440×900, waited for the app to mount, and extracted:

`document.title` · meta description · canonical · robots · `<body>` class and computed
`background-color`/`color`/`font-family` · every `h1`–`h3` · every `a[href]` (text + href) · the
ordered list of `main > *` / `#content > *` / `#primary > *` blocks · every `img[src]` · every
`video[src]` · header text · footer text · element counts · `document.body` text length · page errors.

Raw evidence: [`restore-verification/route-audit-original.json`](./restore-verification/route-audit-original.json)
and [`restore-verification/route-audit-restored.json`](./restore-verification/route-audit-restored.json).

> **Tooling note.** No browser binary existed in the workspace and the sandbox cannot reach
> `apt`/Playwright/Chrome CDNs. A Chromium binary distributed inside an npm package
> (`@sparticuz/chromium`) was used together with its bundled NSS libraries. Screenshots are
> captured and stored for human review; the automated comparison above is structural/computed-style
> evidence, not a pixel diff.

## Stage 1 — restore only (no enhancements)

Comparing `9d806ca` against the restored tree **before** any enhancement was applied:

| Route | Result |
|---|---|
| `/` | identical |
| `/about/` | identical |
| `/contact/` | identical |
| `/works/` | identical |
| `/metaverse/` | identical |
| `/animation/` | identical |
| `/augment-reality/` | identical |
| `/virtual-reality/` | identical |
| `/mixed-reality/` | identical |
| `/brand-advertisement/` | identical |
| `/media-production/` | identical |
| `/360-video/` | identical |
| `/privacy-policy/` | identical |
| `/terms-of-service/` | identical |
| `/no-such-page/` (404) | identical |

**15 / 15 routes identical.** This is the evidence that the original is restored.

## Stage 2 — restored + enhanced (current state)

| Route | Content / structure / identity | Declared differences |
|---|---|---|
| `/` | identical | +1 anchor (`Skip to content`), +15 chars |
| `/about/` | identical | +1 anchor, +15 chars |
| `/contact/` | identical | +1 anchor, +15 chars |
| `/works/` | identical | +1 anchor, +15 chars |
| `/metaverse/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/animation/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/augment-reality/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/virtual-reality/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/mixed-reality/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/brand-advertisement/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/media-production/` | identical | +1 anchor, +15 chars, +1 JSON-LD block |
| `/360-video/` | identical | +1 anchor, +15 chars |
| `/privacy-policy/` | identical | +1 anchor, +15 chars |
| `/terms-of-service/` | identical | +1 anchor, +15 chars |
| `/no-such-page/` (404) | identical | +1 anchor, +15 chars |

Every difference is additive and explained in
[`RESTORE-ENHANCEMENT-LOG.md`](./RESTORE-ENHANCEMENT-LOG.md):

- **+1 anchor / +15 chars** — the "Skip to content" skip link (accessibility; first tab stop, hidden
  until focused). No visual change at rest.
- **+1 JSON-LD block** — an `Organization` + `WebSite` record on the seven capability routes and the
  slide-experience routes, which had **no** structured data at all. Only restates what the preserved
  About, menu and footer content already publishes.

No route lost content, gained invented content, changed heading order, changed section order, or
changed its media, canonical, robots or body styling.

## Text-volume check (characters of rendered body text)

| Route | Original | Restored + enhanced | Delta |
|---|---:|---:|---:|
| `/` | 2,373 | 2,388 | +15 |
| `/about/` | 51,337 | 51,352 | +15 |
| `/contact/` | 1,830 | 1,845 | +15 |
| `/works/` | 103,361 | 103,376 | +15 |
| `/metaverse/` | 15,850 | 15,865 | +15 |
| `/animation/` | 18,199 | 18,214 | +15 |
| `/augment-reality/` | 15,836 | 15,851 | +15 |
| `/virtual-reality/` | 17,136 | 17,151 | +15 |
| `/mixed-reality/` | 14,209 | 14,224 | +15 |
| `/brand-advertisement/` | 16,707 | 16,722 | +15 |
| `/media-production/` | 21,557 | 21,572 | +15 |
| `/360-video/` | 1,632 | 1,647 | +15 |
| `/privacy-policy/` | 7,636 | 7,651 | +15 |
| `/terms-of-service/` | 5,432 | 5,447 | +15 |
| `/no-such-page/` | 1,863 | 1,878 | +15 |

## What changed compared with the rejected redesign (HEAD `4a44117`)

For the record, the same audit run against `4a44117` shows what the restore undid:

| Route | Rejected redesign vs original |
|---|---|
| `/` | body background `rgb(0,0,0)` → `rgb(4,5,10)`; `<body class="home wp-singular …">` → `home js`; header "Digital **metaverse 360 video** Menu" → "Digital Menu" |
| `/about/` | note: before the `</script>` fix this route rendered a **blank page** in both trees |
| `/no-such-page/` | 13 → 38 anchors, 3 → 13 paragraphs, 9 → 29 list items, 0 → 1 footer, body background changed |
| all | global footer replaced site-wide; menu lost two navigation links and gained two invented product entries |

## Interaction verification (browser, current state)

| Check | Result |
|---|---|
| Homepage slider Next → Prev | `Slide 1 of 7: Metaverse` → `Slide 2 of 7: Mixed Reality` → `Slide 1 of 7: Metaverse` |
| Menu opens | `#menuNav.active = true`, items `About Us 01`, `Works 02`, `Contact 03` |
| Menu `Escape` closes | yes |
| Header persistent links restored | `metaverse`, `360 video` |
| Menu copyright restored | `© 2023 Angelcreations. All rights reserved.` |
| Contact wizard: Enter advances single-line fields | yes (all 10 steps completed) |
| Contact wizard: Enter in textarea inserts a newline | yes (focus retained, newline present) |
| Contact wizard: prepared state | review list of all 10 answers + `mailto:business@angelcreations.in` + Copy / Edit / Start again |
| Contact wizard: draft recovered after navigating away | yes (`Ada Lovelace` restored) |

## Screenshots

`docs/restore-verification/before/` — the rejected redesign (`4a44117`).
`docs/restore-verification/after/` — the restored original + enhancements (current state).

Both sets were produced with the same script, the same routes and the same two viewports
(**desktop 1440×900**, **mobile 390×844**), full-page, after a scripted scroll pass so that
scroll-revealed sections are settled. Routes: `/`, `/about/`, `/works/`, `/contact/`, `/metaverse/`,
`/animation/`, `/privacy-policy/`.
