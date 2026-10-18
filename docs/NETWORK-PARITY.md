# Network Parity — final browser audit

**Audit date:** 2026-10-05  
**Evidence:** `route-browser-after-repair.json`, `special-page-compare-after-repair.json`, `panorama-runtime-after-repair.log`, and direct `curl`/Playwright probes executed against the final Vite preview.

## Final local network result

| Category | Executed result |
|---|---|
| Route document status checks | 228 direct/refresh browser navigations; expected statuses matched: 34 captured 200 routes and 23 captured 404 routes, at desktop and mobile |
| Unexpected local HTTP ≥400 resource responses | **0** |
| Unexpected local JavaScript/page errors in all-route audit | **0** |
| Expected browser 404 console/resource notices | 138, all attributable to the 23 intentionally captured 404 document routes across direct/refresh/navigation passes |
| Request failures during rapid audit navigation | 41 `net::ERR_ABORTED` video/range requests; no missing-resource HTTP error was observed |

The aborted requests are expected during the audit because a fresh route/refresh interrupts an in-progress video request. They are limited to homepage/background MP4s and the 360 MP4. The final targeted panorama probe received HTTP 206 `video/mp4` range responses, proving the file path is reachable.

## Repaired runtime asset paths

### Unity WebGL (`/metaverse/`)

**Observed failure before repair:** the React page fetched the production Unity `.data` and `.wasm` URLs cross-origin from `http://127.0.0.1:4173`; browser output showed CORS blocks and `TypeError: Failed to fetch`.

**Final implementation:**

- The source URL shape is `/metaverse/Build/...`.
- Vite dev/preview proxies that path read-only to the source host.
- The bridge returns the source WASM as `application/wasm` and disables cache writing for the large stream.

Final executed desktop probe observed HTTP 200 for the loader, framework, data, and WASM; no console errors and no failed requests. The iPhone-UA comparison also verified the source mobile branch: local and live both use `unity-mobile` and display **“WebGL builds are not supported on mobile devices.”** Local avoids the live server’s incorrect WASM MIME warning by correcting the proxied response.

### Panorama (`/360-video/`)

**Observed failure before repair:** the migration had reduced the source panorama implementation to a flat `<video>`, despite archived source runtime files being available.

**Final implementation:**

- Executes the archived Three.js, Panolens, and Panorama view scripts from `public/legacy-assets/other/wp-content/plugins/panorama/`.
- Retains the captured `data-attributes` (autoplay, loop, controls, fullscreen/settings, initial position and 1920×1080 layout).
- Uses a read-only same-origin Vite bridge for the unarchived 58.6 MB source MP4.

Final probes observed all three scripts at HTTP 200, panorama MP4 range requests at HTTP 206 `video/mp4`, and a created `panolens-canvas` at the source layout. Desktop Chromium emitted only WebGL/GPU performance warnings, also characteristic of the source WebGL path; no page error or missing HTTP resource resulted.

### RSS feeds

`/feed/` and `/comments/feed/` were absent from the React page collection even though `URL-INVENTORY.md` captured both as HTTP 200 RSS documents. They now return the exact captured XML as `application/rss+xml; charset=UTF-8`.

| Route | Source-capture SHA-256 | Final preview verification |
|---|---|---|
| `/feed/` | `4b10d50cd06a5d8364e6869e8937778d157ca71074a7ac038a497ec95f2fec06` | HTTP 200; identical bytes; direct + refresh browser check |
| `/comments/feed/` | `26816871eb19f5354632b9e0324157ef1914dff63c2976b3c86d6fb00c806ded` | HTTP 200; identical bytes; direct + refresh browser check |

## Source/live observations retained rather than changed

- Current live Unity reports an incorrect WASM MIME warning then falls back to ArrayBuffer instantiation. The local preview bridge corrects only the local bridge response; production was not touched.
- Current live pages emit legacy console/page errors involving missing third-party resources, Barba, and GSAP targets. Those were observed in live comparison probes; local does not load production analytics/tracking scripts in this baseline.
- Tracking/analytics presence is documented from the source capture, but IDs/secrets are not reproduced here.

## Deployment constraint

The 404 status preservation, RSS media type, Unity bridge, and panorama video bridge are final Vite preview/dev behaviors. A deployment host would need equivalent server rules. No production server, DNS, hosting, analytics, or form endpoint was changed.
