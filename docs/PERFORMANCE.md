# Performance, video and asset structure

Measured with Playwright (Chromium, 1440x900, local static host, network bytes from
`PerformanceResourceTiming` after 12 s on page so lazy work is included).

## Video: every film runs as soon as the page opens

The seven capability films on the homepage are muted background footage, so they are all
bound to their source and playing from the first paint instead of waiting for a timer or
for their slide to be selected. Nothing buffers on the first swipe.

| Film | Before (master) | Now | Notes |
| --- | --- | --- | --- |
| Metaverse.mp4 | 35.96 MB @ 7.4 Mbps | 11.35 MB | 1280x720, CRF 21 capped at 2.4 Mbps |
| Augmented-Reality-Showroom.mp4 | 14.54 MB @ 3.3 Mbps | 6.38 MB | 1280x720, capped at 1.5 Mbps |
| Virtual-Reality.mp4 | 4.33 MB | 3.02 MB | 1280x720, capped at 1.3 Mbps |
| Mixed-Reality.mp4 | 2.98 MB | 3.20 MB | 1280x720, capped at 1.3 Mbps |
| Main-Background-with-sound.mp4 | 8.96 MB @ 6.4 Mbps | 1.98 MB | 1920x1080 (true HD), audio kept at 128 kbps AAC |
| Singing-girl.mp4 | 1.30 MB | 1.30 MB | already an efficient master, kept as-is |
| Brand-Advertisement.mp4 | 0.42 MB | 0.42 MB | already an efficient master, kept as-is |
| **Total** | **68.5 MB** | **27.6 MB** | native resolution, high quality, `+faststart` for instant start |

The masters are 1280x720 except the 1080p menu/showreel film, so "HD" here is the footage's
own resolution; upscaling would have added bytes without adding detail. Encodes are CRF 21
with a bitrate ceiling, which keeps the grain and the neon detail while removing the
7.4 Mbps over-encoding of the original.

## Route weight

| Route | Before | After | What the visitor sees |
| --- | --- | --- | --- |
| `/` | 73.28 MB | 10.9 MB in the first 12 s, then progressive buffering | posters + headline in ~230 ms, all seven films already moving |
| `/about/` | 11.31 MB | 2.83 MB | hero film playing, showreel waits for a click |
| `/metaverse/` | 3.71 MB | 1.39 MB | poster hero, gallery lazy |
| `/works/` | 3.20 MB | 1.43 MB | filmstrip images lazy |
| `/contact/` | 1.11 MB | 0.66 MB | form only |

First Contentful Paint stays at 130-230 ms on every route because nothing on the critical
path waits for media: the posters are 11-63 KB WebP, the stylesheet is one 270 KB bundle,
and the entry script is 65 KB gzip.

Saved-data and `prefers-reduced-motion` visitors still get `preload="none"` and no autoplay.

## Other changes behind those numbers

1. **The theme stylesheets are first-party code.** They used to be four `<link>` requests to
   an archived directory; they now live in `src/styles/angel/` and are bundled and minified
   by Vite into a single stylesheet.
2. **Posters are generated as WebP** (11-63 KB each) and are what paints before the first
   video frame.
3. **No route payload JSON.** The archived-page renderer and its per-route `page-data/*.json`
   files were removed; every public route is served by an Angel Creations component.
4. **A latent bug was fixed on the way**: the Media Production slide carried
   `type="video/quicktime"` from an old .mov reference, so the browser silently refused to
   load it. It is now `video/mp4` and plays with the rest.

## Asset layout

```
public/
  favicon/       icon-16/32/48/64/192/512, apple-touch-icon, source logo
  favicon.ico
  site.webmanifest
  fonts/         webfonts referenced by the site stylesheet (/fonts/…)
  media/
    images/      posters and page photography
    library/     discipline photography used by About and capabilities
    logos/       studio marks
    icons/       small UI marks
    svg/         vector marks
    videos/      background films
    thumbnails/  works archive thumbnails
    social/      Open Graph share images
```

No path in the codebase, the build output or the HTML refers to the previous platform's
directory names.
