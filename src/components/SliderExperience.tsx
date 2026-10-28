import React, {
  lazy,
  Suspense,
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
  type MouseEvent,
} from 'react';
import rawArchive from '../data/videoArchive.json';
import rawMaps from '../data/experienceMaps.json';
import rawInnerHeroVisuals from '../data/innerHeroVisuals.json';
import rawExplorerVisuals from '../data/explorerVisuals.json';
import { capabilityForRoute } from '../data/capabilities';
import type { ExperienceMapData, ExplorerVisual } from './ExperienceExplorer';
import { slideExperiences, type SlideExperience } from '../data/slideExperiences';
import { buildContactHref, disciplineForExperienceRoute, LEAD_PHONE_DISPLAY, LEAD_PHONE_HREF, trackLeadEvent } from '../utils/leads';
import { navigate } from '../utils/routes';
import { cleanArchiveTitle } from '../utils/archiveCopy';
import { domainsForParent } from '../data/domains';
import { experienceSeoFaqs } from '../utils/seoKeywords';

const MetaverseRuntime = lazy(async () => {
  const module = await import('./MetaversePage');
  return { default: module.MetaverseRuntime };
});
const MetaverseStory = lazy(async () => {
  const module = await import('./MetaverseStory');
  return { default: module.MetaverseStory };
});
const ExperienceStory = lazy(async () => {
  const module = await import('./ExperienceStory');
  return { default: module.ExperienceStory };
});
const ExperienceProcess = lazy(async () => {
  const module = await import('./ExperienceProcess');
  return { default: module.ExperienceProcess };
});

type VideoRecord = {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  duration?: string;
  uploadDate?: string;
  thumbnail?: string;
};

type RouteVisualBundle = {
  hero?: ExplorerVisual;
  story?: ExplorerVisual[];
  map?: ExplorerVisual[];
  applications?: ExplorerVisual[];
};

const archive = (rawArchive as VideoRecord[]).map((record) => ({
  ...record,
  title: cleanArchiveTitle(record.title),
}));
const experienceMaps = rawMaps as unknown as Record<string, ExperienceMapData>;
const innerHeroVisuals = rawInnerHeroVisuals as Record<string, string>;
const explorerVisuals = rawExplorerVisuals as Record<string, RouteVisualBundle>;

interface RouteMeta {
  index: string;
  category: string;
  accentHex: string;
  accentSecondaryHex: string;
  accentRgb: string;
  metrics: { label: string; value: string; detail: string }[];
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/metaverse/': {
    index: '01',
    category: 'Spatial Worlds & Persistent Ecosystems',
    accentHex: '#7C5CFF',
    accentSecondaryHex: '#38BDF8',
    accentRgb: '124, 92, 255',
    metrics: [
      { label: 'Architecture', value: 'Persistent 3D', detail: 'Multi-user spatial worlds' },
      { label: 'Presence', value: 'Real-Time', detail: 'Avatars, voice & live events' },
      { label: 'Economy', value: 'Token & Asset', detail: 'Showrooms & marketplaces' },
      { label: 'Access', value: 'Cross-Device', detail: 'VR, WebXR, desktop & mobile' },
    ],
  },
  '/mixed-reality/': {
    index: '02',
    category: 'Spatial Computing & Physical-Digital Fusion',
    accentHex: '#38BDF8',
    accentSecondaryHex: '#C86BFF',
    accentRgb: '56, 189, 248',
    metrics: [
      { label: 'Spatial Mapping', value: 'Room-Scale', detail: 'Surface, depth & occlusion' },
      { label: 'Input Model', value: 'Hand + Gaze', detail: 'Natural gesture & voice' },
      { label: 'Anchoring', value: 'Sub-Millimeter', detail: 'Persistent world-locked 3D' },
      { label: 'Collaboration', value: 'Co-Located', detail: 'Shared spatial twins' },
    ],
  },
  '/virtual-reality/': {
    index: '03',
    category: 'Full-Immersion Simulation & Presence',
    accentHex: '#C86BFF',
    accentSecondaryHex: '#FB7185',
    accentRgb: '200, 107, 255',
    metrics: [
      { label: 'Field of View', value: '360° Spatial', detail: 'Stereoscopic depth & audio' },
      { label: 'Simulation', value: 'Zero-Risk', detail: 'Hands-on training & rehearsal' },
      { label: 'Retention', value: 'Experiential', detail: 'Embodied muscle memory' },
      { label: 'Scale', value: '1:1 Human', detail: 'Pre-built architecture & labs' },
    ],
  },
  '/augment-reality/': {
    index: '04',
    category: 'Mobile & Wearable Camera Overlays',
    accentHex: '#2DD4BF',
    accentSecondaryHex: '#38BDF8',
    accentRgb: '45, 212, 191',
    metrics: [
      { label: 'Deployment', value: 'Instant Web/App', detail: 'Zero headset barrier' },
      { label: 'Vision', value: 'Surface & Object', detail: 'Camera SLAM & target lock' },
      { label: 'Commerce', value: 'Try-Before-Buy', detail: 'True-to-scale retail preview' },
      { label: 'Guidance', value: 'Live Overlays', detail: 'Navigation & field telemetry' },
    ],
  },
  '/animation/': {
    index: '05',
    category: '2D, 3D, Character & Motion Craft',
    accentHex: '#FB7185',
    accentSecondaryHex: '#FF7847',
    accentRgb: '251, 113, 133',
    metrics: [
      { label: 'Pipeline', value: 'Concept → Render', detail: 'Storyboards to final composite' },
      { label: 'Dimensions', value: '2D + 3D + VFX', detail: 'Cel, CG character & motion' },
      { label: 'Engines', value: 'Cinema & Real-Time', detail: 'Film, broadcast & interactive' },
      { label: 'Identity', value: 'Bespoke Worlds', detail: 'Original characters & lore' },
    ],
  },
  '/brand-advertisement/': {
    index: '06',
    category: 'Strategic Positioning & Campaign Systems',
    accentHex: '#FF7847',
    accentSecondaryHex: '#FFC0D0',
    accentRgb: '255, 120, 71',
    metrics: [
      { label: 'Strategy', value: 'Category-Defining', detail: 'Positioning & brand architecture' },
      { label: 'Storytelling', value: 'Hero Brand Films', detail: 'High-recall emotional craft' },
      { label: 'Launches', value: 'Keynote & Reveal', detail: 'Product theatre & rollouts' },
      { label: 'Channels', value: 'Omnichannel', detail: 'Film, digital, social & OOH' },
    ],
  },
  '/media-production/': {
    index: '07',
    category: 'Cinema, Broadcast, Live & Post Studio',
    accentHex: '#818CF8',
    accentSecondaryHex: '#38BDF8',
    accentRgb: '129, 140, 248',
    metrics: [
      { label: 'Pre-Production', value: 'Script & Board', detail: 'Casting, scouting & planning' },
      { label: 'Capture', value: 'Cinema Grade', detail: 'Multi-cam, lighting & sound' },
      { label: 'Finishing', value: 'Color + VFX + Mix', detail: 'Theatrical & broadcast post' },
      { label: 'Delivery', value: 'Every Screen', detail: 'Cinema, TV, live & social' },
    ],
  },
};

function sourceDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        date
      );
}

function webpSource(source: string): string {
  return source.replace(/\.jpe?g$/i, '.webp');
}

function optimizedHeroSource(source: string): string | undefined {
  if (!source || /\.webp$/i.test(source)) return undefined;
  return /\.(?:jpe?g|png)$/i.test(source)
    ? source.replace(/\.(?:jpe?g|png)$/i, '.webp')
    : undefined;
}

function relatedWork(experience: SlideExperience): VideoRecord[] {
  if (experience.workTitleTerms.length === 0) return [];
  return archive
    .filter((record) => {
      const title = record.title.toLowerCase();
      return experience.workTitleTerms.some((term) => title.includes(term.toLowerCase()));
    })
    .slice(0, 3);
}

const INNER_SECTION_IDS = [
  'inner-overview',
  'experience-introduction',
  'inner-flow',
  'inner-domains',
  'inner-process',
] as const;

type InnerSectionId = (typeof INNER_SECTION_IDS)[number];

export function SliderExperience({ experience }: { experience: SlideExperience }): JSX.Element {
  const routePath = experience.route;
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const readingProgressRef = useRef<HTMLSpanElement | null>(null);
  const jumpNavRef = useRef<HTMLElement | null>(null);
  const heroLensButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const heroSwipeRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [activeHeroLens, setActiveHeroLens] = useState<number>(0);
  const [showMetaverseArtifact, setShowMetaverseArtifact] = useState(false);
  const [activeSection, setActiveSection] = useState<InnerSectionId>('inner-overview');
  const [isJumpNavFloating, setIsJumpNavFloating] = useState(false);

  useEffect(() => {
    setActiveHeroLens(0);
    setShowMetaverseArtifact(false);
    setActiveSection('inner-overview');
    setIsJumpNavFloating(false);
  }, [routePath]);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 680px)').matches) return;
    const nav = jumpNavRef.current;
    const activeLink = nav?.querySelector<HTMLElement>('.apple-section-jump-nav__link.is-active');
    if (!nav || !activeLink) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const target =
      linkRect.left - navRect.left + nav.scrollLeft - (nav.clientWidth - linkRect.width) / 2;
    nav.scrollTo({
      left: Math.max(target, 0),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [activeSection]);

  useEffect(() => {
    let frame = 0;

    const updateScrollState = (): void => {
      frame = 0;
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      if (readingProgressRef.current) {
        readingProgressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      const shouldFloat = scrollTop > Math.min(620, window.innerHeight * 0.72);
      setIsJumpNavFloating((previous) => (previous === shouldFloat ? previous : shouldFloat));

      const probe = scrollTop + window.innerHeight * 0.38;
      let current: InnerSectionId = 'inner-overview';
      for (const id of INNER_SECTION_IDS) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top + scrollTop <= probe) {
          current = id;
        }
      }
      setActiveSection((previous) => (previous === current ? previous : current));
    };

    const requestUpdate = (): void => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [routePath]);

  const index = useMemo(() => {
    const idx = slideExperiences.findIndex((item) => item.route === routePath);
    return idx >= 0 ? idx : 0;
  }, [routePath]);

  const previous = slideExperiences[(index - 1 + slideExperiences.length) % slideExperiences.length];
  const next = slideExperiences[(index + 1) % slideExperiences.length];

  const capabilities = useMemo(
    () =>
      experience.capabilityRoutes
        .map(capabilityForRoute)
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [experience.capabilityRoutes]
  );

  const work = useMemo(() => relatedWork(experience), [experience]);
  const workPresentation = experienceMaps[routePath]?.work;
  const childDomains = useMemo(() => domainsForParent(routePath), [routePath]);
  const serviceFaqs = useMemo(
    () => experienceSeoFaqs(experience, childDomains.map((domain) => domain.contextualTitle)),
    [childDomains, experience]
  );

  const meta = ROUTE_META[routePath] || ROUTE_META['/metaverse/'];
  const routeBundle = explorerVisuals[routePath];
  const enquiryHref = buildContactHref({
    discipline: disciplineForExperienceRoute(routePath),
    intent: 'project-roadmap',
    sourceRoute: routePath,
    topic: experience.label,
    goal: experience.heading,
  });

  // Build a 4-frame multi-angle lens switcher for the Hero Stage, all unique to this route
  const heroLenses = useMemo(() => {
    const fallbackSrc =
      innerHeroVisuals[routePath] || '/media/library/metaverse/hero-metaverse.webp';
    const lenses: Array<{ label: string; src: string; caption: string; subtitle: string }> = [
      {
        label: 'Hero Stage',
        src: routeBundle?.hero?.src || fallbackSrc,
        caption: routeBundle?.hero?.caption || experience.label,
        subtitle: routeBundle?.hero?.subtitle || meta.category,
      },
    ];
    if (routeBundle?.story?.[0]) {
      lenses.push({
        label: 'Architecture',
        src: routeBundle.story[0].src,
        caption: routeBundle.story[0].caption,
        subtitle: routeBundle.story[0].subtitle || 'Core Architectural Layer',
      });
    }
    if (routeBundle?.map?.[0]) {
      lenses.push({
        label: 'Experience Flow',
        src: routeBundle.map[0].src,
        caption: routeBundle.map[0].caption,
        subtitle: routeBundle.map[0].subtitle || 'Interactive Stage Sequence',
      });
    }
    if (routeBundle?.applications?.[0]) {
      lenses.push({
        label: 'Flagship Domain',
        src: routeBundle.applications[0].src,
        caption: routeBundle.applications[0].caption,
        subtitle: routeBundle.applications[0].subtitle || 'Real-World Deployment',
      });
    }
    return lenses;
  }, [experience.label, meta.category, routeBundle, routePath]);

  const activeLens = heroLenses[activeHeroLens] || heroLenses[0];
  const activeHeroWebp = activeLens?.src === heroLenses[0]?.src
    ? optimizedHeroSource(activeLens.src)
    : undefined;

  const routeTo = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, targetRoute: string, slideIndex?: number) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      event.preventDefault();
      if (typeof slideIndex === 'number') {
        navigate(targetRoute, { angelSlide: slideIndex, angelJourney: 'slider' });
      } else {
        navigate(targetRoute);
      }
    },
    []
  );

  // Subtle Apple TV / VisionOS pointer parallax on the hero frame
  const handleHeroPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = heroStageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    el.style.setProperty('--hero-tilt-x', `${(-ny * 3.2).toFixed(2)}deg`);
    el.style.setProperty('--hero-tilt-y', `${(nx * 4.2).toFixed(2)}deg`);
    el.style.setProperty('--hero-glow-x', `${((nx + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--hero-glow-y', `${((ny + 1) * 50).toFixed(1)}%`);
  }, []);

  const handleHeroPointerLeave = useCallback(() => {
    const el = heroStageRef.current;
    if (!el) return;
    el.style.setProperty('--hero-tilt-x', '0deg');
    el.style.setProperty('--hero-tilt-y', '0deg');
    el.style.setProperty('--hero-glow-x', '50%');
    el.style.setProperty('--hero-glow-y', '50%');
  }, []);

  const handleHeroLensKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (idx + 1) % heroLenses.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (idx - 1 + heroLenses.length) % heroLenses.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = heroLenses.length - 1;
      }
      if (nextIndex === null) return;
      event.preventDefault();
      setActiveHeroLens(nextIndex);
      heroLensButtonRefs.current[nextIndex]?.focus();
    },
    [heroLenses.length]
  );

  const handleHeroPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    heroSwipeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }, []);

  const handleHeroPointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = heroSwipeRef.current;
      heroSwipeRef.current = null;
      if (!start || start.pointerId !== event.pointerId || heroLenses.length < 2) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
      setActiveHeroLens((current) =>
        deltaX < 0
          ? Math.min(current + 1, heroLenses.length - 1)
          : Math.max(current - 1, 0)
      );
    },
    [heroLenses.length]
  );

  const appCount = routeBundle?.applications?.length || experience.applications.length;
  const heroCtaLabelByRoute: Record<string, string> = {
    '/metaverse/': 'Let’s Build a World',
    '/mixed-reality/': 'Create Mixed Reality',
    '/virtual-reality/': 'Create Virtual Reality',
    '/augment-reality/': 'Create Augmented Reality',
    '/animation/': 'Make Something Move',
    '/brand-advertisement/': 'Launch Your Campaign',
    '/media-production/': 'Start Your Production',
  };
  const heroCtaLabel = heroCtaLabelByRoute[routePath] || 'Start a Project';
  const sectionLinkClassName = (id: InnerSectionId): string =>
    `apple-section-jump-nav__link${activeSection === id ? ' is-active' : ''}`;

  return (
    <main
      id="main"
      className={`site-main apple-inner-page angel-experience angel-experience--${experience.route.replace(/\//g, '')}`}
      data-inner-route={routePath}
      style={
        {
          '--route-accent': meta.accentHex,
          '--route-accent-secondary': meta.accentSecondaryHex,
          '--route-accent-rgb': meta.accentRgb,
        } as React.CSSProperties
      }
    >
      <div className="apple-reading-progress" aria-hidden="true">
        <span ref={readingProgressRef} />
      </div>

      {/* 1. SPATIAL HERO STAGE */}
      <section className="apple-hero-stage" id="inner-overview" aria-labelledby="experience-title">
        <div className="apple-hero-stage__ambient" aria-hidden="true" />

        <div className="apple-hero-container">
          {/* Top Breadcrumb & Quick-Jump Sub-Nav */}
          <div className="apple-hero-topbar">
            <a
              href="/"
              className="apple-back-pill"
              onClick={(e) => routeTo(e, '/', index)}
              aria-label={`Return to the ${experience.label} homepage slide`}
            >
              <span className="apple-back-pill__arrow" aria-hidden="true">
                ←
              </span>
              <span>{experience.label}</span>
            </a>

            <nav
              ref={jumpNavRef}
              className={`apple-section-jump-nav${isJumpNavFloating ? ' is-floating' : ''}`}
              aria-label="Page sections"
            >
              <a
                href="#inner-overview"
                className={sectionLinkClassName('inner-overview')}
                aria-current={activeSection === 'inner-overview' ? 'location' : undefined}
              >
                Overview
              </a>
              <a
                href="#experience-introduction"
                className={sectionLinkClassName('experience-introduction')}
                aria-current={
                  activeSection === 'experience-introduction' ? 'location' : undefined
                }
              >
                Architecture
              </a>
              <a
                href="#inner-flow"
                className={sectionLinkClassName('inner-flow')}
                aria-current={activeSection === 'inner-flow' ? 'location' : undefined}
              >
                Experience Map
              </a>
              <a
                href="#inner-domains"
                className={sectionLinkClassName('inner-domains')}
                aria-current={activeSection === 'inner-domains' ? 'location' : undefined}
              >
                Domains
              </a>
              <a
                href="#inner-process"
                className={sectionLinkClassName('inner-process')}
                aria-current={activeSection === 'inner-process' ? 'location' : undefined}
              >
                Process
              </a>
            </nav>
          </div>

          {/* Main Hero Split Layout */}
          <div className="apple-hero-grid">
            <div className="apple-hero-copy">
              <div className="apple-hero-badge">
                <span className="apple-hero-badge__cat">{meta.category}</span>
              </div>

              <h1 id="experience-title" className="apple-hero-title">
                {experience.label}
              </h1>

              <p className="apple-hero-tagline">{experience.heading}</p>

              <p className="apple-hero-lead">{experience.summary}</p>

              {/* Tactile Actions */}
              <div className="apple-hero-actions">
                <a
                  href={enquiryHref}
                  className="apple-cta-primary"
                  data-lead-event="lead_cta_click"
                  data-lead-intent="project-roadmap"
                  data-lead-topic={experience.label}
                  onClick={(e) => {
                    trackLeadEvent('lead_cta_click', {
                      intent: 'project-roadmap',
                      topic: experience.label,
                      sourceRoute: routePath,
                      cta: heroCtaLabel,
                    });
                    routeTo(e, enquiryHref);
                  }}
                >
                  <span>{heroCtaLabel}</span>
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#inner-domains"
                  className="apple-cta-secondary"
                >
                  <span>Explore {appCount} Domains</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="angel-lead-microcopy" aria-label="Project enquiry benefits">
                <span>Free roadmap</span>
                <span>No obligation</span>
                <span>
                  or call <a href={LEAD_PHONE_HREF}>{LEAD_PHONE_DISPLAY}</a>
                </span>
              </div>
            </div>

            {/* Spatial 3D Tilt Visual Frame with 4-Angle Lens Switcher */}
            <div
              ref={heroStageRef}
              className="apple-hero-visual-wrap"
              onPointerMove={handleHeroPointerMove}
              onPointerLeave={handleHeroPointerLeave}
              onPointerDown={handleHeroPointerDown}
              onPointerUp={handleHeroPointerEnd}
              onPointerCancel={handleHeroPointerEnd}
            >
              <div className="apple-hero-visual-card">
                <picture className="apple-hero-visual-card__picture">
                  {activeHeroWebp ? (
                    <source srcSet={activeHeroWebp} type="image/webp" />
                  ) : null}
                  <img
                    key={activeLens.src}
                    src={activeLens.src}
                    alt={`${experience.label} — ${activeLens.caption}`}
                    className="apple-hero-visual-card__img"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    draggable={false}
                    width={1920}
                    height={1080}
                  />
                </picture>
                <div className="apple-hero-visual-card__vignette" aria-hidden="true" />

                {/* Bottom Multi-Angle Lens Switcher & Telemetry Overlay */}
                <div className="apple-hero-visual-card__bottom-bar">
                  <div className="apple-hero-lens-info">
                    <span className="apple-hero-lens-info__kicker">{activeLens.label}</span>
                    <p className="apple-hero-visual-card__caption">{activeLens.subtitle}</p>
                  </div>

                  {heroLenses.length > 1 && (
                    <div
                      className="apple-hero-lens-dock"
                      role="tablist"
                      aria-label={`${experience.label} visual perspectives`}
                    >
                      {heroLenses.map((lens, idx) => {
                        const isSelected = idx === activeHeroLens;
                        return (
                          <button
                            key={lens.src}
                            ref={(node) => {
                              heroLensButtonRefs.current[idx] = node;
                            }}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            aria-label={`Show ${lens.label}: ${lens.caption}`}
                            tabIndex={isSelected ? 0 : -1}
                            className={`apple-hero-lens-btn${isSelected ? ' is-active' : ''}`}
                            onClick={() => setActiveHeroLens(idx)}
                            onKeyDown={(event) => handleHeroLensKeyDown(event, idx)}
                          >
                            <img src={lens.src} alt="" loading="lazy" decoding="async" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Metric Spatial Telemetry Bar */}
          <div
            className="apple-telemetry-strip"
            role="list"
            aria-label={`${experience.label} key specs`}
          >
            {meta.metrics.map((m) => (
              <div key={m.label} className="apple-telemetry-tile" role="listitem">
                <span className="apple-telemetry-tile__label">{m.label}</span>
                <strong className="apple-telemetry-tile__value">{m.value}</strong>
                <span className="apple-telemetry-tile__detail">{m.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STORY, INTERACTIVE EXPERIENCE MAP & APPLICATION EXPLORER */}
      <div id="experience-introduction">
        {routePath === '/metaverse/' ? (
          <Suspense
            fallback={
              <p className="angel-route-loading" aria-live="polite">
                Loading Metaverse experience…
              </p>
            }
          >
            <MetaverseStory />
          </Suspense>
        ) : (
          <Suspense
            fallback={
              <p className="angel-route-loading" aria-live="polite">
                Loading {experience.label} experience…
              </p>
            }
          >
            <ExperienceStory experience={experience} />
          </Suspense>
        )}
      </div>

      <Suspense
        fallback={
          <p className="angel-route-loading" aria-live="polite">
            Loading the {experience.label} process…
          </p>
        }
      >
        <ExperienceProcess
          key={experience.route}
          experience={experience}
          enquiryHref={enquiryHref}
          onEnquiryClick={(event) => routeTo(event, enquiryHref)}
          visualSrc={heroLenses[0]?.src}
          visuals={routeBundle?.map}
        />
      </Suspense>

      {/* 3. VERIFIED ARCHIVE WORK & RELATED CAPABILITIES (NON-METAVERSE) */}
      {routePath !== '/metaverse/' && (work.length > 0 || capabilities.length > 0) && (
        <section
          className="apple-story-section"
          aria-label={`${experience.label} selected work and capabilities`}
        >
          <div className="apple-story-container">
            {work.length > 0 && (
              <div className="apple-bento-block" style={{ marginTop: 0, marginBottom: '3.5rem' }}>
                <div className="apple-bento-block__head">
                  <div>
                    <span className="apple-card-kicker">Selected Work</span>
                    <h3 className="apple-bento-block__title">
                      {workPresentation?.title || `Selected ${experience.label} Work`}
                    </h3>
                  </div>
                  <a
                    href="/works/"
                    className="apple-pill-control"
                    style={{ textDecoration: 'none' }}
                    onClick={(e) => routeTo(e, '/works/')}
                  >
                    <span>Explore Complete Works Archive ↗</span>
                  </a>
                </div>

                <div className="apple-sector-grid apple-sector-grid--visual">
                  {work.map((record, idx) => (
                    <article
                      key={record.id}
                      className="apple-sector-card apple-sector-card--visual"
                    >
                      {record.thumbnail && (
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                          className="apple-sector-card__media"
                          aria-label={`Watch ${record.title} on YouTube`}
                        >
                          <picture>
                            <source srcSet={webpSource(record.thumbnail)} type="image/webp" />
                            <img
                              src={record.thumbnail}
                              alt={record.title}
                              loading="lazy"
                              decoding="async"
                            />
                          </picture>
                          <div className="apple-sector-card__media-scrim" aria-hidden="true" />
                          <span className="apple-sector-card__index">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="apple-sector-card__status">Watch Film ↗</span>
                        </a>
                      )}
                      <div className="apple-sector-card__body">
                        <h4 className="apple-sector-card__title">{record.title}</h4>
                        <p className="apple-sector-card__summary">
                          {[record.category, record.duration, sourceDate(record.uploadDate)]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {capabilities.length > 0 && (
              <div className="apple-glass-card apple-glass-card--accent">
                <span className="apple-card-kicker">Related Capabilities</span>
                <h3>The Studio Disciplines Behind {experience.label}</h3>
                <div className="apple-filter-dock" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  {capabilities.map((capability) => (
                    <a
                      key={capability.route}
                      href={capability.route}
                      className="apple-filter-pill"
                      style={{ textDecoration: 'none' }}
                      onClick={(e) => routeTo(e, capability.route)}
                    >
                      <span>{capability.title}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="apple-story-section angel-service-guide" aria-labelledby="experience-faq-title">
        <div className="apple-story-container">
          <div className="angel-service-guide__faq">
            <div className="angel-service-guide__faq-head">
              <span className="apple-card-kicker">{experience.label} FAQs</span>
              <h3 id="experience-faq-title">Common questions before hiring a studio</h3>
            </div>
            <div className="angel-service-guide__faq-list">
              {serviceFaqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <p className="angel-service-guide__cta">
              Planning a project?{' '}
              <a href={enquiryHref} onClick={(event) => routeTo(event, enquiryHref)}>
                Get a free {experience.label} project roadmap
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* 4. OPTIONAL INTERACTIVE UNITY WEBGL ARTIFACT (METAVERSE) */}
      {experience.hasUnityArtifact && (
        <section className="apple-story-section" aria-label="Original Metaverse environment">
          <div className="apple-story-container">
            <div className="apple-glass-card">
              <span className="apple-card-kicker">Interactive 3D Experience</span>
              <h3>Enter the MetaScore WebGL Environment</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                Explore a real-time Unity WebGL environment in your browser and experience its spatial navigation first-hand.
              </p>
              {!showMetaverseArtifact ? (
                <button
                  type="button"
                  className="apple-tactile-btn apple-tactile-btn--primary"
                  onClick={() => setShowMetaverseArtifact(true)}
                >
                  Enter the 3D Environment ↓
                </button>
              ) : (
                <Suspense
                  fallback={
                    <p className="angel-experience__quiet">Loading interactive 3D environment…</p>
                  }
                >
                  <MetaverseRuntime />
                </Suspense>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. COLLABORATION CTA & ADJACENT DISCIPLINE DOCK */}
      <footer className="apple-inner-footer">
        <div className="apple-inner-footer__container">
          <div className="apple-Finale-card">
            {heroLenses[0]?.src && (
              <img
                className="apple-Finale-card__bg"
                src={heroLenses[0].src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            )}
            <div className="apple-Finale-card__copy">
              <div className="apple-section-eyebrow">
                <span className="apple-section-eyebrow__dot" aria-hidden="true" />
                <span>Collaborate With Angel Creations</span>
              </div>
              <h2 className="apple-Finale-card__title">
                {routePath === '/metaverse/'
                  ? 'Have an Idea That Deserves More Than a Screen?'
                  : experience.ctaLead ||
                    `Ready to Build Something Extraordinary in ${experience.label}?`}
              </h2>
              <p className="apple-Finale-card__desc">
                From first concept and interactive prototype to production and launch, we build experiences with the clarity, craft and technical care they deserve.
              </p>
              <div className="angel-lead-microcopy" aria-label="Project enquiry benefits">
                <span>Free roadmap</span>
                <span>Prototype-first scope</span>
                <span>
                  or call <a href={LEAD_PHONE_HREF}>{LEAD_PHONE_DISPLAY}</a>
                </span>
              </div>
            </div>

            <div className="apple-Finale-card__actions">
              <a
                href={enquiryHref}
                className="apple-cta-primary"
                data-lead-event="lead_cta_click"
                data-lead-intent="project-roadmap"
                data-lead-topic={experience.label}
                onClick={(e) => {
                  trackLeadEvent('lead_cta_click', {
                    intent: 'project-roadmap',
                    topic: experience.label,
                    sourceRoute: routePath,
                    cta: 'Experience finale CTA',
                  });
                  routeTo(e, enquiryHref);
                }}
              >
                <span>
                  {routePath === '/metaverse/'
                    ? 'Let’s Build a World'
                    : experience.ctaAction || 'Schedule a Discovery Session'}
                </span>
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="/works/"
                className="apple-cta-secondary"
                onClick={(e) => routeTo(e, '/works/')}
              >
                <span>View Works Archive</span>
              </a>
            </div>
          </div>

          {/* Prev / Next Adjacent Experience Cards */}
          <nav className="apple-adjacent-nav" aria-label="Continue through Angel experiences">
            <a
              href={previous.route}
              className="apple-adjacent-card"
              onClick={(e) =>
                routeTo(
                  e,
                  previous.route,
                  (index - 1 + slideExperiences.length) % slideExperiences.length
                )
              }
            >
              {innerHeroVisuals[previous.route] && (
                <img
                  className="apple-adjacent-card__bg"
                  src={
                    optimizedHeroSource(innerHeroVisuals[previous.route]) ||
                    innerHeroVisuals[previous.route]
                  }
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
              <span className="apple-adjacent-card__dir">← Previous Discipline</span>
              <strong className="apple-adjacent-card__title">
                {previous.label}
              </strong>
            </a>

            <a
              href="/"
              className="apple-adjacent-card apple-adjacent-card--center"
              onClick={(e) => routeTo(e, '/', index)}
            >
              {heroLenses[0]?.src && (
                <img
                  className="apple-adjacent-card__bg"
                  src={heroLenses[0].src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
              <span className="apple-adjacent-card__dir">Interactive Stage</span>
              <strong className="apple-adjacent-card__title">
                Return to {experience.label}
              </strong>
            </a>

            <a
              href={next.route}
              className="apple-adjacent-card apple-adjacent-card--next"
              onClick={(e) => routeTo(e, next.route, (index + 1) % slideExperiences.length)}
            >
              {innerHeroVisuals[next.route] && (
                <img
                  className="apple-adjacent-card__bg"
                  src={
                    optimizedHeroSource(innerHeroVisuals[next.route]) ||
                    innerHeroVisuals[next.route]
                  }
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
              <span className="apple-adjacent-card__dir">Next Discipline →</span>
              <strong className="apple-adjacent-card__title">
                {next.label}
              </strong>
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
