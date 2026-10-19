# Angel Creations end-to-end audit

Audit date: 2026-10-19. Scope: built repository output and local preview only.

## Results

- Sitemap pages: 21/21 returned HTTP 200 in local preview.
- Static anchor instances: 293; unique internal anchor targets: 21; broken local targets: 0.
- Local build asset URLs checked: 305; missing/unserved: 0.
- Social previews: 21/21 unique page-specific images; metadata issues: 0.
- External web URLs inventoried: 53 across 5 hosts; 4 mail/telephone protocol targets are listed separately. Remote checks were not performed.
- Same-origin remote media assets inventoried: 1; the 310 MB QuickTime source has historical repository evidence but was not re-fetched.
- Insecure HTTP web destinations remaining in active source/anchors: 0.
- Error/status probes with unexpected local results: 0; branded 404/410 body markers: 3/3 matched.

## Verified repairs

- Removed the stale no-JavaScript /360-video/ navigation link; the intentionally retired route now returns a branded 410 in local preview.
- Changed the About and footer Virtual Life destination from HTTP to the same HTTPS URL already used by the header.
- Aligned the remote Media Production slide source type with the repository asset manifest’s historical video/quicktime response; the 310 MB source was not re-fetched.
- Removed missing legacy SVG font fallback URLs from the active legacy stylesheet while retaining existing WOFF/WOFF2/TTF sources.
- Added unique 1200×630 local social-preview images and per-route Open Graph/Twitter headline, description, URL, dimensions, MIME type, and alt metadata for all 21 sitemap routes.
- Added a React render-error boundary and generated branded 403/404/410/500/502/503/504 documents; only local 404/410 path status behavior was verified.
- Corrected the production-build CI check to exclude the retired /360-video/ page and require the generated 404/410 documents plus sitemap exclusion.

## Route and social-preview inventory

| Route | Local status | Canonical | Page title | Share headline | Social image |
|---|---:|---|---|---|---|
| `/` | 200 | https://angelcreations.in/ | Angel Creations \| Immersive Experiences, VR, AR & Film | Immersive worlds. Human stories. | https://angelcreations.in/social/og/home.jpg |
| `/about/` | 200 | https://angelcreations.in/about/ | About Angel Creations \| Creative & Immersive Studio | Meet the creative studio. | https://angelcreations.in/social/og/about.jpg |
| `/animation/` | 200 | https://angelcreations.in/animation/ | 2D & 3D Animation, Motion Graphics & VFX \| Angel Creations | Stories in motion. | https://angelcreations.in/social/og/animation.jpg |
| `/augment-reality/` | 200 | https://angelcreations.in/augment-reality/ | Augmented Reality Experiences & Apps \| Angel Creations | A digital layer on the real world. | https://angelcreations.in/social/og/augmented-reality.jpg |
| `/brand-advertisement/` | 200 | https://angelcreations.in/brand-advertisement/ | Brand Films & Creative Campaigns \| Angel Creations | Campaigns with a point of view. | https://angelcreations.in/social/og/brand-advertisement.jpg |
| `/contact/` | 200 | https://angelcreations.in/contact/ | Start a Project Enquiry \| Angel Creations | Let’s start a conversation. | https://angelcreations.in/social/og/contact.jpg |
| `/media-production/` | 200 | https://angelcreations.in/media-production/ | Film, Video & Media Production \| Angel Creations | From first frame to final cut. | https://angelcreations.in/social/og/media-production.jpg |
| `/metaverse/` | 200 | https://angelcreations.in/metaverse/ | Metaverse & Virtual World Experiences \| Angel Creations | Virtual worlds, made tangible. | https://angelcreations.in/social/og/metaverse.jpg |
| `/mixed-reality/` | 200 | https://angelcreations.in/mixed-reality/ | Mixed Reality Experiences & Development \| Angel Creations | Where the real meets digital. | https://angelcreations.in/social/og/mixed-reality.jpg |
| `/privacy-policy/` | 200 | https://angelcreations.in/privacy-policy/ | Privacy Policy \| Angel Creations | How this site uses your data. | https://angelcreations.in/social/og/privacy-policy.jpg |
| `/terms-of-service/` | 200 | https://angelcreations.in/terms-of-service/ | Terms of Service \| Angel Creations | The terms for using this site. | https://angelcreations.in/social/og/terms-of-service.jpg |
| `/virtual-reality/` | 200 | https://angelcreations.in/virtual-reality/ | Virtual Reality Experiences & Development \| Angel Creations | Step inside the story. | https://angelcreations.in/social/og/virtual-reality.jpg |
| `/works/` | 200 | https://angelcreations.in/works/ | Selected Work \| Angel Creations | Selected work from Angel Creations. | https://angelcreations.in/social/og/works.jpg |
| `/capabilities/brand/` | 200 | https://angelcreations.in/capabilities/brand/ | Brand & Creative Campaigns \| Angel Creations | Build a vivid brand story. | https://angelcreations.in/social/og/capability-brand.jpg |
| `/capabilities/design/` | 200 | https://angelcreations.in/capabilities/design/ | Design & Creative Studio \| Angel Creations | Design with purpose and feeling. | https://angelcreations.in/social/og/capability-design.jpg |
| `/capabilities/content/` | 200 | https://angelcreations.in/capabilities/content/ | Immersive Content Production \| Angel Creations | Content for immersive spaces. | https://angelcreations.in/social/og/capability-content.jpg |
| `/capabilities/film/` | 200 | https://angelcreations.in/capabilities/film/ | Film & Video Production \| Angel Creations | Shape a story, frame by frame. | https://angelcreations.in/social/og/capability-film.jpg |
| `/capabilities/animation-3d/` | 200 | https://angelcreations.in/capabilities/animation-3d/ | 2D & 3D Animation and VFX \| Angel Creations | Ideas in motion and dimension. | https://angelcreations.in/social/og/capability-animation-3d.jpg |
| `/capabilities/digital/` | 200 | https://angelcreations.in/capabilities/digital/ | Digital Experiences & Development \| Angel Creations | Digital experiences, made useful. | https://angelcreations.in/social/og/capability-digital.jpg |
| `/capabilities/experiences/` | 200 | https://angelcreations.in/capabilities/experiences/ | Immersive Experiences & Events \| Angel Creations | Spaces for shared moments. | https://angelcreations.in/social/og/capability-experiences.jpg |
| `/capabilities/creative-technology/` | 200 | https://angelcreations.in/capabilities/creative-technology/ | Creative Technology & XR \| Angel Creations | Creative thinking meets technology. | https://angelcreations.in/social/og/capability-creative-technology.jpg |

## Error and alias probes (local preview)

| URL | HTTP status | Location | Response title | Branded body marker |
|---|---:|---|---|---|
| `/work/` | 200 | — | Works archive \| Angel Creations | — |
| `/about` | 301 | /about/ | — | — |
| `/360-video/` | 410 | — | Experience retired \| Angel Creations | yes |
| `/360-video` | 410 | — | Experience retired \| Angel Creations | yes |
| `/made-up-route-for-audit/` | 404 | — | Page not found \| Angel Creations | yes |
| `/feed/` | 200 | — | Angel Creations – A Creative Powerhouse | — |
| `/comments/feed/` | 200 | — | Comments for Angel Creations – A Creative Powerhouse | — |
| `/404.html` | 200 | — | Page not found \| Angel Creations | — |
| `/403.html` | 200 | — | Access unavailable \| Angel Creations | — |
| `/410.html` | 200 | — | Experience retired \| Angel Creations | — |
| `/500.html` | 200 | — | Something went wrong \| Angel Creations | — |
| `/502.html` | 200 | — | Temporary connection issue \| Angel Creations | — |
| `/503.html` | 200 | — | Temporarily unavailable \| Angel Creations | — |
| `/504.html` | 200 | — | Request timed out \| Angel Creations | — |

## Static anchor inventory by route

- `/` — 12 anchors: `/about/`, `/works/`, `/contact/`, `/metaverse/`, `/mixed-reality/`, `/virtual-reality/`, `/augment-reality/`, `/animation/`, `/brand-advertisement/`, `/media-production/`, `/privacy-policy/`, `/terms-of-service/`
- `/about/` — 14 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/content/`, `/capabilities/film/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/privacy-policy/`, `/terms-of-service/`
- `/animation/` — 20 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=1tO39Xqzh9c`, `https://www.youtube.com/watch?v=Bcvrpn7pzA0`, `https://www.youtube.com/watch?v=hHzjY9phuLM`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/content/`, `/capabilities/film/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/augment-reality/`, `/brand-advertisement/`, `/privacy-policy/`, `/terms-of-service/`
- `/augment-reality/` — 18 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=LwU4A0ED6aM`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/capabilities/content/`, `/virtual-reality/`, `/animation/`, `/privacy-policy/`, `/terms-of-service/`
- `/brand-advertisement/` — 21 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=hHzjY9phuLM`, `https://www.youtube.com/watch?v=GkxPabDVf6o`, `https://www.youtube.com/watch?v=tSxmKGesh8k`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/content/`, `/capabilities/film/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/animation/`, `/media-production/`, `/privacy-policy/`, `/terms-of-service/`
- `/contact/` — 6 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/media-production/` — 20 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=CIZqPGn31nM`, `https://www.youtube.com/watch?v=50O6nC07BvQ`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/content/`, `/capabilities/film/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/brand-advertisement/`, `/metaverse/`, `/privacy-policy/`, `/terms-of-service/`
- `/metaverse/` — 18 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/capabilities/brand/`, `/capabilities/design/`, `/capabilities/content/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/media-production/`, `/mixed-reality/`, `/privacy-policy/`, `/terms-of-service/`
- `/mixed-reality/` — 17 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/capabilities/design/`, `/capabilities/animation-3d/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/capabilities/content/`, `/metaverse/`, `/virtual-reality/`, `/privacy-policy/`, `/terms-of-service/`
- `/privacy-policy/` — 6 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/terms-of-service/` — 6 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/virtual-reality/` — 18 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=LwU4A0ED6aM`, `/capabilities/animation-3d/`, `/capabilities/content/`, `/capabilities/film/`, `/capabilities/digital/`, `/capabilities/experiences/`, `/capabilities/creative-technology/`, `/capabilities/design/`, `/mixed-reality/`, `/augment-reality/`, `/privacy-policy/`, `/terms-of-service/`
- `/works/` — 53 anchors: `/`, `/about/`, `/works/`, `/contact/`, `https://www.youtube.com/watch?v=UrH3HFH7PQs`, `https://www.youtube.com/watch?v=ODHBHIhCQck`, `https://www.youtube.com/watch?v=o9vkQOLT7T8`, `https://www.youtube.com/watch?v=JuDxL6Vx-V4`, `https://www.youtube.com/watch?v=n8OVCgNDb0c`, `https://www.youtube.com/watch?v=Icz_vMwFBFA`, `https://www.youtube.com/watch?v=RXeOJh57bbs`, `https://www.youtube.com/watch?v=HVrinNB0RwY`, `https://www.youtube.com/watch?v=1tO39Xqzh9c`, `https://www.youtube.com/watch?v=Bcvrpn7pzA0`, `https://www.youtube.com/watch?v=VSw9Zf1Ugjk`, `https://www.youtube.com/watch?v=Xm0STB55Udk`, `https://www.youtube.com/watch?v=LwU4A0ED6aM`, `https://www.youtube.com/watch?v=hHzjY9phuLM`, `https://www.youtube.com/watch?v=GkxPabDVf6o`, `https://www.youtube.com/watch?v=7hfMEF-6JDc`, `https://www.youtube.com/watch?v=MRwA-EoLP3I`, `https://www.youtube.com/watch?v=tSxmKGesh8k`, `https://www.youtube.com/watch?v=CIZqPGn31nM`, `https://www.youtube.com/watch?v=h6REriwKUM4`, `https://www.youtube.com/watch?v=Sa5mP4ajXyU`, `https://www.youtube.com/watch?v=VttjwJFS81s`, `https://www.youtube.com/watch?v=lkwYiwynaUU`, `https://www.youtube.com/watch?v=Mwy4zslFCHc`, `https://www.youtube.com/watch?v=3PrHierkGoE`, `https://www.youtube.com/watch?v=gRFpyWS1LIU`, `https://www.youtube.com/watch?v=VvLtnh_z6KI`, `https://www.youtube.com/watch?v=WpykIhD0A-s`, `https://www.youtube.com/watch?v=QR0wJM3En3M`, `https://www.youtube.com/watch?v=IE5YNQwfQeo`, `https://www.youtube.com/watch?v=itMJHjIi5aE`, `https://www.youtube.com/watch?v=2AdaMd83ULw`, `https://www.youtube.com/watch?v=fS992chJV4U`, `https://www.youtube.com/watch?v=gmnLd5YKZ6Y`, `https://www.youtube.com/watch?v=-h9jRYAjwZw`, `https://www.youtube.com/watch?v=X8qqEUgUArI`, `https://www.youtube.com/watch?v=xFaRvdL_0Bg`, `https://www.youtube.com/watch?v=M8eKzjTE8sw`, `https://www.youtube.com/watch?v=9hQw1pnzyaY`, `https://www.youtube.com/watch?v=yzc-7e1zmbc`, `https://www.youtube.com/watch?v=wCTEgu1Hwnc`, `https://www.youtube.com/watch?v=wz1Iea_HUlA`, `https://www.youtube.com/watch?v=50O6nC07BvQ`, `https://www.youtube.com/watch?v=1xsCfOKk_3s`, `https://www.youtube.com/watch?v=Vpon7zWFTRE`, `https://www.youtube.com/watch?v=omeS_i3ivlk`, `https://www.youtube.com/watch?v=OWepxMT5dlU`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/brand/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/design/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/content/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/film/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/animation-3d/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/digital/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/experiences/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`
- `/capabilities/creative-technology/` — 8 anchors: `/`, `/about/`, `/works/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/`

## External URLs and contact protocols

Every active target with its source and label is recorded in `END-TO-END-LINK-INVENTORY.json`. Remote HTTP responses were not tested.

- https://thevirtuallife.in/ — src/components/AboutPage.tsx; src/components/Header.tsx; src/components/LegacyFooter.tsx
- https://thevirtuallife.in/weddinginvite/ — src/components/AboutPage.tsx; src/components/Header.tsx; src/components/LegacyFooter.tsx
- https://www.facebook.com/angelcreations.digital/ — src/components/LegacyFooter.tsx
- https://www.instagram.com/angelcreations.digital/ — src/components/LegacyFooter.tsx
- https://www.linkedin.com/in/angelcreations/ — src/components/LegacyFooter.tsx
- https://www.youtube.com/AngelCreationsACreativeStudio — src/components/LegacyFooter.tsx
- https://www.youtube.com/watch?v=-h9jRYAjwZw — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=1tO39Xqzh9c — Static anchor on /animation/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=1xsCfOKk_3s — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=2AdaMd83ULw — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=3PrHierkGoE — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=50O6nC07BvQ — Static anchor on /media-production/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=7hfMEF-6JDc — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=9hQw1pnzyaY — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Bcvrpn7pzA0 — Static anchor on /animation/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=CIZqPGn31nM — Static anchor on /media-production/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=fS992chJV4U — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=GkxPabDVf6o — Static anchor on /brand-advertisement/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=gmnLd5YKZ6Y — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=gRFpyWS1LIU — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=h6REriwKUM4 — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=hHzjY9phuLM — Static anchor on /animation/; Static anchor on /brand-advertisement/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=HVrinNB0RwY — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Icz_vMwFBFA — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=IE5YNQwfQeo — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=itMJHjIi5aE — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=JuDxL6Vx-V4 — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=lkwYiwynaUU — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=LwU4A0ED6aM — Static anchor on /augment-reality/; Static anchor on /virtual-reality/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=M8eKzjTE8sw — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=MRwA-EoLP3I — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Mwy4zslFCHc — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=n8OVCgNDb0c — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=o9vkQOLT7T8 — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=ODHBHIhCQck — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=omeS_i3ivlk — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=OWepxMT5dlU — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=QR0wJM3En3M — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=RXeOJh57bbs — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Sa5mP4ajXyU — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=tSxmKGesh8k — Static anchor on /brand-advertisement/; Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=UrH3HFH7PQs — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Vpon7zWFTRE — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=VSw9Zf1Ugjk — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=VttjwJFS81s — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=VvLtnh_z6KI — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=wCTEgu1Hwnc — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=WpykIhD0A-s — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=wz1Iea_HUlA — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=X8qqEUgUArI — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=xFaRvdL_0Bg — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=Xm0STB55Udk — Static anchor on /works/; Works archive / src/data/videoArchive.json
- https://www.youtube.com/watch?v=yzc-7e1zmbc — Static anchor on /works/; Works archive / src/data/videoArchive.json
- mailto:business@angelcreations.in — src/components/ContactWizard.tsx; src/components/Header.tsx; src/components/LegacyFooter.tsx
- mailto:business@angelcreations.in?subject=dynamic-form-fields — src/components/ContactWizard.tsx
- mailto:support@angelcreations.in — src/components/ContactWizard.tsx; src/components/Header.tsx; src/components/LegacyFooter.tsx; src/components/LegalPage.tsx
- tel:+918058465733 — src/components/ContactWizard.tsx; src/components/Header.tsx; src/components/LegacyFooter.tsx

## Error handling and deployment notes

- Local preview returns 404 for unknown extensionless paths and 410 for the intentionally retired `/360-video/` route. The branded 403/404/410/500/502/503/504 HTML documents are generated in `dist/`.
- Error document files return HTTP 200 when requested directly. Hostinger/production must be explicitly configured to map each error status to its document; that mapping was not found or tested, so no production status behavior is claimed.
- React render errors are caught by the client-side boundary; this does not create an HTTP 500. Server/proxy 5xx codes remain the host’s responsibility.
- No production error-page or rewrite rule is recommended here. Confirm the actual Hostinger product/server and its current supported static-hosting/error-page controls, then test any change on staging with a backup and rollback plan.
- Roll back by restoring the previous deployed artifact/configuration; if the changes are committed, revert the audit/fix commit on the session branch.

## Production verification (separate from local preview)

- Overall production status: **Blocked**. DNS resolution: **Passed**; the target resolves, but is not reachable under the sandbox's outbound network restrictions.
- Root HTTPS: **Blocked** after curl exit 35 / `SSL_ERROR_SYSCALL`; the TLS handshake ended before a certificate or HTTP headers. The GitHub TLS control request passed with certificate verification enabled, but this does not diagnose the production origin.
- Certificate validity, redirect behavior, and DNS/CDN/origin attribution: **Inconclusive**. The certificate was not received; no production HTTP response was obtained.
- Sitemap routes, internal destinations, sitemap/robots, social images, production 404/410, external links, remote media, and production SEO: **Blocked**; 0 production HTTP responses were received. No missing or broken production targets are inferred.
- Browser/interaction QA: **Blocked**. No browser binary or automation package is installed; libnspr4.so is absent.
- Live deployment comparison: **Inconclusive**. GitHub main is 4a441179dbaddeb688cbd002e4936c75b479a960; its workflow builds an artifact but does not deploy. Current local changes are uncommitted.
- Detailed per-target statuses and next actions: [PRODUCTION-QA-2026-10-19.json](PRODUCTION-QA-2026-10-19.json).

## Limitations

- Production HTTPS is blocked in this sandbox: the target is outside the permitted outbound hosts and TLS ended with curl exit 35 before any certificate or HTTP response. This does not establish a DNS/CDN/origin TLS defect.
- Production sitemap routes, internal destinations, error URLs, robots/sitemap, social images, metadata, and the remote video were not individually requested; no live status, final URL, content type, or current media response is claimed.
- The 53 external web destinations and four mail/telephone protocol targets are inventoried, but destination availability and client launch were not verified; none is classified as broken.
- Browser interactions, Back/Forward, touch/keyboard, responsive screenshots, screen-reader testing, console/network inspection, and form-client launch are blocked by the missing browser binary, automation package, and libnspr4.so.
- A generated HTML error document is not proof that Hostinger maps it while preserving the corresponding production HTTP status; live Hostinger product/settings remain inaccessible.

The JSON file is the full URL, link, asset, route, status, and social-preview inventory.
