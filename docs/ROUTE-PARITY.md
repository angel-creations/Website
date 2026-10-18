# Route Parity — final browser audit

**Audit date:** 2026-10-05  
**Local target:** `http://127.0.0.1:4173` (`vite preview`)  
**Source of truth:** `https://angelcreations.in/` and `docs/URL-INVENTORY.md`  
**Method:** Playwright Chromium, direct browser navigation and browser refresh at 1440×900 and 390×844. The mobile audit used touch emulation; selected Unity tests also used an iPhone user agent. No production forms were submitted.

## Result

| Captured route class | Inventory routes | Direct-load checks | Refresh checks | Result |
|---|---:|---:|---:|---|
| Captured HTTP 200 routes, including RSS | 34 | 68 | 68 | PASS |
| Captured HTTP 404 routes | 23 | 46 | 46 | PASS |
| **All URL-INVENTORY routes** | **57** | **114** | **114** | **PASS — 228/228 direct-or-refresh checks** |

The executed JSON record is [`route-browser-after-repair.json`](./route-browser-after-repair.json). It reports zero route failures after comparing the browser response status, final pathname/query, non-empty expected rendered document, and the captured 404 content where applicable.

### URL shape and status preservation

- Trailing slashes, extension-shaped paths, aliases, percent-encoded `works%20types` paths, and search routes were loaded without normalizing the address bar.
- The WordPress pagination anchors actually emit `?s` while the captured inventory request serializes the same empty parameter as `?s=`. The migration retains the clicked `?s` URL and maps it to the captured result page rather than rendering 404. This was clicked and verified at desktop and mobile; see [`clicked-link-audit-after-repair.json`](./clicked-link-audit-after-repair.json).
- All 23 captured 404 URLs now return browser HTTP **404** and render the captured `Nothing here` 404 page, rather than rendering home. The Vite preview middleware intentionally preserves these statuses while Vite supplies the React document.
- `/feed/` and `/comments/feed/` return browser HTTP **200**, `application/rss+xml; charset=UTF-8`, and byte-identical preserved captures. Direct load and refresh were browser-tested. The raw XML also remains in `public/legacy-assets/other/feeds/`.

## Clicked navigation and history

| Test | Executed result |
|---|---|
| Distinct visible rendered internal-link destinations | 41 destinations × desktop/mobile = **82 clicks**, 0 failures |
| Opened global menu primary/legal links | 10 explicit desktop/mobile checks; desktop all passed; mobile About/Works/Contact passed |
| Global menu from page contexts | 108 page-context checks (54 header-bearing HTML routes × desktop/mobile) |
| Logo from page contexts | **108/108** click checks navigated to `/` |
| Browser history | Desktop and mobile menu click → About, Back → Home, Forward → About: **2/2 passed** |

The global menu test confirms the current production-intended visible `mobile_link` controls. The ordinary `.menu__item` controls remain hidden because current production `custom.css` sets them `display:none`; this was not overridden.

Nineteen inventory addresses have no rendered source anchor to click (notably raw RSS endpoints, the forensic URL, and several legacy `.html` 404 endpoints). They were nevertheless direct-loaded and refreshed above; they were not fabricated as new navigation links. The complete set is recorded in `clicked-link-audit-after-repair.json`.

## Page-specific interaction checks

- **Homepage:** see the dedicated slider result in [`FUNCTIONAL-PARITY.md`](./FUNCTIONAL-PARITY.md).
- **Contact:** 8-step form presence plus empty-step blocking, valid next, and previous navigation passed at desktop and mobile without submitting a form. Evidence: [`contact-wizard-after-repair.json`](./contact-wizard-after-repair.json).
- **360 video:** the archived Three.js, Panolens, and panorama view scripts initialize a `panolens-canvas`; the source 360 MP4 returns range responses through the same-origin preview bridge. Evidence: [`panorama-runtime-after-repair.log`](./panorama-runtime-after-repair.log).
- **Metaverse:** Unity loader, framework, data, and WASM requests completed at local same-origin URLs with no local console/network error in the executed desktop test. The iPhone branch displays the source mobile warning and uses `unity-mobile`; see the functional report.

## Known live-equivalent interaction defects retained

These are not local regressions and were not “fixed” because current production exhibits them too:

1. On **mobile `/360-video/`**, the 1920×1080 source panorama canvas covers the header menu hit target.
2. On **mobile `/hello-world/`**, the legacy entry footer covers the header menu hit target.
3. In the opened mobile menu, legal links are placed beyond the 390px viewport (`x≈592` and `x≈660`) in both local and live production.

Consequently, two physical menu clicks in the all-page mobile audit time out (`/360-video/` and `/hello-world/`), while the URL and rendered-route checks pass. This is documented as parity with the live behavior, not a PASS claim for those source defects.

## Deployment note

The Vite preview has explicit middleware for the preserved feeds and captured 404 statuses, plus read-only same-origin bridges for unarchived runtime binaries. A future non-Vite host must carry equivalent response-status, feed, and proxy rules; no production host configuration was changed in this task.

---

## About page parity repair — PASS

**Executed after the baseline audit:** 2026-10-05  
**Source:** `https://angelcreations.in/about/`  
**Evidence:** [`about-verification.json`](./about-verification.json), [`about-assets-probe.json`](./about-assets-probe.json), [`ABOUT-ASSET-MAP.md`](./ABOUT-ASSET-MAP.md), and `baseline/about-verified-*` screenshots.

| Area | Executed result | Status |
|---|---|---|
| **Route** | Direct `/about/` returned HTTP 200 in five fresh contexts. Direct `/about` returned the source-equivalent HTTP 301 `Location: /about/`, then loaded the 200 About document. Refresh was run at each viewport. | **PASS** |
| **Content** | Source title `About - Angel Creations - A Creative Powerhouse`, source H1, and the visible source headings `Who we are`, `Capabilities`, `We're all around`, culture statement, `Our Client`, and `Sectors` matched live. The captured empty second-capability heading remains empty, as on live. Section order and source copy were not replaced. | **PASS** |
| **Assets** | Header logo, source `Main-Background-with-sound.mp4`, source font files and stylesheet set loaded from same-origin preserved paths. The video reached `readyState=4`; ranged requests were `206 video/mp4`. See the asset map. | **PASS** |
| **Navigation** | Actual homepage menu click → About, browser Back → homepage, and Forward → About passed in each of the five viewport contexts. Header links and the three source footer anchors are present. | **PASS** |
| **Interactions** | The original About reveal behavior is now initialized: all 101 `.reveal-text` nodes became visible after a complete source-style scroll at every viewport. The source letter rotation for `Braintree, UK` / `Jaipur, IN` initializes in each case. | **PASS** |
| **Responsive** | Live/local section x/y/width/height geometry matched exactly (within <1 px) for header, Who, services, around, culture, clients, sectors, and footer at 390×844, 430×932, 834×1194, 1440×900, and 1920×1080. | **PASS** |
| **Console** | Local direct, refreshed, alias, click, Back, and Forward contexts had zero page errors and zero console errors. | **PASS** |
| **Network** | No local HTTP ≥400 responses or unexpected failed requests. Navigation can abort in-flight source MP4 media requests (`net::ERR_ABORTED`); those are expected browser cancellations, not load failures. | **PASS** |

The live no-slash endpoint was browser-checked separately and confirmed to be a WordPress 301 to `/about/`; the local preview mirrors that canonical behavior rather than rendering the prior generic 404 fallback. No unrelated page implementation was changed for this repair.
