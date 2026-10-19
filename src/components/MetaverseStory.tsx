import type { ReactNode } from 'react';
import metaverseContent from '../data/metaverseContent.json';
import rawMaps from '../data/experienceMaps.json';
import rawVisuals from '../data/explorerVisuals.json';
import { capabilityForRoute } from '../data/capabilities';
import { ApplicationExplorer, ExperienceMap, type ExperienceMapData, type ExplorerVisual } from './ExperienceExplorer';

function MetaverseSection({ number, title, children }: { number: string; title: string; children: ReactNode }): JSX.Element {
  return (
    <section className={`angel-experience__section angel-metaverse__section angel-metaverse__section--${number}`} aria-labelledby={`metaverse-section-${number}`}>
      <p className="angel-experience__number" aria-hidden="true">{number}</p>
      <div>
        <h2 id={`metaverse-section-${number}`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function MetaverseStory(): JSX.Element {
  const relatedCapabilities = metaverseContent.relatedCapabilityRoutes.map(capabilityForRoute).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const map = (rawMaps as unknown as Record<string, ExperienceMapData>)['/metaverse/'];
  const visuals = (rawVisuals as unknown as Record<string, { hero: ExplorerVisual; map: ExplorerVisual[]; applications: ExplorerVisual[] }>)['/metaverse/'];
  const applicationEntries = metaverseContent.experienceTypes.map((type) => ({ title: type.title, description: type.description, items: type.applications, closing: type.closing }));
  return (
    <>
      <MetaverseSection number="01" title="Dive into a new world.">
        <div className="angel-experience__prose">{metaverseContent.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </MetaverseSection>

      <MetaverseSection number="02" title="Virtual worlds, built around an idea.">
        <div className="angel-experience__prose">{metaverseContent.worldStatement.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </MetaverseSection>

      <ExperienceMap map={map} number="03" visual={visuals.hero.src} visuals={visuals.map} />

      <MetaverseSection number="04" title="What can a metaverse experience become?">
        <ApplicationExplorer mode={map.mode} entries={applicationEntries} visual={visuals.hero.src} visuals={visuals.applications} />
      </MetaverseSection>

      <MetaverseSection number="05" title="The experience layer">
        <p>A virtual world is only as valuable as the experience inside it. We consider:</p>
        <dl className="angel-metaverse__layer">
          {metaverseContent.experienceLayer.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
        </dl>
      </MetaverseSection>

      <MetaverseSection number="06" title="Who can use it?">
        <p>Metaverse experiences can support:</p>
        <ul className="angel-metaverse__contexts">{metaverseContent.whoCanUse.map((context) => <li key={context}>{context}</li>)}</ul>
      </MetaverseSection>

      <MetaverseSection number="07" title="From idea to world">
        <p>A metaverse project can begin with a simple question:</p>
        <p className="angel-metaverse__question">What if this existed somewhere people could enter?</p>
        <p>From there, the experience can evolve through:</p>
        <p className="angel-metaverse__evolution">{metaverseContent.evolution.join(' → ')}</p>
      </MetaverseSection>

      <MetaverseSection number="08" title={map.work?.title ?? 'Show the work'}>
        <p className="angel-experience__section-kicker">Show the work</p>
        {map.work && <p className="angel-experience__work-bridge">{map.work.bridge}</p>}
        <p>No public archive record is linked here without stretching the evidence. Explore the complete verified <a href="/works/">Works archive</a>.</p>
      </MetaverseSection>

      <MetaverseSection number="09" title="Related capabilities">
        <p className="angel-experience__section-kicker">The disciplines behind the experience</p>
        <ul className="angel-experience__capabilities">
          {relatedCapabilities.map((capability) => <li key={capability.route}><a href={capability.route}><span>{capability.title}</span><i aria-hidden="true">↗</i></a></li>)}
        </ul>
      </MetaverseSection>
    </>
  );
}
