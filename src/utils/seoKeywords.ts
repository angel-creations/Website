import rawSeoKeywords from '../data/seoKeywords.json';
import type { SlideExperience } from '../data/slideExperiences';

export type SeoCluster = {
  label?: string;
  focus: string;
  headline?: string;
  aliases: string[];
  services: string[];
  audiences: string[];
  longTail: string[];
  locations?: string[];
};

type ParentTermSet = {
  short: string;
  provider: string;
  serviceSuffixes: string[];
  synonyms: string[];
};

type SeoKeywordData = {
  organization: SeoCluster & { locations: string[] };
  parents: Record<string, SeoCluster>;
  capabilities: Record<string, Omit<SeoCluster, 'headline'>>;
  domainParentTerms: Record<string, ParentTermSet>;
  domainOverrides: Record<string, string[]>;
  popularSearches: Array<{ label: string; route: string }>;
};

const seoKeywordData = rawSeoKeywords as SeoKeywordData;

export const ORGANIZATION_SEO = seoKeywordData.organization;
export const POPULAR_SERVICE_SEARCHES = seoKeywordData.popularSearches;

export function parentSeoCluster(route: string): SeoCluster | undefined {
  return seoKeywordData.parents[route];
}

export function capabilitySeoCluster(route: string): Omit<SeoCluster, 'headline'> | undefined {
  return seoKeywordData.capabilities[route];
}

export function domainParentShort(route: string): string | undefined {
  return seoKeywordData.domainParentTerms[route]?.short;
}

function normaliseTerm(value: string): string {
  return value
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueTerms(values: Array<string | undefined>, limit = 16): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const term = normaliseTerm(value || '');
    const key = term.toLowerCase();
    if (!term || seen.has(key)) return;
    seen.add(key);
    output.push(term);
  });

  return output.slice(0, limit);
}

function alternateTechnologyNames(contextTitle: string): string[] {
  const terms = [contextTitle];

  if (/Virtual Reality/i.test(contextTitle)) {
    terms.push(contextTitle.replace(/Virtual Reality/gi, 'VR'));
  }
  if (/\bVR\b/.test(contextTitle)) {
    terms.push(contextTitle.replace(/\bVR\b/g, 'Virtual Reality'));
  }
  if (/Augmented Reality/i.test(contextTitle)) {
    terms.push(contextTitle.replace(/Augmented Reality/gi, 'AR'));
  }
  if (/\bAR\b/.test(contextTitle)) {
    terms.push(contextTitle.replace(/\bAR\b/g, 'Augmented Reality'));
  }
  if (/Mixed Reality/i.test(contextTitle)) {
    terms.push(contextTitle.replace(/Mixed Reality/gi, 'MR'));
  }
  if (/Visual Effects/i.test(contextTitle)) {
    terms.push(contextTitle.replace(/Visual Effects/gi, 'VFX'));
  }
  if (/\bVFX\b/i.test(contextTitle)) {
    terms.push(contextTitle.replace(/\bVFX\b/gi, 'Visual Effects'));
  }

  return terms;
}

export type DomainSeoSource = {
  route: string;
  title: string;
  contextualTitle: string;
  parentRoute: string;
  parentLabel: string;
  subtitle: string;
  deliverables: string[];
  formats: string[];
  audiences: string[];
};

export type DomainSeoProfile = {
  focus: string;
  aliases: string[];
  keywords: string[];
};

export function domainSeoProfile(domain: DomainSeoSource): DomainSeoProfile {
  const cluster = parentSeoCluster(domain.parentRoute);
  const parentTerms = seoKeywordData.domainParentTerms[domain.parentRoute];
  const overrides = seoKeywordData.domainOverrides[domain.route] || [];
  const context = normaliseTerm(domain.contextualTitle);
  const title = normaliseTerm(domain.title);
  const contextLower = context.toLowerCase();
  const titleLower = title.toLowerCase();
  const short = parentTerms?.short;
  const shortWithTitle = short && /^[A-Z]{2,3}$/.test(short) && !titleLower.includes(short.toLowerCase()) && !contextLower.includes(short.toLowerCase())
    ? `${short} ${title}`
    : undefined;
  const focus = `${context} services in India`;

  const aliases = uniqueTerms([
    ...overrides,
    ...alternateTechnologyNames(context),
    shortWithTitle,
  ], 9);

  const contextWords = new Set(contextLower.split(/[^a-z0-9]+/).filter(Boolean));
  const suffixTerms = (parentTerms?.serviceSuffixes || ['services'])
    .filter((suffix) => !contextWords.has(suffix.split(/\s+/)[0].toLowerCase()))
    .map((suffix) => `${context} ${suffix}`);
  const deliverableTerms = domain.deliverables
    .filter((item) => item.length <= 58 && item.trim().includes(' '))
    .slice(0, 3)
    .map((item) => normaliseTerm(item));
  const audienceTerms = domain.audiences.slice(0, 2).map((audience) => `${context} for ${audience.toLowerCase()}`);
  const formatTerms = domain.formats.slice(0, 2).map((format) => `${context} for ${format.toLowerCase()}`);

  const keywords = uniqueTerms([
    focus,
    `${context} company in India`,
    `${context} services in Jaipur`,
    `${context} services`,
    ...overrides,
    ...suffixTerms,
    ...deliverableTerms,
    ...audienceTerms,
    ...formatTerms,
    cluster?.focus,
  ], 16);

  return { focus, aliases, keywords };
}

export function naturalSeoList(values: string[]): string {
  return values
    .map((value) => value
      .toLowerCase()
      .replace(/\bwebar\b/g, 'WebAR')
      .replace(/\b(vr|ar|mr|xr|vfx|cgi|2d|3d)\b/g, (match) => match.toUpperCase())
      .replace(/\bindia\b/g, 'India')
      .replace(/\bjaipur\b/g, 'Jaipur'))
    .join(', ');
}

export function experienceSeoFaqs(
  experience: SlideExperience,
  _domainTitles: string[] = []
): Array<{ question: string; answer: string }> {
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
      answer: `Yes. Angel Creations is based in Jaipur, Rajasthan, works with clients across India, and has an international client desk in Braintree, United Kingdom for projects delivered worldwide.`,
    },
    {
      question: `How much does a ${experience.label} project cost?`,
      answer: `Cost depends on creative scope, number of environments or scenes, interactivity, platforms, production locations, timeline and finishing requirements. The free roadmap first separates a useful prototype from the full production scope so investment can be discussed responsibly.`,
    },
    {
      question: `How does a ${experience.label} project start?`,
      answer: `Share the audience, goal, preferred format and launch timeline through the project brief. We then shape the creative direction, prototype the defining moment, test it in context and expand into full production.`,
    },
  ];
}

export function clusterKeywords(cluster: SeoCluster | undefined): string[] {
  if (!cluster) return [];
  return uniqueTerms([
    cluster.focus,
    ...(cluster.aliases || []),
    ...(cluster.services || []),
    ...(cluster.longTail || []),
  ], 20);
}
