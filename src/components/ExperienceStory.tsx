import { useState, useEffect } from 'react';
import rawStories from '../data/experienceStories.json';
import rawMaps from '../data/experienceMaps.json';
import rawVisuals from '../data/explorerVisuals.json';
import type { SlideExperience } from '../data/slideExperiences';
import { domainRouteFor } from '../data/domains';
import {
  ApplicationExplorer,
  ExperienceMap,
  type ExperienceMapData,
  type ExplorerVisual,
} from './ExperienceExplorer';

type StoryEntry = {
  title: string;
  description?: string;
  statement?: string;
  items?: string[];
  closing?: string;
};

type StorySectionData = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  statement?: string;
  items?: string[];
  entries?: StoryEntry[];
  sequence?: string[];
  closing?: string;
};

export type Story = {
  sections: StorySectionData[];
  relatedCapabilityRoutes: string[];
  cta: { lead: string; action: string };
};

type RouteVisualBundle = {
  hero: ExplorerVisual;
  story?: ExplorerVisual[];
  map: ExplorerVisual[];
  applications: ExplorerVisual[];
};

const stories = rawStories as Record<string, Story>;
const maps = rawMaps as unknown as Record<string, ExperienceMapData>;
const explorerVisuals = rawVisuals as unknown as Record<string, RouteVisualBundle>;

export function experienceStoryForRoute(route: string): Story | undefined {
  return stories[route];
}

function StoryItemsList({ items }: { items: string[] }): JSX.Element {
  return (
    <ul className="apple-capabilities-list apple-context-items">
      {items.map((item) => (
        <li key={item} className="apple-capabilities-list__item">
          <span className="apple-capabilities-list__check" aria-hidden="true">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StorySectionBody({
  section,
  omitIntro = false,
  omitStatement = false,
}: {
  section: StorySectionData;
  omitIntro?: boolean;
  omitStatement?: boolean;
}): JSX.Element {
  return (
    <div className="apple-context-body">
      {!omitIntro && section.intro && <p className="apple-context-lead">{section.intro}</p>}
      {!omitStatement && section.statement && (
        <p className="apple-context-statement">{section.statement}</p>
      )}
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {section.entries && section.entries.length > 0 && (
        <ol className="apple-context-entry-list">
          {section.entries.map((entry, index) => (
            <li key={entry.title} className="apple-context-entry">
              <span className="apple-context-entry__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{entry.title}</strong>
                {(entry.description || entry.statement) && (
                  <p>{entry.description || entry.statement}</p>
                )}
                {entry.items && entry.items.length > 0 && (
                  <ul className="apple-context-entry__items">
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {entry.closing && <p>{entry.closing}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {section.items && section.items.length > 0 && <StoryItemsList items={section.items} />}

      {section.sequence && section.sequence.length > 0 && (
        <ol className="apple-context-sequence" aria-label={`${section.title} sequence`}>
          {section.sequence.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {step}
            </li>
          ))}
        </ol>
      )}

      {section.closing && <p className="apple-context-closing">{section.closing}</p>}
    </div>
  );
}

interface PillarMeta {
  title: string;
  tag: string;
  text: string;
}

const ROUTE_PILLARS: Record<string, PillarMeta[]> = {
  '/mixed-reality/': [
    {
      title: 'Spatial Awareness',
      tag: 'LiDAR & Scene Mesh',
      text: 'Understands room geometry, physical surfaces, ambient lighting, and spatial boundaries in real time.',
    },
    {
      title: 'Anchored Digital Objects',
      tag: 'Volumetric Pinning',
      text: 'Places 3D models, spatial interfaces, and interactive media directly into the real environment.',
    },
    {
      title: 'Natural Interaction',
      tag: 'Hand, Eye & Voice',
      text: 'Supports direct hand tracking, eye-gaze focus, voice commands, and physical movement without learning curves.',
    },
    {
      title: 'Real-Time Context',
      tag: 'Live Telemetry Overlay',
      text: 'Connects live operational data and 3D digital tools directly to real-world tasks, equipment, and spaces.',
    },
  ],
  '/virtual-reality/': [
    {
      title: 'Full Immersion',
      tag: '360° Optics & Audio',
      text: '360° stereoscopic visuals and spatial audio environments that command undivided attention.',
    },
    {
      title: 'Interactive Simulation',
      tag: '6DoF Haptic Agency',
      text: 'Hands-on scenarios where users learn, test, and explore by physically performing actions.',
    },
    {
      title: 'Spatial Storytelling',
      tag: 'First-Person Presence',
      text: 'Narrative worlds where the audience stands inside the story rather than watching from afar.',
    },
    {
      title: 'Safe Practice',
      tag: 'Zero-Risk Rehearsal',
      text: 'Risk-free environments for high-consequence training, surgical rehearsal, and architectural walkthroughs.',
    },
  ],
  '/augment-reality/': [
    {
      title: 'Instant Access',
      tag: 'WebAR & Mobile Native',
      text: 'Launches effortlessly on mobile devices, tablets, and web browsers without heavy hardware barriers.',
    },
    {
      title: 'Contextual Overlay',
      tag: 'Computer Vision Lock',
      text: 'Displays information, 3D products, and step-by-step guidance right where the user is looking.',
    },
    {
      title: 'Interactive Discovery',
      tag: 'Touch & Camera Triggers',
      text: 'Turns physical packaging, retail spaces, and print media into interactive 3D touchpoints.',
    },
    {
      title: 'Real-World Utility',
      tag: 'Visual Confidence',
      text: 'Helps users visualize, navigate, learn, and shop with immediate spatial confidence.',
    },
  ],
  '/animation/': [
    {
      title: 'Visual Storytelling',
      tag: 'Narrative Clarity',
      text: 'Translates complex narratives, products, and ideas into clear, memorable visual sequences.',
    },
    {
      title: 'Character & World Design',
      tag: 'Original Art Direction',
      text: 'Creates original characters, environments, and unmistakable visual identities from scratch.',
    },
    {
      title: '2D, 3D & Motion Craft',
      tag: 'Hybrid Studio Pipeline',
      text: 'Blends stylized 2D cel illustration, cinematic 3D rendering, and dynamic motion graphics.',
    },
    {
      title: 'Emotional Rhythm',
      tag: 'Timing & Physics',
      text: 'Uses frame-accurate timing, weight, sound, and camera movement to hold attention and inspire action.',
    },
  ],
  '/brand-advertisement/': [
    {
      title: 'Strategic Positioning',
      tag: 'Category Distinction',
      text: 'Defines what makes the brand distinct, relevant, and meaningful in the minds of your audience.',
    },
    {
      title: 'Creative Storytelling',
      tag: 'Emotional Hook',
      text: 'Crafts human-centered narratives that connect emotionally and stay memorable long after viewing.',
    },
    {
      title: 'Visual & Verbal Identity',
      tag: 'Cohesive Design System',
      text: 'Builds an unmistakable look, tone of voice, and feeling across every physical and digital touchpoint.',
    },
    {
      title: 'Multi-Channel Impact',
      tag: 'Integrated Rollout',
      text: 'Adapts campaigns seamlessly across cinema film, social, digital, out-of-home, and experiential.',
    },
  ],
  '/media-production/': [
    {
      title: 'Creative Direction',
      tag: 'Script & Visual Bible',
      text: 'Shapes the core concept, shooting script, storyboard language, and comprehensive production plan.',
    },
    {
      title: 'Cinematography & Capture',
      tag: 'Optics, Light & Stage',
      text: 'Shoots with cinema-grade lighting, camera movement, lens selection, and location or stage craft.',
    },
    {
      title: 'Editorial & Post-Production',
      tag: 'Cut, Grade & Atmos Sound',
      text: 'Refines narrative pacing, HDR color grading, spatial sound mixing, visual effects, and finishing.',
    },
    {
      title: 'Multi-Platform Delivery',
      tag: 'Global Format Mastering',
      text: 'Masters content for theatrical cinema, broadcast television, digital streaming, social, and live events.',
    },
  ],
};

export function ExperienceStory({ experience }: { experience: SlideExperience }): JSX.Element | null {
  const story = experienceStoryForRoute(experience.route);
  const [activePillar, setActivePillar] = useState(0);

  useEffect(() => {
    setActivePillar(0);
  }, [experience.route]);

  if (!story) return null;

  const map = maps[experience.route];
  const routeVisuals = explorerVisuals[experience.route];
  const storyVisuals = routeVisuals?.story || [];
  const mapVisuals = routeVisuals?.map || [];
  const pillars = ROUTE_PILLARS[experience.route] || [];

  const section01 = story.sections[0];
  const section02 = story.sections[1];
  const section03 = story.sections[2];
  const section04 = story.sections[3];
  const contextSections = story.sections.slice(4).filter(Boolean);
  const section01BodyParagraphs = section01?.paragraphs?.slice(1) || [];

  return (
    <>
      {/* 1. EDITORIAL STORY & CORE PILLARS VISUAL BENTO */}
      <section
        className="apple-story-section"
        aria-labelledby="experience-story-title"
        data-story-route={experience.route}
      >
        <div className="apple-story-container">
          {section01 && (
            <header className="apple-story-header">
              <div className="apple-section-eyebrow">
                <span className="apple-section-eyebrow__dot" aria-hidden="true" />
                <span>01 · {experience.label} Architecture</span>
              </div>
              <h2 id="experience-story-title" className="apple-story-title">
                {section01.title}
              </h2>
              {section01.paragraphs?.[0] && (
                <p className="apple-story-lead">{section01.paragraphs[0]}</p>
              )}
            </header>
          )}

          {/* Two-Column Editorial Dossier with Category Visual Plates */}
          <div className="apple-story-compare-grid">
            {section01 && section01BodyParagraphs.length > 0 && (
              <article className="apple-glass-card apple-glass-card--dossier">
                {mapVisuals[0] && (
                  <div className="apple-dossier-visual">
                    <img
                      src={mapVisuals[0].src}
                      alt={mapVisuals[0].caption}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="apple-dossier-visual__overlay" aria-hidden="true" />
                    <span className="apple-dossier-visual__badge">01 · Core Definition</span>
                    <span className="apple-dossier-visual__caption">
                      {mapVisuals[0].subtitle || mapVisuals[0].caption}
                    </span>
                  </div>
                )}
                <div className="apple-dossier-body">
                  {section01BodyParagraphs.map((p) => (
                    <p key={p} style={{ marginBottom: '0.75rem' }}>
                      {p}
                    </p>
                  ))}
                  {section01.closing && <p>{section01.closing}</p>}
                </div>
              </article>
            )}

            {section02 && (
              <article className="apple-glass-card apple-glass-card--dossier apple-glass-card--accent">
                {mapVisuals[2] && (
                  <div className="apple-dossier-visual">
                    <img
                      src={mapVisuals[2].src}
                      alt={mapVisuals[2].caption}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="apple-dossier-visual__overlay" aria-hidden="true" />
                    <span className="apple-dossier-visual__badge">02 · Creative Mechanics</span>
                    <span className="apple-dossier-visual__caption">
                      {mapVisuals[2].subtitle || mapVisuals[2].caption}
                    </span>
                  </div>
                )}
                <div className="apple-dossier-body">
                  <span className="apple-card-kicker">02 · {section02.title}</span>
                  <h3>{section02.statement || section02.title}</h3>
                  {section02.paragraphs?.map((p) => (
                    <p key={p} style={{ marginBottom: '0.75rem' }}>
                      {p}
                    </p>
                  ))}
                  {section02.items && section02.items.length > 0 && (
                    <StoryItemsList items={section02.items} />
                  )}
                  {section02.closing && <p>{section02.closing}</p>}
                </div>
              </article>
            )}
          </div>

          {/* 4-Pillar Visual Bento Grid */}
          {pillars.length > 0 && (
            <div className="apple-bento-block">
              <div className="apple-bento-block__head">
                <div>
                  <span className="apple-card-kicker">Core Architectural Pillars</span>
                  <h3 className="apple-bento-block__title">
                    What Powers {experience.label}
                  </h3>
                </div>
              </div>

              <div className="apple-pillars-grid apple-pillars-grid--visual" role="group" aria-label="Core practice pillars">
                {pillars.map((pillar, idx) => {
                  const visual = storyVisuals[idx];
                  const isSelected = activePillar === idx;
                  return (
                    <article
                      key={pillar.title}
                      className={`apple-pillar-card apple-pillar-card--visual${
                        isSelected ? ' is-selected' : ''
                      }`}
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
                          <span className="apple-pillar-card__index">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
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
          )}

          {/* Section 04: Experience Layer / Core Considerations Bento */}
          {section04 &&
            Boolean(
              section04.entries?.length ||
                section04.items?.length ||
                section04.paragraphs?.length ||
                section04.sequence?.length
            ) && (
              <div className="apple-bento-block">
                <div className="apple-bento-block__head">
                  <div>
                    <span className="apple-card-kicker">04 · {section04.title}</span>
                    <h3 className="apple-bento-block__title">
                      {section04.intro || section04.title}
                    </h3>
                  </div>
                </div>

                {section04.entries && section04.entries.length > 0 ? (
                  <>
                    <div className="apple-values-grid" role="group" aria-label="How the studio works">
                      {section04.entries.map((entry, idx) => (
                        <article key={entry.title} className="apple-value-card">
                          <div className="apple-value-card__top">
                            <span className="apple-value-card__index">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <h4 className="apple-value-card__title">{entry.title}</h4>
                          <p className="apple-value-card__desc">
                            {entry.description || entry.statement}
                          </p>
                        </article>
                      ))}
                    </div>
                    {section04.closing && (
                      <p className="apple-section04-closing">{section04.closing}</p>
                    )}
                  </>
                ) : (
                  <article className="apple-glass-card apple-section04-card">
                    <StorySectionBody section={section04} omitIntro />
                  </article>
                )}
              </div>
            )}
        </div>
      </section>

      {/* 2. INTERACTIVE EXPERIENCE MAP WORKBENCH */}
      {map && (
        <div id="inner-flow">
          <ExperienceMap
            map={map}
            number="03"
            visual={routeVisuals?.hero.src}
            visuals={routeVisuals?.map}
          />
        </div>
      )}

      {/* 3. INTERACTIVE APPLICATION EXPLORER WORKBENCH & VISUAL BENTO DIRECTORY */}
      {section03?.entries && map && (
        <div id="inner-domains">
          <ApplicationExplorer
            mode={map.mode}
            entries={section03.entries.map((entry) => ({
              ...entry,
              href: domainRouteFor(experience.route, entry.title),
            }))}
            visual={routeVisuals?.hero.src}
            visuals={routeVisuals?.applications}
            kicker={`04 · ${experience.label} Domains`}
            heading={section03.title}
            lead={
              section03.intro ||
              `Explore ${section03.entries.length} specialized ${experience.label} categories—each with its own dedicated visual plate and capabilities.`
            }
          />
        </div>
      )}

      {/* 4. CONTEXTS, JOURNEYS, PROCESS NOTES & EVOLUTION */}
      {contextSections.length > 0 && (
        <section
          className="apple-story-section apple-context-section"
          aria-label={`${experience.label} contexts, journeys and outcomes`}
        >
          <div className="apple-story-container">
            <header className="apple-context-section__head">
              <div className="apple-section-eyebrow">
                <span className="apple-section-eyebrow__dot" aria-hidden="true" />
                <span>Experience Contexts</span>
              </div>
              <h2>Where {experience.label} lives, works and grows</h2>
              <p>
                The closing chapters connect the experience to its audiences, environments,
                creative journey and long-term value.
              </p>
            </header>

            <div className="apple-story-compare-grid apple-context-grid">
              {contextSections.map((section, index) => {
                const displayHeading =
                  section.statement && section.statement !== section.title
                    ? section.statement
                    : section.intro && section.intro !== section.title
                      ? section.intro
                      : section.title;

                return (
                  <article
                    key={`${section.title}-${index}`}
                    className={`apple-glass-card apple-context-card${
                      index % 2 === 1 ? ' apple-glass-card--accent' : ''
                    }`}
                  >
                    {displayHeading !== section.title && (
                      <span className="apple-card-kicker">{section.title}</span>
                    )}
                    <h3>{displayHeading}</h3>
                    <StorySectionBody
                      section={section}
                      omitIntro={displayHeading === section.intro}
                      omitStatement={displayHeading === section.statement}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
