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
import { navigate } from '../utils/routes';

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

const archive = rawArchive as VideoRecord[];
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
    accentHex: '#64d2ff',
    accentSecondaryHex: '#5e5ce6',
    accentRgb: '100, 210, 255',
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
    accentHex: '#5e5ce6',
    accentSecondaryHex: '#64d2ff',
    accentRgb: '94, 92, 230',
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
    accentHex: '#bf5af2',
    accentSecondaryHex: '#64d2ff',
    accentRgb: '191, 90, 242',
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
    accentHex: '#30d158',
    accentSecondaryHex: '#64d2ff',
    accentRgb: '48, 209, 88',
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
    accentHex: '#ff9f0a',
    accentSecondaryHex: '#ff375f',
    accentRgb: '255, 159, 10',
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
    accentHex: '#ff375f',
    accentSecondaryHex: '#ff9f0a',
    accentRgb: '255, 55, 95',
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
    accentHex: '#ffd60a',
    accentSecondaryHex: '#ff9f0a',
    accentRgb: '255, 214, 10',
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

function relatedWork(experience: SlideExperience): VideoRecord[] {
  if (experience.workTitleTerms.length === 0) return [];
  return archive
    .filter((record) => {
      const title = record.title.toLowerCase();
      return experience.workTitleTerms.some((term) => title.includes(term.toLowerCase()));
    })
    .slice(0, 3);
}

export function SliderExperience({ experience }: { experience: SlideExperience }): JSX.Element {
  const routePath = experience.route;
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const [activeHeroLens, setActiveHeroLens] = useState<number>(0);
  const [showMetaverseArtifact, setShowMetaverseArtifact] = useState(false);

  useEffect(() => {
    setActiveHeroLens(0);
    setShowMetaverseArtifact(false);
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

  const meta = ROUTE_META[routePath] || ROUTE_META['/metaverse/'];
  const routeBundle = explorerVisuals[routePath];

  // Build a 4-frame multi-angle lens switcher for the Hero Stage, all unique to this route
  const heroLenses = useMemo(() => {
    const fallbackSrc =
      innerHeroVisuals[routePath] || '/inner-library/metaverse/hero-metaverse.webp';
    const lenses: Array<{ label: string; src: string; caption: string; subtitle: string }> = [
      {
        label: '01 · Hero Stage',
        src: routeBundle?.hero?.src || fallbackSrc,
        caption: routeBundle?.hero?.caption || experience.label,
        subtitle: routeBundle?.hero?.subtitle || meta.category,
      },
    ];
    if (routeBundle?.story?.[0]) {
      lenses.push({
        label: '02 · Architecture',
        src: routeBundle.story[0].src,
        caption: routeBundle.story[0].caption,
        subtitle: routeBundle.story[0].subtitle || 'Core Architectural Layer',
      });
    }
    if (routeBundle?.map?.[0]) {
      lenses.push({
        label: '03 · Experience Flow',
        src: routeBundle.map[0].src,
        caption: routeBundle.map[0].caption,
        subtitle: routeBundle.map[0].subtitle || 'Interactive Stage Sequence',
      });
    }
    if (routeBundle?.applications?.[0]) {
      lenses.push({
        label: '04 · Flagship Domain',
        src: routeBundle.applications[0].src,
        caption: routeBundle.applications[0].caption,
        subtitle: routeBundle.applications[0].subtitle || 'Real-World Deployment',
      });
    }
    return lenses;
  }, [experience.label, meta.category, routeBundle, routePath]);

  const activeLens = heroLenses[activeHeroLens] || heroLenses[0];

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

  const appCount = routeBundle?.applications?.length || experience.applications.length;

  return (
    <main
      id="main"
      className={`site-main apple-inner-page angel-experience angel-experience--${experience.number}`}
      data-inner-route={routePath}
      style={
        {
          '--route-accent': meta.accentHex,
          '--route-accent-secondary': meta.accentSecondaryHex,
          '--route-accent-rgb': meta.accentRgb,
        } as React.CSSProperties
      }
    >
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
              aria-label={`Return to homepage slide ${experience.number}`}
            >
              <span className="apple-back-pill__arrow" aria-hidden="true">
                ←
              </span>
              <span>Slide {experience.number} · All Experiences</span>
            </a>

            <nav className="apple-section-jump-nav" aria-label="Page sections">
              <a href="#inner-overview" className="apple-section-jump-nav__link">
                01 Overview
              </a>
              <a href="#experience-introduction" className="apple-section-jump-nav__link">
                02 Architecture
              </a>
              <a href="#inner-flow" className="apple-section-jump-nav__link">
                03 Experience Map
              </a>
              <a href="#inner-domains" className="apple-section-jump-nav__link">
                04 Domains ({appCount})
              </a>
            </nav>
          </div>

          {/* Main Hero Split Layout */}
          <div className="apple-hero-grid">
            <div className="apple-hero-copy">
              <div className="apple-hero-badge">
                <span className="apple-hero-badge__index">Discipline {experience.number}</span>
                <span className="apple-hero-badge__sep" aria-hidden="true">
                  ·
                </span>
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
                  href="/contact/"
                  className="apple-cta-primary"
                  onClick={(e) => routeTo(e, '/contact/')}
                >
                  <span>
                    {routePath === '/metaverse/'
                      ? 'Let’s Build a World'
                      : experience.ctaAction || `Start a ${experience.label} Project`}
                  </span>
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#inner-domains"
                  className="apple-cta-secondary"
                >
                  <span>Explore {appCount} Specialized Domains</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>

            {/* Spatial 3D Tilt Visual Frame with 4-Angle Lens Switcher */}
            <div
              ref={heroStageRef}
              className="apple-hero-visual-wrap"
              onPointerMove={handleHeroPointerMove}
              onPointerLeave={handleHeroPointerLeave}
            >
              <div className="apple-hero-visual-card">
                <img
                  key={activeLens.src}
                  src={activeLens.src}
                  alt={`${experience.label} — ${activeLens.caption}`}
                  className="apple-hero-visual-card__img"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="apple-hero-visual-card__vignette" aria-hidden="true" />

                {/* Top Specular Glass Status Pill */}
                <div className="apple-hero-visual-card__top-bar">
                  <span className="apple-glass-pill">
                    <span className="apple-glass-pill__dot" aria-hidden="true" />
                    <span>{activeLens.caption}</span>
                  </span>
                  <span className="apple-glass-pill apple-glass-pill--mono">
                    {experience.number} / 07
                  </span>
                </div>

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
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            className={`apple-hero-lens-btn${isSelected ? ' is-active' : ''}`}
                            onClick={() => setActiveHeroLens(idx)}
                          >
                            <img src={lens.src} alt="" loading="lazy" decoding="async" />
                            <span>{String(idx + 1).padStart(2, '0')}</span>
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

      {/* 3. VERIFIED ARCHIVE WORK & RELATED CAPABILITIES (NON-METAVERSE) */}
      {routePath !== '/metaverse/' && (work.length > 0 || capabilities.length > 0) && (
        <section
          className="apple-story-section"
          aria-label={`${experience.label} verified work and capabilities`}
        >
          <div className="apple-story-container">
            {work.length > 0 && (
              <div className="apple-bento-block" style={{ marginTop: 0, marginBottom: '3.5rem' }}>
                <div className="apple-bento-block__head">
                  <div>
                    <span className="apple-card-kicker">Verified Production Archive</span>
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

      {/* 4. OPTIONAL INTERACTIVE UNITY WEBGL ARTIFACT (METAVERSE) */}
      {experience.hasUnityArtifact && (
        <section className="apple-story-section" aria-label="Original Metaverse environment">
          <div className="apple-story-container">
            <div className="apple-glass-card">
              <span className="apple-card-kicker">Interactive 3D Artifact</span>
              <h3>Original MetaScore WebGL Environment</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                Launch the preserved interactive Unity WebGL environment directly inside your
                browser to inspect spatial navigation and real-time 3D rendering.
              </p>
              {!showMetaverseArtifact ? (
                <button
                  type="button"
                  className="apple-tactile-btn apple-tactile-btn--primary"
                  onClick={() => setShowMetaverseArtifact(true)}
                >
                  Load Interactive 3D Environment ↓
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
                From initial spatial concept and interactive prototyping to full-scale production
                and global deployment, our team crafts experiences that set the standard in your
                category.
              </p>
            </div>

            <div className="apple-Finale-card__actions">
              <a
                href="/contact/"
                className="apple-cta-primary"
                onClick={(e) => routeTo(e, '/contact/')}
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
              <span className="apple-adjacent-card__dir">← Previous Discipline</span>
              <strong className="apple-adjacent-card__title">
                {previous.number} · {previous.label}
              </strong>
            </a>

            <a
              href="/"
              className="apple-adjacent-card apple-adjacent-card--center"
              onClick={(e) => routeTo(e, '/', index)}
            >
              <span className="apple-adjacent-card__dir">Interactive Stage</span>
              <strong className="apple-adjacent-card__title">
                Return to Slide {experience.number}
              </strong>
            </a>

            <a
              href={next.route}
              className="apple-adjacent-card apple-adjacent-card--next"
              onClick={(e) => routeTo(e, next.route, (index + 1) % slideExperiences.length)}
            >
              <span className="apple-adjacent-card__dir">Next Discipline →</span>
              <strong className="apple-adjacent-card__title">
                {next.number} · {next.label}
              </strong>
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
