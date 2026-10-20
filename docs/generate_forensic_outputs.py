#!/usr/bin/env python3
"""Generate read-only forensic inventory Markdown and React-safe static page data.
Input: docs/forensic-manifest.json and docs/live-html.  No network access.
"""
from __future__ import annotations
import json, os, re, subprocess
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup, Comment
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
PUBLIC = ROOT / 'public'
MANIFEST = json.loads((DOCS / 'forensic-manifest.json').read_text(encoding='utf-8'))
PAGES = MANIFEST['pages']
ASSETS = MANIFEST['assets']
BASE = 'https://angelcreations.in'

def esc(text: object) -> str:
    return str(text or '').replace('|', '\\|').replace('\n', ' ').strip()

def norm_url(value: str) -> str:
    return value.strip()

def loc_path(url: str) -> str:
    p = urlparse(url)
    return p.path + (('?' + p.query) if p.query else '')

def page_kind(page: dict) -> str:
    path = urlparse(page['url']).path.rstrip('/') or '/'
    if page.get('status') == 404: return 'Live 404 result'
    if path == '/': return 'Home'
    if path.startswith('/works/'): return 'Works archive' if path == '/works' else 'Work entry'
    if path.startswith('/category/'): return 'Category archive'
    if path.startswith('/author/'): return 'Author archive'
    if path.startswith('/page/'): return 'Search pagination'
    if urlparse(page['url']).query.startswith('s='): return 'Search results'
    if path in ['/privacy-policy','/terms-of-service']: return 'Legal page'
    if path == '/contact': return 'Contact / enquiry form'
    if path == '/metaverse': return 'Standalone Unity WebGL page'
    if path == '/360-video': return '360 video / panorama page'
    if path in ['/animation', '/brand-advertisement', '/media-production', '/mixed-reality', '/virtual-reality']: return 'Service detail template'
    if path == '/augment-reality': return 'Work-list service template'
    return 'WordPress content page'

def rel_archive(page: dict) -> Path | None:
    value = page.get('archive_path')
    return DOCS / value if value else None

# Which HTML source page(s) directly reference each resource, normalized for URI whitespace.
uses = defaultdict(set)
for page in PAGES:
    for value in page.get('assets', []): uses[norm_url(value)].add(page['url'])
    for value in page.get('scripts', []):
        if value.get('src'): uses[norm_url(value['src'])].add(page['url'])
    for value in page.get('images', []):
        if value.get('src'): uses[norm_url(value['src'])].add(page['url'])
    for video in page.get('videos', []):
        for value in video.get('sources', []): uses[norm_url(value)].add(page['url'])
        if video.get('poster'): uses[norm_url(video['poster'])].add(page['url'])

# Asset metadata for inventory.
def dimensions(local: str) -> str:
    if not local: return ''
    p = PUBLIC / local.lstrip('/')
    try:
        if p.suffix.lower() in {'.jpg','.jpeg','.png','.webp','.gif','.avif','.bmp','.ico'}:
            with Image.open(p) as img:
                return f'{img.width}×{img.height}'
    except Exception:
        pass
    return ''

for asset in ASSETS:
    if asset.get('status') == 'downloaded':
        asset['dimensions'] = dimensions(asset.get('local_path', ''))
        asset['used_by'] = sorted(uses.get(norm_url(asset['original_url']), set()))
    else:
        asset['used_by'] = sorted(uses.get(norm_url(asset['original_url']), set()))

(DOCS / 'asset-manifest.json').write_text(json.dumps(ASSETS, indent=2, ensure_ascii=False), encoding='utf-8')

# Full page record extract for machine-readable verification.
(DOCS / 'page-records.json').write_text(json.dumps(PAGES, indent=2, ensure_ascii=False), encoding='utf-8')

# URL inventory: detailed but still reviewable.
lines = [
    '# URL Inventory', '',
    '> **Capture:** 2026-10-05 UTC / read-only. Source URLs: robots.txt, sitemap index/child sitemaps, WordPress REST discovery, internal links, source links, and an intentional non-existent URL check. No form was submitted.', '',
    f"**Discovery summary:** {MANIFEST['crawl_summary']['page_records']} URL records; {sum(1 for p in PAGES if p.get('status') == 200)} HTTP 200 records; {sum(1 for p in PAGES if p.get('status') == 404)} HTTP 404 records; {MANIFEST['crawl_summary']['queue_remaining']} queue items left.", '',
    'The complete structured fields (every captured link, asset, script, stylesheet, form, video, JSON-LD block, heading, and metadata key) are in [`page-records.json`](./page-records.json). Raw source is in [`live-html/`](./live-html/).', ''
]
for idx, page in enumerate(PAGES, 1):
    h = page.get('headings', {})
    major = [f"{k.upper()}: " + '; '.join(v) for k,v in h.items() if k != 'h1' and v]
    internal = page.get('internal_links', [])
    external = page.get('external_links', [])
    used_assets = page.get('assets', [])
    lines.extend([
        f"## {idx}. `{page['url']}`", '',
        f"- **Status:** {page.get('status', 'network error')}  ",
        f"- **Final URL:** `{page.get('final_url', '')}`  ",
        f"- **Page type:** {page_kind(page)}  ",
        f"- **Title:** {page.get('title', '') or '—'}  ",
        f"- **Meta description:** {page.get('description', '') or '—'}  ",
        f"- **Canonical:** `{page.get('canonical', '') or '—'}`  ",
        f"- **H1:** {'; '.join(h.get('h1', [])) or '—'}  ",
        f"- **Major headings:** {' / '.join(major) or '—'}  ",
        f"- **Internal links:** {len(internal)} — " + (', '.join(f"`{x['url']}` ({x['text'] or 'no text'})" for x in internal[:18]) or '—') + (' … see JSON' if len(internal) > 18 else '') + '  ',
        f"- **External links:** {len(external)} — " + (', '.join(f"`{x['url']}`" for x in external[:12]) or '—') + (' … see JSON' if len(external) > 12 else '') + '  ',
        f"- **Images:** {len(page.get('images', []))}; **video/audio elements:** {len(page.get('videos', []))}; **embeds:** {len(page.get('embeds', []))}; **asset references:** {len(used_assets)}  ",
        f"- **Stylesheets:** {', '.join('`' + x['href'] + '`' for x in page.get('stylesheets', [])) or '—'}  ",
        f"- **Scripts:** {len(page.get('scripts', []))} ({sum(1 for x in page.get('scripts', []) if x.get('src'))} external/local source references; {sum(1 for x in page.get('scripts', []) if x.get('inline'))} inline)  ",
        f"- **JSON-LD:** {len(page.get('json_ld', []))} block(s); **Forms:** {len(page.get('forms', []))}; **Buttons:** {len(page.get('buttons', []))}  ",
        f"- **Raw capture:** `{page.get('archive_path', 'not saved')}`", ''
    ])
    for form in page.get('forms', []):
        lines.append(f"  - Form `{form.get('id') or form.get('class') or '(unidentified)'}` — `{form.get('method')}` `{form.get('action')}`; fields: " + ', '.join(f"`{x.get('name') or x.get('type') or x.get('tag')}`" for x in form.get('fields', [])))
        lines.append('')
(DOCS / 'URL-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# Site tree / source provenance.
by_kind = defaultdict(list)
for p in PAGES: by_kind[page_kind(p)].append(p)
lines = ['# Site Structure', '', '## Source platform', '', '- WordPress, using the custom `fleava` theme with Elementor assets; Yoast SEO Premium reports itself in source.', '- The primary site wrapper is a bespoke full-screen video/slideshow design. `/metaverse/` is a separate Unity WebGL document, not the WordPress shell.', '- The global header links to Home, Metaverse, 360 video; its overlay menu links to About Us, Works, Contact. The overlay footer includes the captured contact/legal links.', '', '## Accessible structure discovered', '']
for kind in sorted(by_kind):
    lines.append(f'### {kind}')
    for p in by_kind[kind]: lines.append(f"- `{p['url']}` — HTTP {p.get('status')} — {p.get('title','') or 'no HTML title'}")
    lines.append('')
lines += ['## Source evidence', '', '- Sitemap list, REST endpoint status, URL counts, and raw source locations: [`forensic-manifest.json`](./forensic-manifest.json).', '- Exact page-level records: [`page-records.json`](./page-records.json).', '- Original retrieved HTML/XML: [`live-html/`](./live-html/).', '- Server platform headers seen on the home page: `x-powered-by: PHP/8.1.34`, `platform: hostinger`, `panel: hpanel`, `x-litespeed-cache: hit`.', '']
(DOCS / 'SITE-STRUCTURE.md').write_text('\n'.join(lines), encoding='utf-8')

# Asset inventory.
counts = Counter(); bytes_by = Counter()
for a in ASSETS:
    if a.get('status') == 'downloaded':
        cat = a['local_path'].split('/')[2]
        counts[cat] += 1; bytes_by[cat] += a.get('bytes',0)
lines = ['# Asset Inventory', '', f"**Archive location:** `public/legacy-assets/`  ", f"**Downloaded archive size:** {MANIFEST['crawl_summary']['downloaded_asset_bytes']:,} bytes.  ", f"**Download policy:** same-origin assets were archived read-only; third-party dependencies were recorded rather than copied. Per-file and total archival safeguards are in the source manifest.", '', '## Summary', '', '| Category | Downloaded files | Bytes |', '|---|---:|---:|']
for cat in sorted(counts): lines.append(f"| {cat} | {counts[cat]} | {bytes_by[cat]:,} |")
lines += ['', '## Asset records', '', '| Original URL | Local path / record state | Type | Size | Dimensions | Referenced by |', '|---|---|---|---:|---|---|']
for a in ASSETS:
    loc = a.get('local_path', a.get('status',''))
    size = f"{a.get('bytes', a.get('declared_size','')):,}" if isinstance(a.get('bytes',a.get('declared_size','')),int) else str(a.get('bytes',a.get('declared_size','')))
    refs = '<br>'.join(f'`{loc_path(x)}`' for x in a.get('used_by', [])[:5]) + ('<br>…' if len(a.get('used_by',[])) > 5 else '')
    lines.append(f"| `{esc(a['original_url'])}` | `{esc(loc)}` | {esc(a.get('content_type',''))} | {size} | {a.get('dimensions','')} | {refs or '—'} |")
lines += ['', '## Not copied', '']
for a in ASSETS:
    if a.get('status') != 'downloaded': lines.append(f"- `{a['original_url']}` — **{a.get('status')}**: {a.get('reason','HTTP status ' + str(a.get('http_status','')))}")
(DOCS / 'ASSET-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# Script inventory.
scripts = defaultdict(lambda: {'pages': set(), 'inline': 0, 'ids': set()})
for p in PAGES:
    for sc in p.get('scripts',[]):
        key = sc.get('src') or '[inline script]'
        scripts[key]['pages'].add(p['url']); scripts[key]['ids'].add(sc.get('id',''))
        if sc.get('inline'): scripts[key]['inline'] += 1

def purpose(url: str) -> str:
    x=url.lower()
    if 'gtag' in x: return 'Google Analytics gtag loader (tracking)'
    if 'googletagmanager' in x: return 'Google Tag Manager (tracking)'
    if 'jquery' in x: return 'jQuery / validation dependency'
    if 'scripts.js' in x: return 'Custom theme bundle: Modernizr, GSAP/ScrollTrigger, Barba, Locomotive/Splitting and site behaviour'
    if 'slick' in x: return 'Slick carousel library'
    if 'owl' in x: return 'Owl Carousel library'
    if 'contact-form-7' in x: return 'Contact Form 7 client-side validation / submission support'
    if 'panorama' in x or 'panolens' in x or 'three' in x: return 'Panorama/360 viewer dependency'
    if 'primary-navigation' in x: return 'Twenty Twenty-One primary navigation helper'
    if 'responsive-embeds' in x: return 'Twenty Twenty-One responsive embed helper'
    if 'react' in x: return 'WordPress bundled React runtime, used by panorama block'
    if url == '[inline script]': return 'Inline page/template logic (details are retained in raw HTML)'
    return 'Legacy WordPress/theme runtime asset'
lines = ['# Script Inventory', '', '> Script sources were inventoried; tracking code is not run by the local React reconstruction. The full source references and inline snippets are in [`page-records.json`](./page-records.json).', '', '| Source | Local / external | Purpose | Page usage | Init / listeners |', '|---|---|---|---:|---|']
for source, record in sorted(scripts.items()):
    locality = 'local archived' if source.startswith(BASE) else ('inline' if source == '[inline script]' else 'external')
    init = 'Template/DOMContentLoaded/load/click/scroll handlers retained in raw source' if source == '[inline script]' else 'Loaded by WordPress template'
    lines.append(f"| `{esc(source)}` | {locality} | {purpose(source)} | {len(record['pages'])} pages | {init} |")
lines += ['', '## Notable implementation findings', '', '- `scripts.js` contains legacy bundled Modernizr, GSAP + ScrollTrigger, Barba, Locomotive-like scroll handling, Splitting, and Three-related code. It is preserved in the asset archive but not executed from React.', '- Inline scripts drive: navigation-menu classes, a homepage slider, animated text splitting, a contact multi-step form, Owl/Slick initialization, a custom cursor, loader delays, and scroll-triggered class changes.', '- The 360 page loads `three.min.js`, `panolens.min.js`, and the Panorama plugin view script; it declares a first-party 360 MP4 source in a block data attribute.', '- The live source also includes Site Kit-added Google Analytics (`G-T4G74DNBP9`) and GTM (`GTM-MMFB2VZ`). IDs are documented here for baseline purposes; no tracker is included in the React runtime.', '']
(DOCS / 'SCRIPT-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# Font inventory.
font_assets = [a for a in ASSETS if '/fonts/' in a.get('original_url','') or a.get('local_path','').split('/')[2:3] == ['fonts']]
lines=['# Font Inventory','', '## Locally archived first-party font files','', '| Family / inferred family | Original URL | Local path | Format |', '|---|---|---|---|']
for a in font_assets:
    source=a['original_url']; name=Path(urlparse(source).path).name
    family='Graphik' if 'Graphik' in name else ('Geograph Edit' if 'GeographEdit' in name else ('Geograph' if 'Geograph' in name or 'geograph' in name else 'Unknown'))
    lines.append(f"| {family} | `{source}` | `{a.get('local_path','not archived')}` | `{Path(name).suffix.lstrip('.')}` |")
lines += ['', '## Remote font stylesheets recorded', '', '- `https://fonts.googleapis.com/css?family=Roboto:…&display=swap` — Elementor Google Font stylesheet; Roboto weights 100–900, normal and italic.', '- `https://fonts.googleapis.com/css?family=Roboto+Slab:…&display=swap` — Elementor Google Font stylesheet; Roboto Slab weights 100–900, normal and italic.', '- Font Awesome 6.2.1 CSS was loaded from cdnjs; it provides icon font styling.', '', '## In-use legacy declarations', '', '- `custom.css` declares Graphik Black (900), Geograph Edit (italic), Geograph regular, and `geographweblight` with EOT/WOFF2/WOFF/TTF/SVG fallbacks and `font-display: swap`.', '- The page source also contains commented Graphik Semibold, Medium, Extralight, Bold, Light, and Regular WOFF2 preload links. Available first-party files discovered from stylesheets are archived.', '']
(DOCS / 'FONT-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# SEO baseline.
lines=['# SEO Inventory', '', '## Crawling controls and sitemaps', '', '- `robots.txt`: `User-agent: *`, `Disallow:` (empty), and `Sitemap: https://angelcreations.in/sitemap_index.xml`.', '- Sitemap index child entries: `post-sitemap.xml`, `page-sitemap.xml`, `works-sitemap.xml`, `category-sitemap.xml`, `works types-sitemap.xml` (the URL is served 404 due to a literal space), and `geo-sitemap.xml`.', '- Yoast SEO Premium source comment reports v22.8 / Yoast SEO v26.3.', '', '## Page metadata baseline', '', '| URL | Status | Title | Meta description | Canonical | Robots | H1 | JSON-LD |', '|---|---:|---|---|---|---|---|---:|']
for p in PAGES:
    lines.append(f"| `{loc_path(p['url'])}` | {p.get('status','')} | {esc(p.get('title',''))} | {esc(p.get('description',''))} | `{esc(p.get('canonical',''))}` | {esc(p.get('robots',''))} | {esc('; '.join(p.get('headings',{}).get('h1',[])))} | {len(p.get('json_ld',[]))} |")
lines += ['', '## Metadata patterns found', '', '- Pages use title, meta description where supplied, canonical, robots, Open Graph (`og:locale`, `og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, often `og:image`), and Twitter card/site metadata as generated by Yoast.', '- Homepage JSON-LD contains `WebPage`, `BreadcrumbList`, `WebSite`, `Organization`, `Place`, and `ImageObject` entities. Child page JSON-LD uses a page-specific `WebPage` and breadcrumb graph.', '- No hreflang link was found in the captured HTML page records.', '- The local React app sets title, description, canonical pathname, Open Graph values, robots and retained JSON-LD data from the captured page record. It intentionally does not add an SEO “fix” in this preservation phase.', '']
(DOCS / 'SEO-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# Redirects/routes.
lines=['# Redirect Inventory & Route Mapping','', '> HTTP checks followed redirects. No URL record in this read-only capture reports a different `final_url`; the important issue is duplicate slash/no-slash output and linked paths which render live 404 templates.', '', '| Original URL | React route | Current status / outcome | Preservation recommendation |', '|---|---|---|---|']
for p in PAGES:
    route=loc_path(p['url'])
    status=p.get('status')
    if status == 404: rec='Render captured legacy 404 for this exact linked legacy path; do not redirect in Phase 1.'
    elif route in ['/terms-of-service','/privacy-policy']: rec='Direct alias to same preserved content as trailing-slash canonical URL; redirect decision deferred.'
    elif '%20' in route: rec='Direct route kept exactly; live route currently returns homepage-like content despite malformed taxonomy path.'
    elif route.startswith('/page/'): rec='Preserve query route; no redirect decision.'
    else: rec='Render directly.'
    lines.append(f"| `{p['url']}` | `{route}` | HTTP {status}; final `{p.get('final_url','')}` | {rec} |")
lines += ['', '## Redirect decision deferred', '', '- No production redirect changes were made. The React client supports all captured HTML path/query routes in its static route table; server-side history fallback/redirect deployment rules are explicitly outside this local-only phase.', '']
(DOCS / 'REDIRECT-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# External deps.
ext_assets=[a for a in ASSETS if a.get('status')=='external-not-downloaded' and not a['original_url'].startswith('data:')]
lines=['# External Dependencies', '', '| Dependency / host | Exact source(s) | Role | Local treatment |', '|---|---|---|---|']
by_host=defaultdict(list)
for a in ext_assets: by_host[urlparse(a['original_url']).netloc].append(a['original_url'])
for host, urls in sorted(by_host.items()):
    role=''
    sample=' '.join(urls).lower()
    if 'google' in host: role='Analytics, GTM, or Google Font stylesheet'
    elif 'cdnjs' in host: role='Font Awesome, jQuery Validate, or Owl Carousel'
    elif 'krowd' in host: role='Slick carousel library'
    elif 'facebook' in host or 'instagram' in host or 'linkedin' in host or 'youtube' in host or host=='x.com': role='Social profile link'
    elif 'fleava' in host: role='Legacy external image/reference'
    else: role='External link/dependency'
    lines.append(f"| `{host}` | " + '<br>'.join(f'`{u}`' for u in urls) + f" | {role} | Recorded; not bundled into the local runtime. |")
lines += ['', '## First-party unresolved remote media', '', '- `https://angelcreations.in/wp-content/uploads/2023/05/an-experienced-video-production-engineer-works-on-2022-08-10-17-32-35-utc.mov` is 310,558,720 bytes by server declaration. It is preserved as an exact source record but not duplicated into the workspace due to the archival size safeguard.', '- `/metaverse/` requests Unity Build files dynamically. The loader (6,721 bytes) and framework (79,569 bytes) were identified through the source; the server does not provide a usable size header for `.data` / `.wasm`, and those WebGL binary resources are not in the local archive. The local route records this functional limitation rather than substituting content.', '']
(DOCS / 'EXTERNAL-DEPENDENCIES.md').write_text('\n'.join(lines), encoding='utf-8')

# Forms and functional interaction baseline.
contact=next((p for p in PAGES if loc_path(p['url'])=='/contact/'), {})
lines=['# Functional Inventory', '', '## Global navigation overlay', '', '| Field | Captured behaviour |', '|---|---|', '| Interaction | Two-line fixed menu control opens the `.menu` overlay and video background; control changes to the close state. |', '| Trigger | Click/tap on the fixed menu control. |', '| Visual response | Overlay/background cover shown with About Us, Works, Contact; desktop uses hover effect and mobile exposes duplicated `.mobile_link` entries. |', '| Timing | CSS transitions; legacy menu bundle controls class changes. |', '| Destination | About, Works, Contact; header also links to Home, metaverse, and 360 video. |', '| Keyboard | No dedicated accessible keyboard handling was found in custom inline logic; native anchors remain focusable. |', '| Dependencies | Legacy theme CSS/JS, jQuery/GSAP/Barba-related bundle. |', '', '## Homepage slideshow', '', '| Field | Captured behaviour |', '|---|---|', '| Interaction | Seven full-screen video slides with Prev/Next controls and “Scroll Down”. |', '| Trigger | Prev/Next click; linked first two slide captions navigate to Metaverse / Mixed Reality. Later service slide anchors have empty legacy hrefs. |', '| Visual response | Current slide uses `.q_current`; number, service label, statement, and muted looping background video change. |', '| Timing | Theme bundle animation / CSS transitions. |', '| Mobile | Uses the same slideshow markup; exact rendered baseline screenshots unavailable (see `baseline/README.md`). |', '| Dependencies | first-party MP4s; legacy GSAP/ScrollTrigger/slider logic. |', '', '## Contact multi-step form', '', f"- **Endpoint/method as in source:** `{contact.get('forms',[{}])[0].get('method','')}` `{contact.get('forms',[{}])[0].get('action','')}`", '- **Fields (source labels):** Ahoy. What\'s your name?; What\'s your mobile number?; What\'s your email?; What\'s the name of your company?; Tell us a bit about your project.; Do you have any budget in mind?; Do you want us to contact you through Mail or call?; If call then what is your preferred time?', '- **Validation:** jQuery Validate with required rules; email validation for `email` in the captured inline code.', '- **Progression:** visible `.tab-pane` step changes with 1000ms `fadeIn`; progress dots switch active class.', '- **Success state:** a 1000ms timeout replaces `#booking-form` content with: `Your message was sent successfully. Thanks! We\'ll be in touch as soon as we can, which is usually like lightning (Unless we\'re sailing or eating tacos!).`', '- **Submission observation:** no test was sent. The captured custom final click handler returns `false`, so its local visible success state is reconstructed without sending data anywhere.', '', '## Other meaningful interactions', '', '- **360 video:** Panorama block configuration identifies a first-party equirectangular video, autoplay true, loop true, muted false, controls false, fullscreen/settings/video controls true. Depends on Panorama plugin + Three.js + Panolens.', '- **Metaverse:** standalone Unity canvas page, desktop 960×600; mobile switches canvas to viewport and shows “WebGL builds are not supported on mobile devices.” Fullscreen button is wired by Unity after instance creation.', '- **Work cards:** hover data attributes set colour/background/cursor label `View`; cards link to six published work entries. The full source still lists dead `/works/<slug>` links inside templates, all captured as 404s.', '- **Custom cursor/text reveals/loaders:** documented in the inline scripts and theme bundle. The React baseline recreates safe visible equivalents only; no legacy external code executes.', '']
(DOCS / 'FUNCTIONAL-INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')

# Migration notes and responsive baseline.
lines=['# Migration Notes', '', '## Preservation decisions', '', '- Live page copy, URL inventory, scripts, original CSS/JS, locally available original media, fonts, and raw HTML are retained before React implementation.', '- No production site, Hostinger, DNS, WordPress, analytics settings, forms, databases, repositories, or Search Console settings were changed.', '- React is intentionally dependency-light: React, ReactDOM, Vite, and TypeScript only. No UI, animation, router, CMS, or backend package was added.', '- The React implementation renders captured source content through a typed, allowlisted DOM data renderer rather than injecting arbitrary HTML. This preserves content/structure without `dangerouslySetInnerHTML`.', '', '## Responsive forensic baseline', '', '### CSS-observed breakpoints', '', '- `1727px`, `1400px`, `1200px`, `1199px`, `1024px`, `991px`, `767px`, and `600px` were found in theme/custom styles.', '- Examples preserved in legacy CSS: header/logo/menu offsets at ≤1024/600, about grids changing from 3 to 2 to 1 columns at 1199/991, work/detail columns stacking at 991, and contact/menu changes at 767.', '', '### Screenshot limitation', '', '- Browser automation/browser binary was not available in this workspace (`chromium`, Chrome, Firefox, Playwright, and wkhtmltoimage were absent). No original-site screenshots were invented. See [`baseline/README.md`](./baseline/README.md).', '- The required viewport matrix is documented for follow-up capture: mobile 320×568, 375×667, 390×844, 430×932; tablet 768×1024, 820×1180, 834×1194, 1024×1366; desktop 1280×720, 1366×768, 1440×900, 1920×1080; wide 2560×1440.', '', '## Known legacy issues intentionally not fixed', '', '- Several homepage slide links are literally empty (`href=""`) for Virtual Reality, Augment Reality, Animation, Brand Advertisement, and Media Production; retained in captured markup/behaviour rather than “fixed”.', '- Service-detail templates have empty sources/links in captured source and render mostly numbered/placeholder sections.', '- The live sitemap advertises `works types-sitemap.xml`, whose literal-space URL returns HTTP 404.', '- `/works/<legacy-slug>` and several `/[service]/about.html` / `awards.html` template links are live 404 pages; local route table preserves the captured 404 result.', '- Malformed current taxonomy URL paths containing a literal space (`/works%20types/...`) return homepage-like content; preserved as routes.', '- Contact endpoint/action is `/contact-us/` while source form metadata represents Contact Form 7; no backend was recreated and no submission was performed.', '- One homepage MOV (310 MB) and Unity data/wasm build artifacts are not archived locally; exact original sources are recorded.', '- Tracking IDs exist in source but are intentionally not included in the local app runtime.', '', '## Security note', '', '- No credentials, API keys, or secrets were found/copied. Analytics identifiers are not runtime configuration.', '- Remote raw markup is not injected as HTML. Script/event attributes are dropped by the renderer. Forms prevent network submission in this local-only baseline.', '']
(DOCS / 'MIGRATION-NOTES.md').write_text('\n'.join(lines), encoding='utf-8')

baseline = DOCS / 'baseline'; baseline.mkdir(exist_ok=True)
(baseline / 'README.md').write_text('''# Screenshot Baseline\n\nNo screenshots are present because this sandbox did not provide a browser binary or browser automation runtime at capture time. The limitation is deliberately documented rather than filled with fabricated imagery.\n\n## Required follow-up capture matrix\n\n| Category | Viewports |\n|---|---|\n| Mobile | 320×568, 375×667, 390×844, 430×932 |\n| Tablet | 768×1024, 820×1180, 834×1194, 1024×1366 |\n| Desktop | 1280×720, 1366×768, 1440×900, 1920×1080 |\n| Wide | 2560×1440 |\n\nCapture the live original before any redesign, then capture the local production build at 390×844, 834×1194, 1440×900, and 1920×1080. Compare menu-open state, slideshow transitions, page length, video crop, typography, and mobile menu.\n''', encoding='utf-8')

# React-safe static source data, parsed from retained original HTML.
# Tags are whitelisted in the TS renderer. Script/event attrs never reach the app.
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
DROP={'script','noscript','template'}

def source_to_local(value: str) -> str:
    value = value.strip()
    if value.startswith(BASE):
        # Find archive record by stripped original/final URL.
        for a in ASSETS:
            if value == a.get('original_url','').strip() and a.get('status') == 'downloaded': return a.get('local_path', value)
        return value
    return value

def local_href(value: str) -> str:
    value=value.strip()
    if value.startswith(BASE):
        u=urlparse(value); return u.path + (('?' + u.query) if u.query else '')
    return value

def parse_style(text: str) -> dict[str,str]:
    out={}
    for part in text.split(';'):
        if ':' not in part: continue
        k,v=part.split(':',1); k=k.strip(); v=v.strip()
        if not k or not v: continue
        key=re.sub(r'-([a-z])', lambda m:m.group(1).upper(), k.lstrip('-'))
        if k.startswith('--'): key=k
        out[key]=v
    return out

def node_data(node):
    if isinstance(node, Comment): return None
    if getattr(node,'name',None) is None:
        value=str(node)
        return {'type':'text','value':value} if value else None
    tag=node.name.lower()
    if tag in DROP: return None
    attrs={}
    for key,value in node.attrs.items():
        low=key.lower()
        if low.startswith('on') or low in {'integrity','nonce'}: continue
        if low in {'class'}: key='className'; value=' '.join(value) if isinstance(value,list) else value
        elif low=='for': key='htmlFor'
        elif low=='tabindex': key='tabIndex'
        elif low=='colspan': key='colSpan'
        elif low=='rowspan': key='rowSpan'
        elif low=='autocomplete': key='autoComplete'
        elif low=='srcset':
            key='srcSet';
            entries=[]
            for item in str(value).split(','):
                bits=item.strip().split()
                if bits: bits[0]=source_to_local(bits[0]); entries.append(' '.join(bits))
            value=', '.join(entries)
        elif low in {'src','poster'}: value=source_to_local(str(value))
        elif low in {'href','action'}: value=local_href(str(value))
        elif low=='style': value=parse_style(str(value))
        elif low=='value' and tag in {'input','textarea','select'}: key='defaultValue'
        elif low=='checked' and tag=='input': key='defaultChecked'; value=True
        elif isinstance(value,list): value=' '.join(str(x) for x in value)
        elif value == '': value=True
        attrs[key]=value
    children=[]
    for child in node.children:
        output=node_data(child)
        if output: children.append(output)
    return {'type':'element','tag':tag,'attrs':attrs,'children':children}

page_data=[]
for p in PAGES:
    if 'html' not in p.get('content_type',''): continue
    raw=rel_archive(p)
    if not raw or not raw.exists(): continue
    soup=BeautifulSoup(raw.read_text(encoding='utf-8',errors='ignore'),'lxml')
    main=soup.select_one('#primary > main.site-main') or soup.find('main')
    children=[]
    if main:
        for child in main.children:
            entry=node_data(child)
            if entry: children.append(entry)
    page_data.append({
        'url':p['url'],'route':loc_path(p['url']),'status':p.get('status'),'kind':page_kind(p),'title':p.get('title',''),
        'description':p.get('description',''),'canonical':p.get('canonical',''),'robots':p.get('robots',''),
        'meta':p.get('meta',{}),'jsonLd':p.get('json_ld',[]),'bodyClasses':p.get('body_classes',[]),'children':children,
    })

src_data=ROOT/'src'/'data';src_data.mkdir(parents=True,exist_ok=True)
(ROOT/'src'/'data'/'pages.json').write_text(json.dumps(page_data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'Wrote inventories and {len(page_data)} React-safe legacy page records.')
