# Angel Creations — production QA and deployment verification

**Audit date:** 2026-10-19 (UTC observations through approximately 18:07Z)

**Overall production result:** **Blocked** — no production HTTP response was obtained. Local build/preview results below are explicitly separate from production results. The full target-by-target record is in [`PRODUCTION-QA-2026-10-19.json`](./PRODUCTION-QA-2026-10-19.json).

## Status key

- **Passed** — the stated check completed and met its criterion.
- **Failed** — a response was received and violated the criterion.
- **Inconclusive** — evidence exists but cannot establish the requested conclusion.
- **Blocked** — the request or test could not be completed because of a known access/tool constraint.

## HTTPS failure and attribution

| Check | Status | Observation |
|---|---|---|
| DNS resolution | **Passed** | `getent` and `socket.getaddrinfo` returned IPv4/IPv6 answers for `angelcreations.in` and `www.angelcreations.in`. Different A/AAAA sets appeared across two observations; no authoritative DNS trace was available, so the variation is not diagnosed. |
| HTTPS GET to `/` | **Blocked** | Reproduced with normal certificate verification. `curl` exit 35, status `000`, `SSL_ERROR_SYSCALL`; the TLS ClientHello was sent, then the connection ended before a certificate or HTTP headers. Observed remote address: `195.35.60.37`. |
| TLS to resolver-returned IPv4 addresses | **Blocked** | Forced SNI-preserving checks to `212.1.212.145` and `191.96.144.13` also ended with curl exit 35. No certificate-verification bypass was used. |
| OpenSSL handshake | **Blocked** | `openssl s_client` reported unexpected EOF after the ClientHello; no peer certificate was received. |
| Certificate chain/SAN/expiry | **Inconclusive** | There was no certificate to inspect. Certificate validity is **not** verified. |
| HTTP-to-HTTPS redirect | **Inconclusive** | The port-80 probe returned curl exit 52 (“Empty reply from server”), with no HTTP status or `Location` header. HTTPS also produced no response, so redirect behavior is unknown. |
| TLS control to `github.com` | **Passed** | HTTPS returned 200 and curl reported `ssl_verify_result=0`; this shows the TLS client/trust store works to that host, not that Angel Creations TLS works. |

**Root cause of this audit failure:** the production host is not reachable from this sandbox because of outbound network restrictions. The request failure is reproducible **from this environment** and is consistent with that egress restriction. It does **not** establish whether the production origin, CDN, or TLS configuration is healthy or faulty. DNS resolved; no certificate was received, so origin TLS, CDN behavior, and certificate validity remain **Inconclusive**. No TLS security option was weakened.

## Production request matrix

| Target group | Count | Status | HTTP/final URL/content type |
|---|---:|---|---|
| Sitemap routes | 21 | **Blocked** | The root TLS request did not reach HTTP. The other 20 routes were not individually requested; status, final URL, and content type are null in the JSON record. |
| Unique internal destinations | 21 | **Blocked** | Same 21 route paths; no live response was obtained. |
| Route-specific social preview images | 21 | **Blocked** | Not individually requested; production image status and MIME type remain unknown. |
| `/sitemap.xml` and `/robots.txt` | 2 | **Blocked** | Not individually requested; production status/content type unknown. |
| Unknown path and retired `/360-video/` path | 2 | **Blocked** | Production 404/410 status, title, and visible body could not be checked. |
| Redirect/alias probes (`www` root, `/about`, `/work/`) | 3 | **Blocked** | Not individually requested; no redirect status or `Location` header is known. |
| Remote Media Production `.mov` | 1 | **Blocked** | Not re-fetched. Its recorded 200 / `video/quicktime` evidence is historical repository data only. |
| External web URLs | 53 | **Blocked** | Five external hosts are not reachable under the sandbox's outbound network restrictions. None is classified as broken; authentication, bot protection, rate limits, and availability were not distinguishable. |
| `mailto:` / `tel:` targets | 4 | **Blocked** | Source targets are inventoried, but there is no browser/mail/phone handler to launch. Mailbox or phone reachability is not claimed. |

The JSON records all 50 distinct production targets with their method, URL, role, attempted flag, `httpStatus`, `finalUrl`, `contentType`, and error. The 21 internal destinations overlap the 21 sitemap routes. Only the homepage transport was attempted; the remaining same-host rows are deliberately marked not individually requested after confirming the host-level block. This is not a production pass/fail claim for those paths.

## Hostinger error handling and deployment state

| Check | Status | Finding |
|---|---|---|
| Production unknown-path 404 | **Blocked** | No production response; Hostinger status/title/body are unknown. |
| Production retired-route 410 | **Blocked** | No production response; Hostinger status/title/body are unknown. |
| Hostinger plan/document root/rewrite configuration | **Blocked** | No hosting-panel access or current server configuration was available. The repository contains no `.htaccess`, `_redirects`, `web.config`, `netlify.toml`, `vercel.json`, or equivalent production mapping. Hostinger product-specific documentation could not be queried from this sandbox because it is not reachable under the sandbox's outbound network restrictions. Vite middleware only verifies the local preview, not Hostinger. |
| Host-specific configuration recommendation | **Inconclusive** | Because the current product and rewrite controls could not be inspected, no Hostinger rule was suggested or applied. The generated `dist/404.html` and `dist/410.html` do not by themselves guarantee production HTTP 404/410. |
| Stale CI route check before correction | **Failed** | The workflow still required `/360-video/`; a local replay against the current build showed it was the sole missing route. |
| Updated CI route/document/sitemap check | **Passed** | Removed the retired route requirement; the replacement 21-route, 404/410-document, sitemap-exclusion, stylesheet, and media checks passed locally. The GitHub Actions workflow itself has not been rerun on this uncommitted branch. |
| Deployment commit comparison | **Inconclusive** | GitHub `main` was `4a441179dbaddeb688cbd002e4936c75b479a960` at audit time. Its latest successful main build run was `39232180134` (2026-10-19 09:43:17Z). The only listed workflow is **Verify production build**; it builds/uploads an artifact but does not deploy. Local changes on `arena/b78ddfb8-website` are uncommitted. The live build could not be fetched or compared. |

**Verified repository discrepancy corrected:** the CI build workflow still required a generated `/360-video/` document even though that route was retired. Replaying its route check against `dist/` showed `/360-video/` as the sole missing required route. The workflow now omits that route and instead verifies that the generated 404/410 documents exist and the retired route is absent from the sitemap. The updated equivalent local checks passed. The GitHub Actions workflow has not been rerun on this uncommitted branch.

No production files, DNS records, Hostinger settings, or live site configuration were changed. The repository deployment checklist calls for a separate preview/staging target and a recoverable backup before any production cutover; neither was available here. Do not deploy the current local artifact based on these blocked checks.

## Browser and interaction QA

**Status: Blocked.** No Chromium, Chrome, Firefox, Playwright, or Puppeteer executable/package was available; `libnspr4.so` is absent. Resolving this would require an approved browser/system package source not available under the sandbox’s egress policy. Therefore no desktop/mobile screenshots, console/network capture, direct-refresh/history tests, menu/external-link/contact/form interaction, keyboard/screen-reader QA, or reduced-motion browser test is claimed.

## Local validation (not production evidence)

| Check | Status | Result |
|---|---|---|
| `npm run build` | **Passed** | TypeScript + Vite build; 70 modules transformed; generated static fallbacks, sitemap, and robots files. |
| `auditStaticOutput.mjs` | **Passed** | 29 documents, 21 sitemap routes, 12 legacy fallbacks, no audit failures. |
| `auditEndToEnd.mjs` | **Passed** | 21/21 routes; 293 static anchors; 21/21 unique internal targets; 0 broken links; 305 local assets with 0 missing; 21 unique social previews with 0 metadata issues; 0 local status/body-marker issues. |
| Full `npm audit` | **Passed** | 0 vulnerabilities. |
| `npm audit --omit=dev` | **Passed** | 0 production dependency vulnerabilities. |
| Git whitespace check | **Passed** | `git diff --check` clean at final validation. |
| Updated CI route/document/sitemap check | **Passed** | 21 required routes, 404/410 documents, sitemap exclusion, local stylesheets, and slide media references all present. |

Local preview confirmed an unknown path as a branded HTTP 404 and `/360-video/` as a branded HTTP 410, including matching titles and body markers. These results are not evidence of Hostinger behavior.

## Next actions for an authorized deployment operator

1. From an approved network path, fetch the production homepage and all sitemap routes, internal destinations, `sitemap.xml`, `robots.txt`, 21 social images, the unknown path, `/360-video/`, and the remote video. Record status, final URL, content type, TLS chain, and relevant headers/body for each.
2. Compare HTML/metadata and asset checksums against the approved `dist/` artifact and identify the deployment commit in Hostinger’s deployment history.
3. With Hostinger access, confirm the hosting product, document root, web-server/rewrite support, and current configuration. Test any required 404/410 mapping on staging first with a backup and rollback plan.
4. Supply a browser environment with `libnspr4.so` and a supported automation browser to complete the blocked desktop/mobile and interaction matrix.
5. Re-run the updated CI workflow after the workflow correction is committed and reviewed; it has only been replayed locally so far.
