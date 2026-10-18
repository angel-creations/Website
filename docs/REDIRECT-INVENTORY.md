# Redirect Inventory & Route Mapping

> HTTP checks followed redirects. No URL record in this read-only capture reports a different `final_url`; the important issue is duplicate slash/no-slash output and linked paths which render live 404 templates.

| Original URL | React route | Current status / outcome | Preservation recommendation |
|---|---|---|---|
| `https://angelcreations.in/` | `/` | HTTP 200; final `https://angelcreations.in/` | Render directly. |
| `https://angelcreations.in/360-video/` | `/360-video/` | HTTP 200; final `https://angelcreations.in/360-video/` | Render directly. |
| `https://angelcreations.in/?s=` | `/?s=` | HTTP 200; final `https://angelcreations.in/?s=` | Render directly. |
| `https://angelcreations.in/about/` | `/about/` | HTTP 200; final `https://angelcreations.in/about/` | Render directly. |
| `https://angelcreations.in/animation/` | `/animation/` | HTTP 200; final `https://angelcreations.in/animation/` | Render directly. |
| `https://angelcreations.in/augment-reality/` | `/augment-reality/` | HTTP 200; final `https://angelcreations.in/augment-reality/` | Render directly. |
| `https://angelcreations.in/brand-advertisement/` | `/brand-advertisement/` | HTTP 200; final `https://angelcreations.in/brand-advertisement/` | Render directly. |
| `https://angelcreations.in/category/uncategorized/` | `/category/uncategorized/` | HTTP 200; final `https://angelcreations.in/category/uncategorized/` | Render directly. |
| `https://angelcreations.in/comments/feed/` | `/comments/feed/` | HTTP 200; final `https://angelcreations.in/comments/feed/` | Render directly. |
| `https://angelcreations.in/contact/` | `/contact/` | HTTP 200; final `https://angelcreations.in/contact/` | Render directly. |
| `https://angelcreations.in/enter-metabox/` | `/enter-metabox/` | HTTP 200; final `https://angelcreations.in/enter-metabox/` | Render directly. |
| `https://angelcreations.in/feed/` | `/feed/` | HTTP 200; final `https://angelcreations.in/feed/` | Render directly. |
| `https://angelcreations.in/hello-world/` | `/hello-world/` | HTTP 200; final `https://angelcreations.in/hello-world/` | Render directly. |
| `https://angelcreations.in/media-production/` | `/media-production/` | HTTP 200; final `https://angelcreations.in/media-production/` | Render directly. |
| `https://angelcreations.in/metaverse/` | `/metaverse/` | HTTP 200; final `https://angelcreations.in/metaverse/` | Render directly. |
| `https://angelcreations.in/mixed-reality/` | `/mixed-reality/` | HTTP 200; final `https://angelcreations.in/mixed-reality/` | Render directly. |
| `https://angelcreations.in/privacy-policy/` | `/privacy-policy/` | HTTP 200; final `https://angelcreations.in/privacy-policy/` | Render directly. |
| `https://angelcreations.in/terms-of-service/` | `/terms-of-service/` | HTTP 200; final `https://angelcreations.in/terms-of-service/` | Render directly. |
| `https://angelcreations.in/test/` | `/test/` | HTTP 200; final `https://angelcreations.in/test/` | Render directly. |
| `https://angelcreations.in/this-route-does-not-exist-for-forensics-2026/` | `/this-route-does-not-exist-for-forensics-2026/` | HTTP 404; final `https://angelcreations.in/this-route-does-not-exist-for-forensics-2026/` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/virtual-reality/` | `/virtual-reality/` | HTTP 200; final `https://angelcreations.in/virtual-reality/` | Render directly. |
| `https://angelcreations.in/works/` | `/works/` | HTTP 200; final `https://angelcreations.in/works/` | Render directly. |
| `https://angelcreations.in/works/vertual-work-copy-2/` | `/works/vertual-work-copy-2/` | HTTP 200; final `https://angelcreations.in/works/vertual-work-copy-2/` | Render directly. |
| `https://angelcreations.in/works/vertual-work-copy/` | `/works/vertual-work-copy/` | HTTP 200; final `https://angelcreations.in/works/vertual-work-copy/` | Render directly. |
| `https://angelcreations.in/works/vertual-work/` | `/works/vertual-work/` | HTTP 200; final `https://angelcreations.in/works/vertual-work/` | Render directly. |
| `https://angelcreations.in/works/virtual-reality-copy-2/` | `/works/virtual-reality-copy-2/` | HTTP 200; final `https://angelcreations.in/works/virtual-reality-copy-2/` | Render directly. |
| `https://angelcreations.in/works/virtual-reality-copy/` | `/works/virtual-reality-copy/` | HTTP 200; final `https://angelcreations.in/works/virtual-reality-copy/` | Render directly. |
| `https://angelcreations.in/works/virtual-reality/` | `/works/virtual-reality/` | HTTP 200; final `https://angelcreations.in/works/virtual-reality/` | Render directly. |
| `https://angelcreations.in/terms-of-service` | `/terms-of-service` | HTTP 200; final `https://angelcreations.in/terms-of-service/` | Direct alias to same preserved content as trailing-slash canonical URL; redirect decision deferred. |
| `https://angelcreations.in/privacy-policy` | `/privacy-policy` | HTTP 200; final `https://angelcreations.in/privacy-policy/` | Direct alias to same preserved content as trailing-slash canonical URL; redirect decision deferred. |
| `https://angelcreations.in/page/3/?s=` | `/page/3/?s=` | HTTP 200; final `https://angelcreations.in/page/3/?s=` | Preserve query route; no redirect decision. |
| `https://angelcreations.in/page/2/?s=` | `/page/2/?s=` | HTTP 200; final `https://angelcreations.in/page/2/?s=` | Preserve query route; no redirect decision. |
| `https://angelcreations.in/animation/about.html` | `/animation/about.html` | HTTP 404; final `https://angelcreations.in/animation/about.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/animation/awards.html` | `/animation/awards.html` | HTTP 404; final `https://angelcreations.in/animation/awards.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/lustica` | `/works/lustica` | HTTP 404; final `https://angelcreations.in/works/lustica` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/karma` | `/works/karma` | HTTP 404; final `https://angelcreations.in/works/karma` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/raia` | `/works/raia` | HTTP 404; final `https://angelcreations.in/works/raia` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/vold` | `/works/vold` | HTTP 404; final `https://angelcreations.in/works/vold` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/arc` | `/works/arc` | HTTP 404; final `https://angelcreations.in/works/arc` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/prodotti` | `/works/prodotti` | HTTP 404; final `https://angelcreations.in/works/prodotti` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/clorova` | `/works/clorova` | HTTP 404; final `https://angelcreations.in/works/clorova` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/samsara` | `/works/samsara` | HTTP 404; final `https://angelcreations.in/works/samsara` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/bodyshop` | `/works/bodyshop` | HTTP 404; final `https://angelcreations.in/works/bodyshop` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/jannata` | `/works/jannata` | HTTP 404; final `https://angelcreations.in/works/jannata` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/apprentice-search` | `/works/apprentice-search` | HTTP 404; final `https://angelcreations.in/works/apprentice-search` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works/relationshift` | `/works/relationshift` | HTTP 404; final `https://angelcreations.in/works/relationshift` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/brand-advertisement/about.html` | `/brand-advertisement/about.html` | HTTP 404; final `https://angelcreations.in/brand-advertisement/about.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/brand-advertisement/awards.html` | `/brand-advertisement/awards.html` | HTTP 404; final `https://angelcreations.in/brand-advertisement/awards.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/author/admin/` | `/author/admin/` | HTTP 200; final `https://angelcreations.in/author/admin/` | Render directly. |
| `https://angelcreations.in/media-production/about.html` | `/media-production/about.html` | HTTP 404; final `https://angelcreations.in/media-production/about.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/media-production/awards.html` | `/media-production/awards.html` | HTTP 404; final `https://angelcreations.in/media-production/awards.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/mixed-reality/about.html` | `/mixed-reality/about.html` | HTTP 404; final `https://angelcreations.in/mixed-reality/about.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/mixed-reality/awards.html` | `/mixed-reality/awards.html` | HTTP 404; final `https://angelcreations.in/mixed-reality/awards.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/virtual-reality/about.html` | `/virtual-reality/about.html` | HTTP 404; final `https://angelcreations.in/virtual-reality/about.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/virtual-reality/awards.html` | `/virtual-reality/awards.html` | HTTP 404; final `https://angelcreations.in/virtual-reality/awards.html` | Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1. |
| `https://angelcreations.in/works%20types/karma-group/` | `/works%20types/karma-group/` | HTTP 200; final `https://angelcreations.in/` | Direct route kept exactly; live route currently returns homepage-like content despite malformed taxonomy path. |
| `https://angelcreations.in/works%20types/lustica-bay/` | `/works%20types/lustica-bay/` | HTTP 200; final `https://angelcreations.in/` | Direct route kept exactly; live route currently returns homepage-like content despite malformed taxonomy path. |

## Redirect decision deferred

- No production redirect changes were made. The React client supports all captured HTML path/query routes in its static route table; server-side history fallback/redirect deployment rules are explicitly outside this local-only phase.
