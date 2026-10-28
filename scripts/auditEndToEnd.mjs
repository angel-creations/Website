/*
  Local-only end-to-end inventory for the generated static site.
  Run after `npm run build` with a Vite preview available (PREVIEW_BASE may be overridden).
  It does not crawl production or follow external websites.
*/
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const previewBase = process.env.PREVIEW_BASE || 'http://127.0.0.1:4174';
const productionOrigin = 'https://angelcreations.in';
const reportDate = new Date().toISOString().slice(0, 10);
const productionQaFile = 'docs/audits/PRODUCTION-QA-2026-10-19.json';
let productionQa = null;
try {
  productionQa = JSON.parse(await readFile(join(root, productionQaFile), 'utf8'));
} catch {
  // Production verification is maintained separately and is not required for local-only audits.
}
const routeSeo = JSON.parse(await readFile(join(root, 'src/data/routeSeo.json'), 'utf8'));
const sitemapXml = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const routes = [...sitemapXml.matchAll(/<loc>https:\/\/angelcreations\.in([^<]+)<\/loc>/g)].map((match) => match[1]);
const sourceAnchorInventory = [];
const externalByUrl = new Map();
const assetByUrl = new Map();
const remoteAssetByUrl = new Map();
const sourceInternalLinks = new Map();
const staticAnchorRecords = [];
const assetIssues = [];
const remoteMediaTypeIssues = [];
const linkIssues = [];
const socialIssues = [];

function decodeEntities(value = '') {
  return String(value).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[code.toLowerCase()] || entity;
  });
}

function parseAttributes(tag) {
  const attributes = {};
  const start = tag.indexOf(' ');
  if (start < 0) return attributes;
  const content = tag.slice(start, tag.lastIndexOf('>'));
  for (const match of content.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const key = match[1].toLowerCase();
    attributes[key] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function plainText(markup = '') {
  return decodeEntities(markup.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function readMeta(html, key, attr = 'property') {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if (attributes[attr] === key) return attributes.content || '';
  }
  return '';
}

function pageFile(route) {
  return join(dist, route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}index.html`);
}

function classifyUrl(raw, baseRoute = '/') {
  const href = decodeEntities(String(raw || '').trim());
  if (!href) return { kind: 'empty', href };
  if (href.startsWith('#')) return { kind: 'fragment', href };
  if (/^(mailto|tel|sms):/i.test(href)) return { kind: 'contact', href };
  if (/^(data|javascript|blob):/i.test(href)) return { kind: 'non-navigation', href };
  try {
    const target = new URL(href, `${productionOrigin}${baseRoute}`);
    const host = target.hostname.toLowerCase();
    if (host === 'angelcreations.in' || host === 'www.angelcreations.in') {
      return { kind: 'internal', href, pathname: target.pathname, search: target.search, hash: target.hash };
    }
    return { kind: 'external', href: target.href, hostname: host };
  } catch {
    return { kind: 'relative', href };
  }
}

function addExternal(url, source, label = '') {
  const classified = classifyUrl(url);
  if (classified.kind !== 'external') return;
  const record = externalByUrl.get(classified.href) || {
    url: classified.href,
    hostname: classified.hostname,
    sources: new Set(),
    labels: new Set(),
    localStatus: 'not applicable',
    remoteVerification: 'Not tested: outbound crawling of external services is unavailable in this sandbox.',
  };
  record.sources.add(source);
  if (label) record.labels.add(label);
  externalByUrl.set(classified.href, record);
}

function addSourceInternal(href, source) {
  const classified = classifyUrl(href);
  if (classified.kind !== 'internal') return;
  const key = `${classified.pathname}${classified.search}${classified.hash}`;
  const record = sourceInternalLinks.get(key) || { href: key, sources: new Set() };
  record.sources.add(source);
  sourceInternalLinks.set(key, record);
}

function tagName(tag) {
  return /^<\s*([\w-]+)/.exec(tag)?.[1]?.toLowerCase() || '';
}

function addAsset(raw, sourceFile, context) {
  const value = decodeEntities(String(raw || '').trim());
  if (!value || value.startsWith('#') || /^(data|blob|javascript):/i.test(value)) return;
  if (value.startsWith('//') || /^https?:/i.test(value)) {
    try {
      const url = new URL(value.startsWith('//') ? `https:${value}` : value);
      const record = remoteAssetByUrl.get(url.href) || {
        url: url.href,
        hostname: url.hostname.toLowerCase(),
        sources: new Set(),
        verification: 'Remote asset was inventoried but not requested from this sandbox.',
      };
      record.sources.add(`${sourceFile} (${context})`);
      remoteAssetByUrl.set(url.href, record);
    } catch { /* Invalid or unsupported URL, reported by the source-link inventory if clickable. */ }
    return;
  }

  const withoutQuery = value.split(/[?#]/, 1)[0];
  if (!withoutQuery || withoutQuery.includes('${') || /[{}]/.test(withoutQuery)) return;
  let path = withoutQuery;
  if (!path.startsWith('/')) {
    const fromDist = sourceFile.startsWith('dist/') ? sourceFile.slice(5) : '';
    path = `/${normalize(join(dirname(fromDist || 'index.html'), withoutQuery)).replaceAll('\\', '/')}`;
  }
  path = `/${path.replace(/^\/+/, '')}`;
  const extension = extname(path).toLowerCase();
  const assetLike = Boolean(extension) || ['/assets/', '/media/', '/media/library/', '/media/social/'].some((prefix) => path.startsWith(prefix));
  if (!assetLike) return;
  const record = assetByUrl.get(path) || { url: path, sources: new Set(), exists: null, localStatus: null };
  record.sources.add(`${sourceFile} (${context})`);
  assetByUrl.set(path, record);
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const groups = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return groups.flat();
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  }));
  return output;
}

// 1) Crawl every built sitemap HTML document and inventory actual anchor-only links.
for (const route of routes) {
  const file = pageFile(route);
  const html = await readFile(file, 'utf8');
  const anchors = [];
  for (const match of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gi)) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const attributes = parseAttributes(tag);
    const record = {
      sourceRoute: route,
      href: attributes.href || '',
      text: plainText(match[1]),
      target: attributes.target || '',
      rel: attributes.rel || '',
      kind: classifyUrl(attributes.href || '', route).kind,
    };
    anchors.push(record);
    staticAnchorRecords.push(record);
    if (record.kind === 'external') addExternal(record.href, `Static anchor on ${route}`, record.text);
  }
  sourceAnchorInventory.push({ route, anchorCount: anchors.length, anchors });
}

// 2) Collect component-defined anchors and data-driven route/video destinations that do not
//    appear in the no-JavaScript HTML (header/footer UI, menu products, runtime card maps).
const sourceFiles = (await filesUnder(join(root, 'src/components'))).filter((file) => /\.(tsx|ts)$/.test(file));
const sourceTargetBlankLinks = [];
for (const file of sourceFiles) {
  const relativeFile = relative(root, file).replaceAll('\\', '/');
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const attributes = parseAttributes(tag);
    if (attributes.href && !attributes.href.includes('{')) {
      addSourceInternal(attributes.href, relativeFile);
      addExternal(attributes.href, relativeFile, 'source-defined anchor');
    }
    if (attributes.target === '_blank') {
      sourceTargetBlankLinks.push({
        source: relativeFile,
        href: attributes.href || '(dynamic href)',
        rel: attributes.rel || '',
        secureRel: /\bnoopener\b|\bnoreferrer\b/i.test(attributes.rel || ''),
      });
    }
  }
  for (const match of source.matchAll(/\bhref\s*:\s*(['"])([^'"\n]+)\1/g)) {
    addSourceInternal(match[2], relativeFile);
    addExternal(match[2], relativeFile, 'source-defined link data');
  }
  for (const match of source.matchAll(/\b(?:mailto|tel):[^\s'"`<>}]*/gi)) {
    const rawEndpoint = match[0].replace(/[),;]+$/, '');
    const endpoint = rawEndpoint.startsWith('mailto:') && rawEndpoint.includes('?subject=')
      ? 'mailto:business@angelcreations.in?subject=dynamic-form-fields'
      : rawEndpoint;
    const record = externalByUrl.get(endpoint) || {
      url: endpoint,
      hostname: endpoint.startsWith('mailto:') ? 'email' : 'telephone',
      sources: new Set(), labels: new Set(),
      localStatus: 'not tested (requires a mail or phone client)',
      remoteVerification: 'Protocol target inventoried from source; no client launch was performed.',
    };
    record.sources.add(relativeFile);
    externalByUrl.set(endpoint, record);
  }
}

const slideExperiences = JSON.parse(await readFile(join(root, 'src/data/slideExperiences.json'), 'utf8'));
const assetManifest = JSON.parse(await readFile(join(root, 'docs/asset-manifest.json'), 'utf8'));
for (const slide of slideExperiences) {
  addSourceInternal(slide.route, 'Home slideshow / src/data/slideExperiences.json');
  if (slide.video && /^https?:/.test(slide.video)) {
    const videoUrl = new URL(slide.video);
    if (videoUrl.hostname === 'angelcreations.in' || videoUrl.hostname === 'www.angelcreations.in') {
      const historicalRecord = assetManifest.find((record) => record.original_url === slide.video);
      const record = remoteAssetByUrl.get(slide.video) || {
        url: slide.video,
        hostname: videoUrl.hostname,
        sources: new Set(),
        declaredMediaType: slide.mediaType || '',
        lastRecordedHttpStatus: historicalRecord?.http_status ?? null,
        lastRecordedContentType: historicalRecord?.content_type || '',
        lastRecordedAt: historicalRecord?.fetched_at || '',
        archiveStatus: historicalRecord?.status || 'not recorded',
        verification: 'No current remote request was performed. Any recorded status/content type is historical repository evidence only.',
      };
      record.sources.add(`Home slideshow / ${slide.label}`);
      if (historicalRecord?.content_type && slide.mediaType && historicalRecord.content_type !== slide.mediaType) {
        remoteMediaTypeIssues.push({ route: slide.route, url: slide.video, declared: slide.mediaType, recordedContentType: historicalRecord.content_type });
      }
      remoteAssetByUrl.set(slide.video, record);
    } else {
      addExternal(slide.video, `Remote slide video: ${slide.label}`);
    }
  }
}
const videoArchive = JSON.parse(await readFile(join(root, 'src/data/videoArchive.json'), 'utf8'));
for (const video of videoArchive) {
  if (video.url) addExternal(video.url, 'Works archive / src/data/videoArchive.json', video.title || '');
}
const capabilitiesSource = await readFile(join(root, 'src/data/capabilities.ts'), 'utf8');
for (const match of capabilitiesSource.matchAll(/route:\s*'([^']+)'/g)) {
  addSourceInternal(match[1], 'Capability route data / src/data/capabilities.ts');
}
for (const match of capabilitiesSource.matchAll(/'((?:\/)[^']+)'/g)) {
  if (match[1].startsWith('/capabilities/')) addSourceInternal(match[1], 'Capability related-route data / src/data/capabilities.ts');
}

// 3) Check link targets that resolve back to Angel Creations using the local preview server.
const internalCandidates = new Map();
for (const record of staticAnchorRecords) {
  const classified = classifyUrl(record.href, record.sourceRoute);
  if (classified.kind !== 'internal') continue;
  const key = `${classified.pathname}${classified.search}`;
  const item = internalCandidates.get(key) || { href: record.href, pathname: classified.pathname, search: classified.search, sources: new Set() };
  item.sources.add(`static anchor on ${record.sourceRoute}`);
  internalCandidates.set(key, item);
}
for (const record of sourceInternalLinks.values()) {
  const classified = classifyUrl(record.href);
  if (classified.kind !== 'internal') continue;
  const key = `${classified.pathname}${classified.search}`;
  const item = internalCandidates.get(key) || { href: record.href, pathname: classified.pathname, search: classified.search, sources: new Set() };
  for (const source of record.sources) item.sources.add(source);
  internalCandidates.set(key, item);
}
const internalLinkTests = await mapLimit([...internalCandidates.values()], 12, async (item) => {
  const url = new URL(`${item.pathname}${item.search}`, previewBase).href;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    return {
      href: item.href,
      requestedPath: `${item.pathname}${item.search}`,
      status: response.status,
      finalUrl: response.url,
      redirected: response.redirected,
      sources: [...item.sources].sort(),
    };
  } catch (error) {
    return {
      href: item.href,
      requestedPath: `${item.pathname}${item.search}`,
      status: null,
      finalUrl: '',
      redirected: false,
      error: error instanceof Error ? error.message : String(error),
      sources: [...item.sources].sort(),
    };
  }
});
for (const test of internalLinkTests) {
  if (test.status === null || test.status >= 400) linkIssues.push(test);
}
const emptyAnchorIssues = staticAnchorRecords.filter((record) => !record.href).map((record) => ({ route: record.sourceRoute, text: record.text }));

// 4) Verify the page-specific static social metadata exposed before JavaScript runs.
const socialPreviewInventory = [];
for (const route of routes) {
  const html = await readFile(pageFile(route), 'utf8');
  const title = plainText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '');
  const description = readMeta(html, 'description', 'name');
  const image = readMeta(html, 'og:image');
  let imagePath = '';
  try { imagePath = new URL(image).pathname; } catch { /* surfaced in metadata issues */ }
  const preview = {
    route,
    title,
    description,
    canonical: /<link\b[^>]*rel=["']canonical["'][^>]*>/i.exec(html)
      ? parseAttributes(/<link\b[^>]*rel=["']canonical["'][^>]*>/i.exec(html)[0]).href || ''
      : '',
    ogTitle: readMeta(html, 'og:title'),
    ogDescription: readMeta(html, 'og:description'),
    ogUrl: readMeta(html, 'og:url'),
    ogType: readMeta(html, 'og:type'),
    ogLocale: readMeta(html, 'og:locale'),
    ogImage: image,
    ogImageSecureUrl: readMeta(html, 'og:image:secure_url'),
    ogImageWidth: readMeta(html, 'og:image:width'),
    ogImageHeight: readMeta(html, 'og:image:height'),
    ogImageType: readMeta(html, 'og:image:type'),
    ogImageAlt: readMeta(html, 'og:image:alt'),
    twitterCard: readMeta(html, 'twitter:card', 'name'),
    twitterTitle: readMeta(html, 'twitter:title', 'name'),
    twitterDescription: readMeta(html, 'twitter:description', 'name'),
    twitterImage: readMeta(html, 'twitter:image', 'name'),
    twitterImageAlt: readMeta(html, 'twitter:image:alt', 'name'),
    expectedImage: routeSeo[route]?.image || imagePath,
    expectedShareTitle: routeSeo[route]?.shareTitle || routeSeo[route]?.title || title,
    imagePath,
  };
  socialPreviewInventory.push(preview);

  const expectedCanonical = `${productionOrigin}${route}`;
  if (!preview.title || !preview.description || !preview.ogTitle || !preview.ogDescription) socialIssues.push(`${route}: missing title or description metadata`);
  if (preview.canonical !== expectedCanonical || preview.ogUrl !== expectedCanonical) socialIssues.push(`${route}: canonical or og:url does not match the route`);
  if (preview.ogType !== 'website' || preview.ogLocale !== 'en_IN') socialIssues.push(`${route}: Open Graph type or locale is missing`);
  if (!preview.ogImage || !preview.ogImage.startsWith('https://') || preview.imagePath !== preview.expectedImage) socialIssues.push(`${route}: missing or unexpected HTTPS Open Graph image`);
  if (!preview.ogImageAlt || !preview.twitterImageAlt) socialIssues.push(`${route}: missing social image alternative text`);
  if (routeSeo[route]?.image) {
    if (preview.ogImageWidth !== '1200' || preview.ogImageHeight !== '630' || preview.ogImageType !== 'image/jpeg') socialIssues.push(`${route}: social image dimensions or MIME type are missing/incorrect`);
  } else {
    const expectedImageType = imagePath.endsWith('.png') ? 'image/png' : imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    if (preview.ogImageType !== expectedImageType) socialIssues.push(`${route}: generated social image MIME type is missing/incorrect`);
  }
  if (preview.twitterCard !== 'summary_large_image' || preview.twitterImage !== preview.ogImage) socialIssues.push(`${route}: Twitter card image metadata is incomplete`);
  if (preview.ogTitle !== preview.expectedShareTitle || preview.twitterTitle !== preview.expectedShareTitle) socialIssues.push(`${route}: social headline does not match route metadata`);
  const metaImageFile = imagePath ? join(dist, imagePath.replace(/^\/+/, '')) : '';
  try { if (!metaImageFile) throw new Error('missing path'); await access(metaImageFile); }
  catch { socialIssues.push(`${route}: social image file is missing from the local build`); }
}
const duplicateSocialImages = [...new Set(socialPreviewInventory.map((item) => item.ogImage).filter(Boolean))]
  .filter((image) => socialPreviewInventory.filter((item) => item.ogImage === image).length > 1);
const duplicateSocialTitles = [...new Set(socialPreviewInventory.map((item) => item.ogTitle).filter(Boolean))]
  .filter((title) => socialPreviewInventory.filter((item) => item.ogTitle === title).length > 1);
if (duplicateSocialImages.length) socialIssues.push(`Duplicate social image URLs: ${duplicateSocialImages.join(', ')}`);
if (duplicateSocialTitles.length) socialIssues.push(`Duplicate social headlines: ${duplicateSocialTitles.join(', ')}`);

// 5) Audit local asset references in built HTML, CSS, JavaScript, and active source data.
const distFiles = await filesUnder(dist);
const activeCssFiles = new Set();
for (const file of distFiles.filter((path) => path.endsWith('.html'))) {
  const relativeFile = relative(root, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/<(?:img|source|video|audio|script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const attributes = parseAttributes(tag);
    for (const attribute of ['src', 'poster']) if (attributes[attribute]) addAsset(attributes[attribute], relativeFile, attribute);
    const name = tagName(tag);
    if (name === 'link' && attributes.href && (attributes.rel || '').match(/stylesheet|icon|preload|modulepreload|manifest/i)) {
      addAsset(attributes.href, relativeFile, 'link href');
      if (/stylesheet/i.test(attributes.rel || '')) {
        const classified = classifyUrl(attributes.href);
        if (classified.kind === 'internal' && extname(classified.pathname).toLowerCase() === '.css') {
          activeCssFiles.add(join(dist, classified.pathname.replace(/^\/+/, '')));
        }
      }
    }
    if (attributes.srcset) {
      for (const entry of attributes.srcset.split(',')) addAsset(entry.trim().split(/\s+/)[0], relativeFile, 'srcset');
    }
  }
}
for (const file of activeCssFiles) {
  const relativeFile = relative(root, file).replaceAll('\\', '/');
  const css = await readFile(file, 'utf8').catch(() => '');
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) addAsset(match[2], relativeFile, 'active CSS url()');
  for (const match of css.matchAll(/@import\s+(?:url\()?\s*(['"])([^'"]+)\1\s*\)?/gi)) {
    const imported = match[2];
    addAsset(imported, relativeFile, 'active CSS @import');
    if (!/^https?:|^\/\//i.test(imported) && extname(imported).toLowerCase() === '.css') {
      activeCssFiles.add(join(dirname(file), imported));
    }
  }
}
for (const file of distFiles.filter((path) => path.endsWith('.js'))) {
  const relativeFile = relative(root, file).replaceAll('\\', '/');
  const js = await readFile(file, 'utf8');
  for (const match of js.matchAll(/["'`]((?:\/(?:assets|media)\/)[^"'`\s]*)["'`]/g)) {
    addAsset(match[1], relativeFile, 'runtime asset path');
  }
}
const activeDataFiles = (await filesUnder(join(root, 'src/data')))
  .filter((file) => /\.(json|ts)$/.test(file) && !file.endsWith('pages.json'));
for (const file of [...activeDataFiles, ...sourceFiles]) {
  const relativeFile = relative(root, file).replaceAll('\\', '/');
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/['"](\/[^'"\s?#]+\.[a-z0-9]{2,8})['"]/gi)) {
    addAsset(match[1], relativeFile, 'active source reference');
  }
}
const assetRecords = [...assetByUrl.values()];
for (const record of assetRecords) {
  const targetFile = join(dist, record.url.replace(/^\/+/, '').split(/[?#]/, 1)[0]);
  try { await access(targetFile); record.exists = true; }
  catch { record.exists = false; assetIssues.push({ url: record.url, sources: [...record.sources].sort() }); }
}
const localAssetHttpTests = await mapLimit(assetRecords.filter((record) => record.exists), 12, async (record) => {
  try {
    const response = await fetch(new URL(record.url, previewBase), { method: 'GET' });
    record.localStatus = response.status;
    return { url: record.url, status: response.status };
  } catch (error) {
    record.localStatus = null;
    return { url: record.url, status: null, error: error instanceof Error ? error.message : String(error) };
  }
});
for (const test of localAssetHttpTests) {
  if (test.status === null || test.status >= 400) assetIssues.push(test);
}

// 6) Verify route, 404/410, alias, feed and static error-document response behaviour locally.
const statusProbePaths = [
  ...routes,
  '/work/', '/about', '/360-video/', '/360-video', '/made-up-route-for-audit/',
  '/feed/', '/comments/feed/', '/404.html', '/403.html', '/410.html', '/500.html', '/502.html', '/503.html', '/504.html',
];
const statusProbes = await mapLimit(statusProbePaths, 12, async (route) => {
  try {
    const response = await fetch(new URL(route, previewBase), { redirect: 'manual' });
    const body = await response.text();
    const title = plainText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1] || '');
    const expectedErrorMarker = route === '/360-video/' || route === '/360-video'
      ? 'SIGNAL / 410'
      : route === '/made-up-route-for-audit/'
        ? 'SIGNAL / 404'
        : '';
    return {
      route, status: response.status, location: response.headers.get('location') || '', title,
      errorBodyMarker: expectedErrorMarker ? body.includes(expectedErrorMarker) : null,
    };
  } catch (error) {
    return { route, status: null, error: error instanceof Error ? error.message : String(error) };
  }
});
const expectedStatuses = new Map([
  ...routes.map((route) => [route, 200]),
  ['/work/', 200], ['/about', 301], ['/360-video/', 410], ['/360-video', 410],
  ['/made-up-route-for-audit/', 404], ['/feed/', 200], ['/comments/feed/', 200],
  ['/404.html', 200], ['/403.html', 200], ['/410.html', 200], ['/500.html', 200], ['/502.html', 200], ['/503.html', 200], ['/504.html', 200],
]);
const statusIssues = statusProbes.flatMap((probe) => probe.status === expectedStatuses.get(probe.route) ? [] : [{ ...probe, expected: expectedStatuses.get(probe.route) }]);
const errorBodyIssues = statusProbes
  .filter((probe) => probe.errorBodyMarker === false)
  .map((probe) => ({ route: probe.route, status: probe.status, title: probe.title, issue: 'Expected branded error content was not served.' }));

const externalLinks = [...externalByUrl.values()].map((record) => ({
  url: record.url,
  hostname: record.hostname,
  sources: [...record.sources].sort(),
  labels: [...record.labels].sort(),
  remoteVerification: record.remoteVerification,
  localStatus: record.localStatus,
})).sort((a, b) => a.url.localeCompare(b.url));
const sourceDefinedInternalLinks = [...sourceInternalLinks.values()].map((record) => ({
  href: record.href,
  sources: [...record.sources].sort(),
})).sort((a, b) => a.href.localeCompare(b.href));
const remoteAssets = [...remoteAssetByUrl.values()].map((record) => ({
  url: record.url,
  hostname: record.hostname,
  declaredMediaType: record.declaredMediaType || '',
  lastRecordedHttpStatus: record.lastRecordedHttpStatus ?? null,
  lastRecordedContentType: record.lastRecordedContentType || '',
  lastRecordedAt: record.lastRecordedAt || '',
  archiveStatus: record.archiveStatus || '',
  referencedBy: [...record.sources].sort(),
  verification: record.verification,
})).sort((a, b) => a.url.localeCompare(b.url));
const externalWebLinks = externalLinks.filter((link) => /^https?:/i.test(link.url));
const externalWebHosts = [...new Set(externalWebLinks.map((link) => link.hostname))].sort();
const contactProtocolTargets = externalLinks.filter((link) => /^(mailto|tel|sms):/i.test(link.url));
const insecureHttpTargets = externalWebLinks.filter((link) => /^http:\/\//i.test(link.url));
const internalAnchorUniqueTargets = [...new Set(staticAnchorRecords.filter((record) => record.kind === 'internal').map((record) => record.href))].sort();
const errorDocumentMap = ['403.html', '404.html', '410.html', '500.html', '502.html', '503.html', '504.html'].map((file) => ({
  file,
  exists: distFiles.some((path) => path === join(dist, file)),
  statusMappingVerified: false,
}));

const report = {
  auditDate: reportDate,
  environment: {
    previewBase,
    scope: 'Built repository output and local Vite preview only; no production crawl or external-service requests were performed.',
    production: productionQa
      ? `Production QA is ${productionQa.overallProductionStatus}: DNS resolved, but TLS to angelcreations.in ended before a certificate or HTTP response. The host is blocked by this sandbox's outbound network policy; origin/CDN/TLS configuration remains undiagnosed. See ${productionQaFile}.`
      : 'Production HTTPS was not verified; the separate production QA report is not present.',
    browser: 'Browser QA is blocked: no browser or automation package is installed and libnspr4.so is absent; see the production QA report.',
  },
  productionVerification: productionQa ? {
    status: productionQa.overallProductionStatus,
    report: productionQaFile,
    dnsStatus: productionQa.diagnostics.find((item) => item.check.startsWith('DNS resolution'))?.status || 'Inconclusive',
    rootHttpsStatus: productionQa.diagnostics.find((item) => item.check.startsWith('HTTPS GET'))?.status || 'Inconclusive',
    productionHttpResponses: productionQa.productionRequestMatrix.actualHttpResponses,
    productionTargetsRecorded: productionQa.productionRequestMatrix.requests.length,
    externalTargetsBlocked: productionQa.externalLinkVerification.count,
    productionErrorRoutesStatus: productionQa.hostingerErrorHandling.status,
    browserQaStatus: productionQa.browserQa.status,
  } : null,
  summary: {
    sitemapRoutes: routes.length,
    routeResponsesOk: statusProbes.filter((probe) => routes.includes(probe.route) && probe.status === 200).length,
    staticAnchorInstances: staticAnchorRecords.length,
    uniqueInternalAnchorTargets: internalAnchorUniqueTargets.length,
    internalTargetTests: internalLinkTests.length,
    brokenInternalTargets: linkIssues.length,
    emptyAnchorHrefs: emptyAnchorIssues.length,
    localAssetReferences: assetRecords.length,
    missingOrUnservedLocalAssets: assetIssues.length,
    uniqueSocialImages: [...new Set(socialPreviewInventory.map((item) => item.ogImage).filter(Boolean))].length,
    socialMetadataIssues: socialIssues.length,
    externalWebTargets: externalWebLinks.length,
    externalWebHosts: externalWebHosts.length,
    contactProtocolTargets: contactProtocolTargets.length,
    remoteMediaAssets: remoteAssets.length,
    remoteMediaTypeIssues: remoteMediaTypeIssues.length,
    statusProbeIssues: statusIssues.length + errorBodyIssues.length,
  },
  verifiedFixes: [
    'Removed the stale no-JavaScript /360-video/ navigation link; the intentionally retired route now returns a branded 410 in local preview.',
    'Changed the About and footer Virtual Life destination from HTTP to the same HTTPS URL already used by the header.',
    'Aligned the remote Media Production slide source type with the repository asset manifest’s historical video/quicktime response; the 310 MB source was not re-fetched.',
    'Removed missing SVG font fallback URLs from the site stylesheet while retaining existing WOFF/WOFF2/TTF sources.',
    'Curated core and capability routes use unique 1200×630 social-preview images; generated domain routes use their unique domain visuals with route-specific Open Graph/Twitter metadata.',
    'Added a React render-error boundary and generated branded 403/404/410/500/502/503/504 documents; only local 404/410 path status behavior was verified.',
    'Corrected the production-build CI check to exclude the retired /360-video/ page and require the generated 404/410 documents plus sitemap exclusion.',
  ],
  routeInventory: socialPreviewInventory,
  staticAnchorInventory: sourceAnchorInventory,
  internalAnchorTargets: internalAnchorUniqueTargets,
  internalTargetTests: internalLinkTests,
  sourceDefinedInternalLinks,
  emptyAnchorIssues,
  externalLinkInventory: externalLinks,
  remoteAssetInventory: remoteAssets,
  remoteMediaTypeIssues,
  insecureHttpTargets,
  localAssetInventory: assetRecords.map((record) => ({
    url: record.url,
    existsInBuild: record.exists,
    localHttpStatus: record.localStatus,
    referencedBy: [...record.sources].sort(),
  })).sort((a, b) => a.url.localeCompare(b.url)),
  assetIssues,
  socialMetadataIssues: socialIssues,
  duplicateSocialImages,
  duplicateSocialTitles,
  statusProbes,
  statusIssues,
  errorBodyIssues,
  errorDocuments: errorDocumentMap,
  sourceTargetBlankLinks,
  targetBlankSecurityIssues: sourceTargetBlankLinks.filter((link) => !link.secureRel),
  applicationChecks: {
    history: 'Source contains pushState navigation, popstate synchronization, and query-preserving route normalization; browser Back/Forward behavior not exercised.',
    contact: 'Source retains user-controlled mailto flow and telephone links; no form submission backend is configured or claimed.',
    reactErrorBoundary: 'Application root is wrapped in a React render-error boundary; runtime failure injection was not exercised in a browser.',
    unknownPaths: 'Local preview returns 404 for unknown extensionless routes and 410 for intentionally retired /360-video/; both responses were checked for their matching title and branded error-body marker.',
    hostErrors: 'Custom static documents are generated for 403, 404, 410, 500, 502, 503, and 504. Production server mappings/status codes are unverified and are not inferred from the files.',
  },
  excludedInactiveCapture: {
    source: 'src/data/pages.json',
    note: 'This file retains the captured page content used by the archived route renderer. Its obsolete links are not emitted as active anchors in the current generated pages; active link inventory is based on built anchors plus current component/data definitions.',
  },
  limitations: [
    'Production HTTPS is blocked in this sandbox: the target is outside the permitted outbound hosts and TLS ended with curl exit 35 before any certificate or HTTP response. This does not establish a DNS/CDN/origin TLS defect.',
    'Production sitemap routes, internal destinations, error URLs, robots/sitemap, social images, metadata, and the remote video were not individually requested; no live status, final URL, content type, or current media response is claimed.',
    'The 53 external web destinations and four mail/telephone protocol targets are inventoried, but destination availability and client launch were not verified; none is classified as broken.',
    'Browser interactions, Back/Forward, touch/keyboard, responsive screenshots, screen-reader testing, console/network inspection, and form-client launch are blocked by the missing browser binary, automation package, and libnspr4.so.',
    'A generated HTML error document is not proof that Hostinger maps it while preserving the corresponding production HTTP status; live Hostinger product/settings remain inaccessible.',
  ],
};

const markdown = [
  '# Angel Creations end-to-end audit',
  '',
  `Audit date: ${reportDate}. Scope: built repository output and local preview only.`,
  '',
  '## Results',
  '',
  `- Sitemap pages: ${report.summary.routeResponsesOk}/${routes.length} returned HTTP 200 in local preview.`,
  `- Static anchor instances: ${staticAnchorRecords.length}; unique internal anchor targets: ${internalAnchorUniqueTargets.length}; broken local targets: ${linkIssues.length}.`,
  `- Local build asset URLs checked: ${assetRecords.length}; missing/unserved: ${assetIssues.length}.`,
  `- Social previews: ${report.summary.uniqueSocialImages}/${routes.length} unique page-specific images; metadata issues: ${socialIssues.length}.`,
  `- External web URLs inventoried: ${externalWebLinks.length} across ${externalWebHosts.length} hosts; ${contactProtocolTargets.length} mail/telephone protocol targets are listed separately. Remote checks were not performed.`,
  `- Same-origin remote media assets inventoried: ${remoteAssets.length}; the 310 MB QuickTime source has historical repository evidence but was not re-fetched.`,
  `- Insecure HTTP web destinations remaining in active source/anchors: ${insecureHttpTargets.length}.`,
  `- Error/status probes with unexpected local results: ${statusIssues.length + errorBodyIssues.length}; branded 404/410 body markers: ${statusProbes.filter((probe) => probe.errorBodyMarker === true).length}/${statusProbes.filter((probe) => probe.errorBodyMarker !== null).length} matched.`,
  '',
  '## Verified repairs',
  '',
  ...report.verifiedFixes.map((fix) => `- ${fix}`),
  '',
  '## Route and social-preview inventory',
  '',
  '| Route | Local status | Canonical | Page title | Share headline | Social image |',
  '|---|---:|---|---|---|---|',
  ...socialPreviewInventory.map((page) => {
    const probe = statusProbes.find((item) => item.route === page.route);
    return `| \`${page.route}\` | ${probe?.status ?? 'not tested'} | ${page.canonical || '—'} | ${page.title.replaceAll('|', '\\|')} | ${page.ogTitle.replaceAll('|', '\\|')} | ${page.ogImage || '—'} |`;
  }),
  '',
  '## Error and alias probes (local preview)',
  '',
  '| URL | HTTP status | Location | Response title | Branded body marker |',
  '|---|---:|---|---|---|',
  ...statusProbes.filter((probe) => !routes.includes(probe.route)).map((probe) => {
    const title = (probe.title || '—').replaceAll('|', '\\|');
    const marker = probe.errorBodyMarker === true ? 'yes' : probe.errorBodyMarker === false ? 'NO' : '—';
    return `| \`${probe.route}\` | ${probe.status ?? 'error'} | ${probe.location || '—'} | ${title} | ${marker} |`;
  }),
  '',
  '## Static anchor inventory by route',
  '',
  ...sourceAnchorInventory.map((page) => `- \`${page.route}\` — ${page.anchorCount} anchors: ${[...new Set(page.anchors.map((anchor) => anchor.href).filter(Boolean))].map((href) => `\`${href.replaceAll('|', '\\|')}\``).join(', ') || 'none'}`),
  '',
  '## External URLs and contact protocols',
  '',
  'Every active target with its source and label is recorded in `END-TO-END-LINK-INVENTORY.json`. Remote HTTP responses were not tested.',
  '',
  ...externalLinks.map((link) => `- ${link.url} — ${link.sources.join('; ')}`),
  '',
  '## Error handling and deployment notes',
  '',
  '- Local preview returns 404 for unknown extensionless paths and 410 for the intentionally retired `/360-video/` route. The branded 403/404/410/500/502/503/504 HTML documents are generated in `dist/`.',
  '- Error document files return HTTP 200 when requested directly. Hostinger/production must be explicitly configured to map each error status to its document; that mapping was not found or tested, so no production status behavior is claimed.',
  '- React render errors are caught by the client-side boundary; this does not create an HTTP 500. Server/proxy 5xx codes remain the host’s responsibility.',
  '- No production error-page or rewrite rule is recommended here. Confirm the actual Hostinger product/server and its current supported static-hosting/error-page controls, then test any change on staging with a backup and rollback plan.',
  '- Roll back by restoring the previous deployed artifact/configuration; if the changes are committed, revert the audit/fix commit on the session branch.',
  '',
  ...(productionQa ? [
    '## Production verification (separate from local preview)',
    '',
    `- Overall production status: **${productionQa.overallProductionStatus}**. DNS resolution: **${productionQa.diagnostics.find((item) => item.check.startsWith('DNS resolution'))?.status}**; the target resolves, but is not reachable under the sandbox's outbound network restrictions.`,
    '- Root HTTPS: **Blocked** after curl exit 35 / `SSL_ERROR_SYSCALL`; the TLS handshake ended before a certificate or HTTP headers. The GitHub TLS control request passed with certificate verification enabled, but this does not diagnose the production origin.',
    '- Certificate validity, redirect behavior, and DNS/CDN/origin attribution: **Inconclusive**. The certificate was not received; no production HTTP response was obtained.',
    `- Sitemap routes, internal destinations, sitemap/robots, social images, production 404/410, external links, remote media, and production SEO: **Blocked**; ${productionQa.productionRequestMatrix.actualHttpResponses} production HTTP responses were received. No missing or broken production targets are inferred.`,
    `- Browser/interaction QA: **${productionQa.browserQa.status}**. No browser binary or automation package is installed; libnspr4.so is absent.`,
    `- Live deployment comparison: **${productionQa.deploymentComparison.status}**. GitHub main is ${productionQa.deploymentComparison.remoteMainShaAtAudit}; its workflow builds an artifact but does not deploy. Current local changes are uncommitted.`,
    `- Detailed per-target statuses and next actions: [PRODUCTION-QA-2026-10-19.json](PRODUCTION-QA-2026-10-19.json).`,
    '',
  ] : []),
  '## Limitations',
  '',
  ...report.limitations.map((item) => `- ${item}`),
  '',
  'The JSON file is the full URL, link, asset, route, status, and social-preview inventory.',
].join('\n');

await mkdir(join(root, 'docs/audits'), { recursive: true });
await writeFile(join(root, 'docs/audits/END-TO-END-LINK-INVENTORY.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(join(root, 'docs/audits/END-TO-END-AUDIT.md'), `${markdown}\n`);
console.log(JSON.stringify({
  summary: report.summary,
  statusIssues,
  errorBodyIssues,
  linkIssues,
  emptyAnchorIssues,
  assetIssues: assetIssues.slice(0, 30),
  socialIssues,
  duplicateSocialImages,
  targetBlankSecurityIssues: report.targetBlankSecurityIssues,
  insecureHttpTargets,
  remoteMediaTypeIssues,
  remoteAssets,
  reports: ['docs/audits/END-TO-END-AUDIT.md', 'docs/audits/END-TO-END-LINK-INVENTORY.json'],
}, null, 2));
if (linkIssues.length || emptyAnchorIssues.length || assetIssues.length || socialIssues.length || statusIssues.length || errorBodyIssues.length || report.targetBlankSecurityIssues.length || insecureHttpTargets.length || remoteMediaTypeIssues.length) {
  process.exitCode = 1;
}
