import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const previewBase = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173';
const origin = 'https://angelcreations.in';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? htmlFiles(join(directory, entry.name)) : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []));
  return nested.flat();
}
function routeFor(file) {
  const filePath = relative(root, file).replaceAll('\\', '/');
  if (filePath === 'index.html') return '/';
  if (filePath === '404.html') return '/404.html';
  return `/${filePath.replace(/\/index\.html$/, '/')}`;
}
function firstMatch(expression, text) { return expression.exec(text)?.[1]?.trim() || ''; }
function textOnly(markup) { return markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function jsonLdTypes(html) {
  const types = new Set();
  for (const raw of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(raw[1]);
      const records = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
      for (const record of records) if (record?.['@type']) types.add(record['@type']);
    } catch { /* surfaced through the missing schema check if relevant */ }
  }
  return [...types];
}
function duplicates(rows, key) {
  const index = new Map();
  for (const row of rows) { const value = row[key]; if (value) index.set(value, [...(index.get(value) || []), row.route]); }
  return [...index.entries()].filter(([, routes]) => routes.length > 1);
}

const rows = [];
for (const file of await htmlFiles(root)) {
  const html = await readFile(file, 'utf8');
  const route = routeFor(file);
  const hrefs = [...html.matchAll(/\shref=["']([^"']+)["']/gi)].map((match) => match[1]);
  const internalLinkTargets = [...new Set(hrefs.filter((href) => href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/assets/')))];
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => textOnly(match[1]));
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const jsonld = jsonLdTypes(html);
  let httpStatus = null;
  try { httpStatus = (await fetch(`${previewBase}${route}`, { redirect: 'manual' })).status; } catch { /* preview may be intentionally unavailable */ }
  rows.push({
    route, httpStatus,
    title: textOnly(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, html)),
    titleLength: textOnly(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, html)).length,
    description: firstMatch(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html) || firstMatch(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i, html),
    descriptionLength: (firstMatch(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html) || firstMatch(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i, html)).length,
    canonical: firstMatch(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i, html) || firstMatch(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i, html),
    h1Count: h1.length, h1,
    h2: (html.match(/<h2\b/gi) || []).length,
    robots: firstMatch(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i, html),
    jsonld,
    internalLinks: internalLinkTargets.length,
    internalLinkTargets,
    images: images.length,
    imagesWithoutAlt: images.filter((image) => !/\salt=["'][^"']*["']/i.test(image)).length,
  });
}
rows.sort((a, b) => a.route.localeCompare(b.route));
const sitemap = [...(await readFile(join(root, 'sitemap.xml'), 'utf8')).matchAll(/<loc>https:\/\/angelcreations\.in([^<]+)<\/loc>/g)].map((match) => match[1]);
const publicRows = rows.filter((row) => row.route !== '/404.html');
const sitemapSet = new Set(sitemap);
const report = {
  documents: rows.length,
  sitemap: sitemap.length,
  sitemapMissingDocs: sitemap.filter((route) => !rows.some((row) => row.route === route)),
  previewBase,
  httpStatusIssues: rows.filter((row) => row.httpStatus !== null && row.httpStatus !== 200).map((row) => [row.route, row.httpStatus]),
  duplicateTitles: duplicates(publicRows, 'title'),
  duplicateDescriptions: duplicates(publicRows, 'description'),
  missingDescriptions: publicRows.filter((row) => !row.description).map((row) => row.route),
  missingCanonical: publicRows.filter((row) => !row.canonical).map((row) => row.route),
  canonicalMismatch: publicRows.filter((row) => row.canonical && row.canonical !== `${origin}${row.route}` && row.route !== '/work/').map((row) => [row.route, row.canonical]),
  canonicalAliasExceptions: publicRows.filter((row) => row.route === '/work/' && row.canonical === `${origin}/works/`).map((row) => [row.route, row.canonical]),
  h1Issues: publicRows.filter((row) => row.h1Count !== 1).map((row) => [row.route, row.h1Count]),
  schemaIssues: publicRows.filter((row) => row.route !== '/work/' && (!row.jsonld.some((type) => type === 'WebPage' || type === 'CollectionPage') || !row.jsonld.includes('BreadcrumbList'))).map((row) => [row.route, row.jsonld]),
  rootSchema: rows.find((row) => row.route === '/')?.jsonld || [],
  orphanSitemapRoutes: publicRows.filter((row) => row.route !== '/work/' && !sitemapSet.has(row.route)).map((row) => row.route),
  internalLinkCount: rows.reduce((total, row) => total + row.internalLinks, 0),
  rows,
};
await writeFile(new URL('../docs/PHASE-3-SEO-REPORT.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ documents: report.documents, sitemap: report.sitemap, httpStatusIssues: report.httpStatusIssues, missingDescriptions: report.missingDescriptions, h1Issues: report.h1Issues, schemaIssues: report.schemaIssues, canonicalAliasExceptions: report.canonicalAliasExceptions }, null, 2));
