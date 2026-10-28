// Structural checks on the deployable `dist/` output.
//
// The site is published as plain files, so defects that only appear on a static
// host (a malformed document, an unterminated <script>, an asset reference that
// was never emitted) are invisible to the dev server. This script parses every
// generated document the way a browser would and fails the build when a visitor
// would get an empty page.

import { readFile, stat } from 'node:fs/promises';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const distDirectory = path.resolve(process.argv[2] ?? 'dist');
const googleTagManagerContainerId = 'GTM-MMFB2VZ';
const googleAnalyticsMeasurementId = 'G-T4G74DNBP9';

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
}

const coreRequiredRoutes = [
  '/', '/about/', '/works/', '/animation/', '/augment-reality/',
  '/brand-advertisement/', '/media-production/', '/metaverse/', '/mixed-reality/',
  '/virtual-reality/', '/contact/', '/privacy-policy/', '/terms-of-service/',
  '/capabilities/brand/', '/capabilities/design/', '/capabilities/content/',
  '/capabilities/film/', '/capabilities/animation-3d/', '/capabilities/digital/',
  '/capabilities/experiences/', '/capabilities/creative-technology/',
];

function slugifyDomainTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const explorerVisuals = JSON.parse(readFileSync(path.resolve(process.cwd(), 'src/data/explorerVisuals.json'), 'utf8'));
const domainRoutes = Object.entries(explorerVisuals).flatMap(([parentRoute, bundle]) =>
  (bundle.applications || []).map((visual) => `${parentRoute}${slugifyDomainTitle(visual.caption)}/`)
);
const requiredRoutes = [...coreRequiredRoutes, '/domains/', ...domainRoutes];

const standaloneDocuments = new Set(['403.html', '404.html', '410.html', '500.html', '502.html', '503.html', '504.html']);

function documentPath(route) {
  return route === '/' ? path.join(distDirectory, 'index.html') : path.join(distDirectory, route.slice(1), 'index.html');
}

function walk(directory, extension = '.html', results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, extension, results);
    else if (entry.name.endsWith(extension)) results.push(full);
  }
  return results;
}

const visibleSeoKeywordArtifacts = [
  'Other names for this work',
  'Popular Service Searches',
  'Related forms include',
  'clients may also describe',
  'teams may also describe',
  'Service Guide · Jaipur',
  'Start with a high-demand service',
];

const problems = [];
const record = (file, message) => problems.push(`${path.relative(distDirectory, file)}: ${message}`);

// 1. Every route must exist and boot the application.
for (const route of requiredRoutes) {
  const file = documentPath(route);
  const exists = await stat(file).then((stats) => stats.isFile()).catch(() => false);
  if (!exists) {
    problems.push(`missing route document for ${route}`);
    continue;
  }

  const html = await readFile(file, 'utf8');
  const body = html.split(/<\/head>/i)[1] ?? '';
  if (!/<div[^>]+id="root"/i.test(body)) record(file, 'body has no #root container, so the application cannot mount');

  const moduleScripts = [...html.matchAll(/<script\b[^>]*type="module"[^>]*>/gi)];
  if (moduleScripts.length === 0) record(file, 'no module entry script, so no JavaScript route will render');

  for (const match of moduleScripts) {
    const after = html.slice(match.index + match[0].length);
    if (!/^\s*<\/script>/i.test(after)) record(file, 'module entry script is not closed, which makes browsers swallow the rest of the document');
    const source = /\bsrc="([^"]+)"/.exec(match[0])?.[1];
    if (source) {
      const asset = path.join(distDirectory, source.replace(/^\//, ''));
      const assetExists = await stat(asset).then((stats) => stats.isFile()).catch(() => false);
      if (!assetExists) record(file, `entry script ${source} is not present in the build`);
    }
  }

  // Every published document must be able to survive its own JavaScript failing: the
  // boot fallback and its watchdog are what stop a stale cached document (pointing at a
  // replaced bundle) or a mispublished source tree from rendering blank.
  if (!/id="boot-fallback"/.test(html)) record(file, 'no boot fallback, so a failed bundle leaves a blank page');
  if (!/data-boot-watchdog/.test(html)) record(file, 'no boot watchdog script');
  if (!/id="root"/.test(html)) record(file, 'no application mount point');

  const stylesheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="\/([^"]+)"/gi)].map((match) => match[1]);
  for (const stylesheet of stylesheets) {
    const asset = path.join(distDirectory, stylesheet);
    const assetExists = await stat(asset).then((stats) => stats.isFile()).catch(() => false);
    if (!assetExists) record(file, `stylesheet /${stylesheet} is not present in the build`);
  }
}

// 2. Every HTML document in the build must parse as a complete document.
for (const file of walk(distDirectory)) {
  const html = await readFile(file, 'utf8');

  // Search Console ownership tokens (googleXXXX.html) are plain-text proofs, not
  // documents: Google requires their exact contents, so verify the token line
  // instead of the complete-document rules.
  if (/^google[0-9a-f]+\.html$/i.test(path.basename(file))) {
    if (!/^google-site-verification:/.test(html)) record(file, 'Search Console token file does not start with its verification string');
    continue;
  }
  const opened = (html.match(/<script\b/gi) ?? []).length;
  const closed = (html.match(/<\/script>/gi) ?? []).length;
  if (opened !== closed) record(file, `${opened} <script> tags but ${closed} </script> tags`);
  if (!/<\/html>\s*$/i.test(html.trimEnd())) record(file, 'document does not end with </html>');

  // Analytics must be present exactly once per real document. GTM is kept for
  // future tags, while GA4 runs through the direct Google tag because the
  // published GTM container currently has no tags to forward hits to GA4.
  const head = html.split(/<\/head>/i)[0] ?? '';
  if (countMatches(head, new RegExp(googleTagManagerContainerId, 'g')) !== 1) {
    record(file, 'Google Tag Manager container is missing or duplicated in the document head');
  }
  if (countMatches(html, new RegExp(`googletagmanager\\.com/ns\\.html\\?id=${googleTagManagerContainerId}`, 'g')) !== 1) {
    record(file, 'Google Tag Manager noscript iframe is missing or duplicated');
  }
  if (countMatches(head, new RegExp(`googletagmanager\\.com/gtag/js\\?id=${googleAnalyticsMeasurementId}`, 'g')) !== 1) {
    record(file, 'Google Analytics gtag.js loader is missing or duplicated in the document head');
  }
  if (countMatches(head, new RegExp(`gtag\\('config',\\s*'${googleAnalyticsMeasurementId}'\\)`, 'g')) !== 1) {
    record(file, 'Google Analytics config call is missing or duplicated in the document head');
  }

  for (const phrase of visibleSeoKeywordArtifacts) {
    if (html.includes(phrase)) record(file, `visible SEO keyword artifact is rendered in page copy: ${phrase}`);
  }

  if (standaloneDocuments.has(path.basename(file))) {
    if (!/<main\b/i.test(html)) record(file, 'status document has no <main> content');
  }
}

// 3. The same visible keyword labels must not be shipped in client bundles.
for (const file of walk(distDirectory, '.js')) {
  const script = await readFile(file, 'utf8');
  for (const phrase of visibleSeoKeywordArtifacts) {
    if (script.includes(phrase)) record(file, `visible SEO keyword artifact is shipped in client code: ${phrase}`);
  }
}

// 4. The Apache policy that keeps HTML revalidating and hides repository source.
const htaccess = await stat(path.join(distDirectory, '.htaccess')).then((stats) => stats.isFile()).catch(() => false);
if (!htaccess) {
  problems.push('.htaccess is missing from the build: HTML would be cacheable, so a cached document can point at a replaced bundle');
} else {
  const rules = await readFile(path.join(distDirectory, '.htaccess'), 'utf8');
  if (!/angel-creations-htaccess:/.test(rules)) problems.push('.htaccess is not the managed file');
  if (!/no-cache[^\n]*/.test(rules)) problems.push('.htaccess does not mark HTML as no-cache');
  if (!/RedirectMatch 404[^\n]*\(src\|scripts\|docs/.test(rules)) problems.push('.htaccess does not block repository source paths');
}

if (problems.length > 0) {
  console.error(`Static output verification failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log(`Verified ${requiredRoutes.length} route documents and ${walk(distDirectory).length} HTML files in ${path.relative(process.cwd(), distDirectory) || '.'}: every route mounts the app, every script is closed, every referenced asset exists, every document carries a boot fallback and the GTM/GA4 tags exactly once, no visible SEO keyword artifacts are shipped, and .htaccess enforces no-cache HTML.`);
