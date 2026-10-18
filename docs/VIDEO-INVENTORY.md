# Video, Animation & Interactive Media Inventory

> Capture is read-only. Playback configuration below is taken from the retrieved HTML/attributes; no production form action or media mutation occurred.

## First-party local video archive

| Source | Local path | Usage | Autoplay | Muted | Loop | Controls | Poster / preload |
|---|---|---|---:|---:|---:|---:|---|
| `https://angelcreations.in/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4` | Global overlay menu background; reused on content pages | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/08/Metaverse.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/08/Metaverse.mp4` | Home slide 01 | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/08/Mixed-Reality.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/08/Mixed-Reality.mp4` | Home slide 02 | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/08/Virtual-Reality.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/08/Virtual-Reality.mp4` | Home slide 03 | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/05/Augmented-Reality-Showroom.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/05/Augmented-Reality-Showroom.mp4` | Home slide 04 | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/05/Singing-girl.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/05/Singing-girl.mp4` | Home slide 05 | yes | yes | yes | no | none / default |
| `https://angelcreations.in/wp-content/uploads/2023/05/Brand-Advertisement.mp4` | `/legacy-assets/videos/wp-content/uploads/2023/05/Brand-Advertisement.mp4` | Home slide 06 | yes | yes | yes | no | none / default |

## First-party source recorded but not copied

| Source | Usage | Captured configuration | Archival status |
|---|---|---|---|
| `https://angelcreations.in/wp-content/uploads/2023/05/an-experienced-video-production-engineer-works-on-2022-08-10-17-32-35-utc.mov` | Home slide 07 / Media Production | autoplay, muted, loop; no controls; source declares `type="video/mp4"` despite `.mov` URL | Server declared 310,558,720 bytes; not copied because it exceeds the per-file archive safeguard. Exact URL retained. |
| `https://angelcreations.in/wp-content/uploads/2023/01/Y2meta.app-360°-VR-TERRIFYING-Sea-Creatures-_-Deep-Ocean-Horror-720p60.mp4` | `/360-video/` Panorama block | `autoplay:true`, `loop:true`, `muted:false`, `controlBar:false`, `fullscreen:true`, `setting:true`, `video:true`; configured layouts 1920×1080 desktop/tablet/mobile | Discovered in Panorama block `data-attributes`, not a direct media DOM attribute; source/runtime not copied. |

## Interactive / animation runtimes

| Item | Source/configuration | Local status |
|---|---|---|
| Metaverse Unity WebGL | `/metaverse/` has 960×600 desktop canvas; dynamic loader `Build/Metaverse05_Browser_Jan31.loader.js`; data/framework/wasm URLs; product `MetaScore` version `0.1`; mobile displays “WebGL builds are not supported on mobile devices.” | HTML, TemplateData CSS/images/logos, loader size evidence and configuration are preserved. Build `.data` / `.wasm` binaries are not archived; local route has a documented best-effort remote bridge. |
| 360 Panorama | WordPress Panorama plugin with Three.js + Panolens | Plugin JS dependencies are archived; required media/panorama behaviour is unresolved without its media/runtime bundle. |
| Animated GIF / Lottie / third-party YouTube/Vimeo embeds | None found in the captured page records. | N/A |

## Empty legacy template media

The captured Animation, Brand Advertisement, Media Production, Mixed Reality, and Virtual Reality service-detail templates include video elements with empty source attributes. This is recorded as current behaviour and has not been filled with replacement media.
