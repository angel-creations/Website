import { Fragment, type ReactNode } from 'react';
import rawStories from '../data/experienceStories.json';
import rawMaps from '../data/experienceMaps.json';
import rawVisuals from '../data/explorerVisuals.json';
import type { SlideExperience } from '../data/slideExperiences';
import { ApplicationExplorer, ExperienceMap, type ExperienceMapData, type ExplorerVisual } from './ExperienceExplorer';

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

type Story = {
  sections: StorySectionData[];
  relatedCapabilityRoutes: string[];
  cta: { lead: string; action: string };
};

const stories = rawStories as Record<string, Story>;
const maps = rawMaps as unknown as Record<string, ExperienceMapData>;
const explorerVisuals = rawVisuals as unknown as Record<string, { hero: ExplorerVisual; map: ExplorerVisual[]; applications: ExplorerVisual[] }>;

export function experienceStoryForRoute(route: string): Story | undefined {
  return stories[route];
}

function StorySection({ number, title, children }: { number: string; title: string; children: ReactNode }): JSX.Element {
  return (
    <section className={`angel-experience__section angel-story__section angel-story__section--${number}`} aria-labelledby={`story-section-${number}`}>
      <p className="angel-experience__number" aria-hidden="true">{number}</p>
      <div>
        <h2 id={`story-section-${number}`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function SourceList({ items }: { items: string[] }): JSX.Element {
  return <ul className="angel-experience__source-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function Entries({ entries }: { entries: StoryEntry[] }): JSX.Element {
  return (
    <ol className="angel-story__entries">
      {entries.map((entry, index) => (
        <li key={entry.title}>
          <p className="angel-story__entry-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
          <div>
            <h3>{entry.title}</h3>
            {entry.description && <p>{entry.description}</p>}
            {entry.statement && <p className="angel-story__statement">{entry.statement}</p>}
            {entry.items && entry.items.length > 0 && <SourceList items={entry.items} />}
            {entry.closing && <p className="angel-story__closing">{entry.closing}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ExperienceStory({ experience }: { experience: SlideExperience }): JSX.Element | null {
  const story = experienceStoryForRoute(experience.route);
  if (!story) return null;

  const map = maps[experience.route];
  const routeVisuals = explorerVisuals[experience.route];
  return (
    <>
      {story.sections.map((section, index) => (
        <Fragment key={section.title}>
          <StorySection number={String(index + 1).padStart(2, '0')} title={section.title}>
            {section.intro && <p>{section.intro}</p>}
            {section.paragraphs && <div className="angel-story__prose">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
            {section.statement && <p className="angel-story__statement">{section.statement}</p>}
            {section.items && section.items.length > 0 && <SourceList items={section.items} />}
            {section.entries && section.entries.length > 0 && (index === 2 && map ? <ApplicationExplorer mode={map.mode} entries={section.entries} visual={routeVisuals?.hero.src} visuals={routeVisuals?.applications} /> : <Entries entries={section.entries} />)}
            {section.sequence && section.sequence.length > 0 && <p className="angel-story__sequence">{section.sequence.join(' → ')}</p>}
            {section.closing && <p className="angel-story__closing">{section.closing}</p>}
          </StorySection>
          {index === 1 && map && <ExperienceMap map={map} visual={routeVisuals?.hero.src} visuals={routeVisuals?.map} />}
        </Fragment>
      ))}
    </>
  );
}
