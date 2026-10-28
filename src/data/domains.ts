import rawStories from './experienceStories.json';
import rawMaps from './experienceMaps.json';
import rawVisuals from './explorerVisuals.json';
import metaverseContent from './metaverseContent.json';
import { slideExperiences, type SlideExperience } from './slideExperiences';
import { domainParentShort, domainSeoProfile } from '../utils/seoKeywords';

type RawDomainEntry = {
  title: string;
  description?: string;
  statement?: string;
  items?: string[];
  applications?: string[];
  closing?: string;
};

type RawStory = {
  sections: Array<{
    title: string;
    intro?: string;
    entries?: RawDomainEntry[];
  }>;
};

type RawVisual = {
  src: string;
  caption: string;
  subtitle?: string;
};

type RawVisualBundle = {
  hero: RawVisual;
  story?: RawVisual[];
  map: RawVisual[];
  applications: RawVisual[];
};

export type DomainJourneyStep = {
  title: string;
  description: string;
};

export type DomainRecord = {
  slug: string;
  route: string;
  title: string;
  contextualTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoFocus: string;
  seoAliases: string[];
  seoKeywords: string[];
  description: string;
  closing?: string;
  deliverables: string[];
  parent: SlideExperience;
  parentRoute: string;
  parentLabel: string;
  parentCategory: string;
  parentIndex: number;
  siblingIndex: number;
  siblingCount: number;
  image: string;
  imageAlt: string;
  imageCaption: string;
  subtitle: string;
  accent: string;
  accentSecondary: string;
  accentRgb: string;
  formats: string[];
  audiences: string[];
  principles: Array<{ title: string; description: string }>;
  journeyTitle: string;
  journeyIntro: string;
  journey: DomainJourneyStep[];
  enquiryDiscipline: string;
  searchTerms: string[];
};

const stories = rawStories as unknown as Record<string, RawStory>;
const visuals = rawVisuals as unknown as Record<string, RawVisualBundle>;
const maps = rawMaps as unknown as Record<string, {
  title: string;
  intro: string;
  steps: [string, string][];
}>;

const PARENT_META: Record<string, {
  category: string;
  accent: string;
  accentSecondary: string;
  accentRgb: string;
  enquiryDiscipline: string;
  formats: string[];
  audiences: string[];
  principles: Array<{ title: string; description: string }>;
}> = {
  '/metaverse/': {
    category: 'Spatial Worlds & Persistent Ecosystems',
    accent: '#7C5CFF',
    accentSecondary: '#38BDF8',
    accentRgb: '124, 92, 255',
    enquiryDiscipline: 'Metaverse',
    formats: ['Browser-based 3D worlds', 'VR-ready environments', 'Live virtual events', 'Community spaces', 'Interactive product worlds'],
    audiences: ['Brands and cultural institutions', 'Communities and creators', 'Education and enterprise teams', 'Event and entertainment producers'],
    principles: [
      { title: 'Presence before spectacle', description: 'Scale, sound, identity and movement are shaped so people feel inside the idea—not merely looking at it.' },
      { title: 'A reason to return', description: 'Live moments, evolving content and social rituals give the world a life beyond its launch day.' },
      { title: 'Designed for participation', description: 'Every space asks what people can do, make, discover or share together.' },
    ],
  },
  '/mixed-reality/': {
    category: 'Spatial Computing & Physical-Digital Fusion',
    accent: '#38BDF8',
    accentSecondary: '#C86BFF',
    accentRgb: '56, 189, 248',
    enquiryDiscipline: 'Mixed Reality (MR)',
    formats: ['Spatial headsets', 'Tablets and mobile devices', 'Installations and showrooms', 'Training spaces', 'Shared physical environments'],
    audiences: ['Operations and training teams', 'Designers and architects', 'Educators and researchers', 'Retail, media and entertainment teams'],
    principles: [
      { title: 'Respect the real room', description: 'Digital content is anchored to surfaces, objects, light and movement in the physical environment.' },
      { title: 'Natural interaction', description: 'Hands, gaze, voice and position replace complicated controls wherever possible.' },
      { title: 'Context at the moment of need', description: 'Useful information appears in place, at the right scale and only when it helps.' },
    ],
  },
  '/virtual-reality/': {
    category: 'Full-Immersion Simulation & Presence',
    accent: '#C86BFF',
    accentSecondary: '#FB7185',
    accentRgb: '200, 107, 255',
    enquiryDiscipline: 'Virtual Reality (VR)',
    formats: ['Standalone VR headsets', 'Location-based installations', 'Training simulators', '360° and 180° media', 'Interactive virtual environments'],
    audiences: ['Training and safety teams', 'Educators and cultural institutions', 'Healthcare and research teams', 'Entertainment and brand experience teams'],
    principles: [
      { title: 'Comfort is creative direction', description: 'Movement, pacing, scale and sound protect comfort while intensifying presence.' },
      { title: 'Learn by doing', description: 'Embodied choices and feedback turn observation into memorable understanding.' },
      { title: 'Presence with purpose', description: 'Immersion is used where being there changes the story, decision or skill.' },
    ],
  },
  '/augment-reality/': {
    category: 'Mobile & Wearable Camera Overlays',
    accent: '#2DD4BF',
    accentSecondary: '#38BDF8',
    accentRgb: '45, 212, 191',
    enquiryDiscipline: 'Augmented Reality (AR)',
    formats: ['WebAR in the browser', 'Mobile and tablet apps', 'Packaging and print triggers', 'Retail and exhibition spaces', 'Location-based experiences'],
    audiences: ['Retail and consumer brands', 'Tourism and cultural organisations', 'Industrial and field teams', 'Educators, artists and media producers'],
    principles: [
      { title: 'Instant, useful access', description: 'The experience should be easy to launch on devices people already carry.' },
      { title: 'Locked to the real world', description: 'Tracking, scale and occlusion make digital layers feel present and trustworthy.' },
      { title: 'One clear next action', description: 'AR moments guide people to explore, understand, navigate or decide without friction.' },
    ],
  },
  '/animation/': {
    category: '2D, 3D, Character & Motion Craft',
    accent: '#FB7185',
    accentSecondary: '#FF7847',
    accentRgb: '251, 113, 133',
    enquiryDiscipline: '3D Animation & VFX',
    formats: ['Film and episodic content', 'Brand and product films', 'Interactive media', 'Social and broadcast', 'Spatial and real-time experiences'],
    audiences: ['Studios and producers', 'Brands and product teams', 'Educators and publishers', 'Game, XR and entertainment teams'],
    principles: [
      { title: 'Story leads technique', description: 'Style, timing and technology are chosen to serve the idea and the audience.' },
      { title: 'Performance in every frame', description: 'Weight, rhythm, expression and camera movement create believable emotion.' },
      { title: 'A pipeline built for iteration', description: 'Boards, animatics and reviews make creative decisions visible before final production.' },
    ],
  },
  '/brand-advertisement/': {
    category: 'Strategic Positioning & Campaign Systems',
    accent: '#FF7847',
    accentSecondary: '#FFC0D0',
    accentRgb: '255, 120, 71',
    enquiryDiscipline: 'Brand Advertisement',
    formats: ['Integrated campaigns', 'Film and social content', 'Out-of-home media', 'Product launches', 'Digital and experiential activations'],
    audiences: ['Founders and marketing leaders', 'Product launch teams', 'Agencies and media partners', 'Consumer, enterprise and cultural brands'],
    principles: [
      { title: 'One unmistakable idea', description: 'Every execution strengthens the same memorable thought.' },
      { title: 'Distinctive, not decorated', description: 'Visual and verbal choices are designed to be recognised as unmistakably yours.' },
      { title: 'Built as a system', description: 'Hero assets and everyday content share one flexible creative language.' },
    ],
  },
  '/media-production/': {
    category: 'Cinema, Broadcast, Live & Post Studio',
    accent: '#818CF8',
    accentSecondary: '#38BDF8',
    accentRgb: '129, 140, 248',
    enquiryDiscipline: 'Media Production',
    formats: ['Cinema and streaming', 'Broadcast television', 'Live events', 'Commercial and corporate media', 'Social and digital platforms'],
    audiences: ['Brands and institutions', 'Producers and broadcasters', 'Event organisers', 'Agencies and independent creators'],
    principles: [
      { title: 'Plan for the final frame', description: 'Script, capture and post-production decisions are connected from the first treatment.' },
      { title: 'Craft under pressure', description: 'Experienced production systems protect quality when schedules, locations and live moments are unforgiving.' },
      { title: 'Made for every screen', description: 'Masters and cutdowns are finished for the places audiences will actually watch.' },
    ],
  },
};

const SUPPLEMENTAL_DELIVERABLES: Record<string, string[]> = {
  '/metaverse/virtual-economies/': [
    'Participation and reward loops',
    'Digital ownership journeys',
    'Creator commerce touchpoints',
    'Virtual goods presentation',
    'Community incentive systems',
    'Experience analytics and tuning',
  ],
  '/brand-advertisement/explainer-communication/': [
    'Message architecture',
    'Script and storyboard development',
    'Product and system visualisation',
    'Motion graphics and animation',
    'Voice, music and sound design',
    'Channel-ready edits and cutdowns',
  ],
  '/media-production/television-production/': [
    'Format and episode development',
    'Multi-camera production planning',
    'Studio and location capture',
    'Editorial and graphics packages',
    'Broadcast-ready sound and colour finishing',
    'Delivery masters and archive versions',
  ],
};

const DOMAIN_DESCRIPTION_OVERRIDES: Record<string, string> = {
  '/metaverse/virtual-education/': 'Learning does not have to happen inside a rectangle. Virtual environments can create immersive campuses, labs and collaborative spaces where people learn by exploring together.',
  '/metaverse/virtual-workspaces/': 'Distributed teams can use shared virtual environments to meet, present, workshop and build together—wherever they are.',
  '/virtual-reality/architectural-visualization/': 'Walk through a place before it exists. VR helps people understand scale, light, material, movement and design intent at true human scale.',
  '/media-production/video-production/': 'Create visual content for brands, campaigns, corporate communication, events and digital platforms—planned, filmed and finished for the screens that matter.',
  '/media-production/film-production/': 'From concept development through production and post-production, film gives a story its most complete cinematic form.',
  '/media-production/media-consulting/': 'Not every project begins with a production brief. Sometimes the first question is which format, platform, story and production route will create the greatest value.',
};

export function slugifyDomainTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function domainRouteFor(parentRoute: string, title: string): string {
  return `${parentRoute}${slugifyDomainTitle(title)}/`;
}

function contextualTitle(parentRoute: string, parentLabel: string, title: string): string {
  if (parentRoute === '/mixed-reality/') {
    return title === 'Architecture & Design'
      ? 'Architecture & Design in Mixed Reality'
      : `Mixed Reality ${title}`;
  }
  if (parentRoute === '/virtual-reality/') {
    if (title.startsWith('VR ')) return title;
    if (title === 'Architectural Visualization') return 'VR Architectural Visualization';
    if (title === 'Healthcare') return 'VR for Healthcare';
    return `${title} in Virtual Reality`;
  }
  if (parentRoute === '/augment-reality/') {
    if (title.startsWith('AR ') || title.startsWith('Industrial AR')) return title;
    return `AR for ${title}`;
  }
  if (parentRoute === '/metaverse/' && title === 'Gaming') return 'Gaming in the Metaverse';
  if (parentRoute === '/brand-advertisement/' && title === 'Explainer Communication') return 'Brand Explainer Communication';
  return title || parentLabel;
}

function seoTitleFor(contextTitle: string, parentLabel: string, parentRoute: string): string {
  const context = contextTitle.toLowerCase();
  const parent = parentLabel.toLowerCase();
  const short = domainParentShort(parentRoute);
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
            `${contextTitle} Services in India | Angel Creations`,
            `${contextTitle} Animation Services | Angel Creations`,
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

  return candidates.find((candidate) => candidate && candidate.length <= 65) || `${contextTitle} | Angel Creations`;
}

function seoDescriptionFor(contextTitle: string, parentLabel: string, description: string, deliverables: string[], subtitle = ''): string {
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

function entriesForParent(parent: SlideExperience): RawDomainEntry[] {
  if (parent.route === '/metaverse/') {
    return metaverseContent.experienceTypes.map((entry) => ({
      title: entry.title,
      description: entry.description,
      items: entry.applications,
      closing: entry.closing,
    }));
  }
  return stories[parent.route]?.sections[2]?.entries ?? [];
}

function searchTermsFor(domain: Pick<DomainRecord, 'title' | 'contextualTitle' | 'parentLabel' | 'deliverables'>, parent: SlideExperience): string[] {
  const stopWords = new Set(['and', 'the', 'for', 'with', 'production', 'services', 'virtual', 'reality']);
  const words = `${domain.title} ${domain.contextualTitle}`
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  return [...new Set([domain.title, domain.contextualTitle, ...words, ...parent.workTitleTerms])];
}

export const domains: DomainRecord[] = slideExperiences.flatMap((parent, parentIndex) => {
  const entries = entriesForParent(parent);
  const meta = PARENT_META[parent.route];
  const parentMap = maps[parent.route];

  return entries.map((entry, siblingIndex) => {
    const route = domainRouteFor(parent.route, entry.title);
    const visual = visuals[parent.route]?.applications[siblingIndex] ?? visuals[parent.route]?.hero;
    const deliverables = (entry.items?.length ? entry.items : entry.applications?.length ? entry.applications : SUPPLEMENTAL_DELIVERABLES[route] ?? [])
      .filter(Boolean)
      .map((item) => item.replace(/^([a-z])/, (_, letter: string) => letter.toUpperCase()));
    const title = entry.title;
    const contextTitle = contextualTitle(parent.route, parent.label, title);
    const description = DOMAIN_DESCRIPTION_OVERRIDES[route] || entry.description || entry.statement || parent.summary;
    const subtitle = visual?.subtitle || visual?.caption || meta?.category || parent.label;
    const seoProfile = domainSeoProfile({
      route,
      title,
      contextualTitle: contextTitle,
      parentRoute: parent.route,
      parentLabel: parent.label,
      subtitle,
      deliverables,
      formats: meta?.formats ?? [],
      audiences: meta?.audiences ?? [],
    });
    const partial = {
      title,
      contextualTitle: contextTitle,
      parentLabel: parent.label,
      deliverables,
    };

    return {
      slug: slugifyDomainTitle(title),
      route,
      title,
      contextualTitle: contextTitle,
      seoTitle: seoTitleFor(contextTitle, parent.label, parent.route),
      seoDescription: seoDescriptionFor(contextTitle, parent.label, description, deliverables, subtitle),
      seoFocus: seoProfile.focus,
      seoAliases: seoProfile.aliases,
      seoKeywords: seoProfile.keywords,
      description,
      closing: entry.closing,
      deliverables,
      parent,
      parentRoute: parent.route,
      parentLabel: parent.label,
      parentCategory: meta?.category ?? parent.label,
      parentIndex,
      siblingIndex,
      siblingCount: entries.length,
      image: visual?.src ?? parent.poster ?? '/media/social/og/home.jpg',
      imageAlt: `${contextTitle} service visual by Angel Creations — ${subtitle}`,
      imageCaption: visual?.caption ?? contextTitle,
      subtitle,
      accent: meta?.accent ?? '#7DD3FC',
      accentSecondary: meta?.accentSecondary ?? '#A78BFA',
      accentRgb: meta?.accentRgb ?? '125, 211, 252',
      formats: meta?.formats ?? [],
      audiences: meta?.audiences ?? [],
      principles: meta?.principles ?? [],
      journeyTitle: parentMap?.title ?? `How ${parent.label} takes shape`,
      journeyIntro: parentMap?.intro ?? parent.summary,
      journey: (parentMap?.steps ?? []).map(([stepTitle, stepDescription]) => ({
        title: stepTitle,
        description: stepDescription,
      })),
      enquiryDiscipline: meta?.enquiryDiscipline ?? parent.label,
      searchTerms: searchTermsFor(partial as Pick<DomainRecord, 'title' | 'contextualTitle' | 'parentLabel' | 'deliverables'>, parent),
    };
  });
});

export function domainForRoute(route: string): DomainRecord | undefined {
  return domains.find((domain) => domain.route === route);
}

export function domainsForParent(parentRoute: string): DomainRecord[] {
  return domains.filter((domain) => domain.parentRoute === parentRoute);
}

export function siblingDomains(domain: DomainRecord): DomainRecord[] {
  return domainsForParent(domain.parentRoute).filter((item) => item.route !== domain.route);
}

export function domainFaqs(domain: DomainRecord): Array<{ question: string; answer: string }> {
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

export function domainsForCapability(capabilityRoute: string): DomainRecord[] {
  return domains.filter((domain) => domain.parent.capabilityRoutes.includes(capabilityRoute));
}
