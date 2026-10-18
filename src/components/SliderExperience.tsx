import { lazy, Suspense, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import rawArchive from '../data/videoArchive.json';
import rawMaps from '../data/experienceMaps.json';
import rawInnerHeroVisuals from '../data/innerHeroVisuals.json';
import { capabilityForRoute } from '../data/capabilities';
import type { ExperienceMapData } from './ExperienceExplorer';
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

const archive = rawArchive as VideoRecord[];
const experienceMaps = rawMaps as unknown as Record<string, ExperienceMapData>;
const innerHeroVisuals = rawInnerHeroVisuals as Record<string, string>;
const sourceApproach = 'Angel Creations’ current public About source describes work rooted in usability, creativity, aesthetics and craft, built through collaboration, joint ambition and mutual respect.';

function sourceDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function webpSource(source: string): string {
  return source.replace(/\.jpe?g$/i, '.webp');
}

function relatedWork(experience: SlideExperience): VideoRecord[] {
  if (experience.workTitleTerms.length === 0) return [];
  return archive.filter((record) => {
    const title = record.title.toLowerCase();
    return experience.workTitleTerms.some((term) => title.includes(term.toLowerCase()));
  }).slice(0, 3);
}

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }): JSX.Element {
  return (
    <section className="angel-experience__section" aria-labelledby={`experience-section-${number}`}>
      <p className="angel-experience__number" aria-hidden="true">{number}</p>
      <div>
        <h2 id={`experience-section-${number}`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function MediaStage({ experience }: { experience: SlideExperience }): JSX.Element {
  const visual = innerHeroVisuals[experience.route];
  return (
    <div className="angel-experience__media angel-experience__media--library">
      {visual && <img className="angel-experience__poster" src={visual} alt="" aria-hidden="true" fetchPriority="high" decoding="async" />}
      <p className="angel-experience__media-credit" aria-hidden="true">Photo via Unsplash / {experience.label}</p>
    </div>
  );
}

export function SliderExperience({ experience }: { experience: SlideExperience }): JSX.Element {
  const index = slideExperiences.findIndex((item) => item.route === experience.route);
  const previous = slideExperiences[(index - 1 + slideExperiences.length) % slideExperiences.length];
  const next = slideExperiences[(index + 1) % slideExperiences.length];
  const capabilities = experience.capabilityRoutes.map(capabilityForRoute).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const work = useMemo(() => relatedWork(experience), [experience]);
  const workPresentation = experienceMaps[experience.route]?.work;
  const [showMetaverseArtifact, setShowMetaverseArtifact] = useState(false);
  const supportingSectionStart = (experience.storySectionCount ?? 4) + 1;

  const routeTo = (event: MouseEvent<HTMLAnchorElement>, route: string, slideIndex: number): void => {
    event.preventDefault();
    navigate(route, { angelSlide: slideIndex, angelJourney: 'slider' });
  };

  return (
    <main id="main" className={`site-main angel-experience angel-experience--${experience.number}`}>
      <header className="angel-experience__hero" aria-labelledby="experience-title">
        <MediaStage experience={experience} />
        <div className="angel-experience__hero-copy">
          <p className="angel-experience__slide-number" aria-label={`Homepage slide ${experience.number}`}>{experience.number}</p>
          <p className="angel-experience__label">/ {experience.label}</p>
          <h1 id="experience-title">{experience.label}</h1>
          <p className="angel-experience__heading">{experience.heading}</p>
          <p className="angel-experience__summary">{experience.summary}</p>
          <a className="angel-experience__enter" href="#experience-introduction">Enter the source material <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <div className="angel-experience__body" id="experience-introduction">
        {experience.route === '/metaverse/' ? <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading Angel.</p>}><MetaverseStory /></Suspense> : experience.hasExpandedStory ? <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading Angel.</p>}><ExperienceStory experience={experience} /></Suspense> : <>
          <Section number="01" title="What is this?"><p>{experience.summary}</p><p className="angel-experience__quiet">This page stays within Angel’s currently captured public material; it does not add an unverified project claim.</p></Section>
          <Section number="02" title="What Angel creates here"><p>Current public Angel source material lists:</p><ul className="angel-experience__source-list">{experience.creates.map((item) => <li key={item}>{item}</li>)}</ul></Section>
          <Section number="03" title="How Angel approaches it"><p>{sourceApproach}</p></Section>
          <Section number="04" title="Where it applies"><p>These are application contexts named in the captured Angel source. They are not asserted as project outcomes.</p><ul className="angel-experience__source-list">{experience.applications.map((item) => <li key={item}>{item}</li>)}</ul></Section>
        </>}

        {experience.route !== '/metaverse/' && <>
          <Section number={String(supportingSectionStart).padStart(2, '0')} title={workPresentation?.title ?? 'Show the work'}>
            <p className="angel-experience__section-kicker">Show the work</p>
            {workPresentation && <p className="angel-experience__work-bridge">{workPresentation.bridge}</p>}
            {work.length > 0 ? <><p>Only records whose published title explicitly matches this experience are shown. Titles, descriptions, thumbnails and links remain their original public source material.</p><ol className="angel-experience__work-list">{work.map((record) => <li key={record.id}><a className="angel-experience__work-media" href={record.url} target="_blank" rel="noreferrer" aria-label={`Watch ${record.title} on YouTube`}>{record.thumbnail && <picture><source srcSet={webpSource(record.thumbnail)} type="image/webp" /><img src={record.thumbnail} alt="" loading="lazy" decoding="async" /></picture>}</a><div className="angel-experience__work-copy"><h3><a href={record.url} target="_blank" rel="noreferrer">{record.title}</a></h3><p className="angel-experience__work-meta">{[record.category, record.duration, sourceDate(record.uploadDate)].filter(Boolean).join(' / ')}</p>{record.description && <details><summary>Read source description</summary><p>{record.description}</p></details>}<a className="angel-experience__source-link" href={record.url} target="_blank" rel="noreferrer">Watch source <span aria-hidden="true">↗</span></a></div></li>)}</ol></> : <p>No public archive record is linked here without stretching the evidence. Explore the complete verified <a href="/works/">Works archive</a>.</p>}
          </Section>
          <Section number={String(supportingSectionStart + 1).padStart(2, '0')} title="Related capabilities"><p className="angel-experience__section-kicker">The disciplines behind the experience</p><ul className="angel-experience__capabilities">{capabilities.map((capability) => <li key={capability.route}><a href={capability.route}><span>{capability.title}</span><i aria-hidden="true">↗</i></a></li>)}</ul></Section>
        </>}

        {experience.hasUnityArtifact && (
          <Section number={experience.route === '/metaverse/' ? '10' : '07'} title="Original Metaverse environment">
            <p>The captured route includes a Unity WebGL artifact titled MetaScore. It is retained as a source artifact and is not presented as a new product or case study.</p>
            {!showMetaverseArtifact ? <button className="angel-experience__artifact-button" type="button" onClick={() => setShowMetaverseArtifact(true)}>Load original environment <span aria-hidden="true">↓</span></button> : <Suspense fallback={<p className="angel-experience__quiet">Loading the preserved environment.</p>}><MetaverseRuntime /></Suspense>}
          </Section>
        )}

        <section className="angel-experience__conversation" aria-label={`Start a ${experience.label} conversation`}>
          <p>{experience.route === '/metaverse/' ? 'Have an idea that deserves more than a screen?' : experience.ctaLead ?? `${experience.label} / a conversation starts here.`}</p>
          <a href="/contact/">{experience.route === '/metaverse/' ? 'Let’s build a world.' : experience.ctaAction ?? 'Start a project'} <span aria-hidden="true">↗</span></a>
        </section>
      </div>

      <nav className="angel-experience__journey" aria-label="Continue through Angel experiences">
        <a href="/" onClick={(event) => routeTo(event, '/', index)}><span>Home</span><strong>Return to slide {experience.number}</strong></a>
        <a href={previous.route} onClick={(event) => routeTo(event, previous.route, (index - 1 + slideExperiences.length) % slideExperiences.length)}><span>Prev</span><strong>{previous.number} / {previous.label}</strong></a>
        <p className="angel-experience__current" aria-current="page"><span>Current</span><strong>{experience.number} / {String(slideExperiences.length).padStart(2, '0')}<br />{experience.label}</strong></p>
        <a href={next.route} onClick={(event) => routeTo(event, next.route, (index + 1) % slideExperiences.length)}><span>Next</span><strong>{next.number} / {next.label}</strong></a>
      </nav>
    </main>
  );
}
