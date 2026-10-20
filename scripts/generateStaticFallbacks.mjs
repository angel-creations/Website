/*
  Generates source-qualified route documents after Vite build.
  JavaScript-capable visitors boot the same React application from every route.  The semantic
  source fallback lives in <noscript>, so no-JS users and crawlers retain meaningful content.
*/
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { bootFallbackBlock } from './boot-fallback.mjs';

const pages = JSON.parse(await readFile(new URL('../src/data/pages.json', import.meta.url), 'utf8'));
const videos = JSON.parse(await readFile(new URL('../src/data/videoArchive.json', import.meta.url), 'utf8'));
const routeSeo = JSON.parse(await readFile(new URL('../src/data/routeSeo.json', import.meta.url), 'utf8'));
const slideExperiences = JSON.parse(await readFile(new URL('../src/data/slideExperiences.json', import.meta.url), 'utf8'));
const metaverseContent = JSON.parse(await readFile(new URL('../src/data/metaverseContent.json', import.meta.url), 'utf8'));
const experienceStories = JSON.parse(await readFile(new URL('../src/data/experienceStories.json', import.meta.url), 'utf8'));
const experienceMaps = JSON.parse(await readFile(new URL('../src/data/experienceMaps.json', import.meta.url), 'utf8'));
const innerHeroVisuals = JSON.parse(await readFile(new URL('../src/data/innerHeroVisuals.json', import.meta.url), 'utf8'));
const capabilitySource = await readFile(new URL('../src/data/capabilities.ts', import.meta.url), 'utf8');
const dist = new URL('../dist/', import.meta.url);
const rootBuild = await readFile(new URL('index.html', dist), 'utf8');
const coreRoutes = new Set([
  '/', '/about/', '/contact/', '/works/', '/metaverse/',
  '/animation/', '/augment-reality/', '/brand-advertisement/', '/media-production/',
  '/mixed-reality/', '/virtual-reality/', '/privacy-policy/', '/terms-of-service/',
]);

function parseStringArray(value) {
  return [...value.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

// The source-qualified capability data remains the single authored source. This narrow parser
// deliberately extracts only its stable literal fields for no-JavaScript delivery.
const capabilityRecords = [...capabilitySource.matchAll(/slug: '([^']+)', title: '([^']+)', route: '([^']+)', eyebrow: '([^']+)',\s*overview: '([^']+)',\s*creates: \[([^\]]+)\],\s*applications: \[([^\]]+)\]/gs)].map((match) => ({
  slug: match[1], title: match[2], route: match[3], eyebrow: match[4], overview: match[5],
  creates: parseStringArray(match[6]), applications: parseStringArray(match[7]),
}));
if (capabilityRecords.length !== 8) throw new Error(`Expected 8 source-qualified capability records; found ${capabilityRecords.length}.`);
if (slideExperiences.length !== 7) throw new Error(`Expected 7 homepage slide experiences; found ${slideExperiences.length}.`);

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function normaliseText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  return (node.children || []).map(textOf).join('');
}

function collectNodes(nodes, tag, limit = 8) {
  const results = [];
  const visit = (node) => {
    if (!node || results.length >= limit) return;
    if (node.type === 'element' && node.tag === tag) {
      const text = normaliseText(textOf(node));
      if (text) results.push(text);
    }
    (node.children || []).forEach(visit);
  };
  nodes.forEach(visit);
  return [...new Set(results)];
}

function getDescription(page) {
  return normaliseText(page.description || page.meta?.description || routeSeo[page.route]?.description || '');
}

function getFallbackH1(page) {
  return collectNodes(page.children || [], 'h1', 1)[0]
    || normaliseText(page.meta?.['og:title'] || page.title || 'Angel Creations');
}

function sourceSchema(page) {
  return (page.jsonLd || []).flatMap((item) => {
    try {
      const data = JSON.parse(item);
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
    } catch {
      return '';
    }
  }).join('\n');
}

function socialMeta(meta = {}) {
  return Object.entries(meta).flatMap(([key, value]) => {
    if (!value || (!key.startsWith('og:') && !key.startsWith('twitter:'))) return [];
    const attribute = key.startsWith('og:') ? 'property' : 'name';
    return [`<meta ${attribute}="${key}" content="${escapeHtml(value)}">`];
  }).join('\n');
}

function enhanceRootDocument() {
  const home = pages.find((page) => page.route === '/');
  if (!home) throw new Error('Captured home route is missing.');
  const title = routeSeo['/']?.title || home.title;
  const shareTitle = routeSeo['/']?.shareTitle || title;
  const description = routeSeo['/']?.description || getDescription(home);
  const canonical = home.canonical || 'https://angelcreations.in/';
  const image = routeSeo['/']?.image
    ? `https://angelcreations.in${routeSeo['/'].image}`
    : home.meta?.['og:image'];
  const imageAlt = routeSeo['/']?.imageAlt || title;
  const rootSocialMeta = {
    ...home.meta,
    'og:type': 'website',
    'og:site_name': 'Angel Creations',
    'og:locale': 'en_US',
    'og:title': shareTitle,
    'og:description': description,
    'og:url': canonical,
    'og:image': image,
    ...(image ? {
      'og:image:secure_url': image,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'og:image:alt': imageAlt,
    } : {}),
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': shareTitle,
    'twitter:description': description,
    'twitter:image': image,
    ...(image ? { 'twitter:image:alt': imageAlt } : {}),
  };
  const markerStart = '<!-- angel-static-seo:start -->';
  const markerEnd = '<!-- angel-static-seo:end -->';
  const injection = `${markerStart}\n${socialMeta(rootSocialMeta)}\n${sourceSchema(home)}\n${markerEnd}`;
  const withoutPrevious = rootBuild.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}\\n?`), '');
  const withHeadMetadata = withoutPrevious
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  return writeFile(new URL('index.html', dist), withHeadMetadata.replace('</head>', `${injection}\n</head>`));
}

function capabilitySchema(capability) {
  const canonical = `https://angelcreations.in${capability.route}`;
  const title = routeSeo[capability.route]?.title || `${capability.title} | Angel Creations`;
  const description = routeSeo[capability.route]?.description || capability.overview;
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': canonical, url: canonical,
        name: title, description,
        isPartOf: { '@id': 'https://angelcreations.in/#website' },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
          { '@type': 'ListItem', position: 2, name: 'Capabilities', item: 'https://angelcreations.in/about/' },
          { '@type': 'ListItem', position: 3, name: capability.title, item: canonical },
        ],
      },
      {
        '@type': 'Service', '@id': `${canonical}#service`, name: title,
        description, url: canonical,
        provider: { '@id': 'https://angelcreations.in/#organization' },
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

// Reuse the built stylesheet and Vite entry assets from the actual generated root build. This
// prevents static route files from becoming a no-JS-only experience for JavaScript users.
//
// Script elements must be copied with their closing tag. Emitting `<script src="...">` alone
// makes every browser swallow the remainder of the document as script text, which blanked
// every route in production (the root document was the only one Vite wrote itself).
const runtimeAssetTags = [...rootBuild.matchAll(/<script\b[^>]*src="\/assets\/[^"]+"[^>]*>\s*<\/script>|<link\b[^>]*rel="stylesheet"[^>]*>/g)]
  .map((match) => match[0])
  .filter((tag) => tag.startsWith('<script')
    ? tag.includes('type="module"')
    : /href="\/assets\//.test(tag))
  .join('\n');
if (!runtimeAssetTags.includes('type="module"')) throw new Error('Generated root build entry script was not found.');
{
  const opened = (runtimeAssetTags.match(/<script\b/gi) || []).length;
  const closed = (runtimeAssetTags.match(/<\/script>/gi) || []).length;
  if (opened !== closed) throw new Error(`Generated entry asset markup has ${opened} <script> tags but ${closed} </script> tags.`);
}

// Every generated route document gets the same boot fallback as the root document, so a
// cached document or a failed bundle can never leave a route blank. The block is shared
// with the Vite plugin through scripts/boot-fallback.mjs.
if (!bootFallbackBlock.includes('id="boot-fallback"')) {
  throw new Error('Boot fallback markup is missing or malformed.');
}
if (!bootFallbackBlock.includes('data-boot-watchdog')) {
  throw new Error('Boot watchdog script is missing from the boot fallback.');
}

const fallbackCss = `<style>html{background:#000;color:#fff;font-family:Arial,sans-serif}body{max-width:960px;margin:0 auto;padding:clamp(2rem,8vw,7rem) clamp(1.25rem,5vw,4rem);background:#000}nav{display:flex;flex-wrap:wrap;gap:1rem 1.5rem;margin-bottom:4rem;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}a{color:#fff}h1{max-width:17ch;font-size:clamp(2.25rem,6vw,4.8rem);font-weight:400;letter-spacing:-.05em;line-height:.96}h2{margin-top:4rem;font-size:clamp(1.5rem,4vw,3rem);font-weight:400;letter-spacing:-.03em}h3{font-size:1.2rem;font-weight:400}p{max-width:48rem;line-height:1.6;color:rgba(255,255,255,.76)}.eyebrow,.meta{color:#c5b5a5;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}.archive{margin:3rem 0;padding:0;list-style:none}.archive li{padding:2rem 0;border-top:1px solid rgba(255,255,255,.2)}details{margin-top:1rem}.source-text{white-space:pre-line}li{padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.16);list-style:none}ul{padding:0;border-top:1px solid rgba(255,255,255,.2)}.lead{font-size:1.12rem}</style>`;

const notFoundFallbackCss = `<style>
.angel-not-found{position:relative;isolation:isolate;display:grid;min-height:68vh;align-items:center;margin-top:1.5rem;padding:clamp(1.5rem,5vw,3.5rem);overflow:hidden;border:1px solid rgba(228,232,242,.12);border-radius:24px;background:radial-gradient(36rem 28rem at 22% 50%,rgba(123,63,242,.22),transparent 68%),radial-gradient(26rem 22rem at 22% 52%,rgba(0,210,255,.12),transparent 70%),#060913;color:#f7f9ff}
.angel-not-found:before{position:absolute;z-index:-1;inset:0;background-image:linear-gradient(rgba(228,232,242,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(228,232,242,.035) 1px,transparent 1px);background-size:48px 48px;content:"";pointer-events:none}
.angel-not-found__layout{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:center;gap:clamp(1rem,4vw,2.5rem)}
.angel-not-found__visual{position:relative;display:grid;width:min(100%,19rem);aspect-ratio:1;place-items:center;justify-self:center;border:1px solid rgba(228,232,242,.1);border-radius:50%;background:radial-gradient(circle,rgba(26,42,108,.45),transparent 70%)}
.angel-not-found__visual:before,.angel-not-found__visual:after{position:absolute;inset:10%;border:1px solid rgba(0,210,255,.22);border-radius:50%;content:""}
.angel-not-found__visual:after{inset:21%;border-color:rgba(214,180,255,.2)}
.angel-not-found__orbit{position:absolute;top:50%;left:50%;width:88%;height:54%;border:1px solid rgba(0,210,255,.45);border-radius:50%;transform:translate(-50%,-50%) rotate(-22deg)}
.angel-not-found__orbit--middle{width:58%;height:91%;border-color:rgba(214,180,255,.38);transform:translate(-50%,-50%) rotate(38deg)}
.angel-not-found__orbit--inner{width:96%;height:32%;border-color:rgba(255,94,138,.28);transform:translate(-50%,-50%) rotate(5deg)}
.angel-not-found__planet{position:relative;z-index:1;display:grid;width:54%;aspect-ratio:1;place-items:center;border:1px solid rgba(247,249,255,.2);border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(0,210,255,.34),transparent 35%),radial-gradient(circle at 70% 75%,rgba(232,92,255,.34),transparent 48%),linear-gradient(145deg,#24324f,#0a0f1f 70%);box-shadow:0 0 3rem rgba(123,63,242,.3)}
.angel-not-found__planet span{color:#f7f9ff;font:400 clamp(3rem,8vw,5rem)/.8 Georgia,serif;letter-spacing:-.1em}
.angel-not-found__planet i{position:absolute;top:17%;right:19%;width:.4rem;height:.4rem;border-radius:50%;background:#ff5e8a;box-shadow:0 0 1rem #ff5e8a}
.angel-not-found__visual-label,.angel-not-found__visual-coordinate{position:absolute;color:rgba(228,232,242,.62);font:600 .52rem/1.3 Arial,sans-serif;letter-spacing:.14em}
.angel-not-found__visual-label{top:10%;left:11%}.angel-not-found__visual-coordinate{right:6%;bottom:14%}
.angel-not-found__content{position:relative;min-width:0}.angel-not-found__eyebrow,.angel-not-found__code,.angel-not-found__footnote{font:600 .62rem/1.5 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:rgba(228,232,242,.65)}
.angel-not-found__eyebrow{margin:0 0 1.5rem}.angel-not-found__eyebrow span{color:#00d2ff}.angel-not-found__code{margin:0 0 .8rem;color:#d6b4ff}
.angel-not-found h1{max-width:11ch;margin:0;color:#f7f9ff;font:400 clamp(2.5rem,5vw,4.6rem)/.98 Georgia,serif;letter-spacing:-.055em}.angel-not-found h1 em{color:#76dcff;font-style:normal}
.angel-not-found__description{max-width:30rem;margin:1.1rem 0 0;color:rgba(228,232,242,.82);font-size:.98rem;line-height:1.65}
.angel-not-found__requested{display:grid;gap:.35rem;max-width:32rem;margin-top:1.2rem;padding:.75rem .9rem;border:1px solid rgba(228,232,242,.16);border-radius:12px;background:rgba(10,15,31,.6)}
.angel-not-found__requested span{color:rgba(228,232,242,.6);font:600 .55rem/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.angel-not-found__requested code{overflow-wrap:anywhere;color:#f7f9ff;font:500 .78rem/1.5 monospace}
.angel-not-found__actions{display:flex;flex-wrap:wrap;gap:.55rem;margin:1.5rem 0 0}.angel-not-found__actions a{display:inline-flex;min-height:2.6rem;align-items:center;justify-content:center;gap:.7rem;margin:0;padding:.7rem .9rem;border:1px solid rgba(228,232,242,.26);border-radius:999px;color:#f7f9ff;background:rgba(10,15,31,.7);font:600 .62rem/1.2 Arial,sans-serif;letter-spacing:.04em;text-decoration:none;text-transform:none}.angel-not-found__actions a:first-child{border-color:transparent;background:linear-gradient(110deg,#6846e8,#167bcb 60%,#00a9b8)}.angel-not-found__actions a:hover{border-color:#00d2ff;transform:translateY(-2px)}.angel-not-found__actions a:focus-visible{outline:2px solid #00d2ff;outline-offset:4px}
.angel-not-found__footnote{margin:1.6rem 0 0;font-size:.52rem}.angel-not-found__footnote span{color:#00d2ff}
@media(max-width:680px){.angel-not-found{min-height:0;padding:1.4rem}.angel-not-found__layout{grid-template-columns:minmax(0,1fr);gap:1.35rem}.angel-not-found__visual{width:min(64vw,15rem)}.angel-not-found__content{padding-bottom:.25rem}.angel-not-found__eyebrow{margin-bottom:1.15rem}.angel-not-found h1{font-size:clamp(2.5rem,11vw,4rem)}.angel-not-found__actions{gap:.45rem}.angel-not-found__actions a{min-height:2.45rem;padding:.65rem .75rem;font-size:.57rem}}
@media(prefers-reduced-motion:reduce){.angel-not-found__actions a{transition:none;transform:none}}
</style>`;

function documentShell({ title, description, canonical, robots, ogTitle, image, imageAlt, schema = '', extraHead = '', fallback }) {
  return `<!doctype html>
<html lang="en-US" class="respect-color-scheme-preference"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
<meta name="robots" content="${escapeHtml(robots || 'index, follow')}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(ogTitle || title)}">
${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Angel Creations">
<meta property="og:locale" content="en_US">
${image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:secure_url" content="${escapeHtml(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="${escapeHtml(imageAlt || ogTitle || title)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">
${description ? `<meta name="twitter:description" content="${escapeHtml(description)}">` : ''}
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}"><meta name="twitter:image:alt" content="${escapeHtml(imageAlt || ogTitle || title)}">` : ''}
${schema}
${extraHead}
${runtimeAssetTags}
</head><body class="is-light-theme no-js"><div id="root"></div>${bootFallbackBlock}<noscript>${fallbackCss}${fallback}</noscript></body></html>`;
}

function staticNavigation() {
  return `<nav aria-label="Primary"><a href="/">Home</a><a href="/about/">About</a><a href="/works/">Works</a><a href="/contact/">Contact</a></nav>`;
}

function staticLegalLinks() {
  return `<footer><a href="/privacy-policy/">Privacy Policy</a> / <a href="/terms-of-service/">Terms of Service</a></footer>`;
}

function renderCapabilityIndex() {
  return `<section aria-labelledby="static-capabilities"><h2 id="static-capabilities">Capabilities</h2><p>Explore Angel’s source-qualified capability material.</p><ul>${capabilityRecords.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul></section>`;
}

function renderVideoArchive() {
  return `<section aria-labelledby="video-archive-title"><p class="eyebrow">Archive / 47 public source records</p><h2 id="video-archive-title">Watch the work.</h2><p>Titles, descriptions, links, and available metadata are retained from Angel Creations’ public video archive. Source descriptions are presented as source text, not new claims.</p><ol class="archive">${videos.map((video) => {
    const metadata = [video.category, video.duration, video.publishDate || video.uploadDate, video.views === undefined ? '' : `${video.views} views`, video.likes === undefined || video.likes === '' ? '' : `${video.likes} likes`, video.status].filter(Boolean);
    return `<li><article><h3><a href="${escapeHtml(video.url)}">${escapeHtml(video.title)}</a></h3>${metadata.length ? `<p class="meta">${metadata.map(escapeHtml).join(' / ')}</p>` : ''}${video.description ? `<details><summary>Read source description</summary><p class="source-text">${escapeHtml(video.description)}</p></details>` : ''}${video.tags?.length ? `<details><summary>Source tags (${video.tags.length})</summary><p class="source-text">${escapeHtml(video.tags.join(' · '))}</p></details>` : ''}</article></li>`;
  }).join('')}</ol></section>`;
}

function experienceSchema(experience) {
  const canonical = `https://angelcreations.in${experience.route}`;
  const title = routeSeo[experience.route]?.title || `${experience.label} | Angel Creations`;
  const description = routeSeo[experience.route]?.description || experience.summary;
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': canonical, url: canonical,
        name: title, description,
        isPartOf: { '@id': 'https://angelcreations.in/#website' },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
          { '@type': 'ListItem', position: 2, name: experience.label, item: canonical },
        ],
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

function experienceWork(experience) {
  if (!experience.workTitleTerms?.length) return [];
  return videos.filter((video) => experience.workTitleTerms.some((term) => video.title.toLowerCase().includes(term.toLowerCase()))).slice(0, 3);
}

function metaverseFallback(experience, previous, next) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const related = metaverseContent.relatedCapabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean);
  const possibilities = metaverseContent.experienceTypes.map((type) => `<section><h3>${escapeHtml(type.title)}</h3><p>${escapeHtml(type.description)}</p>${type.applications.length ? list(type.applications) : ''}${type.closing ? `<p>${escapeHtml(type.closing)}</p>` : ''}</section>`).join('');
  const layer = `<dl>${metaverseContent.experienceLayer.map(([term, definition]) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd>`).join('')}</dl>`;
  const map = experienceMaps['/metaverse/'];
  const mapMarkup = map ? `<p class="eyebrow">Experience map / explore</p><h2>${escapeHtml(map.title)}</h2><p>${escapeHtml(map.intro)}</p>${list(map.steps.map(([title, description]) => `${title} — ${description}`))}` : '';
  return `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.number)} / ${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p>${metaverseContent.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<h2>Virtual worlds, built around an idea.</h2>${metaverseContent.worldStatement.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${mapMarkup}<h2>What can a metaverse experience become?</h2>${possibilities}<h2>The experience layer</h2><p>A virtual world is only as valuable as the experience inside it. We consider:</p>${layer}<h2>Who can use it?</h2><p>Metaverse experiences can support:</p>${list(metaverseContent.whoCanUse)}<h2>From idea to world</h2><p>A metaverse project can begin with a simple question:</p><p>What if this existed somewhere people could enter?</p><p>From there, the experience can evolve through:</p><p>${escapeHtml(metaverseContent.evolution.join(' → '))}</p><p class="eyebrow">Show the work</p><h2>${escapeHtml(map?.work?.title || 'Show the work')}</h2>${map?.work?.bridge ? `<p>${escapeHtml(map.work.bridge)}</p>` : ''}<p>No public archive record is linked here without stretching the evidence. Explore the complete verified <a href="/works/">Works archive</a>.</p><p class="eyebrow">The disciplines behind the experience</p><h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul><h2>Original Metaverse environment</h2><p>The captured route includes a Unity WebGL artifact titled MetaScore. It is retained as a source artifact and is not presented as a new product or case study. JavaScript is required to load this optional preserved environment.</p><h2>Let’s build a world.</h2><p>Have an idea that deserves more than a screen? <a href="/contact/">Start a conversation with Angel Creations.</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to slide ${escapeHtml(experience.number)}</a> / <a href="${previous.route}">Prev: ${escapeHtml(previous.number)} / ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.number)} / 07 ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.number)} / ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
}

function storyFallback(experience, story, previous, next, workMarkup) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const entries = (items) => `<ol class="archive">${items.map((item) => `<li><article><h3>${escapeHtml(item.title)}</h3>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}${item.statement ? `<p>${escapeHtml(item.statement)}</p>` : ''}${item.items?.length ? list(item.items) : ''}${item.closing ? `<p>${escapeHtml(item.closing)}</p>` : ''}</article></li>`).join('')}</ol>`;
  const sections = story.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''}${section.paragraphs?.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') ?? ''}${section.statement ? `<p>${escapeHtml(section.statement)}</p>` : ''}${section.items?.length ? list(section.items) : ''}${section.entries?.length ? entries(section.entries) : ''}${section.sequence?.length ? `<p>${escapeHtml(section.sequence.join(' → '))}</p>` : ''}${section.closing ? `<p>${escapeHtml(section.closing)}</p>` : ''}</section>`).join('');
  const related = story.relatedCapabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean);
  const map = experienceMaps[experience.route];
  const mapMarkup = map ? `<section><p class="eyebrow">Experience map / explore</p><h2>${escapeHtml(map.title)}</h2><p>${escapeHtml(map.intro)}</p>${list(map.steps.map(([title, description]) => `${title} — ${description}`))}</section>` : '';
  return `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.number)} / ${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p><p>${escapeHtml(experience.summary)}</p>${mapMarkup}${sections}<p class="eyebrow">Show the work</p><h2>${escapeHtml(map?.work?.title || 'Show the work')}</h2>${map?.work?.bridge ? `<p>${escapeHtml(map.work.bridge)}</p>` : ''}${workMarkup}<p class="eyebrow">The disciplines behind the experience</p><h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul><h2>${escapeHtml(story.cta.lead)}</h2><p><a href="/contact/">${escapeHtml(story.cta.action)}</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to slide ${escapeHtml(experience.number)}</a> / <a href="${previous.route}">Prev: ${escapeHtml(previous.number)} / ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.number)} / 07 ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.number)} / ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
}

function experienceDocument(experience) {
  const canonical = `https://angelcreations.in${experience.route}`;
  const metadata = routeSeo[experience.route] || {};
  const title = metadata.title || `${experience.label} | Angel Creations`;
  const shareTitle = metadata.shareTitle || title;
  const description = metadata.description || experience.summary;
  const imageAlt = metadata.imageAlt || shareTitle;
  const imagePath = metadata.image || innerHeroVisuals[experience.route];
  const image = imagePath ? new URL(imagePath, 'https://angelcreations.in').href : undefined;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const index = slideExperiences.findIndex((item) => item.route === experience.route);
  const previous = slideExperiences[(index - 1 + slideExperiences.length) % slideExperiences.length];
  const next = slideExperiences[(index + 1) % slideExperiences.length];
  const related = experience.capabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean);
  const work = experienceWork(experience);
  const workMarkup = work.length ? `<ol class="archive">${work.map((record) => `<li><article><h3><a href="${escapeHtml(record.url)}">${escapeHtml(record.title)}</a></h3>${record.description ? `<details><summary>Read source description</summary><p class="source-text">${escapeHtml(record.description)}</p></details>` : ''}</article></li>`).join('')}</ol>` : `<p>No public archive record is linked here without stretching the evidence. Explore the complete verified <a href="/works/">Works archive</a>.</p>`;
  const story = experienceStories[experience.route];
  const artifact = experience.hasUnityArtifact ? `<h2>Original Metaverse environment</h2><p>The captured route includes a Unity WebGL artifact titled MetaScore. It is retained as a source artifact and is not presented as a new product or case study. JavaScript is required to load this optional preserved environment.</p>` : '';
  const defaultFallback = `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.number)} / ${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p><p>${escapeHtml(experience.summary)}</p><h2>What Angel creates here</h2><p>Current public Angel source material lists:</p>${list(experience.creates)}<h2>How Angel approaches it</h2><p>Angel Creations’ current public About source describes work rooted in usability, creativity, aesthetics and craft, built through collaboration, joint ambition and mutual respect.</p><h2>Where it applies</h2><p>These are application contexts named in the captured Angel source. They are not asserted as project outcomes.</p>${list(experience.applications)}<h2>Show the work</h2>${workMarkup}<h2>Related areas</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul>${artifact}<h2>Start a conversation</h2><p><a href="/contact/">Start a project</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to slide ${escapeHtml(experience.number)}</a> / <a href="${previous.route}">Prev: ${escapeHtml(previous.number)} / ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.number)} / 07 ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.number)} / ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
  const fallback = experience.route === '/metaverse/' ? metaverseFallback(experience, previous, next) : story ? storyFallback(experience, story, previous, next, workMarkup) : defaultFallback;
  return documentShell({ title, description, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: shareTitle, image, imageAlt, schema: experienceSchema(experience), fallback });
}

function documentFor(page) {
  const experience = slideExperiences.find((item) => item.route === page.route);
  if (experience) return experienceDocument(experience);
  const h1 = getFallbackH1(page);
  const headings = collectNodes(page.children || [], 'h2', 10);
  const sourceParagraphs = collectNodes(page.children || [], 'p', 8).filter((item) => item.length > 30 && item.length < 600);
  const canonical = page.canonical || `https://angelcreations.in${page.route}`;
  const metadata = routeSeo[page.route] || {};
  const title = metadata.title || page.title || h1;
  const shareTitle = metadata.shareTitle || title;
  const description = metadata.description || getDescription(page);
  const image = metadata.image ? new URL(metadata.image, 'https://angelcreations.in').href : undefined;
  const imageAlt = metadata.imageAlt || shareTitle;
  const fallback = `${staticNavigation()}<main><p class="eyebrow">Angel Creations / source fallback</p><h1>${escapeHtml(h1)}</h1>${description ? `<p class="lead">${escapeHtml(description)}</p>` : ''}${headings.map((heading) => `<h2>${escapeHtml(heading)}</h2>`).join('')}${sourceParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${page.route === '/about/' ? renderCapabilityIndex() : ''}${page.route === '/works/' ? renderVideoArchive() : ''}</main>${staticLegalLinks()}`;
  return documentShell({ title, description, canonical, robots: page.robots, ogTitle: shareTitle, image, imageAlt, schema: sourceSchema(page), fallback });
}

function capabilityDocument(capability) {
  const canonical = `https://angelcreations.in${capability.route}`;
  const metadata = routeSeo[capability.route] || {};
  const title = metadata.title || `${capability.title} | Angel Creations`;
  const shareTitle = metadata.shareTitle || title;
  const description = metadata.description || capability.overview;
  const image = metadata.image ? new URL(metadata.image, 'https://angelcreations.in').href : undefined;
  const imageAlt = metadata.imageAlt || shareTitle;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const fallback = `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(capability.eyebrow)}</p><h1>${escapeHtml(capability.title)}</h1><p>${escapeHtml(description)}</p><h2>What Angel creates</h2><p>Current public Angel source material lists:</p>${list(capability.creates)}<h2>What it can support</h2><p>These are application contexts named in the captured Angel source. They are not claimed as case-study outcomes.</p>${list(capability.applications)}<h2>Relevant public work</h2><p>Explore the verified public <a href="/works/">Works archive</a>.</p><h2>Relevant insights</h2><p>No separate authored insight record is asserted without a verified source. The public Works archive remains the related source-qualified material.</p><p>Need this capability? <a href="/contact/">Start a project</a>.</p></main>${staticLegalLinks()}`;
  return documentShell({ title, description, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: shareTitle, image, imageAlt, schema: capabilitySchema(capability), fallback });
}

function statusErrorDocument({ status, title, label, codeLabel, heading, description, footnote }) {
  const pageMarkup = `<main id="main" class="site-main angel-not-found"><section class="angel-not-found__layout" aria-labelledby="status-error-title"><div class="angel-not-found__visual" aria-hidden="true"><span class="angel-not-found__visual-label">SIGNAL / ${status}</span><span class="angel-not-found__orbit"></span><span class="angel-not-found__orbit angel-not-found__orbit--middle"></span><span class="angel-not-found__orbit angel-not-found__orbit--inner"></span><span class="angel-not-found__planet"><span>${status}</span><i></i></span><span class="angel-not-found__visual-coordinate">AC / ${status === 410 ? 'RETIRED' : 'STATUS'}</span></div><div class="angel-not-found__content"><p class="angel-not-found__eyebrow">Angel Creations <span>/ ${escapeHtml(label)}</span></p><p class="angel-not-found__code">${escapeHtml(codeLabel)} <span aria-hidden="true">—</span> ${status}</p><h1 id="status-error-title">${escapeHtml(heading)}</h1><p class="angel-not-found__description">${escapeHtml(description)}</p><nav class="angel-not-found__actions" aria-label="Continue exploring Angel Creations"><a href="/"><span>Back to home</span><span aria-hidden="true">↗</span></a><a href="/works/">Explore the work</a><a href="/contact/">Contact the studio</a></nav><p class="angel-not-found__footnote">${escapeHtml(footnote)} <span aria-hidden="true">·</span> KEEP EXPLORING</p></div></section></main>`;
  return `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${escapeHtml(title)}</title>${notFoundFallbackCss}</head><body>${pageMarkup}</body></html>`;
}

function notFoundDocument() {
  return statusErrorDocument({
    status: 404, title: 'Page not found | Angel Creations', label: 'Error 404',
    codeLabel: 'PAGE NOT FOUND', heading: 'This page is out of orbit.',
    description: 'That address doesn’t lead to a page here. Let’s get you back to something worth exploring.',
    footnote: 'GOOD THINGS ARE STILL AHEAD',
  });
}

function errorDocuments() {
  return {
    '403.html': statusErrorDocument({
      status: 403, title: 'Access unavailable | Angel Creations', label: 'Access unavailable',
      codeLabel: 'ACCESS UNAVAILABLE', heading: 'This page can’t be opened from here.',
      description: 'The server did not allow this request. If you believe you should have access, contact the studio.',
      footnote: 'WE’RE HERE TO HELP',
    }),
    '410.html': statusErrorDocument({
      status: 410, title: 'Experience retired | Angel Creations', label: 'Retired experience',
      codeLabel: 'EXPERIENCE RETIRED', heading: 'This experience has retired.',
      description: 'The old 360 video address has been retired. Explore current work or contact the studio for help finding something.',
      footnote: 'THE OLD ROUTE IS RETIRED',
    }),
    '500.html': statusErrorDocument({
      status: 500, title: 'Something went wrong | Angel Creations', label: 'Server error',
      codeLabel: 'SERVER ERROR', heading: 'Something went wrong on our side.',
      description: 'The request could not be completed. Please try again shortly, or contact the studio if the problem continues.',
      footnote: 'PLEASE TRY AGAIN SHORTLY',
    }),
    '502.html': statusErrorDocument({
      status: 502, title: 'Temporary connection issue | Angel Creations', label: 'Connection issue',
      codeLabel: 'GATEWAY ERROR', heading: 'We couldn’t complete that connection.',
      description: 'A gateway returned an unexpected response. Please try again shortly, or return to the home page.',
      footnote: 'CONNECTIONS CAN BE RETRIED',
    }),
    '503.html': statusErrorDocument({
      status: 503, title: 'Temporarily unavailable | Angel Creations', label: 'Temporarily unavailable',
      codeLabel: 'SERVICE UNAVAILABLE', heading: 'The site is temporarily unavailable.',
      description: 'Please try again in a little while. You can also contact the studio directly.',
      footnote: 'THANK YOU FOR YOUR PATIENCE',
    }),
    '504.html': statusErrorDocument({
      status: 504, title: 'Request timed out | Angel Creations', label: 'Request timed out',
      codeLabel: 'GATEWAY TIMEOUT', heading: 'That request took too long.',
      description: 'The server did not finish the request in time. Please retry, or come back in a little while.',
      footnote: 'PLEASE TRY AGAIN',
    }),
  };
}

function worksAliasDocument() {
  const fallback = `${staticNavigation()}<main><p class="eyebrow">Works / moved</p><h1>Continue to the Works archive.</h1><p><a href="/works/">Explore 47 verified public Angel Creations video records.</a></p></main>${staticLegalLinks()}`;
  return documentShell({ title: 'Works archive | Angel Creations', description: 'Continue to the Angel Creations Works archive.', canonical: 'https://angelcreations.in/works/', robots: 'noindex, follow', ogTitle: 'Works archive | Angel Creations', extraHead: '<meta http-equiv="refresh" content="0; url=/works/">', fallback });
}

await enhanceRootDocument();

const selectedPages = pages.filter((page) => page.status === 200 && coreRoutes.has(page.route));
for (const page of selectedPages) {
  if (page.route === '/') continue; // Vite owns the root document; its local noscript fallback lives in index.html.
  const relative = page.route.replace(/^\//, '');
  await mkdir(new URL(`${relative}`, dist), { recursive: true });
  await writeFile(new URL(`${relative}index.html`, dist), documentFor(page));
}

for (const capability of capabilityRecords) {
  const relative = capability.route.replace(/^\//, '');
  await mkdir(new URL(`${relative}`, dist), { recursive: true });
  await writeFile(new URL(`${relative}index.html`, dist), capabilityDocument(capability));
}

await writeFile(new URL('404.html', dist), notFoundDocument());
for (const [filename, html] of Object.entries(errorDocuments())) {
  await writeFile(new URL(filename, dist), html);
}
await mkdir(new URL('work/', dist), { recursive: true });
await writeFile(new URL('work/index.html', dist), worksAliasDocument());

const sitemapUrls = [
  ...selectedPages.map((page) => page.canonical || `https://angelcreations.in${page.route}`),
  ...capabilityRecords.map((capability) => `https://angelcreations.in${capability.route}`),
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
const robotsTxt = 'User-agent: *\nAllow: /\nSitemap: https://angelcreations.in/sitemap.xml\n';
await Promise.all([
  writeFile(new URL('sitemap.xml', dist), sitemapXml),
  writeFile(new URL('robots.txt', dist), robotsTxt),
  writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemapXml),
  writeFile(new URL('../public/robots.txt', import.meta.url), robotsTxt),
]);

console.log(`Generated ${selectedPages.length - 1} enhanced core and ${capabilityRecords.length} capability static fallbacks, sitemap.xml and robots.txt.`);
