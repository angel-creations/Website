import { useState } from 'react';
import metaverseContent from '../data/metaverseContent.json';
import rawMaps from '../data/experienceMaps.json';
import rawVisuals from '../data/explorerVisuals.json';
import { capabilityForRoute } from '../data/capabilities';
import { domainRouteFor } from '../data/domains';
import {
  ApplicationExplorer,
  ExperienceMap,
  type ExperienceMapData,
  type ExplorerVisual,
} from './ExperienceExplorer';

type RouteVisualBundle = {
  hero: ExplorerVisual;
  story?: ExplorerVisual[];
  map: ExplorerVisual[];
  applications: ExplorerVisual[];
};

const METAVERSE_PILLARS = [
  {
    index: '01',
    title: 'Spatial Presence',
    tag: '3D Acoustic & Volumetric Scale',
    text: 'Shared 3D environments with true depth, architectural scale, and spatialized audio so people feel genuinely present together.',
  },
  {
    index: '02',
    title: 'Identity & Avatars',
    tag: 'Persistent Digital Persona',
    text: 'Customizable digital identity and expressive representation that carries seamlessly across rooms, worlds, and live events.',
  },
  {
    index: '03',
    title: 'Real-Time Interaction',
    tag: 'Synchronous Multi-User Physics',
    text: 'Live multiplayer collaboration, spatial exploration, and shared activities—never passive page scrolling.',
  },
  {
    index: '04',
    title: 'Persistent Ecosystem',
    tag: 'Continuously Evolving Worlds',
    text: 'Connected spaces, live events, and digital assets that persist and evolve over time so communities always have a reason to return.',
  },
];

export function MetaverseStory(): JSX.Element {
  const [activePillar, setActivePillar] = useState(0);
  const relatedCapabilities = metaverseContent.relatedCapabilityRoutes
    .map(capabilityForRoute)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const map = (rawMaps as unknown as Record<string, ExperienceMapData>)['/metaverse/'];
  const visuals = (rawVisuals as unknown as Record<string, RouteVisualBundle>)['/metaverse/'];
  const storyVisuals = visuals.story || [];
  const applicationEntries = metaverseContent.experienceTypes.map((type) => ({
    title: type.title,
    description: type.description,
    items: type.applications,
    closing: type.closing,
    href: domainRouteFor('/metaverse/', type.title),
  }));

  return (
    <>
      {/* 1. EDITORIAL STORY & CORE PILLARS VISUAL BENTO */}
      <section
        className="apple-story-section"
        aria-labelledby="metaverse-story-title"
        data-story-route="/metaverse/"
      >
        <div className="apple-story-container">
          <header className="apple-story-header">
            <div className="apple-section-eyebrow">
              <span className="apple-section-eyebrow__dot" aria-hidden="true" />
              <span>01 · Spatial Computing &amp; Persistent Virtual Worlds</span>
            </div>
            <h2 id="metaverse-story-title" className="apple-story-title">
              Dive Into a New World—Built Around an Idea People Step Inside.
            </h2>
            <p className="apple-story-lead">{metaverseContent.intro[0]}</p>
          </header>

          {/* Two-Column Definition & World Statement Editorial Dossier with Category Visual Plates */}
          <div className="apple-story-compare-grid">
            <article className="apple-glass-card apple-glass-card--dossier">
              {visuals.map[0] && (
                <div className="apple-dossier-visual">
                  <img
                    src={visuals.map[0].src}
                    alt={visuals.map[0].caption}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="apple-dossier-visual__overlay" aria-hidden="true" />
                  <span className="apple-dossier-visual__badge">01 · Spatial Presence</span>
                  <span className="apple-dossier-visual__caption">
                    {visuals.map[0].subtitle || visuals.map[0].caption}
                  </span>
                </div>
              )}
              <div className="apple-dossier-body">
                <span className="apple-card-kicker">Dive Into a New World</span>
                <h3>Beyond Flat Pages &amp; Passive Screens</h3>
                {metaverseContent.intro.slice(1).map((paragraph) => (
                  <p key={paragraph} style={{ marginBottom: '0.75rem' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <article className="apple-glass-card apple-glass-card--dossier apple-glass-card--accent">
              {visuals.map[3] && (
                <div className="apple-dossier-visual">
                  <img
                    src={visuals.map[3].src}
                    alt={visuals.map[3].caption}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="apple-dossier-visual__overlay" aria-hidden="true" />
                  <span className="apple-dossier-visual__badge">02 · World Architecture</span>
                  <span className="apple-dossier-visual__caption">
                    {visuals.map[3].subtitle || visuals.map[3].caption}
                  </span>
                </div>
              )}
              <div className="apple-dossier-body">
                <span className="apple-card-kicker">Virtual Worlds, Built Around an Idea</span>
                <h3>Designed for Story, Purpose &amp; Return</h3>
                {metaverseContent.worldStatement.map((paragraph) => (
                  <p key={paragraph} style={{ marginBottom: '0.75rem' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </div>

          {/* 4-Pillar Visual Bento Grid */}
          <div className="apple-bento-block">
            <div className="apple-bento-block__head">
              <div>
                <span className="apple-card-kicker">Core Architectural Pillars</span>
                <h3 className="apple-bento-block__title">
                  What Makes a True Metaverse Experience
                </h3>
              </div>
            </div>

            <div className="apple-pillars-grid apple-pillars-grid--visual" role="list">
              {METAVERSE_PILLARS.map((pillar, idx) => {
                const visual = storyVisuals[idx];
                const isSelected = activePillar === idx;
                return (
                  <article
                    key={pillar.title}
                    className={`apple-pillar-card apple-pillar-card--visual${
                      isSelected ? ' is-selected' : ''
                    }`}
                    role="listitem"
                    tabIndex={0}
                    aria-current={isSelected || undefined}
                    onClick={() => setActivePillar(idx)}
                    onMouseEnter={() => setActivePillar(idx)}
                    onFocus={() => setActivePillar(idx)}
                  >
                    {visual && (
                      <div className="apple-pillar-card__media">
                        <img
                          src={visual.src}
                          alt={`${pillar.title} — ${visual.subtitle || visual.caption}`}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="apple-pillar-card__media-scrim" aria-hidden="true" />
                        <span className="apple-pillar-card__index">{pillar.index}</span>
                        <span className="apple-pillar-card__tag">{pillar.tag}</span>
                      </div>
                    )}
                    <div className="apple-pillar-card__content">
                      <h4 className="apple-pillar-card__title">{pillar.title}</h4>
                      <p className="apple-pillar-card__desc">{pillar.text}</p>
                      {visual?.subtitle && (
                        <div className="apple-pillar-card__CaptionFoot">
                          <span className="apple-pillar-card__dot" aria-hidden="true" />
                          <span>{visual.subtitle}</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* The Experience Layer & Evolution Bento */}
          <div className="apple-bento-block">
            <div className="apple-bento-block__head">
              <div>
                <span className="apple-card-kicker">05 · The Experience Layer</span>
                <h3 className="apple-bento-block__title">
                  Engineered for Human Presence &amp; Long-Term Value
                </h3>
              </div>
            </div>

            <div className="apple-values-grid" role="list">
              {metaverseContent.experienceLayer.map(([term, definition], idx) => (
                <article key={term} className="apple-value-card" role="listitem">
                  <div className="apple-value-card__top">
                    <span className="apple-value-card__index">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h4 className="apple-value-card__title">{term}</h4>
                  <p className="apple-value-card__desc">{definition}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE EXPERIENCE MAP WORKBENCH */}
      <div id="inner-flow">
        <ExperienceMap map={map} number="03" visual={visuals.hero.src} visuals={visuals.map} />
      </div>

      {/* 3. INTERACTIVE APPLICATION EXPLORER WORKBENCH & VISUAL BENTO DIRECTORY */}
      <div id="inner-domains">
        <ApplicationExplorer
          mode={map.mode}
          entries={applicationEntries}
          visual={visuals.hero.src}
          visuals={visuals.applications}
          kicker="04 · Metaverse Applications"
          heading="What Can a Metaverse Experience Become?"
          lead="Explore 9 distinct metaverse domains—each with its own dedicated spatial visual plate, interactive mechanics, and enterprise use cases."
        />
      </div>

      {/* 4. SUPPORTED CONTEXTS & RELATED CAPABILITIES */}
      <section className="apple-story-section" aria-label="Metaverse contexts and capabilities">
        <div className="apple-story-container">
          <div className="apple-story-compare-grid">
            <article className="apple-glass-card">
              <span className="apple-card-kicker">Who Can Use It?</span>
              <h3>Organizations &amp; Communities We Support</h3>
              <ul className="apple-capabilities-list" style={{ marginTop: '1rem' }}>
                {metaverseContent.whoCanUse.map((context) => (
                  <li key={context} className="apple-capabilities-list__item">
                    <span className="apple-capabilities-list__check" aria-hidden="true">
                      ✓
                    </span>
                    <span>{context}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="apple-glass-card apple-glass-card--accent">
              <span className="apple-card-kicker">Related Capabilities</span>
              <h3>The Disciplines Behind the Experience</h3>
              <p style={{ marginBottom: '1.25rem' }}>
                Every persistent virtual world combines real-time 3D engineering, spatial design,
                and interactive storytelling across our core studio disciplines:
              </p>
              <div className="apple-filter-dock" style={{ marginBottom: 0 }}>
                {relatedCapabilities.map((capability) => (
                  <a
                    key={capability.route}
                    href={capability.route}
                    className="apple-filter-pill"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>{capability.title}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
