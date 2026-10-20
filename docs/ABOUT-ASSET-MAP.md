# About page asset map

**Source page:** `https://angelcreations.in/about/`  
**Verified local route:** `http://127.0.0.1:4173/about/`  
**Evidence:** [`about-assets-probe.json`](./about-assets-probe.json), captured source at [`live-html/about/index.html`](./live-html/about/index.html), and the five-viewport browser record [`about-verification.json`](./about-verification.json).

| Source asset / behavior | Local preservation path | Page use | Browser result |
|---|---|---|---|
| `/wp-content/uploads/2023/01/logo-rectangle-1.png` | `/media/logos/uploads/2023/01/logo-rectangle-1.png` | Header logo and home link | Local `200 image/png`; source responded `200` (with a legacy `image/webp` response label). The source’s empty `alt` is retained. |
| `/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | `/media/videos/uploads/2023/08/Main-Background-with-sound.mp4` | About background video and opened-menu video backdrop | Local ranged media requests returned `206 video/mp4`, with `video.readyState = 4` in every direct-load viewport. This is the original captured 8,958,400-byte video. |
| `Geograph-Regular.woff2` | `/fonts/wp-content/themes/fleava/assets/fonts/Geograph-Regular.woff2` (plus the compatibility mirror under `other/`) | About display and body typography | Local `200 font/woff2`; the same family is used by live and local computed styles. |
| `Graphik-Regular-Web.woff2` | `/legacy-assets/other/wp-content/themes/fleava/assets/fonts/Graphik-Regular-Web.woff2` (plus mirror) | Theme typography | Local `200 font/woff2`. |
| `geographweblight.woff2` | `/fonts/wp-content/themes/fleava/assets/fonts/geographweblight.woff2` | Theme light-weight typography | Local `200 font/woff2`. |
| Fleava/WordPress stylesheets: `app.css`, `custom.css`, `style.css`, `style-dark-mode.css`, Contact Form 7 and Elementor CSS, and `post-594.css` | Same-origin files under `/legacy-assets/other/wp-content/...` | Source layout, responsive rules, About-specific inline CSS, header/footer styling | Every local stylesheet requested by the page returned `200 text/css`. |
| Source inline About reveal script | [`src/components/AboutReveal.tsx`](../src/components/AboutReveal.tsx), scoped only to `data-about-page-reveal` | Splits `.reveal-text` into source-style line/word spans; scroll-reveals it with the source timing shape | Local initial render exposes the in-viewport source copy; a complete scroll exposes all 101 reveal nodes at each required viewport. |
| Source inline rotating-location script | [`src/components/AboutReveal.tsx`](../src/components/AboutReveal.tsx), scoped only to `.worded` on About | Alternates the source location strings `Braintree, UK` and `Jaipur, IN` letter-by-letter | Both source strings are split into 13 and 10 source-style letter spans and initialize visible in every required viewport. |
| Live external/analytics/plugin script references | Recorded in `about-assets-probe.json` and captured HTML; not executed as arbitrary extracted scripts | Current production also loads theme/plugin dependencies and third-party tracking/support scripts | Their presence is documented without copying tracking configuration into the local runtime. The page-specific visual behavior required for About is implemented narrowly above. |

## Asset and content boundaries

- The About document has no separate gallery images or CSS background-image assets. Its prominent visual media is the single `Main-Background-with-sound.mp4` file.
- The source inline page style block, exact section markup/copy, video, header links, and source footer are retained. The local source footer has the same three source anchors: `Privacy Policy`, Instagram icon, and Facebook icon; all are `#` anchors in the current live page.
- The original source includes current-live third-party/plugin script references. It also produces legacy source-side console/network noise in a live browser. Those scripts were not enabled wholesale; the repair avoids arbitrary inline-script execution while restoring the two About-only behaviors that hid content or left the rotating location text invisible.
