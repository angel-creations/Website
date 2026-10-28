import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const previewBase = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173';
const origin = 'https://angelcreations.in';
const explorerVisuals = JSON.parse(await readFile(new URL('../src/data/explorerVisuals.json', import.meta.url), 'utf8'));
const domainRouteCount = Object.values(explorerVisuals).reduce((total, bundle) => total + (bundle.applications?.length || 0), 0);
const expectedSitemapCount = 21 + 1 + domainRouteCount;
const expectedDocumentCount = 29 + 1 + domainRouteCount;

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
function decodeHtml(value) {
  return String(value).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[code.toLowerCase()] || entity;
  });
}
function textOnly(markup) { return decodeHtml(markup.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }
function extractDescription(html) {
  return decodeHtml(
    firstMatch(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html)
      || firstMatch(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i, html),
  );
}
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
  // Search Console ownership tokens (googleXXXX.html) are plain-text proofs, not documents.
  if (/^google[0-9a-f]+\.html$/i.test(relative(root, file).replaceAll('\\', '/'))) continue;
  const html = await readFile(file, 'utf8');
  const route = routeFor(file);
  const anchorTags = [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => match[0]);
  const hrefs = anchorTags.flatMap((tag) => {
    const match = /\bhref=["']([^"']+)["']/i.exec(tag);
    return match ? [match[1]] : [];
  });
  const internalLinkTargets = [...new Set(hrefs.filter((href) => href.startsWith('/') && !href.startsWith('//')))];
  // The hidden boot shell and the <noscript> route fallback are mutually exclusive:
  // the former appears only when JavaScript is enabled but the bundle never mounts,
  // while the latter is the document crawlers/no-JS users receive. Audit the route H1
  // from that indexable fallback, not from the emergency boot shell.
  const contentHtml = html.replace(/<!-- angel-boot-fallback:start -->[\s\S]*?<!-- angel-boot-fallback:end -->/g, '');
  const h1 = [...contentHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => textOnly(match[1]));
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const jsonld = jsonLdTypes(html);
  let httpStatus = null;
  try { httpStatus = (await fetch(`${previewBase}${route}`, { redirect: 'manual' })).status; } catch { /* preview may be intentionally unavailable */ }
  rows.push({
    route, httpStatus,
    title: textOnly(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, html)),
    titleLength: textOnly(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, html)).length,
    description: extractDescription(html),
    descriptionLength: extractDescription(html).length,
    canonical: firstMatch(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i, html) || firstMatch(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i, html),
    h1Count: h1.length, h1,
    h2: (contentHtml.match(/<h2\b/gi) || []).length,
    robots: firstMatch(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i, html),
    jsonld,
    internalLinks: internalLinkTargets.length,
    internalLinkTargets,
    images: images.length,
    imagesWithoutAlt: images.filter((image) => !/\salt=["'][^"']*["']/i.test(image)).length,
  });
}
rows.sort((a, b) => a.route.localeCompare(b.route));
const sitemapXml = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sourceSitemapXml = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8').catch(() => '');
const sourceRobotsTxt = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8').catch(() => '');
const rootSitemapXml = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8').catch(() => '');
const rootRobotsTxt = await readFile(new URL('../robots.txt', import.meta.url), 'utf8').catch(() => '');
const sourceGoogleVerification = await readFile(new URL('../public/googleb16a568f6f3a241d.html', import.meta.url), 'utf8').catch(() => '');
const rootGoogleVerification = await readFile(new URL('../googleb16a568f6f3a241d.html', import.meta.url), 'utf8').catch(() => '');
const robotsTxt = await readFile(join(root, 'robots.txt'), 'utf8').catch(() => '');
const sitemap = [...sitemapXml.matchAll(/<loc>https:\/\/angelcreations\.in([^<]+)<\/loc>/g)].map((match) => match[1]);
async function fetchStaticFile(path) {
  try {
    const response = await fetch(`${previewBase}${path}`, { redirect: 'manual' });
    return { status: response.status, body: await response.text() };
  } catch {
    return { status: null, body: '' };
  }
}
const [servedSitemap, servedRobots] = await Promise.all([
  fetchStaticFile('/sitemap.xml'),
  fetchStaticFile('/robots.txt'),
]);
const sitemapDeliveryIssues = [
  ...(sourceSitemapXml === sitemapXml ? [] : ['public/sitemap.xml does not match the generated sitemap']),
  ...(sourceRobotsTxt === robotsTxt ? [] : ['public/robots.txt does not match the generated robots file']),
  ...(rootSitemapXml === sitemapXml ? [] : ['root sitemap.xml fallback does not match the generated sitemap']),
  ...(rootRobotsTxt === robotsTxt ? [] : ['root robots.txt fallback does not match the generated robots file']),
  ...(rootGoogleVerification === sourceGoogleVerification && rootGoogleVerification.startsWith('google-site-verification:') ? [] : ['root Search Console verification fallback does not match the public token file']),
  ...(robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`) ? [] : ['robots.txt does not reference the sitemap']),
  ...(servedSitemap.status === 200 ? [] : [`/sitemap.xml returned HTTP ${servedSitemap.status}`]),
  ...(servedSitemap.body === sitemapXml ? [] : ['/sitemap.xml response does not match the generated sitemap']),
  ...(servedRobots.status === 200 ? [] : [`/robots.txt returned HTTP ${servedRobots.status}`]),
  ...(servedRobots.body === robotsTxt ? [] : ['/robots.txt response does not match the generated robots file']),
];
if (sitemap.includes('/360-video/')) sitemapDeliveryIssues.push('removed /360-video/ route remains in the sitemap');
const errorDocuments = ['/404.html', '/403.html', '/410.html', '/500.html', '/502.html', '/503.html', '/504.html'];
const publicRows = rows.filter((row) => !errorDocuments.includes(row.route));
const sitemapSet = new Set(sitemap);
const notFoundHtml = await readFile(join(root, '404.html'), 'utf8').catch(() => '');
const notFoundDesignIssues = [
  ...['angel-not-found__visual', 'angel-not-found__actions', 'status-error-title', '/works/', '/contact/']
    .filter((required) => !notFoundHtml.includes(required))
    .map((required) => `404 document is missing ${required}`),
];
const statusDocumentSpecs = [
  ['403.html', 403], ['410.html', 410], ['500.html', 500], ['502.html', 502], ['503.html', 503], ['504.html', 504],
];
const statusDocumentIssues = [];
for (const [filename, status] of statusDocumentSpecs) {
  const html = rows.find((row) => row.route === `/${filename}`);
  const source = join(root, filename);
  let content = '';
  try { content = await readFile(source, 'utf8'); } catch { /* reported as a missing document */ }
  if (!content) statusDocumentIssues.push(`${filename} is missing`);
  if (content && (!content.includes(`SIGNAL / ${status}`) || !content.includes('status-error-title') || !/name="robots" content="noindex, follow"/.test(content))) {
    statusDocumentIssues.push(`${filename} is missing its branded status label, accessible heading, or noindex directive`);
  }
  if (html && html.httpStatus !== 200) statusDocumentIssues.push(`${filename} static document returned HTTP ${html.httpStatus}`);
}
const errorStatusPaths = [
  ['/made-up-route-for-audit/', 404],
  ['/360-video/', 410],
  ['/360-video', 410],
  ['/about', 301],
];
const errorStatusChecks = await Promise.all(errorStatusPaths.map(async ([route, expected]) => {
  try {
    const response = await fetch(`${previewBase}${route}`, { redirect: 'manual' });
    return { route, expected, actual: response.status, location: response.headers.get('location') };
  } catch {
    return { route, expected, actual: null, location: null };
  }
}));
const errorStatusIssues = errorStatusChecks
  .filter((check) => check.actual !== check.expected)
  .map((check) => `${check.route} returned ${check.actual}, expected ${check.expected}`);
const report = {
  documents: rows.length,
  sitemap: sitemap.length,
  sitemapDelivery: {
    sourceMatchesGenerated: sourceSitemapXml === sitemapXml,
    sitemapHttpStatus: servedSitemap.status,
    robotsHttpStatus: servedRobots.status,
    robotsReferencesSitemap: robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`),
    removed360RouteListed: sitemap.includes('/360-video/'),
  },
  sitemapDeliveryIssues,
  notFoundDesignIssues,
  statusDocumentIssues,
  errorStatusChecks,
  errorStatusIssues,
  sitemapMissingDocs: sitemap.filter((route) => !rows.some((row) => row.route === route)),
  previewBase,
  httpStatusIssues: rows.filter((row) => row.httpStatus !== null && row.httpStatus !== 200).map((row) => [row.route, row.httpStatus]),
  duplicateTitles: duplicates(publicRows, 'title'),
  duplicateDescriptions: duplicates(publicRows, 'description'),
  missingDescriptions: publicRows.filter((row) => !row.description).map((row) => row.route),
  titleLengthIssues: publicRows.filter((row) => row.route !== '/work/' && (row.titleLength < 20 || row.titleLength > 65)).map((row) => [row.route, row.titleLength]),
  descriptionLengthIssues: publicRows.filter((row) => row.route !== '/work/' && (row.descriptionLength < 70 || row.descriptionLength > 160)).map((row) => [row.route, row.descriptionLength]),
  missingCanonical: publicRows.filter((row) => !row.canonical).map((row) => row.route),
  canonicalMismatch: publicRows.filter((row) => row.canonical && row.canonical !== `${origin}${row.route}` && row.route !== '/work/').map((row) => [row.route, row.canonical]),
  canonicalAliasExceptions: publicRows.filter((row) => row.route === '/work/' && row.canonical === `${origin}/works/`).map((row) => [row.route, row.canonical]),
  h1Issues: publicRows.filter((row) => row.h1Count !== 1).map((row) => [row.route, row.h1Count]),
  schemaIssues: publicRows.filter((row) => row.route !== '/work/' && (!row.jsonld.some((type) => type === 'WebPage' || type === 'CollectionPage') || !row.jsonld.includes('BreadcrumbList'))).map((row) => [row.route, row.jsonld]),
  rootSchema: rows.find((row) => row.route === '/')?.jsonld || [],
  orphanSitemapRoutes: publicRows.filter((row) => row.route !== '/work/' && !sitemapSet.has(row.route)).map((row) => row.route),
  internalLinkCount: rows.reduce((total, row) => total + row.internalLinks, 0),
  missingAlt: publicRows.filter((row) => row.imagesWithoutAlt > 0).map((row) => [row.route, row.imagesWithoutAlt]),
  missingRobots: publicRows.filter((row) => !row.robots).map((row) => row.route),
  notFoundIndexable: rows.filter((row) => errorDocuments.includes(row.route) && !/noindex/i.test(row.robots)).map((row) => row.route),
  rows,
};

const auditFailures = {
  documentCount: report.documents === expectedDocumentCount ? [] : [`expected ${expectedDocumentCount} HTML documents, found ${report.documents}`],
  sitemapCount: report.sitemap === expectedSitemapCount ? [] : [`expected ${expectedSitemapCount} sitemap URLs, found ${report.sitemap}`],
  sitemapDeliveryIssues: report.sitemapDeliveryIssues,
  notFoundDesignIssues: report.notFoundDesignIssues,
  statusDocumentIssues: report.statusDocumentIssues,
  errorStatusIssues: report.errorStatusIssues,
  httpStatusIssues: report.httpStatusIssues,
  duplicateTitles: report.duplicateTitles,
  duplicateDescriptions: report.duplicateDescriptions,
  missingDescriptions: report.missingDescriptions,
  titleLengthIssues: report.titleLengthIssues,
  descriptionLengthIssues: report.descriptionLengthIssues,
  missingCanonical: report.missingCanonical,
  canonicalMismatch: report.canonicalMismatch,
  h1Issues: report.h1Issues,
  schemaIssues: report.schemaIssues,
  sitemapMissingDocs: report.sitemapMissingDocs,
  orphanSitemapRoutes: report.orphanSitemapRoutes,
  missingAlt: report.missingAlt,
  missingRobots: report.missingRobots,
  notFoundIndexable: report.notFoundIndexable,
};
report.auditFailures = auditFailures;
const hasAuditFailures = Object.values(auditFailures).some((issues) => issues.length > 0);

await writeFile(new URL('../docs/PHASE-3-SEO-REPORT.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  documents: report.documents,
  sitemap: report.sitemap,
  sitemapDelivery: report.sitemapDelivery,
  auditPassed: !hasAuditFailures,
  auditFailures,
  canonicalAliasExceptions: report.canonicalAliasExceptions,
}, null, 2));
if (hasAuditFailures) process.exitCode = 1;
