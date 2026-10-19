/*
  Generates source-qualified route documents after Vite build.
  JavaScript-capable visitors boot the same React application from every route.  The semantic
  source fallback lives in <noscript>, so no-JS users and crawlers retain meaningful content.
*/
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const pages = JSON.parse(await readFile(new URL('../src/data/legacyPages.json', import.meta.url), 'utf8'));
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
  '/', '/about/', '/contact/', '/works/', '/metaverse/', '/360-video/',
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
  const markerStart = '<!-- angel-static-seo:start -->';
  const markerEnd = '<!-- angel-static-seo:end -->';
  const injection = `${markerStart}\n${socialMeta(home.meta)}\n${sourceSchema(home)}\n${markerEnd}`;
  const withoutPrevious = rootBuild.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}\\n?`), '');
  return writeFile(new URL('index.html', dist), withoutPrevious.replace('</head>', `${injection}\n</head>`));
}

function capabilitySchema(capability) {
  const canonical = `https://angelcreations.in${capability.route}`;
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': canonical, url: canonical,
        name: `${capability.title} | Angel Creations`, description: capability.overview,
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
        '@type': 'Service', '@id': `${canonical}#service`, name: capability.title,
        description: capability.overview, url: canonical,
        provider: { '@id': 'https://angelcreations.in/#organization' },
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

// Reuse all local legacy CSS and Vite entry assets from the actual generated root build. This
// prevents static route files from becoming a no-JS-only experience for JavaScript users.
// Script tags must be copied as complete elements: the Vite entry is `<script ...></script>`, and
// emitting only the opening tag leaves the rest of <head> (and the whole <body>) parsed as script
// text, which renders a blank document for JavaScript visitors on every static route file.
const runtimeAssetTags = [...rootBuild.matchAll(/<(?:link|script)\b[^>]*>(?:<\/script>)?/g)]
  .map((match) => {
    const tag = match[0];
    if (tag.startsWith('<script') && !tag.endsWith('</script>')) return `${tag}</script>`;
    if (tag.startsWith('</script>')) return '';
    return tag;
  })
  .filter(Boolean)
  .filter((tag) => (tag.includes('rel="stylesheet"') && /href="\/(?:legacy-assets|assets)\//.test(tag)) || (tag.includes('type="module"') && /src="\/assets\//.test(tag)))
  .join('\n');
if (!runtimeAssetTags.includes('type="module"')) throw new Error('Generated root build entry script was not found.');
if ((runtimeAssetTags.match(/<script\b/g) ?? []).length !== (runtimeAssetTags.match(/<\/script>/g) ?? []).length) {
  throw new Error('Generated static runtime asset tags contain an unclosed script element.');
}

const fallbackCss = `<style>html{background:#000;color:#fff;font-family:Arial,sans-serif}body{max-width:960px;margin:0 auto;padding:clamp(2rem,8vw,7rem) clamp(1.25rem,5vw,4rem);background:#000}nav{display:flex;flex-wrap:wrap;gap:1rem 1.5rem;margin-bottom:4rem;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}a{color:#fff}h1{max-width:17ch;font-size:clamp(2.25rem,6vw,4.8rem);font-weight:400;letter-spacing:-.05em;line-height:.96}h2{margin-top:4rem;font-size:clamp(1.5rem,4vw,3rem);font-weight:400;letter-spacing:-.03em}h3{font-size:1.2rem;font-weight:400}p{max-width:48rem;line-height:1.6;color:rgba(255,255,255,.76)}.eyebrow,.meta{color:#c5b5a5;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}.archive{margin:3rem 0;padding:0;list-style:none}.archive li{padding:2rem 0;border-top:1px solid rgba(255,255,255,.2)}details{margin-top:1rem}.source-text{white-space:pre-line}li{padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.16);list-style:none}ul{padding:0;border-top:1px solid rgba(255,255,255,.2)}.lead{font-size:1.12rem}</style>`;

// Same-origin preloads for the two Graphik faces every route renders. Kept identical to the
// root document so a direct entry on any inner route paints text as early as the home stage.
const fontPreloadTags = [
  '/legacy-assets/fonts/wp-content/themes/fleava/assets/fonts/Graphik-Regular-Web.woff2',
  '/legacy-assets/fonts/wp-content/themes/fleava/assets/fonts/Graphik-Light-Web.woff2',
].map((href) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`).join('');

function documentShell({ title, description, canonical, robots, ogTitle, image, schema = '', extraHead = '', fallback }) {
  return `<!doctype html>
<html lang="en-US" class="respect-color-scheme-preference"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#000000">
${fontPreloadTags}
<title>${escapeHtml(title)}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
<meta name="robots" content="${escapeHtml(robots || 'index, follow')}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(ogTitle || title)}">
${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}
<meta property="og:url" content="${escapeHtml(canonical)}">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
${schema}
${extraHead}
${runtimeAssetTags}
</head><body class="is-light-theme no-js"><div id="root"></div><noscript>${fallbackCss}${fallback}</noscript></body></html>`;
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
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': canonical, url: canonical,
        name: `${experience.label} | Angel Creations`, description: experience.summary,
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
  return documentShell({ title: `${experience.label} | Angel Creations`, description: experience.summary, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: `${experience.label} | Angel Creations`, image: innerHeroVisuals[experience.route] ? `https://angelcreations.in${innerHeroVisuals[experience.route]}` : undefined, schema: experienceSchema(experience), fallback });
}

function documentFor(page) {
  const experience = slideExperiences.find((item) => item.route === page.route);
  if (experience) return experienceDocument(experience);
  const h1 = getFallbackH1(page);
  const headings = collectNodes(page.children || [], 'h2', 10);
  const sourceParagraphs = collectNodes(page.children || [], 'p', 8).filter((item) => item.length > 30 && item.length < 600);
  const canonical = page.canonical || `https://angelcreations.in${page.route}`;
  const description = getDescription(page);
  const fallback = `${staticNavigation()}<main><p class="eyebrow">Angel Creations / source fallback</p><h1>${escapeHtml(h1)}</h1>${description ? `<p class="lead">${escapeHtml(description)}</p>` : ''}${headings.map((heading) => `<h2>${escapeHtml(heading)}</h2>`).join('')}${sourceParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${page.route === '/about/' ? renderCapabilityIndex() : ''}${page.route === '/works/' ? renderVideoArchive() : ''}</main>${staticLegalLinks()}`;
  return documentShell({ title: page.title || h1, description, canonical, robots: page.robots, ogTitle: page.meta?.['og:title'] || h1, image: page.meta?.['og:image'], schema: sourceSchema(page), fallback });
}

function capabilityDocument(capability) {
  const canonical = `https://angelcreations.in${capability.route}`;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const fallback = `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(capability.eyebrow)}</p><h1>${escapeHtml(capability.title)}</h1><p>${escapeHtml(capability.overview)}</p><h2>What Angel creates</h2><p>Current public Angel source material lists:</p>${list(capability.creates)}<h2>What it can support</h2><p>These are application contexts named in the captured Angel source. They are not claimed as case-study outcomes.</p>${list(capability.applications)}<h2>Relevant public work</h2><p>Explore the verified public <a href="/works/">Works archive</a>.</p><h2>Relevant insights</h2><p>No separate authored insight record is asserted without a verified source. The public Works archive remains the related source-qualified material.</p><p>Need this capability? <a href="/contact/">Start a project</a>.</p></main>${staticLegalLinks()}`;
  return documentShell({ title: `${capability.title} | Angel Creations`, description: capability.overview, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: `${capability.title} | Angel Creations`, schema: capabilitySchema(capability), fallback });
}

function notFoundDocument() {
  const fallback = `${staticNavigation()}<main><p class="eyebrow">404 / Angel archive</p><h1>This route is out of view.</h1><p>The page is not part of the available Angel archive.</p><p><a href="/">Return home</a> / <a href="/works/">Explore work</a> / <a href="/contact/">Start a project</a></p></main>${staticLegalLinks()}`;
  return documentShell({ title: 'Page not found | Angel Creations', description: 'The requested Angel Creations page is not available.', canonical: 'https://angelcreations.in/404.html', robots: 'noindex, follow', ogTitle: 'Page not found | Angel Creations', fallback });
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
await mkdir(new URL('work/', dist), { recursive: true });
await writeFile(new URL('work/index.html', dist), worksAliasDocument());

const sitemapUrls = [
  ...selectedPages.map((page) => page.canonical || `https://angelcreations.in${page.route}`),
  ...capabilityRecords.map((capability) => `https://angelcreations.in${capability.route}`),
];
await writeFile(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(new URL('robots.txt', dist), 'User-agent: *\nAllow: /\nSitemap: https://angelcreations.in/sitemap.xml\n');

console.log(`Generated ${selectedPages.length - 1} enhanced core and ${capabilityRecords.length} capability static fallbacks, sitemap.xml and robots.txt.`);
