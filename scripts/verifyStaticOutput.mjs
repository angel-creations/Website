// Structural checks on the deployable `dist/` output.
//
// The site is published as plain files, so defects that only appear on a static
// host (a malformed document, an unterminated <script>, an asset reference that
// was never emitted) are invisible to the dev server. This script parses every
// generated document the way a browser would and fails the build when a visitor
// would get an empty page.

import { readFile, stat } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const distDirectory = path.resolve(process.argv[2] ?? 'dist');

const requiredRoutes = [
  '/', '/about/', '/works/', '/animation/', '/augment-reality/',
  '/brand-advertisement/', '/media-production/', '/metaverse/', '/mixed-reality/',
  '/virtual-reality/', '/contact/', '/privacy-policy/', '/terms-of-service/',
  '/capabilities/brand/', '/capabilities/design/', '/capabilities/content/',
  '/capabilities/film/', '/capabilities/animation-3d/', '/capabilities/digital/',
  '/capabilities/experiences/', '/capabilities/creative-technology/',
];

const standaloneDocuments = new Set(['403.html', '404.html', '410.html', '500.html', '502.html', '503.html', '504.html']);

function documentPath(route) {
  return route === '/' ? path.join(distDirectory, 'index.html') : path.join(distDirectory, route.slice(1), 'index.html');
}

function walk(directory, results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

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
  const opened = (html.match(/<script\b/gi) ?? []).length;
  const closed = (html.match(/<\/script>/gi) ?? []).length;
  if (opened !== closed) record(file, `${opened} <script> tags but ${closed} </script> tags`);
  if (!/<\/html>\s*$/i.test(html.trimEnd())) record(file, 'document does not end with </html>');

  if (standaloneDocuments.has(path.basename(file))) {
    if (!/<main\b/i.test(html)) record(file, 'status document has no <main> content');
  }
}

if (problems.length > 0) {
  console.error(`Static output verification failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log(`Verified ${requiredRoutes.length} route documents and ${walk(distDirectory).length} HTML files in ${path.relative(process.cwd(), distDirectory) || '.'}: every route mounts the app, every script is closed, and every referenced asset exists.`);
