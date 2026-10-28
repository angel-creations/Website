export const LEAD_BUSINESS_EMAIL = 'business@angelcreations.in';
export const LEAD_SUPPORT_EMAIL = 'support@angelcreations.in';
export const LEAD_PHONE_DISPLAY = '+91 80584 65733';
export const LEAD_PHONE_HREF = 'tel:+918058465733';
export const LEAD_DRAFT_STORAGE_KEY = 'angel-creations:lead-draft:v1';
export const LEAD_ATTRIBUTION_STORAGE_KEY = 'angel-creations:lead-attribution:v1';

export type LeadIntent = 'project-roadmap' | 'discovery-call' | 'scope-estimate' | 'general-project';

export type LeadContactContext = {
  discipline?: string;
  intent?: LeadIntent;
  sourceRoute?: string;
  topic?: string;
  goal?: string;
};

export type LeadAttribution = {
  firstLandingPage?: string;
  lastLandingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  capturedAt?: string;
};

export const LEAD_INTENTS: Record<LeadIntent, {
  label: string;
  shortLabel: string;
  promise: string;
  outcome: string;
  subjectPrefix: string;
}> = {
  'project-roadmap': {
    label: 'Free Project Roadmap',
    shortLabel: 'Project roadmap',
    promise: 'Turn an early idea into a clear creative and production route.',
    outcome: 'Recommended concept direction, experience format, prototype milestone and production path.',
    subjectPrefix: 'Project roadmap request',
  },
  'discovery-call': {
    label: 'Discovery Call',
    shortLabel: 'Discovery call',
    promise: 'Prepare a focused conversation with the studio before you call or email.',
    outcome: 'A concise call brief covering goals, audience, format, timeline and decision points.',
    subjectPrefix: 'Discovery call request',
  },
  'scope-estimate': {
    label: 'Scope & Estimate',
    shortLabel: 'Scope and estimate',
    promise: 'Organise the information needed to scope deliverables and discuss investment responsibly.',
    outcome: 'A structured estimate brief with deliverables, timeline, assumptions and open decisions.',
    subjectPrefix: 'Scope and estimate request',
  },
  'general-project': {
    label: 'Start a Project',
    shortLabel: 'Project enquiry',
    promise: 'Share the idea and let the studio help choose the right format and first step.',
    outcome: 'A clear project brief ready for a producer conversation.',
    subjectPrefix: 'New project enquiry',
  },
};

export const EXPERIENCE_DISCIPLINES: Record<string, string> = {
  '/metaverse/': 'Metaverse',
  '/mixed-reality/': 'Mixed Reality (MR)',
  '/virtual-reality/': 'Virtual Reality (VR)',
  '/augment-reality/': 'Augmented Reality (AR)',
  '/animation/': '3D Animation & VFX',
  '/brand-advertisement/': 'Brand Advertisement',
  '/media-production/': 'Media Production',
};

export const CAPABILITY_DISCIPLINES: Record<string, string> = {
  '/capabilities/brand/': 'Brand Advertisement',
  '/capabilities/design/': 'Custom Multi-Discipline Commission',
  '/capabilities/content/': 'Custom Multi-Discipline Commission',
  '/capabilities/film/': 'Media Production',
  '/capabilities/animation-3d/': '3D Animation & VFX',
  '/capabilities/digital/': 'Custom Multi-Discipline Commission',
  '/capabilities/experiences/': 'Experiential Installation',
  '/capabilities/creative-technology/': 'Custom Multi-Discipline Commission',
};

const ATTRIBUTION_PARAMS = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_term', 'utmTerm'],
  ['utm_content', 'utmContent'],
  ['gclid', 'gclid'],
  ['fbclid', 'fbclid'],
  ['msclkid', 'msclkid'],
] as const;

function cleanParam(value: string | undefined, maxLength = 140): string | undefined {
  const cleaned = value?.replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function readStoredAttribution(): LeadAttribution {
  try {
    const raw = window.sessionStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) as LeadAttribution : {};
  } catch {
    return {};
  }
}

export function buildContactHref(context: LeadContactContext = {}): string {
  const params = new URLSearchParams();
  const discipline = cleanParam(context.discipline, 90);
  const topic = cleanParam(context.topic, 140);
  const goal = cleanParam(context.goal, 180);
  const source = cleanParam(context.sourceRoute, 140);

  if (discipline) params.set('discipline', discipline);
  if (context.intent) params.set('intent', context.intent);
  if (source) params.set('source', source);
  if (topic) params.set('topic', topic);
  if (goal) params.set('goal', goal);

  const query = params.toString();
  return query ? `/contact/?${query}` : '/contact/';
}

export function disciplineForExperienceRoute(route: string): string {
  return EXPERIENCE_DISCIPLINES[route] || 'Custom Multi-Discipline Commission';
}

export function disciplineForCapabilityRoute(route: string): string {
  return CAPABILITY_DISCIPLINES[route] || 'Custom Multi-Discipline Commission';
}

export function captureLeadAttribution(): LeadAttribution {
  if (typeof window === 'undefined') return {};

  const existing = readStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  const currentPage = `${window.location.pathname}${window.location.search}`;
  const next: LeadAttribution = {
    ...existing,
    firstLandingPage: existing.firstLandingPage || currentPage,
    lastLandingPage: currentPage,
    referrer: existing.referrer || cleanParam(document.referrer || undefined, 240),
    capturedAt: new Date().toISOString(),
  };

  ATTRIBUTION_PARAMS.forEach(([param, key]) => {
    const value = cleanParam(params.get(param) || undefined, 160);
    if (value) next[key] = value;
  });

  try {
    window.sessionStorage.setItem(LEAD_ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Attribution is an optimisation layer; the enquiry remains fully usable without storage.
  }

  return next;
}

export function getLeadAttribution(): LeadAttribution {
  if (typeof window === 'undefined') return {};
  return readStoredAttribution();
}

export function formatLeadAttribution(attribution: LeadAttribution): string[] {
  const lines: Array<[string, string | undefined]> = [
    ['First landing page', attribution.firstLandingPage],
    ['Latest landing page', attribution.lastLandingPage],
    ['Referrer', attribution.referrer],
    ['UTM source', attribution.utmSource],
    ['UTM medium', attribution.utmMedium],
    ['UTM campaign', attribution.utmCampaign],
    ['UTM term', attribution.utmTerm],
    ['UTM content', attribution.utmContent],
    ['Google click ID', attribution.gclid],
    ['Meta click ID', attribution.fbclid],
    ['Microsoft click ID', attribution.msclkid],
  ];

  return lines
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value]) => `${label}: ${value}`);
}

export function trackLeadEvent(eventName: string, payload: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === 'undefined') return;

  const safePayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
  const event = {
    event: eventName,
    pagePath: window.location.pathname,
    ...safePayload,
  };

  const browserWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };
  browserWindow.dataLayer = browserWindow.dataLayer || [];
  browserWindow.dataLayer.push(event);

  // Send the same lead interaction directly to GA4. The published GTM
  // container currently has no tags, so a dataLayer push alone would leave
  // these events stranded in the browser.
  const analyticsPayload = Object.fromEntries(
    Object.entries(safePayload).map(([key, value]) => [
      key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(),
      value,
    ]),
  );
  browserWindow.gtag?.('event', eventName, {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
    ...analyticsPayload,
  });

  window.dispatchEvent(new CustomEvent('angel:lead-event', { detail: event }));
}

export function scoreLeadBrief(values: Record<string, string>): {
  score: number;
  label: string;
  nextStep: string;
  missingBoosters: string[];
} {
  const value = (id: string): string => (values[id] || '').trim();
  let score = 0;

  if (value('name')) score += 10;
  if (/^\S+@\S+\.\S+$/.test(value('email'))) score += 15;
  if (value('projectType')) score += 15;
  if (value('description').length >= 150) score += 20;
  else if (value('description').length >= 70) score += 15;
  else if (value('description').length >= 30) score += 10;
  else if (value('description')) score += 5;
  if (value('company')) score += 8;
  if (value('phone')) score += 8;
  if (value('timeline')) score += 12;
  if (value('investment')) score += 12;

  const missingBoosters: string[] = [];
  if (!value('company')) missingBoosters.push('company or brand');
  if (!value('phone')) missingBoosters.push('direct phone number');
  if (!value('timeline')) missingBoosters.push('target timeline');
  if (!value('investment')) missingBoosters.push('investment range');
  if (value('description').length < 90) missingBoosters.push('audience, platform and must-have deliverables');

  if (score >= 85) {
    return {
      score,
      label: 'Production-ready brief',
      nextStep: 'Send the brief or call now—the key scoping inputs are in place.',
      missingBoosters,
    };
  }
  if (score >= 70) {
    return {
      score,
      label: 'Strong project brief',
      nextStep: 'Send it now, or add the remaining details below for a sharper first conversation.',
      missingBoosters,
    };
  }
  if (score >= 45) {
    return {
      score,
      label: 'Useful starting brief',
      nextStep: 'Add timeline, budget and audience details to make the roadmap more precise.',
      missingBoosters,
    };
  }
  return {
    score,
    label: 'Early idea brief',
    nextStep: 'Complete the core questions so the studio can recommend the right format and first prototype.',
    missingBoosters,
  };
}

export function roadmapForLead(values: Record<string, string>, intent: LeadIntent, topic?: string): string[] {
  const discipline = (values.projectType || topic || 'your project').trim();
  const timeline = (values.timeline || '').trim();
  const investment = (values.investment || '').trim();

  const shared = [
    `Define the audience, business goal and signature moment for ${discipline}.`,
    'Prototype the defining interaction, story beat or visual sequence before full production.',
    'Lock the experience blueprint: deliverables, platforms, content system, technical route and review milestones.',
    'Build, test in the real context, refine performance and prepare launch-ready masters and supporting assets.',
  ];

  if (intent === 'scope-estimate') {
    return [
      shared[0],
      `Confirm estimate inputs: timeline ${timeline ? `“${timeline}”` : 'still to confirm'}; investment ${investment ? `“${investment}”` : 'still to confirm'}.`,
      shared[2],
      'Agree a phased scope so the first release is valuable, measurable and ready to expand.',
    ];
  }

  if (intent === 'discovery-call') {
    return [
      shared[0],
      'Use the call to choose the strongest format, identify constraints and agree the first decision milestone.',
      shared[1],
      shared[3],
    ];
  }

  return shared;
}

function configuredLeadEndpoint(): string | undefined {
  const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
  return cleanParam(meta.env?.VITE_LEAD_FORM_ENDPOINT, 500);
}

export function hasConfiguredLeadEndpoint(): boolean {
  return Boolean(configuredLeadEndpoint());
}

export async function submitLeadToConfiguredEndpoint(payload: Record<string, unknown>): Promise<boolean> {
  const endpoint = configuredLeadEndpoint();
  if (!endpoint) return false;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Lead endpoint returned HTTP ${response.status}`);
  return true;
}
