# GOD MODE — Angel Creations Website Remediation Report

**Branch:** `arena/69e5b04e-website` (branched from `main` @ `961aadb`)
**Date:** 2026-10-31
**Scope delivered:** the approved subset only — security headers, accessibility, the `/work/` → `/works/` redirect, social integration, DMARC recommendation, and verification.
**Not touched, per instruction:** mobile video loading/compression/autoplay, cookie/consent and any tracking change, EmailJS service or template IDs, SMTP configuration, design, colour, typography, animation, imagery, content, dependencies.
**Nothing has been merged, pushed to `main`, or deployed.**

---

## 1. Executive summary

| Workstream | Status | Headline |
|---|---|---|
| Security headers (`public/.htaccess`) | **FIXED** | 8 headers added inside `<IfModule mod_headers.c>`; 1 permanent redirect added; cache, MIME and source-tree rules preserved verbatim |
| Accessibility (6 audit categories + 2 found during verification) | **FIXED** | axe: **85/85 sitemap routes clean** (WCAG 2.1 A/AA); **14/14 deep desktop+mobile combos clean** (WCAG + best-practice); **9/9 mobile experience pages clean** |
| SEO redirect `/work/` → `/works/` | **FIXED** | `RedirectMatch 301`; zero internal links to `/work/`; sitemap contains only `/works/`; canonicals unchanged; no loop |
| Social media integration | **FIXED** | 5 official profiles in the footer (icon buttons) **and** a compact block on `/contact/`; all 5 in Organization `sameAs` on 85/85 pages, single entity |
| DMARC | **REQUIRES APPROVAL** | Current record is `v=DMARC1; p=none` with **no `rua=`**; no DNS change made |
| Code quality (component splits) | **DEFERRED** | Documented as future work in §2.9; no refactor performed |
| Regression + suites | **VERIFIED** | build, static, smoke, config, emailjs, fallback, degraded, deliverability, `npm audit` — all pass |

**Verdict:** the approved remediation is complete in code and verified locally against a production build. Remaining work is not implementation — it is the deploy itself, the post-deploy header confirmation, and the DNS decision on DMARC.

**What could not be verified from this environment:** the live response headers and the live TLS/HTTPS state of `angelcreations.in`. This sandbox has no outbound access to the production host, and `vite preview` serves static files without reading `.htaccess`. Those two checks are marked **NOT VERIFIED** in §3 and are listed as pre-deploy gates in §13.

---

## 2. Findings addressed

### 2.1 `label-content-name-mismatch` — **FIXED**

| File | Before | After |
|---|---|---|
| `HomeSlideshow.tsx` | visible `Prev` / name `Previous capability` | name `Prev capability` |
| `ContactWizard.tsx` (step dots) | visible `01` / name `Step 1: …` | name `01 — Step 1: …` (visible string is now a prefix of the name) |
| `ContactWizard.tsx` (back button) | visible `Prev` / name `Previous question` | name `Prev question` |
| `VideoArchive.tsx` (stage play) | visible `Play Film` / name `Play <title> in the Cinema Stage` | name `Play Film — <title> in the Cinema Stage` |
| `VideoArchive.tsx` (thumbnail) | visible `01` / name `Show <title> in the spotlight` | name `Show 01 — <title> in the spotlight` |
| `AboutPage.tsx` (showreel) | visible `Play` / name `Play showreel` was fine, but the mute button was not | `Play showreel` / `Pause showreel`; mute now exactly `Mute Audio` / `Unmute Audio` to match its visible text |
| `ExperienceExplorer.tsx` (domain cards) | visible `01 · ● Open page · <subtitle> · <title>` / name `Open the <title> domain page` | `aria-label` removed — the link/button is named by its own visible content, so voice control can say what it sees |
| `SliderExperience.tsx` (work cards) | visible `01` + `Watch Film ↗` / name `Watch <title> on YouTube` | `aria-label` removed; an `.sr-only` span adds `on YouTube (opens in a new tab)` so the name keeps the outbound context |
| `ExperienceProcess.tsx` (play/pause) | visible `Pause journey` / name `Pause guided process journey` | name `Pause journey — guided process`; the ▶/❚❚ glyph is now drawn in CSS so it is decorative and never part of the visible string |

Rule applied throughout: **the visible text must be a substring of the accessible name.** Where the visible content is itself descriptive (domain cards, work thumbnails), the override was removed rather than forced to match.

### 2.2 `definition-list` — **FIXED**

`AboutPage.tsx` metrics ended each `<dl>` group with a bare `<span>`. Replaced with `<dd className="ac-about-v2-metric__note">`. The stylesheet selector was updated in the same commit (`enhancements.css`) so the note keeps its original 13.6px rendering — **no visual change**.

### 2.3 `aria-allowed-role` — **FIXED**

`ExperienceProcess.tsx` had `<article role="tabpanel">`; `article` does not permit `tabpanel`. Changed to `<div role="tabpanel">` — every panel style is class-based (`.apple-process-stage__panel`), so layout and animation are unchanged.

### 2.4 `heading-order` — **FIXED**

| File | Change | Companion CSS |
|---|---|---|
| `ContactWizard.tsx` | question heading `h3` → `h2` | selector retargeted to `.ac-label h2` (computed 45.6px / 600 preserved) |
| `ContactWizard.tsx` | support cards `h4` → `h3` | selector retargeted to `.supportmail h3` (computed 14.72px / 600 preserved) |

### 2.5 `landmark-contentinfo-is-top-level` — **FIXED**

`AboutPage.tsx` and `LegalPage.tsx` rendered `<SiteFooter />` inside `<main>`. The footer is now a sibling of `<main>` in both files (comment added at each site so it is not reintroduced).

### 2.6 `image-redundant-alt` — **FIXED**

`CapabilityDetail.tsx`: thumbnails inside a card that already shows the record title carried `alt={record.title}`. Now `alt=""` — the link's visible text is the accessible name, so the image is correctly decorative.

### 2.7 `aria-required-children` (found during verification) — **FIXED**

`ExperienceStory.tsx` and `MetaverseStory.tsx` used `role="list"` on a grid whose `<article>` children are selectable panels with `aria-current`/`tabindex`, not list items — a critical rule violation. Both grids are now `role="group"` with an `aria-label`.

### 2.8 `aria-required-parent` (found during verification) — **FIXED**

`ExperienceStory.tsx` still carried a stray `role="listitem"` on the pillar cards after the grid became `role="group"`. Removing it made the six experience routes (`/animation/`, `/augment-reality/`, `/brand-advertisement/`, `/media-production/`, `/mixed-reality/`, `/virtual-reality/`) clean of the critical `aria-required-parent` error. This one only appeared in the **85-route** sweep, not in the 7-route spot check — which is why the final matrix covers every sitemap URL.

### 2.9 Code quality — **DEFERRED**

No refactor performed, as instructed. Recorded for future work:

- `AboutPage.tsx` (~1 800 lines), `ContactWizard.tsx` (~1 450), `SliderExperience.tsx` (~1 100), `MetaverseStory.tsx` / `ExperienceStory.tsx` (~900 each) each mix data mapping, layout and interaction. Natural seams: the wizard's step model, the story "pillar/values" renderers, and the works card grid.
- The three "story" components share near-identical pillar/values markup and could eventually share one primitive.
- Social data now lives in `src/data/socialLinks.ts`; the same 5 URLs are also mirrored in `scripts/generateStaticFallbacks.mjs` and `src/utils/seo.ts`. A single shared constants module for build + runtime would remove the last manual sync.

---

## 3. Security headers — **FIXED (source) / NOT VERIFIED (live)**

All additions are inside one `<IfModule mod_headers.c>` block appended after the existing cache block, before `mod_deflate`. No directive was removed or reordered; only 1 redirect line and the header block were added.

| Header | Value | Rationale |
|---|---|---|
| `Content-Security-Policy` | see below | blocking injection while allowing GTM/GA4, EmailJS, YouTube and the Unity build |
| `Strict-Transport-Security` | `max-age=15552000` with `env=HTTPS` | 6 months; **no `includeSubDomains`** so mail subdomains never inherit it; `env=HTTPS` guarantees it is only emitted on an HTTPS response |
| `X-Content-Type-Options` | `nosniff` | |
| `X-Frame-Options` | `SAMEORIGIN` | kept identical to `frame-ancestors 'self'` — the two must not disagree |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | |
| `Permissions-Policy` | `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), fullscreen=(self), autoplay=(self)` | autoplay/fullscreen retained so existing video behaviour is untouched |
| `Cross-Origin-Opener-Policy` | `same-origin` | |
| `X-Permitted-Cross-Domain-Policies` | `none` | |

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'
            https://www.googletagmanager.com https://www.google-analytics.com
            https://region1.google-analytics.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
media-src 'self' blob: https:;
connect-src 'self' https://api.emailjs.com https://www.googletagmanager.com
            https://www.google-analytics.com https://region1.google-analytics.com
            https://analytics.google.com;
frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com
            https://www.googletagmanager.com;
worker-src 'self' blob:;
object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'self'; upgrade-insecure-requests
```

**Why each relaxation exists (all measured against the built output, not guessed):**

- `'unsafe-inline'` in `script-src` — every document ships inline GTM bootstrap + GA4 config + a boot watchdog; a nonce/hash policy needs a templating server. `style-src` inline is needed for React inline styles and the inline `<style>` in each boot fallback.
- `'wasm-unsafe-eval'` — the Unity WebGL build on `/metaverse/` fails to initialise without it.
- `api.emailjs.com` in `connect-src` — the enquiry form posts from the browser; without this the form breaks.
- `youtube-nocookie.com` / `youtube.com` in `frame-src` — the privacy-enhanced player used by the work archive.
- Fonts are **self-hosted** (`/fonts/*.woff2`, verified in `baseline.css`); no Google Fonts origin is needed.
- No `http://` resource references exist anywhere in `dist` (checked), so `upgrade-insecure-requests` is safe.

**Preserved:** HTML `no-store`/`no-cache`, hashed-asset `immutable` cache rules, MIME types, `ErrorDocument`, and the source-tree `RedirectMatch 404` block for `/src`, `/scripts`, `/docs`, `/.github`, `/package.json`, `/tsconfig*` etc. There are no duplicate header directives: each security header appears exactly once (14 `Header always set` lines total = 6 pre-existing cache lines + 8 new).

**NOT VERIFIED:** that Apache emits them on the live host (no egress from this environment; `vite preview` ignores `.htaccess`). Post-deploy check:

```bash
curl -sI https://angelcreations.in/ | grep -Ei 'content-security|strict-transport|x-content-type|x-frame|referrer|permissions|cross-origin|x-permitted'
curl -sI https://angelcreations.in/works/ | grep -i cache-control
```

Watch for a second, conflicting CSP injected by a hosting panel or CDN — if two `Content-Security-Policy` headers appear, browsers enforce the intersection and the site can break.

---

## 4. Accessibility — **FIXED**

| Scan | Matrix | Result |
|---|---|---|
| Full route sweep | **all 85 sitemap URLs**, 1440×900, WCAG 2.0/2.1 A+AA | **85/85 clean, 0 violations** |
| Deep combos | 7 routes × desktop + mobile (390×844), WCAG A/AA **+ best-practice** | **14/14 clean** |
| Mobile deep sweep | 9 additional routes (6 experience pages, `/works/`, `/domains/`, `/film-production/`) | **9/9 clean** |

Rules that were failing at the start of remediation and are now at zero: `label-content-name-mismatch`, `definition-list`, `aria-allowed-role`, `heading-order`, `landmark-contentinfo-is-top-level`, `image-redundant-alt`, plus `aria-required-children` and `aria-required-parent` discovered during verification.

Design preservation was checked after each structural change: contact question heading still 45.6px/600, support card heading 14.72px/600, about metrics 48px with the note at 13.6px, and the metaverse play control renders the same pill button with a glyph drawn in CSS.

---

## 5. Redirect `/work/` → `/works/` — **FIXED**

```apache
RedirectMatch 301 ^/work/?$ /works/
```

| Check | Result |
|---|---|
| `/work` and `/work/` match | yes (regex tested both) |
| `/works/`, `/works`, `/work/animation/`, `/work?x=1` | not matched — no loops, no over-matching |
| Internal links pointing at `/work/` | **0** across all 94 built HTML documents |
| Sitemap entries | `/works/` only; **no `/work/` loc** |
| Canonical | `/works/` on the archive page; the legacy `/work/` stub already canonicalises to `/works/` and carries `<meta http-equiv="refresh" content="0; url=/works/">` as a second safety net |
| Metadata | untouched — title, description, OG/Twitter and canonical for `/works/` unchanged |

The 301 is a server-level rule, so it only takes effect once `dist/.htaccess` (identical to `public/.htaccess`) is deployed.

---

## 6. Social media integration — **FIXED**

Five profiles, used verbatim, in one shared module (`src/data/socialLinks.ts`) consumed by both surfaces:

- `https://www.facebook.com/angelcreations.animation`
- `https://www.instagram.com/angelcreations.digital/`
- `https://www.linkedin.com/company/angelcreations-creativestudio/`
- `https://www.youtube.com/@AngelCreationsACreativeStudio`
- `https://x.com/angelcreation0`

**Footer** (`SiteFooter.tsx`): icon-only links with inline 24×24 SVG paths, `aria-label="<Name> (opens in a new tab)"`, `title`, `target="_blank"`, `rel="noopener noreferrer"`, 34×34 circular hit area, hover and `:focus-visible` states, `prefers-reduced-motion` guard. Measured at 1440 / 834 / 390: identical URLs, `rel` and `target` on all five; **footer height delta vs the previous text links = 0px desktop, +1px tablet, +1px mobile** (the meta row was already taller than the icons).

**Contact page** (`ContactWizard.tsx`): `/contact/` intentionally has no site footer, so a compact `Follow the studio` row sits directly under the three support cards — same 34×34 buttons, same labels, `rel="noopener noreferrer"`, `target="_blank"`, new tab announced in the name. Measured at 1440 / 834 / 390: block width 1080 / 786 / 358, horizontal overflow 0, all five links present.

**OG/Twitter:** unchanged and re-verified on all 85 sitemap pages — `og:title`, `og:description`, `og:image`, `og:url`, `og:type` and `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` all present.

---

## 7. Structured data (JSON-LD) — **FIXED**

| Check | Result |
|---|---|
| Pages with an `Organization` node | **85 / 85** sitemap routes, **exactly one per page** (no duplicate entity) |
| Entity identity | `@id https://angelcreations.in/#organization`, typed `Organization` + `Place` |
| `sameAs` | exactly the 5 official URLs on every page; **one distinct payload** across the whole site |
| Duplicate `sameAs` blocks | none |
| Canonicals | present and self-referential on every page; 0 mismatches |

The fix required normalising the **captured per-page JSON-LD** during generation (`scripts/generateStaticFallbacks.mjs` → `normaliseOrganization()`), not just the generator's own entity: the live `Organization` node is emitted from captured page JSON-LD, so editing the template alone changed nothing. `src/utils/seo.ts` carries the same array for client-side updates.

`dist/work/index.html` (legacy stub) carries no Organization node — it is a redirect stub, is absent from the sitemap, and will 301 to `/works/`.

---

## 8. DMARC — **REQUIRES APPROVAL** (recommendation only, no DNS change)

**What is published today** (read via DNS TXT lookups in `npm run test:deliverability`):

| Record | Observed value |
|---|---|
| DMARC | `v=DMARC1; p=none` — monitoring only, **no `rua=`**, so no aggregate reports exist |
| SPF | `v=spf1 include:_spf.mail.hostinger.com ~all` — exactly one record, 3 DNS lookups |
| MX | `mx1.hostinger.com`, `mx2.hostinger.com` |
| Nameservers | `ns1.dns-parking.com`, `ns2.dns-parking.com` |
| DKIM | selector not supplied, so it could not be checked |

**Impact:** `p=none` with no `rua=` means nobody receives authentication data. Forged mail claiming `@angelcreations.in` is not acted on, and genuine failures (SPF/DKIM breaks after a DNS change, forwarding damage, a new sending service) stay invisible until a recipient complains. `~all` on SPF tolerates unauthorised senders instead of rejecting them.

**Recommended future record** — apply only after the mailbox exists:

```
v=DMARC1; p=none; rua=mailto:dmarc@angelcreations.in; fo=1; adkim=r; aspf=r; pct=100
```

**Preconditions, in order:**

1. Create and prove `dmarc@angelcreations.in` receives mail (an aggregate report is a daily zip/XML; it must not bounce).
2. Confirm **only one** DMARC TXT exists at `_dmarc.angelcreations.in` — two records make DMARC unreadable and are worse than none.
3. Confirm DKIM is a CNAME per selector from the mail provider and that a real message carries a `s=` selector, so `adkim=r` is meaningful.
4. Leave `p=none` for 2–4 weeks of reports, then step to `p=quarantine`. **Do not move to quarantine/reject in the same change as enabling reporting.**

**Not changed:** SPF, MX, DKIM, DMARC policy, and no DNS record was edited. Deliverability warnings remain intentionally open (softfail, `p=none`, no `rua`, unknown DKIM selector).

---

## 9. Files modified

| File | Change |
|---|---|
| `public/.htaccess` | +1 `RedirectMatch 301` for `/work/`; +8 security headers in a new `<IfModule mod_headers.c>` block; cache/MIME/source rules untouched |
| `scripts/generateStaticFallbacks.mjs` | `OFFICIAL_SAME_AS`, `isOrganization()`, recursive `normaliseOrganization()` applied to captured page JSON-LD |
| `src/utils/seo.ts` | runtime `Organization.sameAs` aligned to the same 5 URLs |
| `src/data/socialLinks.ts` | **new** — single source of truth for the 5 profiles (URL, label, glyph path) |
| `src/components/SiteFooter.tsx` | icon-only social links, imports the shared list |
| `src/components/ContactWizard.tsx` | contact social row, step-dot/back labels, `h3`→`h2`, `h4`→`h3` |
| `src/components/AboutPage.tsx` | metric `<span>`→`<dd>`, showreel labels, footer moved out of `<main>` |
| `src/components/LegalPage.tsx` | footer moved out of `<main>` |
| `src/components/SliderExperience.tsx` | work-card override removed, `.sr-only` outbound context added |
| `src/components/ExperienceExplorer.tsx` | domain-card overrides removed |
| `src/components/ExperienceStory.tsx` | grids → `role="group"`, stray `role="listitem"` removed |
| `src/components/MetaverseStory.tsx` | grids → `role="group"`, stray `role="listitem"` removed |
| `src/components/ExperienceProcess.tsx` | `article`→`div` for the tabpanel, CSS glyph, play/pause name |
| `src/components/VideoArchive.tsx` | stage/thumbnail accessible names |
| `src/components/HomeSlideshow.tsx` | `Prev capability` |
| `src/components/CapabilityDetail.tsx` | decorative thumbnail alt |
| `src/styles/inner-experiences.css` | selectors following the heading swaps; contact social block; CSS play/pause glyph |
| `src/styles/enhancements.css` | metric `dd`/note rules; footer social button styles |

`package.json`, `src/config/emailjs.ts`, EmailJS templates and all video/privacy code are **unchanged**. `axe-core` was installed with `--no-save` for scanning only — it is not a dependency.

---

## 10. Test results (final build)

| Command | Result |
|---|---|
| `npm run build` (`tsc -b` + Vite + generators + verify) | **pass** — 85 route documents / 94 HTML files, every asset resolves, boot fallback present, GTM/GA4 exactly once |
| `npm run test:static` | **46 / 46 checks passed** |
| `npm run test:smoke` (dev server, 5173) | **46 / 46 checks passed** |
| `npm run test:config` | **23 checks passed, 0 failed** |
| `npm run test:emailjs` | **138 checks passed, 0 failed** |
| `npm run test:fallback` | **pass** — readable content renders without `/src/main.tsx` |
| `npm run test:degraded` | **pass** — 6 routes render with every `/assets/*.js` forced to 404 |
| `npm run test:deliverability` | **4 passed, 4 warnings, 0 failed** — "authenticated but incomplete" (all 4 warnings are the DMARC/SPF items in §8) |
| `npm audit` (with and without dev deps) | **0 vulnerabilities** |
| axe — 85 sitemap routes, WCAG 2.1 A/AA | **85/85 clean** |
| axe — 14 deep desktop/mobile combos, incl. best-practice | **14/14 clean** |
| axe — 9 mobile routes, incl. best-practice | **9/9 clean** |

The only console errors in any run are `ERR_CONNECTION_CLOSED` for `googletagmanager.com/gtag/js` and `/gtm.js` — this sandbox blocks external egress. They are environmental, not site defects.

---

## 11. Desktop / tablet / mobile regression — **VERIFIED**

12 routes (`/`, `/works/`, `/work/`, `/about/`, `/contact/`, `/metaverse/`, `/capabilities/design/`, `/domains/`, `/privacy-policy/`, `/terms-of-service/`, `/mixed-reality/`, `/animation/`) × 4 viewports (1440×900, 834×1112, 390×844, 320×640) = **48 combinations**:

- **48/48 HTTP 200**, exactly one `<h1>` and one `<main>` on every page.
- **Horizontal page overflow = 0 at every size**, including 320px.
- Elements reported "wider than viewport" are decorative inside clipped containers (carousel tracks, ambient orbs, full-bleed video) — the document itself never scrolls sideways; behaviour unchanged from `main`.
- Footer: 5 icons at 34×34 on every viewport, footer height delta ≤ 1px vs the previous text links.
- Contact social row: 1080 / 786 / 358px wide, no overflow, five 34×34 targets.
- Design tokens, colours, type scale and animation are untouched: the only CSS added is selector retargeting for swapped headings, the metric note, the footer social buttons and the contact social row; the play/pause glyph moved from a text node to CSS with identical placement.

---

## 12. Remaining risks

1. **CSP is strict for third parties.** Any tag added later inside GTM-MMFB2VZ that calls a host outside the allowlist (Meta/LinkedIn/TikTok pixels, a new analytics vendor) will be silently blocked. Extend `script-src`/`connect-src` in `public/.htaccess` when such a tag is added. `'unsafe-inline'` remains in `script-src` (GTM bootstrap) and is the main residual weakness of this policy.
2. **Host-level headers.** If Hostinger or a CDN also injects CSP/HSTS, the browser enforces the intersection. Confirm with `curl -sI` that exactly one CSP is present after deploy.
3. **HSTS is one-way.** `env=HTTPS` and the absence of `includeSubDomains` limit the blast radius, but once served, browsers honour it for 6 months. Only deploy when HTTPS is confirmed for the apex **and** `www`.
4. **Redirect only exists at the server.** `.htaccess` is inert on any host that serves `dist/` without Apache; the legacy stub's meta-refresh + canonical remain the fallback.
5. **`/work/` stub is still published.** Harmless and unlinked, but it is dead weight; deleting it later is a one-line generator change.
6. **DMARC still `p=none` without `rua=`.** No enforcement, no visibility — the single largest remaining mail risk.
7. **Deferred by instruction:** mobile video weight (27.6 MB/visit), consent/consent-mode, and the EmailJS routing/auto-reply investigation. None of these were touched.
8. **`sameAs` lives in three places** (`socialLinks.ts`, `generateStaticFallbacks.mjs`, `seo.ts`). They are in sync today; a future social change must update all three.

---

## 13. Approvals needed

| # | Item | Status | Action |
|---|---|---|---|
| 1 | Deploy this branch to production | **REQUIRES APPROVAL** | No merge, no push to `main`, no deploy has been performed |
| 2 | Enable the new headers live | **REQUIRES APPROVAL** | After deploy, confirm HTTPS on apex + `www`, then run the `curl -sI` checks in §3 |
| 3 | Enable/publish DMARC `rua=` | **REQUIRES APPROVAL** | Create `dmarc@angelcreations.in`, confirm a single DMARC TXT, then add the record in §8 — no DNS change made here |
| 4 | Move DMARC to `p=quarantine` | **REQUIRES APPROVAL** | Only after 2–4 weeks of reports; never combined with #3 |
| 5 | Remove the `/work/` stub from the build | **DEFERRED** | Optional cleanup once the 301 is confirmed live |
| 6 | Component splits (§2.9) | **DEFERRED** | Documented only |
| 7 | Mobile video weight, consent mode, EmailJS routing | **DEFERRED (excluded)** | Out of scope by instruction |

**Nothing in this report is claimed as verified on production.** Every "FIXED" is verified against a local production build (`dist`) and a real browser; every "NOT VERIFIED" is a check that requires the live host.
