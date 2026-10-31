/*
  Generates curated route documents after Vite build.
  JavaScript-capable visitors boot the same React application from every route.  The semantic
  source fallback lives in <noscript>, so no-JS users and crawlers retain meaningful content.
*/
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { bootFallbackBlock } from './boot-fallback.mjs';

const pages = JSON.parse(await readFile(new URL('../src/data/pages.json', import.meta.url), 'utf8'));
const videos = JSON.parse(await readFile(new URL('../src/data/videoArchive.json', import.meta.url), 'utf8')).map((video) => ({ ...video, title: cleanArchiveTitle(video.title) }));
const routeSeo = JSON.parse(await readFile(new URL('../src/data/routeSeo.json', import.meta.url), 'utf8'));
const seoKeywords = JSON.parse(await readFile(new URL('../src/data/seoKeywords.json', import.meta.url), 'utf8'));
const slideExperiences = JSON.parse(await readFile(new URL('../src/data/slideExperiences.json', import.meta.url), 'utf8'));
const metaverseContent = JSON.parse(await readFile(new URL('../src/data/metaverseContent.json', import.meta.url), 'utf8'));
const experienceStories = JSON.parse(await readFile(new URL('../src/data/experienceStories.json', import.meta.url), 'utf8'));
const experienceMaps = JSON.parse(await readFile(new URL('../src/data/experienceMaps.json', import.meta.url), 'utf8'));
const innerHeroVisuals = JSON.parse(await readFile(new URL('../src/data/innerHeroVisuals.json', import.meta.url), 'utf8'));
const explorerVisuals = JSON.parse(await readFile(new URL('../src/data/explorerVisuals.json', import.meta.url), 'utf8'));
const capabilitySource = await readFile(new URL('../src/data/capabilities.ts', import.meta.url), 'utf8');
const googleSiteVerification = await readFile(new URL('../public/googleb16a568f6f3a241d.html', import.meta.url), 'utf8');
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

// The capability data remains the single authored source. This narrow parser
// deliberately extracts only its stable literal fields for no-JavaScript delivery.
const capabilityRecords = [...capabilitySource.matchAll(/slug: '([^']+)', title: '([^']+)', route: '([^']+)', eyebrow: '([^']+)',\s*overview: '([^']+)',\s*creates: \[([^\]]+)\],\s*applications: \[([^\]]+)\]/gs)].map((match) => ({
  slug: match[1], title: match[2], route: match[3], eyebrow: match[4], overview: match[5],
  creates: parseStringArray(match[6]), applications: parseStringArray(match[7]),
}));
if (capabilityRecords.length !== 8) throw new Error(`Expected 8 capability records; found ${capabilityRecords.length}.`);
const capabilityDomainRoutes = [...capabilitySource.matchAll(/domainRoutes: \[([^\]]+)\]/g)].map((match) => parseStringArray(match[1]));
if (capabilityDomainRoutes.length !== capabilityRecords.length) {
  throw new Error(`Expected ${capabilityRecords.length} capability domain-route lists; found ${capabilityDomainRoutes.length}.`);
}
capabilityRecords.forEach((record, index) => {
  record.domainRoutes = capabilityDomainRoutes[index] || [];
});
const enquiryDisciplineByExperienceRoute = {
  '/metaverse/': 'Metaverse',
  '/mixed-reality/': 'Mixed Reality (MR)',
  '/virtual-reality/': 'Virtual Reality (VR)',
  '/augment-reality/': 'Augmented Reality (AR)',
  '/animation/': '3D Animation & VFX',
  '/brand-advertisement/': 'Brand Advertisement',
  '/media-production/': 'Media Production',
};
const enquiryDisciplineByCapabilityRoute = {
  '/capabilities/brand/': 'Brand Advertisement',
  '/capabilities/design/': 'Custom Multi-Discipline Commission',
  '/capabilities/content/': 'Custom Multi-Discipline Commission',
  '/capabilities/film/': 'Media Production',
  '/capabilities/animation-3d/': '3D Animation & VFX',
  '/capabilities/digital/': 'Custom Multi-Discipline Commission',
  '/capabilities/experiences/': 'Experiential Installation',
  '/capabilities/creative-technology/': 'Custom Multi-Discipline Commission',
};
function leadContactHref({ discipline, sourceRoute, topic, goal }) {
  const params = new URLSearchParams({ intent: 'project-roadmap' });
  if (discipline) params.set('discipline', discipline);
  if (sourceRoute) params.set('source', sourceRoute);
  if (topic) params.set('topic', topic);
  if (goal) params.set('goal', goal);
  return `/contact/?${params.toString()}`;
}
function experienceLeadHref(experience) {
  return leadContactHref({
    discipline: enquiryDisciplineByExperienceRoute[experience.route] || 'Custom Multi-Discipline Commission',
    sourceRoute: experience.route,
    topic: experience.label,
    goal: experience.heading,
  });
}
if (slideExperiences.length !== 7) throw new Error(`Expected 7 homepage slide experiences; found ${slideExperiences.length}.`);

function slugifyDomainTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function domainRouteFor(parentRoute, title) {
  return `${parentRoute}${slugifyDomainTitle(title)}/`;
}

function domainContextualTitle(parentRoute, title) {
  if (parentRoute === '/mixed-reality/') return title === 'Architecture & Design' ? 'Architecture & Design in Mixed Reality' : `Mixed Reality ${title}`;
  if (parentRoute === '/virtual-reality/') {
    if (title.startsWith('VR ')) return title;
    if (title === 'Architectural Visualization') return 'VR Architectural Visualization';
    if (title === 'Healthcare') return 'VR for Healthcare';
    return `${title} in Virtual Reality`;
  }
  if (parentRoute === '/augment-reality/') return title.startsWith('AR ') || title.startsWith('Industrial AR') ? title : `AR for ${title}`;
  if (parentRoute === '/metaverse/' && title === 'Gaming') return 'Gaming in the Metaverse';
  if (parentRoute === '/brand-advertisement/' && title === 'Explainer Communication') return 'Brand Explainer Communication';
  return title;
}

const supplementalDomainDeliverables = {
  '/metaverse/virtual-economies/': ['Participation and reward loops', 'Digital ownership journeys', 'Creator commerce touchpoints', 'Virtual goods presentation', 'Community incentive systems', 'Experience analytics and tuning'],
  '/brand-advertisement/explainer-communication/': ['Message architecture', 'Script and storyboard development', 'Product and system visualisation', 'Motion graphics and animation', 'Voice, music and sound design', 'Channel-ready edits and cutdowns'],
  '/media-production/television-production/': ['Format and episode development', 'Multi-camera production planning', 'Studio and location capture', 'Editorial and graphics packages', 'Broadcast-ready sound and colour finishing', 'Delivery masters and archive versions'],
};

const supplementalDomainDescriptions = {
  '/metaverse/virtual-education/': 'Learning does not have to happen inside a rectangle. Virtual environments can create immersive campuses, labs and collaborative spaces where people learn by exploring together.',
  '/metaverse/virtual-workspaces/': 'Distributed teams can use shared virtual environments to meet, present, workshop and build together—wherever they are.',
  '/virtual-reality/architectural-visualization/': 'Walk through a place before it exists. VR helps people understand scale, light, material, movement and design intent at true human scale.',
  '/media-production/video-production/': 'Create visual content for brands, campaigns, corporate communication, events and digital platforms—planned, filmed and finished for the screens that matter.',
  '/media-production/film-production/': 'From concept development through production and post-production, film gives a story its most complete cinematic form.',
  '/media-production/media-consulting/': 'Not every project begins with a production brief. Sometimes the first question is which format, platform, story and production route will create the greatest value.',
};

const domainParentContexts = {
  '/metaverse/': {
    formats: ['Browser-based 3D worlds', 'VR-ready environments', 'Live virtual events', 'Community spaces', 'Interactive product worlds'],
    audiences: ['Brands and cultural institutions', 'Communities and creators', 'Education and enterprise teams', 'Event and entertainment producers'],
  },
  '/mixed-reality/': {
    formats: ['Spatial headsets', 'Tablets and mobile devices', 'Installations and showrooms', 'Training spaces', 'Shared physical environments'],
    audiences: ['Operations and training teams', 'Designers and architects', 'Educators and researchers', 'Retail, media and entertainment teams'],
  },
  '/virtual-reality/': {
    formats: ['Standalone VR headsets', 'Location-based installations', 'Training simulators', '360° and 180° media', 'Interactive virtual environments'],
    audiences: ['Training and safety teams', 'Educators and cultural institutions', 'Healthcare and research teams', 'Entertainment and brand experience teams'],
  },
  '/augment-reality/': {
    formats: ['WebAR in the browser', 'Mobile and tablet apps', 'Packaging and print triggers', 'Retail and exhibition spaces', 'Location-based experiences'],
    audiences: ['Retail and consumer brands', 'Tourism and cultural organisations', 'Industrial and field teams', 'Educators, artists and media producers'],
  },
  '/animation/': {
    formats: ['Film and episodic content', 'Brand and product films', 'Interactive media', 'Social and broadcast', 'Spatial and real-time experiences'],
    audiences: ['Studios and producers', 'Brands and product teams', 'Educators and publishers', 'Game, XR and entertainment teams'],
  },
  '/brand-advertisement/': {
    formats: ['Integrated campaigns', 'Film and social content', 'Out-of-home media', 'Product launches', 'Digital and experiential activations'],
    audiences: ['Founders and marketing leaders', 'Product launch teams', 'Agencies and media partners', 'Consumer, enterprise and cultural brands'],
  },
  '/media-production/': {
    formats: ['Cinema and streaming', 'Broadcast television', 'Live events', 'Commercial and corporate media', 'Social and digital platforms'],
    audiences: ['Brands and institutions', 'Producers and broadcasters', 'Event organisers', 'Agencies and independent creators'],
  },
};

function normaliseSeoTerm(value = '') {
  return String(value).replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
}

function uniqueSeoTerms(values, limit = 16) {
  const seen = new Set();
  const output = [];
  values.forEach((value) => {
    const term = normaliseSeoTerm(value || '');
    const key = term.toLowerCase();
    if (!term || seen.has(key)) return;
    seen.add(key);
    output.push(term);
  });
  return output.slice(0, limit);
}

function naturalSeoList(values) {
  return values
    .map((value) => String(value)
      .toLowerCase()
      .replace(/\bwebar\b/g, 'WebAR')
      .replace(/\b(vr|ar|mr|xr|vfx|cgi|2d|3d)\b/g, (match) => match.toUpperCase())
      .replace(/\bindia\b/g, 'India')
      .replace(/\bjaipur\b/g, 'Jaipur'))
    .join(', ');
}

function clusterSeoKeywords(cluster) {
  if (!cluster) return [];
  return uniqueSeoTerms([cluster.focus, ...(cluster.aliases || []), ...(cluster.services || []), ...(cluster.longTail || [])], 20);
}

function alternateTechnologyNames(contextTitle) {
  const terms = [contextTitle];
  if (/Virtual Reality/i.test(contextTitle)) terms.push(contextTitle.replace(/Virtual Reality/gi, 'VR'));
  if (/\bVR\b/.test(contextTitle)) terms.push(contextTitle.replace(/\bVR\b/g, 'Virtual Reality'));
  if (/Augmented Reality/i.test(contextTitle)) terms.push(contextTitle.replace(/Augmented Reality/gi, 'AR'));
  if (/\bAR\b/.test(contextTitle)) terms.push(contextTitle.replace(/\bAR\b/g, 'Augmented Reality'));
  if (/Mixed Reality/i.test(contextTitle)) terms.push(contextTitle.replace(/Mixed Reality/gi, 'MR'));
  if (/Visual Effects/i.test(contextTitle)) terms.push(contextTitle.replace(/Visual Effects/gi, 'VFX'));
  if (/\bVFX\b/i.test(contextTitle)) terms.push(contextTitle.replace(/\bVFX\b/gi, 'Visual Effects'));
  return terms;
}

function staticDomainSeoProfile({ route, title, contextualTitle, parentRoute, parentLabel, subtitle, deliverables, formats, audiences }) {
  const cluster = seoKeywords.parents[parentRoute];
  const parentTerms = seoKeywords.domainParentTerms[parentRoute];
  const overrides = seoKeywords.domainOverrides[route] || [];
  const context = normaliseSeoTerm(contextualTitle);
  const cleanTitle = normaliseSeoTerm(title);
  const focus = `${context} services in India`;
  const short = parentTerms?.short;
  const shortWithTitle = short && /^[A-Z]{2,3}$/.test(short) && !cleanTitle.toLowerCase().includes(short.toLowerCase()) && !context.toLowerCase().includes(short.toLowerCase())
    ? `${short} ${cleanTitle}`
    : undefined;
  const aliases = uniqueSeoTerms([
    ...overrides,
    ...alternateTechnologyNames(context),
    shortWithTitle,
  ], 9);
  const contextWords = new Set(context.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const keywords = uniqueSeoTerms([
    focus,
    `${context} company in India`,
    `${context} services in Jaipur`,
    `${context} services`,
    ...overrides,
    ...(parentTerms?.serviceSuffixes || ['services'])
      .filter((suffix) => !contextWords.has(suffix.split(/\s+/)[0].toLowerCase()))
      .map((suffix) => `${context} ${suffix}`),
    ...deliverables.filter((item) => item.length <= 58 && item.trim().includes(' ')).slice(0, 3),
    ...audiences.slice(0, 2).map((audience) => `${context} for ${audience.toLowerCase()}`),
    ...formats.slice(0, 2).map((format) => `${context} for ${format.toLowerCase()}`),
    cluster?.focus,
  ]);
  return { focus, aliases, keywords };
}

function domainSeoTitle(contextTitle, parentLabel, parentRoute, plainTitle = '') {
  const context = contextTitle.toLowerCase();
  const parent = parentLabel.toLowerCase();
  const short = seoKeywords.domainParentTerms[parentRoute]?.short;
  const shortLower = short?.toLowerCase();
  const mentionsParent = context.includes(parent) || (shortLower ? new RegExp(`(^|[^a-z0-9])${shortLower}([^a-z0-9]|$)`).test(context) : false);
  const candidates = mentionsParent
    ? [
        `${contextTitle} Services in India | Angel Creations`,
        `${contextTitle} Services | Angel Creations`,
        `${contextTitle} in India | Angel Creations`,
      ]
    : parentRoute === '/metaverse/'
      ? [
          `Metaverse ${contextTitle} Services in India | Angel Creations`,
          `${contextTitle} in the Metaverse | Angel Creations`,
          `${contextTitle} Metaverse Services | Angel Creations`,
          `${contextTitle} Services in India | Angel Creations`,
        ]
      : parentRoute === '/animation/'
        ? [
            `${contextTitle} Animation Services in India | Angel Creations`,
            // Dropping "India" rather than "Animation": these pages rank for
            // animation work, so the discipline is the last word to lose.
            `${contextTitle} Animation Services | Angel Creations`,
            `${contextTitle} Services in India | Angel Creations`,
          ]
        : parentRoute === '/brand-advertisement/' || parentRoute === '/media-production/'
          ? [
              `${contextTitle} Services in India | Angel Creations`,
              `${contextTitle} Services | Angel Creations`,
            ]
          : [
              short ? `${short} ${contextTitle} Services in India | Angel Creations` : undefined,
              `${contextTitle} | ${parentLabel} Services in India | Angel Creations`,
              `${contextTitle} Services in India | Angel Creations`,
            ];
  // 60 characters is the length Google renders before truncating a title in
  // results. Prefer the first candidate that fits. When even the plain form of
  // the contextual title is too long (e.g. "Streaming & Broadcasting in Virtual
  // Reality"), fall back to the short catalogue title so the brand suffix and the
  // service name both survive instead of being truncated mid-word.
  // Branded fallbacks, most specific first. A domain page must keep the parent
  // discipline in the title — an /animation/ page whose title drops "Animation"
  // loses the term it ranks for — so the short parent prefix and the
  // "Animation" suffix are tried before the plain title. The short prefix is only
  // used when the contextual title does not already spell the parent out, which
  // is what produced the redundant "MR Mixed Reality ..." form.
  const branded = [
    // The contextual title plus brand is the most descriptive form, so it is
    // tried first; the short prefix (MR/VR/animation) only takes over when that
    // would overflow the 60-character budget.
    `${contextTitle} | Angel Creations`,
    (() => {
      if (!short) return undefined;
      const candidate = `${short} ${plainTitle || contextTitle} | Angel Creations`;
      const redundant = `${short} ${contextTitle}`.toLowerCase() === contextTitle.toLowerCase();
      return redundant ? undefined : candidate;
    })(),
    parentRoute === '/animation/' && plainTitle ? `${plainTitle} Animation | Angel Creations` : undefined,
    plainTitle ? `${plainTitle} | Angel Creations` : undefined,
  ].filter(Boolean);
  return candidates.find((candidate) => candidate && candidate.length <= 60)
    || branded.find((candidate) => candidate.length <= 60)
    || branded[branded.length - 1];
}

function domainSeoDescription(contextTitle, parentLabel, description, deliverables, subtitle = '') {
  const rawFirstSentence = description.match(/^.*?[.!?](?=\s|$)/)?.[0] || description;
  const firstSentence = /[.!?]$/.test(rawFirstSentence) ? rawFirstSentence : `${rawFirstSentence}.`;
  const focusItems = deliverables.slice(0, 2).map((item) => item.toLowerCase());
  const prefix = `${contextTitle} services in India by Angel Creations. `;
  const suffixes = [
    focusItems.length > 1 ? ` Explore ${focusItems.join(', ')} within ${parentLabel} and get a free project roadmap.` : '',
    focusItems[0] ? ` Explore ${focusItems[0]} within ${parentLabel} and get a free project roadmap.` : '',
    focusItems[0] ? ` Explore ${focusItems[0]} and get a free project roadmap.` : '',
    ' Get a free project roadmap.',
  ].filter((suffix, index, list) => suffix && list.indexOf(suffix) === index);

  for (const suffix of suffixes) {
    const candidate = `${prefix}${firstSentence}${suffix}`.replace(/\s+/g, ' ').trim();
    if (candidate.length <= 158) return candidate;
  }

  const cleanSubtitle = subtitle.replace(/\s+/g, ' ').trim().replace(/[.!?]$/, '');
  if (cleanSubtitle) {
    for (const suffix of suffixes) {
      const candidate = `${prefix}${cleanSubtitle}.${suffix}`.replace(/\s+/g, ' ').trim();
      if (candidate.length <= 158) return candidate;
    }
  }

  const suffix = suffixes[suffixes.length - 1];
  const maxSummaryLength = 158 - prefix.length - suffix.length - 1;
  if (maxSummaryLength >= 45) {
    const shortened = firstSentence.slice(0, maxSummaryLength);
    const lastSpace = shortened.lastIndexOf(' ');
    const summary = shortened
      .slice(0, lastSpace > 40 ? lastSpace : maxSummaryLength)
      .trim()
      .replace(/[.,;:!?]$/, '');
    return `${prefix}${summary}.${suffix}`.replace(/\s+/g, ' ').trim();
  }

  return `${prefix}${suffix.trim()}`.replace(/\s+/g, ' ').trim();
}

const domainRecords = slideExperiences.flatMap((parent) => {
  const entries = parent.route === '/metaverse/'
    ? metaverseContent.experienceTypes.map((entry) => ({ title: entry.title, description: entry.description, items: entry.applications, closing: entry.closing }))
    : (experienceStories[parent.route]?.sections?.[2]?.entries || []);
  return entries.map((entry, index) => {
    const route = domainRouteFor(parent.route, entry.title);
    const visual = explorerVisuals[parent.route]?.applications?.[index] || explorerVisuals[parent.route]?.hero || {};
    const deliverables = (entry.items?.length ? entry.items : entry.applications?.length ? entry.applications : supplementalDomainDeliverables[route] || []).filter(Boolean).map((item) => item.replace(/^([a-z])/, (_, letter) => letter.toUpperCase()));
    const contextualTitle = domainContextualTitle(parent.route, entry.title);
    const description = supplementalDomainDescriptions[route] || entry.description || entry.statement || parent.summary;
    const subtitle = visual.subtitle || visual.caption || parent.label;
    const parentContext = domainParentContexts[parent.route] || { formats: [], audiences: [] };
    const seoProfile = staticDomainSeoProfile({
      route,
      title: entry.title,
      contextualTitle,
      parentRoute: parent.route,
      parentLabel: parent.label,
      subtitle,
      deliverables,
      formats: parentContext.formats,
      audiences: parentContext.audiences,
    });
    return {
      route,
      slug: slugifyDomainTitle(entry.title),
      title: entry.title,
      contextualTitle,
      description,
      closing: entry.closing || '',
      deliverables,
      parent,
      parentRoute: parent.route,
      parentLabel: parent.label,
      image: visual.src || parent.poster || '/media/social/og/home.jpg',
      imageAlt: `${contextualTitle} service visual by Angel Creations — ${subtitle}`,
      subtitle,
      formats: parentContext.formats,
      audiences: parentContext.audiences,
      seoTitle: domainSeoTitle(contextualTitle, parent.label, parent.route, entry.title),
      seoDescription: domainSeoDescription(contextualTitle, parent.label, description, deliverables, subtitle),
      seoFocus: seoProfile.focus,
      seoAliases: seoProfile.aliases,
      seoKeywords: seoProfile.keywords,
    };
  });
});
if (domainRecords.length !== 63) throw new Error(`Expected 63 domain records; found ${domainRecords.length}.`);
if (new Set(domainRecords.map((domain) => domain.route)).size !== domainRecords.length) throw new Error('Domain routes must be unique.');

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

// The captured documents still carry the Organization entity from the previous
// site, and three of its sameAs entries point at the wrong destinations (a
// Facebook page handle that does not exist, a YouTube URL without the @-handle
// and a personal LinkedIn profile instead of the company page). The entity is
// rewritten in place rather than duplicated, so every page keeps exactly one
// Organization node and it always agrees with the footer.
const OFFICIAL_SAME_AS = [
  'https://www.facebook.com/angelcreations.animation',
  'https://www.instagram.com/angelcreations.digital/',
  'https://www.linkedin.com/company/angelcreations-creativestudio/',
  'https://www.youtube.com/@AngelCreationsACreativeStudio',
  'https://x.com/angelcreation0',
];

function isOrganization(node) {
  const type = node?.['@type'];
  return Array.isArray(type) ? type.includes('Organization') : type === 'Organization';
}

function normaliseOrganization(node) {
  if (!node || typeof node !== 'object') return node;
  if (isOrganization(node)) {
    node.sameAs = [...OFFICIAL_SAME_AS];
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(normaliseOrganization);
    else if (value && typeof value === 'object') normaliseOrganization(value);
  }
  return node;
}

function sourceSchema(page) {
  return (page.jsonLd || []).flatMap((item) => {
    try {
      const data = normaliseOrganization(JSON.parse(item));
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
    'og:locale': 'en_IN',
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

const organizationSchemaEntity = {
  '@type': 'Organization',
  '@id': 'https://angelcreations.in/#organization',
  name: 'Angel Creations',
  url: 'https://angelcreations.in/',
  logo: {
    '@type': 'ImageObject',
    url: 'https://angelcreations.in/media/logos/logo-rectangle-1.png',
  },
  image: 'https://angelcreations.in/media/social/og/home.jpg',
  description: 'Angel Creations is an XR, animation, VFX and film studio in Jaipur, India crafting virtual worlds, AR/VR/MR experiences, brand campaigns and cinematic media for clients worldwide.',
  slogan: 'Immersive worlds. Human stories.',
  knowsAbout: [
    seoKeywords.organization.focus,
    ...seoKeywords.organization.services,
    ...seoKeywords.organization.aliases,
  ],
  areaServed: seoKeywords.organization.locations,
  email: 'business@angelcreations.in',
  telephone: '+91-8058465733',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'IN',
  },
  location: [
    {
      '@type': 'Place',
      name: 'Angel Creations — Jaipur, India',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jaipur',
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'Place',
      name: 'Angel Creations — Braintree, United Kingdom',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Braintree',
        addressCountry: 'GB',
      },
    },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'business@angelcreations.in',
      telephone: '+91-8058465733',
      url: 'https://angelcreations.in/contact/',
      areaServed: ['India', 'United Kingdom', 'Worldwide'],
      availableLanguage: ['English'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@angelcreations.in',
      url: 'https://angelcreations.in/contact/',
      areaServed: ['India', 'United Kingdom', 'Worldwide'],
      availableLanguage: ['English'],
    },
  ],
  // Official profiles only, in the same order as the footer so the two never
  // contradict each other. Three of the previous values were wrong: the
  // Facebook page handle, a YouTube URL without the @-handle, and a personal
  // LinkedIn profile instead of the company page. X was missing entirely.
  sameAs: [
    'https://www.facebook.com/angelcreations.animation',
    'https://www.instagram.com/angelcreations.digital/',
    'https://www.linkedin.com/company/angelcreations-creativestudio/',
    'https://www.youtube.com/@AngelCreationsACreativeStudio',
    'https://x.com/angelcreation0',
  ],
};

const websiteSchemaEntity = {
  '@type': 'WebSite',
  '@id': 'https://angelcreations.in/#website',
  url: 'https://angelcreations.in/',
  name: 'Angel Creations',
  publisher: { '@id': 'https://angelcreations.in/#organization' },
  inLanguage: 'en-IN',
};

const serviceDiscoveryFields = {
  areaServed: seoKeywords.organization.locations,
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://angelcreations.in/contact/',
    servicePhone: '+91-8058465733',
    availableLanguage: ['English'],
  },
  termsOfService: 'https://angelcreations.in/terms-of-service/',
};

function faqSchemaEntity(id, items) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

const capabilityApproach = 'Every commission is shaped around the audience, the story and the experience it must create—balancing usability, aesthetics, technical precision and craft through close collaboration.';

function staticCapabilityFaqs(capability) {
  return [
    {
      question: `What ${capability.title} services can Angel Creations create?`,
      answer: `Depending on the brief, the work can include ${capability.creates.join(', ').toLowerCase()}.`,
    },
    {
      question: `Where can ${capability.title} create value?`,
      answer: `Relevant settings and formats include ${capability.applications.join(', ').toLowerCase()}, chosen around the audience, story and launch context.`,
    },
    {
      question: `Who hires ${capability.title} services in India and worldwide?`,
      answer: 'It is usually commissioned by teams planning a launch, campaign, learning experience, presentation or public-facing moment. Angel Creations works from Jaipur, India with organisations across India and internationally.',
    },
    {
      question: `How much does a ${capability.title} project cost?`,
      answer: 'Cost depends on creative scope, production scale, interactivity, timeline and delivery formats. A prototype or pilot can be scoped first so the value and production route are visible before committing to the full build.',
    },
    {
      question: `How does a ${capability.title} project start?`,
      answer: `${capabilityApproach} Share the goal, audience, timeline and available budget through the project brief, and the first roadmap can be shaped from there.`,
    },
  ];
}

function staticExperienceFaqs(experience) {
  return [
    {
      question: `What ${experience.label} services does Angel Creations offer?`,
      answer: `We design and produce ${experience.label} experiences around a specific audience, setting, platform and outcome, from early prototypes through full production rather than forcing a one-size-fits-all package.`,
    },
    {
      question: `Which industries and teams can use ${experience.label}?`,
      answer: `${experience.label} can help teams teach, demonstrate, visualise, entertain or invite participation. The right format depends on the people it is for, where it will be experienced and what should happen next.`,
    },
    {
      question: `Does Angel Creations provide ${experience.label} services in Jaipur, across India and worldwide?`,
      answer: 'Yes. Angel Creations is based in Jaipur, Rajasthan, works with clients across India, and has an international client desk in Braintree, United Kingdom for projects delivered worldwide.',
    },
    {
      question: `How much does a ${experience.label} project cost?`,
      answer: 'Cost depends on creative scope, number of environments or scenes, interactivity, platforms, production locations, timeline and finishing requirements. The free roadmap first separates a useful prototype from the full production scope so investment can be discussed responsibly.',
    },
    {
      question: `How does a ${experience.label} project start?`,
      answer: 'Share the audience, goal, preferred format and launch timeline through the project brief. We then shape the creative direction, prototype the defining moment, test it in context and expand into full production.',
    },
  ];
}

function staticDomainFaqs(domain) {
  return [
    {
      question: `What is ${domain.contextualTitle}?`,
      answer: domain.description,
    },
    {
      question: `What ${domain.contextualTitle} services does Angel Creations provide?`,
      answer: `Depending on the brief, the work can include ${domain.deliverables.join(', ').toLowerCase()}.`,
    },
    {
      question: `Which platforms and formats can ${domain.contextualTitle} use?`,
      answer: `Common touchpoints include ${domain.formats.join(', ').toLowerCase()}. The final format is chosen around the audience, setting, hardware and production goals.`,
    },
    {
      question: `Who is ${domain.contextualTitle} for?`,
      answer: 'It is for teams who need people to understand, explore, learn from, or act on an idea. We shape the experience around the people who will use, watch, visit or share it.',
    },
    {
      question: `Does Angel Creations offer ${domain.contextualTitle} in Jaipur, across India and worldwide?`,
      answer: 'Yes. Angel Creations is based in Jaipur, Rajasthan, serves clients across India and works internationally through its Braintree, United Kingdom client desk.',
    },
    {
      question: `How does a ${domain.contextualTitle} project start, and how is cost scoped?`,
      answer: 'Share the audience, setting, desired outcome and timeline through the project enquiry. Cost is scoped after defining the creative route, interactivity, production scale and delivery formats; the free roadmap separates a sensible prototype from full production.',
    },
  ];
}

function faqFallbackMarkup(heading, items) {
  return `<h2>${escapeHtml(heading)}</h2>${items.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join('')}`;
}

function jsonLdScript(payload) {
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

function cleanArchiveTitle(title) {
  return String(title || '')
    .replace(/Angel['’]s Creations(?:['’]s)?/g, 'Angel Creations')
    .replace(/\bAngels Creations\b/g, 'Angel Creations')
    .replace(/\bPre\s+-\s+Wedding\b/g, 'Pre-Wedding')
    .replace(/\bSide By Side\b/g, 'Side by Side')
    .replace(/\bShow-reel\b/g, 'Showreel')
    .replace('What if Parallel Universe be like', 'What Would a Parallel Universe Be Like?')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function archiveSummary(video) {
  const fallback = 'A selected production from the Angel Creations archive.';
  const boilerplate = /(digital marketing|broadcasting\s*&\s*media production|it solutions|event organi[sz]ers|one\s*['’]?stop['’]?\s+solution|stop['’]?\s+solution|designing and media production|web designing|business growth|contact us|order your own|subscribe|notification bell|more than\s+\d+\s+(customers|videos)|mind-boggling|quick turnaround|^by\s+2020\b|we Angel Creations are a studio|group of onlookers|excellent track record)/i;
  const candidates = [];

  String(video.description || '')
    .replace(/\r\n?/g, '\n')
    .split(/\n+/)
    .forEach((paragraph) => {
      const cleaned = paragraph
        .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
        .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, ' ')
        .replace(/\+?\d[\d\s-]{7,}\d/g, ' ')
        .replace(/#\S+/g, ' ')
        .replace(/Angel['’]s Creations/g, 'Angel Creations')
        .replace(/Angels creations/gi, 'Angel Creations')
        .replace(/\bwas done for\b/gi, 'was created for')
        .replace(/,\.(?=\s|$)/g, '.')
        .replace(/\bone of (his|her|their) most popular track\b/gi, 'one of $1 most popular tracks')
        .replace(/\bone of most popular track\b/gi, 'one of the most popular tracks')
        .replace(/\bin purpose of inauguration of\b/gi, 'for the inauguration of')
        .replace(/\bGiant huge\b/gi, 'Giant')
        .replace(/([A-Za-z])(\()/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
      const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
      sentences.forEach((sentence) => {
        const cleanSentence = sentence.replace(/^[\s\-–—•|]+/, '').replace(/\s+/g, ' ').trim();
        if (cleanSentence.length < 24 || /^\d+\)/.test(cleanSentence) || boilerplate.test(cleanSentence)) return;
        if (/^(mail|call|website|instagram|facebook|google\+|get in touch)\b/i.test(cleanSentence)) return;
        candidates.push(cleanSentence);
      });
    });

  if (!candidates.length) return fallback;
  let summary = candidates[0];
  let candidateIndex = 1;
  while (
    candidates[candidateIndex] &&
    (summary.length < 86 || /,$/.test(summary)) &&
    `${summary} ${candidates[candidateIndex]}`.length <= 190
  ) {
    const prefix = /,$/.test(summary)
      ? summary
      : /[.!?…]$/.test(summary)
        ? summary
        : `${summary}.`;
    summary = `${prefix} ${candidates[candidateIndex]}`;
    candidateIndex += 1;
  }
  summary = summary.replace(/,\s*$/, '.').replace(/,\.(?=\s|$)/g, '.');
  summary = summary.replace(/^([^A-Za-z]*)([a-z])/, (_match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  if (summary.length > 194) {
    const shortened = summary.slice(0, 191);
    const lastSpace = shortened.lastIndexOf(' ');
    summary = `${shortened.slice(0, lastSpace > 120 ? lastSpace : 191).trim()}…`;
  } else if (!/[.!?…]$/.test(summary)) {
    summary = `${summary}.`;
  }
  return summary;
}

function isoDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) return undefined;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = Math.round(total % 60);
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${remainder ? `${remainder}S` : ''}` || 'PT0S';
}

function worksVideoSchema() {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://angelcreations.in/works/#video-archive',
    name: 'XR, Animation, VFX & Film Portfolio — Selected Angel Creations productions',
    description: routeSeo['/works/']?.description || 'Selected Angel Creations productions.',
    keywords: ['XR portfolio India', 'animation and VFX portfolio', 'brand film portfolio', 'film production portfolio', ...seoKeywords.organization.services],
    numberOfItems: videos.length,
    itemListElement: videos.map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        '@id': `https://angelcreations.in/works/#video-${video.id}`,
        name: video.title,
        description: archiveSummary(video),
        thumbnailUrl: video.thumbnail ? new URL(video.thumbnail, 'https://angelcreations.in').href : undefined,
        uploadDate: video.publishDate || video.uploadDate || undefined,
        duration: isoDuration(video.durationSeconds),
        contentUrl: video.url,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
        genre: video.category || undefined,
        keywords: uniqueSeoTerms([video.category, 'Angel Creations selected work'], 3),
        inLanguage: 'en-IN',
        creator: { '@id': 'https://angelcreations.in/#organization' },
        publisher: { '@id': 'https://angelcreations.in/#organization' },
        interactionStatistic: video.views === undefined ? undefined : {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'WatchAction' },
          userInteractionCount: Number(video.views) || 0,
        },
      },
    })),
  };
  return jsonLdScript(payload);
}

function capabilitySchema(capability) {
  const canonical = `https://angelcreations.in${capability.route}`;
  const title = routeSeo[capability.route]?.title || `${capability.title} | Angel Creations`;
  const description = routeSeo[capability.route]?.description || capability.overview;
  const cluster = seoKeywords.capabilities[capability.route];
  const keywords = clusterSeoKeywords(cluster);
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchemaEntity,
      websiteSchemaEntity,
      {
        '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
        name: title, description, keywords,
        isPartOf: { '@id': 'https://angelcreations.in/#website' },
        about: { '@id': 'https://angelcreations.in/#organization' },
        mainEntity: { '@id': `${canonical}#service` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
          { '@type': 'ListItem', position: 2, name: 'About', item: 'https://angelcreations.in/about/' },
          { '@type': 'ListItem', position: 3, name: capability.title, item: canonical },
        ],
      },
      {
        '@type': 'Service', '@id': `${canonical}#service`, name: capability.title,
        alternateName: cluster?.aliases,
        serviceType: cluster?.focus || capability.title,
        description, keywords, url: canonical,
        provider: { '@id': 'https://angelcreations.in/#organization' },
        ...serviceDiscoveryFields,
        audience: (cluster?.audiences || []).map((audience) => ({ '@type': 'BusinessAudience', audienceType: audience })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${capability.title} services`,
          itemListElement: (capability.domainRoutes || []).map((route) => ({
            '@type': 'Offer',
            itemOffered: { '@id': `https://angelcreations.in${route}#service` },
          })),
        },
      },
      faqSchemaEntity(`${canonical}#faq`, staticCapabilityFaqs(capability)),
    ],
  };
  return jsonLdScript(payload);
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

const gtmHeadSnippet = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MMFB2VZ');</script>`;
// GA4 is installed directly because the published GTM container has no tags.
// Keep this measurement out of GTM unless this direct tag is removed, or GA4
// will receive duplicate hits.
const googleAnalyticsMeasurementId = 'G-T4G74DNBP9';
const gaHeadSnippet = `<script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsMeasurementId}');</script>`;
const analyticsHeadSnippet = `${gtmHeadSnippet}${gaHeadSnippet}`;
const gtmNoScript = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MMFB2VZ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

function documentShell({ title, description, canonical, robots, ogTitle, image, imageAlt, schema = '', extraHead = '', fallback }) {
  return `<!doctype html>
<html lang="en-IN" class="respect-color-scheme-preference"><head>
<meta charset="utf-8">${analyticsHeadSnippet}<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
<meta name="robots" content="${escapeHtml(robots || 'index, follow')}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/icon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0b0b0f">
<meta property="og:title" content="${escapeHtml(ogTitle || title)}">
${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Angel Creations">
<meta property="og:locale" content="en_IN">
${image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:secure_url" content="${escapeHtml(image)}">${image.includes('/media/social/og/') ? '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' : ''}<meta property="og:image:type" content="${image.toLowerCase().endsWith('.png') ? 'image/png' : image.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg'}"><meta property="og:image:alt" content="${escapeHtml(imageAlt || ogTitle || title)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">
${description ? `<meta name="twitter:description" content="${escapeHtml(description)}">` : ''}
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}"><meta name="twitter:image:alt" content="${escapeHtml(imageAlt || ogTitle || title)}">` : ''}
${schema}
${extraHead}
${runtimeAssetTags}
</head><body class="is-light-theme no-js">${gtmNoScript}<div id="root"></div>${bootFallbackBlock}<noscript>${fallbackCss}${fallback}</noscript></body></html>`;
}

function staticNavigation() {
  return `<nav aria-label="Primary"><a href="/">Home</a><a href="/about/">About the Studio</a><a href="/works/">Selected Works & Portfolio</a><a href="/domains/">All 63 Service Domains</a><a href="/contact/">Contact</a></nav>`;
}

function staticLegalLinks() {
  return `<footer><a href="/privacy-policy/">Privacy Policy</a> / <a href="/terms-of-service/">Terms of Service</a></footer>`;
}

function renderCapabilityIndex() {
  return `<section aria-labelledby="static-capabilities"><h2 id="static-capabilities">XR, Animation, VFX, Brand & Film Capabilities</h2><p>Explore the disciplines behind Angel Creations’ work in India and worldwide.</p><ul>${capabilityRecords.map((capability) => `<li><a href="${capability.route}">${escapeHtml((routeSeo[capability.route]?.title || capability.title).split(' | ')[0])}</a></li>`).join('')}</ul></section>`;
}

function renderVideoArchive() {
  return `<section aria-labelledby="video-archive-title"><p class="eyebrow">XR, Animation, VFX & Film Portfolio · India</p><h2 id="video-archive-title">Watch XR, Animation, VFX & Film Work.</h2><p>Browse films, VFX breakdowns, 2D and 3D animation, architectural visualisation, brand commercials and live productions, then watch each work on YouTube.</p><ol class="archive">${videos.map((video) => {
    const metadata = [video.category, video.duration, video.publishDate || video.uploadDate, video.views === undefined ? '' : `${video.views} views`, video.likes === undefined || video.likes === '' ? '' : `${video.likes} likes`, video.status].filter(Boolean);
    return `<li><article><h3><a href="${escapeHtml(video.url)}">${escapeHtml(video.title)}</a></h3>${metadata.length ? `<p class="meta">${metadata.map(escapeHtml).join(' / ')}</p>` : ''}<p>${escapeHtml(archiveSummary(video))}</p></article></li>`;
  }).join('')}</ol></section>`;
}

function experienceSchema(experience) {
  const canonical = `https://angelcreations.in${experience.route}`;
  const metadata = routeSeo[experience.route] || {};
  const title = metadata.title || `${experience.label} | Angel Creations`;
  const description = metadata.description || experience.summary;
  const imagePath = metadata.image || innerHeroVisuals[experience.route];
  const image = imagePath ? new URL(imagePath, 'https://angelcreations.in').href : undefined;
  const cluster = seoKeywords.parents[experience.route];
  const keywords = clusterSeoKeywords(cluster);
  const childDomains = domainRecords.filter((domain) => domain.parentRoute === experience.route);
  const graph = [
    organizationSchemaEntity,
    websiteSchemaEntity,
    {
      '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
      name: title, description, keywords,
      isPartOf: { '@id': 'https://angelcreations.in/#website' },
      about: { '@id': 'https://angelcreations.in/#organization' },
      mainEntity: { '@id': `${canonical}#service` },
      ...(image ? { primaryImageOfPage: { '@id': `${canonical}#primaryimage` } } : {}),
      breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-IN',
    },
    {
      '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
        { '@type': 'ListItem', position: 2, name: experience.label, item: canonical },
      ],
    },
    {
      '@type': 'Service', '@id': `${canonical}#service`, name: experience.label,
      alternateName: cluster?.aliases,
      serviceType: cluster?.focus || experience.label,
      description, keywords, url: canonical,
      provider: { '@id': 'https://angelcreations.in/#organization' },
      ...serviceDiscoveryFields,
      audience: (cluster?.audiences || []).map((audience) => ({ '@type': 'BusinessAudience', audienceType: audience })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${experience.label} services`,
        itemListElement: childDomains.map((domain) => ({
          '@type': 'Offer',
          itemOffered: { '@id': `https://angelcreations.in${domain.route}#service` },
        })),
      },
    },
    faqSchemaEntity(`${canonical}#faq`, staticExperienceFaqs(experience)),
  ];
  if (image) {
    graph.push({
      '@type': 'ImageObject',
      '@id': `${canonical}#primaryimage`,
      url: image,
      contentUrl: image,
      caption: metadata.imageAlt || title,
      inLanguage: 'en-IN',
    });
  }
  graph.push({
    '@type': 'ItemList',
    '@id': `${canonical}#domain-service-list`,
    name: `${experience.label} domain services`,
    numberOfItems: childDomains.length,
    itemListElement: childDomains.map((domain, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        '@id': `https://angelcreations.in${domain.route}#service`,
        name: `${domain.contextualTitle} — ${domain.parentLabel}`,
        alternateName: domain.seoAliases,
        url: `https://angelcreations.in${domain.route}`,
      },
    })),
  });
  return jsonLdScript({ '@context': 'https://schema.org', '@graph': graph });
}

function experienceWork(experience) {
  if (!experience.workTitleTerms?.length) return [];
  return videos.filter((video) => experience.workTitleTerms.some((term) => video.title.toLowerCase().includes(term.toLowerCase()))).slice(0, 3);
}

function experienceServiceGuideMarkup(experience) {
  const childDomains = domainRecords.filter((domain) => domain.parentRoute === experience.route);
  const contactHref = experienceLeadHref(experience);
  return `<section><h2>Specialist ${escapeHtml(experience.label)} services</h2><ul>${childDomains.map((domain) => `<li><a href="${domain.route}">${escapeHtml(domain.contextualTitle)}</a></li>`).join('')}</ul>${faqFallbackMarkup(`${experience.label} FAQs`, staticExperienceFaqs(experience))}<p>Planning a project? <a href="${escapeHtml(contactHref)}">Get a free ${escapeHtml(experience.label)} project roadmap</a>.</p></section>`;
}

function metaverseFallback(experience, previous, next) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const related = metaverseContent.relatedCapabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean);
  const possibilities = metaverseContent.experienceTypes.map((type) => `<section><h3>${escapeHtml(type.title)}</h3><p>${escapeHtml(type.description)}</p>${type.applications.length ? list(type.applications) : ''}${type.closing ? `<p>${escapeHtml(type.closing)}</p>` : ''}</section>`).join('');
  const layer = `<dl>${metaverseContent.experienceLayer.map(([term, definition]) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd>`).join('')}</dl>`;
  const map = experienceMaps['/metaverse/'];
  const mapMarkup = map ? `<p class="eyebrow">Experience map / explore</p><h2>${escapeHtml(map.title)}</h2><p>${escapeHtml(map.intro)}</p>${list(map.steps.map(([title, description]) => `${title} — ${description}`))}` : '';
  return `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p>${metaverseContent.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<h2>Virtual worlds, built around an idea.</h2>${metaverseContent.worldStatement.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${mapMarkup}<h2>What can a metaverse experience become?</h2>${possibilities}<h2>The experience layer</h2><p>A virtual world is only as valuable as the experience inside it. We consider:</p>${layer}<h2>Who can use it?</h2><p>Metaverse experiences can support:</p>${list(metaverseContent.whoCanUse)}<h2>From idea to world</h2><p>A metaverse project can begin with a simple question:</p><p>What if this existed somewhere people could enter?</p><p>From there, the experience can evolve through:</p><p>${escapeHtml(metaverseContent.evolution.join(' → '))}</p><p class="eyebrow">Show the work</p><h2>${escapeHtml(map?.work?.title || 'Show the work')}</h2>${map?.work?.bridge ? `<p>${escapeHtml(map.work.bridge)}</p>` : ''}<p>Explore the complete <a href="/works/">Works archive</a> to see related productions.</p><p class="eyebrow">The disciplines behind the experience</p><h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul><h2>Original Metaverse environment</h2><p>Explore the original MetaScore Unity WebGL environment. JavaScript is required to load this interactive experience.</p><h2>Let’s build a world.</h2><p>Have an idea that deserves more than a screen? <a href="${escapeHtml(experienceLeadHref(experience))}">Start a conversation with Angel Creations.</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to ${escapeHtml(experience.label)}</a> / <a href="${previous.route}">Previous: ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
}

function storyFallback(experience, story, previous, next, workMarkup) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const entries = (items) => `<ol class="archive">${items.map((item) => `<li><article><h3>${escapeHtml(item.title)}</h3>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}${item.statement ? `<p>${escapeHtml(item.statement)}</p>` : ''}${item.items?.length ? list(item.items) : ''}${item.closing ? `<p>${escapeHtml(item.closing)}</p>` : ''}</article></li>`).join('')}</ol>`;
  const sections = story.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''}${section.paragraphs?.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') ?? ''}${section.statement ? `<p>${escapeHtml(section.statement)}</p>` : ''}${section.items?.length ? list(section.items) : ''}${section.entries?.length ? entries(section.entries) : ''}${section.sequence?.length ? `<p>${escapeHtml(section.sequence.join(' → '))}</p>` : ''}${section.closing ? `<p>${escapeHtml(section.closing)}</p>` : ''}</section>`).join('');
  const related = story.relatedCapabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean);
  const map = experienceMaps[experience.route];
  const mapMarkup = map ? `<section><p class="eyebrow">Experience map / explore</p><h2>${escapeHtml(map.title)}</h2><p>${escapeHtml(map.intro)}</p>${list(map.steps.map(([title, description]) => `${title} — ${description}`))}</section>` : '';
  return `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p><p>${escapeHtml(experience.summary)}</p>${mapMarkup}${sections}<p class="eyebrow">Show the work</p><h2>${escapeHtml(map?.work?.title || 'Show the work')}</h2>${map?.work?.bridge ? `<p>${escapeHtml(map.work.bridge)}</p>` : ''}${workMarkup}<p class="eyebrow">The disciplines behind the experience</p><h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul><h2>${escapeHtml(story.cta.lead)}</h2><p><a href="${escapeHtml(experienceLeadHref(experience))}">${escapeHtml(story.cta.action)}</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to ${escapeHtml(experience.label)}</a> / <a href="${previous.route}">Previous: ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
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
  const workMarkup = work.length ? `<ol class="archive">${work.map((record) => `<li><article><h3><a href="${escapeHtml(record.url)}">${escapeHtml(record.title)}</a></h3><p>${escapeHtml(archiveSummary(record))}</p></article></li>`).join('')}</ol>` : `<p>Explore the complete <a href="/works/">Works archive</a> to see related productions.</p>`;
  const story = experienceStories[experience.route];
  const artifact = experience.hasUnityArtifact ? `<h2>Original Metaverse environment</h2><p>Explore the original MetaScore Unity WebGL environment. JavaScript is required to load this interactive experience.</p>` : '';
  const defaultFallback = `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(experience.label)}</p><h1>${escapeHtml(experience.label)}</h1><p class="lead">${escapeHtml(experience.heading)}</p><p>${escapeHtml(experience.summary)}</p><h2>What we create</h2><p>A focused toolkit for stories, spaces and experiences.</p>${list(experience.creates)}<h2>How we work</h2><p>Usability, creativity, aesthetics and craft guide every commission, built through collaboration, shared ambition and mutual respect.</p><h2>Where it creates value</h2><p>Formats and settings where this craft can help people learn, explore, decide and connect.</p>${list(experience.applications)}<h2>Show the work</h2>${workMarkup}<h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul>${artifact}<h2>Start a conversation</h2><p><a href="${escapeHtml(experienceLeadHref(experience))}">Start a project</a></p><nav aria-label="Continue through Angel experiences"><a href="/">Return to ${escapeHtml(experience.label)}</a> / <a href="${previous.route}">Previous: ${escapeHtml(previous.label)}</a> / <span aria-current="page">Current: ${escapeHtml(experience.label)}</span> / <a href="${next.route}">Next: ${escapeHtml(next.label)}</a></nav></main>${staticLegalLinks()}`;
  const baseFallback = experience.route === '/metaverse/' ? metaverseFallback(experience, previous, next) : story ? storyFallback(experience, story, previous, next, workMarkup) : defaultFallback;
  const fallback = baseFallback.replace('</main>', `${experienceServiceGuideMarkup(experience)}</main>`);
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
  const fallback = `${staticNavigation()}<main><p class="eyebrow">Angel Creations</p><h1>${escapeHtml(h1)}</h1>${description ? `<p class="lead">${escapeHtml(description)}</p>` : ''}${headings.map((heading) => `<h2>${escapeHtml(heading)}</h2>`).join('')}${sourceParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${page.route === '/about/' ? renderCapabilityIndex() : ''}${page.route === '/works/' ? renderVideoArchive() : ''}</main>${staticLegalLinks()}`;
  return documentShell({ title, description, canonical, robots: page.robots, ogTitle: shareTitle, image, imageAlt, schema: page.route === '/works/' ? `${sourceSchema(page)}\n${worksVideoSchema()}` : sourceSchema(page), fallback });
}

function domainSchema(domain) {
  const canonical = `https://angelcreations.in${domain.route}`;
  const parentCanonical = `https://angelcreations.in${domain.parentRoute}`;
  const image = new URL(domain.image, 'https://angelcreations.in').href;
  const relatedRoutes = [
    domain.parentRoute,
    ...domainRecords.filter((item) => item.parentRoute === domain.parentRoute && item.route !== domain.route).slice(0, 5).map((item) => item.route),
  ];
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchemaEntity,
      websiteSchemaEntity,
      {
        '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
        name: domain.seoTitle, description: domain.seoDescription, keywords: domain.seoKeywords,
        isPartOf: { '@id': 'https://angelcreations.in/#website' },
        about: { '@id': `${canonical}#service` },
        primaryImageOfPage: { '@id': `${canonical}#primaryimage` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
          { '@type': 'ListItem', position: 2, name: domain.parentLabel, item: parentCanonical },
          { '@type': 'ListItem', position: 3, name: domain.contextualTitle, item: canonical },
        ],
      },
      {
        '@type': 'Service', '@id': `${canonical}#service`,
        name: `${domain.contextualTitle} — ${domain.parentLabel}`,
        alternateName: domain.seoAliases,
        serviceType: domain.seoFocus,
        description: domain.seoDescription, keywords: domain.seoKeywords, url: canonical,
        provider: { '@id': 'https://angelcreations.in/#organization' },
        ...serviceDiscoveryFields,
        audience: domain.audiences.map((audience) => ({ '@type': 'BusinessAudience', audienceType: audience })),
        isRelatedTo: relatedRoutes.map((route) => ({ '@id': `https://angelcreations.in${route}#service` })),
      },
      {
        '@type': 'ImageObject', '@id': `${canonical}#primaryimage`,
        url: image, contentUrl: image,
        caption: domain.imageAlt,
        inLanguage: 'en-IN',
      },
      faqSchemaEntity(`${canonical}#faq`, staticDomainFaqs(domain)),
    ],
  });
}

function domainDocument(domain) {
  const canonical = `https://angelcreations.in${domain.route}`;
  const image = new URL(domain.image, 'https://angelcreations.in').href;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const map = experienceMaps[domain.parentRoute];
  const siblings = domainRecords.filter((item) => item.parentRoute === domain.parentRoute && item.route !== domain.route).slice(0, 6);
  const related = domain.parent.capabilityRoutes.map((route) => capabilityRecords.find((capability) => capability.route === route)).filter(Boolean).slice(0, 4);
  const journey = map ? `<h2>${escapeHtml(map.title)}</h2><p>${escapeHtml(map.intro)}</p>${list(map.steps.map(([title, description]) => `${title} — ${description}`))}` : '';
  const contactHref = leadContactHref({
    discipline: enquiryDisciplineByExperienceRoute[domain.parentRoute] || 'Custom Multi-Discipline Commission',
    sourceRoute: domain.route,
    topic: domain.contextualTitle,
    goal: domain.subtitle,
  });
  const faqMarkup = faqFallbackMarkup(`${domain.contextualTitle} FAQs`, staticDomainFaqs(domain));
  const fallback = `${staticNavigation()}<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="${domain.parentRoute}">${escapeHtml(domain.parentLabel)}</a> / <span aria-current="page">${escapeHtml(domain.title)}</span></nav><p class="eyebrow">${escapeHtml(domain.parentLabel)} Services in India</p><h1>${escapeHtml(domain.contextualTitle)}</h1><p class="lead">${escapeHtml(domain.subtitle)}</p><p>${escapeHtml(domain.description)}</p><h2>${escapeHtml(domain.contextualTitle)} services in India</h2><h2>What our ${escapeHtml(domain.contextualTitle)} services can include</h2>${list(domain.deliverables)}${domain.closing ? `<p>${escapeHtml(domain.closing)}</p>` : ''}<h2>Where ${escapeHtml(domain.title)} can live</h2>${list(domain.formats)}<h2>Who ${escapeHtml(domain.title)} can serve</h2>${list(domain.audiences)}${journey}${faqMarkup}<h2>Related capabilities</h2><ul>${related.map((capability) => `<li><a href="${capability.route}">${escapeHtml(capability.title)}</a></li>`).join('')}</ul><h2>Related ${escapeHtml(domain.parentLabel)} services</h2><ul>${siblings.map((sibling) => `<li><a href="${sibling.route}">${escapeHtml(sibling.contextualTitle)}</a></li>`).join('')}</ul><p><a href="/domains/">Explore all 63 XR, animation, film and brand services</a> or <a href="${escapeHtml(contactHref)}">get a free ${escapeHtml(domain.title)} project roadmap</a>.</p></main>${staticLegalLinks()}`;
  return documentShell({ title: domain.seoTitle, description: domain.seoDescription, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: domain.seoTitle, image, imageAlt: domain.imageAlt, schema: domainSchema(domain), fallback });
}

function domainIndexSchema() {
  const canonical = 'https://angelcreations.in/domains/';
  const metadata = routeSeo['/domains/'] || {};
  const keywords = uniqueSeoTerms([
    ...clusterSeoKeywords(seoKeywords.organization),
    ...slideExperiences.map((experience) => seoKeywords.parents[experience.route]?.focus),
  ], 24);
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchemaEntity,
      websiteSchemaEntity,
      {
        '@type': 'CollectionPage', '@id': `${canonical}#webpage`, url: canonical,
        name: metadata.title || '63 XR, Animation, Film & Brand Services | Angel Creations',
        description: metadata.description || 'Explore 63 specialist services across VR, AR, metaverse, animation, brand campaigns and media production. Compare deliverables and start your project.',
        keywords,
        isPartOf: { '@id': 'https://angelcreations.in/#website' },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
          { '@type': 'ListItem', position: 2, name: 'Domains', item: canonical },
        ],
      },
      {
        '@type': 'ItemList', '@id': `${canonical}#domain-service-list`,
        name: 'Angel Creations domains', numberOfItems: domainRecords.length,
        itemListElement: domainRecords.map((domain, index) => ({
          '@type': 'ListItem', position: index + 1,
          item: {
            '@type': 'Service',
            '@id': `https://angelcreations.in${domain.route}#service`,
            name: `${domain.contextualTitle} — ${domain.parentLabel}`,
            alternateName: domain.seoAliases,
            url: `https://angelcreations.in${domain.route}`,
          },
        })),
      },
    ],
  });
}

function domainIndexDocument() {
  const metadata = routeSeo['/domains/'] || {};
  const groups = slideExperiences.map((parent) => {
    const items = domainRecords.filter((domain) => domain.parentRoute === parent.route);
    return `<section><h2><a href="${parent.route}">${escapeHtml(parent.label)} services</a></h2><p>${escapeHtml(parent.summary)}</p><ul>${items.map((domain) => `<li><a href="${domain.route}">${escapeHtml(domain.contextualTitle)}</a> — ${escapeHtml(domain.subtitle)}</li>`).join('')}</ul></section>`;
  }).join('');
  const fallback = `${staticNavigation()}<main><p class="eyebrow">XR, Animation, VFX & Film Services in India</p><h1>Every domain. Every world we can build.</h1><p>Explore ${domainRecords.length} specialised services from a Jaipur-based studio working across India and worldwide—covering metaverse development, mixed reality, VR, AR and WebAR, 2D and 3D animation, VFX, brand films, ad campaigns, film and video production.</p>${groups}</main>${staticLegalLinks()}`;
  return documentShell({
    title: metadata.title || '63 XR, Animation, Film & Brand Services | Angel Creations',
    description: metadata.description || 'Explore 63 specialist services across VR, AR, metaverse, animation, brand campaigns and media production. Compare deliverables and start your project.',
    canonical: 'https://angelcreations.in/domains/',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogTitle: metadata.shareTitle || metadata.title || 'Every domain. Every world we can build.',
    image: `https://angelcreations.in${metadata.image || '/media/social/og/domains.jpg'}`,
    imageAlt: metadata.imageAlt || 'Angel Creations domain directory artwork with the headline “Every domain. Every world we can build.”',
    schema: domainIndexSchema(),
    fallback,
  });
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
  const specialistDomains = (capability.domainRoutes || [])
    .map((route) => domainRecords.find((domain) => domain.route === route))
    .filter(Boolean);
  const contactHref = leadContactHref({
    discipline: enquiryDisciplineByCapabilityRoute[capability.route] || 'Custom Multi-Discipline Commission',
    sourceRoute: capability.route,
    topic: capability.title,
    goal: description,
  });
  const specialistMarkup = specialistDomains.length
    ? `<h2>${escapeHtml(capability.title)} services by domain</h2><ul>${specialistDomains.map((domain) => `<li><a href="${domain.route}">${escapeHtml(domain.contextualTitle)}</a> — ${escapeHtml(domain.subtitle)}</li>`).join('')}</ul>`
    : '';
  const faqMarkup = faqFallbackMarkup(`Before you brief ${capability.title}`, staticCapabilityFaqs(capability));
  const fallback = `${staticNavigation()}<main><p class="eyebrow">${escapeHtml(capability.eyebrow)}</p><h1>${escapeHtml(capability.title)}</h1><p>${escapeHtml(description)}</p><h2>What our ${escapeHtml(capability.title)} services create</h2><p>A focused toolkit for stories, spaces and experiences.</p>${list(capability.creates)}<h2>Where ${escapeHtml(capability.title)} creates value</h2><p>Formats and settings where this craft can help people learn, explore, decide and connect.</p>${list(capability.applications)}${specialistMarkup}${faqMarkup}<h2>From the archive</h2><p>Explore all 47 productions in the <a href="/works/">XR, animation, VFX and film Works archive</a>.</p><p>Ready to begin? <a href="${escapeHtml(contactHref)}">Get a free project roadmap</a>.</p></main>${staticLegalLinks()}`;
  return documentShell({ title, description, canonical, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', ogTitle: shareTitle, image, imageAlt, schema: capabilitySchema(capability), fallback });
}

function statusErrorDocument({ status, title, label, codeLabel, heading, description, footnote }) {
  const pageMarkup = `<main id="main" class="site-main angel-not-found"><section class="angel-not-found__layout" aria-labelledby="status-error-title"><div class="angel-not-found__visual" aria-hidden="true"><span class="angel-not-found__visual-label">SIGNAL / ${status}</span><span class="angel-not-found__orbit"></span><span class="angel-not-found__orbit angel-not-found__orbit--middle"></span><span class="angel-not-found__orbit angel-not-found__orbit--inner"></span><span class="angel-not-found__planet"><span>${status}</span><i></i></span><span class="angel-not-found__visual-coordinate">AC / ${status === 410 ? 'RETIRED' : 'STATUS'}</span></div><div class="angel-not-found__content"><p class="angel-not-found__eyebrow">Angel Creations <span>/ ${escapeHtml(label)}</span></p><p class="angel-not-found__code">${escapeHtml(codeLabel)} <span aria-hidden="true">—</span> ${status}</p><h1 id="status-error-title">${escapeHtml(heading)}</h1><p class="angel-not-found__description">${escapeHtml(description)}</p><nav class="angel-not-found__actions" aria-label="Continue exploring Angel Creations"><a href="/"><span>Back to home</span><span aria-hidden="true">↗</span></a><a href="/works/">Explore the work</a><a href="/contact/">Contact the studio</a></nav><p class="angel-not-found__footnote">${escapeHtml(footnote)} <span aria-hidden="true">·</span> KEEP EXPLORING</p></div></section></main>`;
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8">${analyticsHeadSnippet}<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${escapeHtml(title)}</title>${notFoundFallbackCss}</head><body>${gtmNoScript}${pageMarkup}</body></html>`;
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
  const fallback = `${staticNavigation()}<main><p class="eyebrow">Works / moved</p><h1>Continue to the Works archive.</h1><p><a href="/works/">Explore 47 Angel Creations productions.</a></p></main>${staticLegalLinks()}`;
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

await mkdir(new URL('domains/', dist), { recursive: true });
await writeFile(new URL('domains/index.html', dist), domainIndexDocument());

for (const domain of domainRecords) {
  const relative = domain.route.replace(/^\//, '');
  await mkdir(new URL(`${relative}`, dist), { recursive: true });
  await writeFile(new URL(`${relative}index.html`, dist), domainDocument(domain));
}

await writeFile(new URL('404.html', dist), notFoundDocument());
for (const [filename, html] of Object.entries(errorDocuments())) {
  await writeFile(new URL(filename, dist), html);
}
await mkdir(new URL('work/', dist), { recursive: true });
await writeFile(new URL('work/index.html', dist), worksAliasDocument());

function sitemapImageMarkup(imagePath, title) {
  if (!imagePath) return '';
  const imageUrl = new URL(imagePath, 'https://angelcreations.in').href;
  const imageTitle = String(title || '').replace(/\s+/g, ' ').trim();
  return `<image:image><image:loc>${escapeHtml(imageUrl)}</image:loc>${imageTitle ? `<image:title>${escapeHtml(imageTitle)}</image:title>` : ''}</image:image>`;
}
const sitemapEntries = [
  ...selectedPages.map((page) => ({
    url: page.canonical || `https://angelcreations.in${page.route}`,
    image: routeSeo[page.route]?.image,
    title: routeSeo[page.route]?.imageAlt || routeSeo[page.route]?.title || page.title,
  })),
  ...capabilityRecords.map((capability) => ({
    url: `https://angelcreations.in${capability.route}`,
    image: routeSeo[capability.route]?.image,
    title: routeSeo[capability.route]?.imageAlt || routeSeo[capability.route]?.title || capability.title,
  })),
  {
    url: 'https://angelcreations.in/domains/',
    image: routeSeo['/domains/']?.image,
    title: routeSeo['/domains/']?.imageAlt || routeSeo['/domains/']?.title,
  },
  ...domainRecords.map((domain) => ({
    url: `https://angelcreations.in${domain.route}`,
    image: domain.image,
    title: domain.imageAlt,
  })),
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapEntries.map((entry) => `  <url><loc>${escapeHtml(entry.url)}</loc>${sitemapImageMarkup(entry.image, entry.title)}</url>`).join('\n')}\n</urlset>\n`;
const robotsTxt = 'User-agent: *\nAllow: /\nSitemap: https://angelcreations.in/sitemap.xml\n';
const llmsTxt = [
  '# Angel Creations',
  '',
  '> Angel Creations is an XR, animation, VFX and film studio in Jaipur, Rajasthan, India, with an international client desk in Braintree, United Kingdom. The studio designs and produces metaverse and virtual worlds, VR, AR/WebAR and mixed-reality experiences, 2D and 3D animation, CGI and VFX, brand films, ad campaigns, film and video production for organisations across India and worldwide.',
  '',
  `Primary service focus: ${seoKeywords.organization.focus}.`,
  `Also described as: ${seoKeywords.organization.aliases.join('; ')}.`,
  `Core services: ${seoKeywords.organization.services.join('; ')}.`,
  `Service locations: ${seoKeywords.organization.locations.join('; ')}.`,
  '',
  '## Start a project',
  '',
  '- [Start a project enquiry](https://angelcreations.in/contact/): Share your goals, creative discipline, timeline, and contact details through the guided enquiry.',
  '- [View selected work](https://angelcreations.in/works/): Explore 47 productions across animation, VFX, architectural visualisation, commercials, live events, film and immersive media.',
  '- [Explore all 63 domains](https://angelcreations.in/domains/): Compare specialist services, deliverables and formats across seven experience areas.',
  '',
  '## Popular service searches',
  '',
  ...seoKeywords.popularSearches.map((item) => `- [${item.label}](https://angelcreations.in${item.route})`),
  '',
  '## Core experience areas',
  '',
  ...slideExperiences.map((experience) => {
    const cluster = seoKeywords.parents[experience.route];
    return `- [${cluster?.headline || experience.label}](https://angelcreations.in${experience.route}): ${experience.summary} Focus: ${cluster?.focus || experience.label}. Also searched as: ${(cluster?.aliases || []).join('; ')}. Services: ${(cluster?.services || []).join('; ')}. Audiences: ${(cluster?.audiences || []).join('; ')}.`;
  }),
  '',
  '## Studio capabilities',
  '',
  ...capabilityRecords.map((capability) => {
    const cluster = seoKeywords.capabilities[capability.route];
    return `- [${capability.title}](https://angelcreations.in${capability.route}): ${capability.overview} Focus: ${cluster?.focus || capability.title}. Also searched as: ${(cluster?.aliases || []).join('; ')}. Services: ${(cluster?.services || []).join('; ')}.`;
  }),
  '',
  '## Specialist domain services',
  '',
  ...domainRecords.map((domain) => `- [${domain.contextualTitle}](https://angelcreations.in${domain.route}): ${domain.seoDescription} Focus: ${domain.seoFocus}. Also known as: ${domain.seoAliases.slice(0, 4).join('; ')}.`),
  '',
  '## Contact',
  '',
  '- Business enquiries: business@angelcreations.in',
  '- Support: support@angelcreations.in',
  '- General: info@angelcreations.in',
  '- Telephone: +91 80584 65733',
  '- Studio: Jaipur, Rajasthan, India',
  '- International client desk: Braintree, United Kingdom',
  '',
].join('\n');
await Promise.all([
  writeFile(new URL('sitemap.xml', dist), sitemapXml),
  writeFile(new URL('robots.txt', dist), robotsTxt),
  writeFile(new URL('llms.txt', dist), llmsTxt),
  writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemapXml),
  writeFile(new URL('../public/robots.txt', import.meta.url), robotsTxt),
  writeFile(new URL('../public/llms.txt', import.meta.url), llmsTxt),
  // Incident fallbacks: Hostinger's document root is a git checkout. When its
  // GIT deployment resets public_html, Apache temporarily serves this source
  // tree instead of dist, moving public/robots.txt and public/sitemap.xml to
  // /public/... and returning 404 at the canonical crawler paths. Tracked root
  // copies keep Search Console verification, robots rules and the sitemap
  // available until the workflow restores the built site.
  writeFile(new URL('../sitemap.xml', import.meta.url), sitemapXml),
  writeFile(new URL('../robots.txt', import.meta.url), robotsTxt),
  writeFile(new URL('../googleb16a568f6f3a241d.html', import.meta.url), googleSiteVerification),
]);

console.log(`Generated ${selectedPages.length - 1} enhanced core, ${capabilityRecords.length} capability and ${domainRecords.length} domain static fallbacks, sitemap.xml, robots.txt and llms.txt.`);
