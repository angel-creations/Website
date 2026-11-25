import rawArchive from '../data/videoArchive.json';
import type { Capability } from '../data/capabilities';
import { domainForRoute } from '../data/domains';
import { capabilityFaqs } from '../data/leadFaqs';
import { LeadCtaBand } from './LeadCtaBand';
import { cleanArchiveTitle } from '../utils/archiveCopy';
import { buildContactHref, disciplineForCapabilityRoute, trackLeadEvent } from '../utils/leads';
import { imageSize } from '../utils/imageDimensions';

type VideoRecord = {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  tags?: string[];
  uploadDate?: string;
  duration?: string;
  thumbnail?: string;
};

const archive = (rawArchive as VideoRecord[]).map((record) => ({
  ...record,
  title: cleanArchiveTitle(record.title),
}));

function recordMatchesCapability(record: VideoRecord, capability: Capability): boolean {
  const searchable = `${record.title} ${record.description} ${(record.tags ?? []).join(' ')}`.toLowerCase();
  return capability.workTerms.some((term) => searchable.includes(term.toLowerCase()));
}

function sourceDate(record: VideoRecord): string | null {
  if (!record.uploadDate) return null;
  const date = new Date(record.uploadDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function webpSource(source: string): string {
  return source.replace(/\.jpe?g$/i, '.webp');
}

export function CapabilityDetail({ capability, includeHero = true }: { capability: Capability; includeHero?: boolean }): JSX.Element {
  const Title = includeHero ? 'h1' : 'h2';
  const relatedWork = archive.filter((record) => recordMatchesCapability(record, capability)).slice(0, 4);
  const visualExamples = relatedWork.slice(0, 2);
  const specialistDomains = (capability.domainRoutes ?? [])
    .map(domainForRoute)
    .filter((domain): domain is NonNullable<typeof domain> => Boolean(domain));
  const contactHref = buildContactHref({
    discipline: disciplineForCapabilityRoute(capability.route),
    intent: 'project-roadmap',
    sourceRoute: capability.route,
    topic: capability.title,
    goal: capability.overview,
  });

  return (
    <section className={`angel-capability${includeHero ? '' : ' angel-capability--extension'}`} aria-labelledby={`capability-${capability.slug}-title`}>
      <header className="angel-capability__hero">
        <p className="angel-capability__eyebrow">{capability.eyebrow}</p>
        <Title id={`capability-${capability.slug}-title`}>{capability.title}</Title>
        <p className="angel-capability__overview">{capability.overview}</p>
        <a
          className="angel-capability__hero-cta"
          href={contactHref}
          data-lead-event="lead_cta_click"
          data-lead-intent="project-roadmap"
          data-lead-topic={capability.title}
          onClick={() => trackLeadEvent('lead_cta_click', {
            intent: 'project-roadmap',
            topic: capability.title,
            sourceRoute: capability.route,
            cta: 'Capability hero CTA',
          })}
        >
          Start a {capability.title} project <span aria-hidden="true">↗</span>
        </a>
        <div className="angel-lead-microcopy" aria-label="Project enquiry benefits">
          <span>Free roadmap</span>
          <span>No obligation</span>
          <span>Capability pre-selected</span>
        </div>
      </header>

      <div className="angel-capability__sections">
        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-creates`}>
          <p className="angel-capability__number">Create</p>
          <div>
            <h2 id={`${capability.slug}-creates`}>What our {capability.title} services create</h2>
            <p>A focused toolkit for stories, spaces and experiences with a clear job to do.</p>
            <ul className="angel-capability__source-list">{capability.creates.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-contexts`}>
          <p className="angel-capability__number">Apply</p>
          <div>
            <h2 id={`${capability.slug}-contexts`}>Where {capability.title} creates value</h2>
            <p>Formats and settings where this craft can help people learn, explore, decide and connect.</p>
            <ul className="angel-capability__source-list">{capability.applications.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-approach`}>
          <p className="angel-capability__number">Approach</p>
          <div>
            <h2 id={`${capability.slug}-approach`}>How we work</h2>
            <p>{capability.approach}</p>
          </div>
        </section>

        {visualExamples.length > 0 && (
          <section className="angel-capability__visuals" aria-labelledby={`${capability.slug}-visuals`}>
            <div className="angel-capability__section-heading"><p className="angel-capability__number">In frame</p><h2 id={`${capability.slug}-visuals`}>Selected work in frame</h2></div>
            <div className="angel-capability__visual-list">
              {visualExamples.map((record) => (
                <a href={record.url} target="_blank" rel="noreferrer" key={record.id} className="angel-capability__visual">
                  {record.thumbnail && <picture><source srcSet={webpSource(record.thumbnail)} type="image/webp" /><img src={record.thumbnail}
                  {...imageSize(record.thumbnail)} alt="" loading="lazy" decoding="async" /></picture>}
                  <span>{record.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-work`}>
          <p className="angel-capability__number">Archive</p>
          <div>
            <h2 id={`${capability.slug}-work`}>From the archive</h2>
            <p>Selected productions connected to this capability. Explore all 47 films and breakdowns in the <a href="/works/">Works archive</a>.</p>
            {relatedWork.length > 0 ? (
              <ol className="angel-capability__work-list">
                {relatedWork.map((record) => <li key={record.id}><a href={record.url} target="_blank" rel="noreferrer">{record.title}</a><span>{[record.category, record.duration, sourceDate(record)].filter(Boolean).join(' / ')}</span></li>)}
              </ol>
            ) : <p className="angel-capability__quiet">Explore the full archive to see the studio’s wider body of work.</p>}
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-related`}>
          <p className="angel-capability__number">Continue</p>
          <div>
            <h2 id={`${capability.slug}-related`}>Related capabilities</h2>
            <ul className="angel-capability__related-list">{capability.related.map((item, index) => <li key={item}><a href={capability.relatedRoutes[index]}>{item}</a></li>)}</ul>
          </div>
        </section>

        {specialistDomains.length > 0 && (
          <section className="angel-capability__section" aria-labelledby={`${capability.slug}-domains`}>
            <p className="angel-capability__number">Specialist Services</p>
            <div>
              <h2 id={`${capability.slug}-domains`}>{capability.title} services by domain</h2>
              <p>Go deeper into the exact service area behind your brief—each domain page covers deliverables, formats, creation journey and related work.</p>
              <ul className="angel-capability__domain-links">
                {specialistDomains.map((domain) => (
                  <li key={domain.route}>
                    <a href={domain.route}>
                      <span>{domain.parentLabel}</span>
                      <strong>{domain.contextualTitle}</strong>
                      <small>{domain.subtitle}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {capability.industryContexts && (
          <section className="angel-capability__section" aria-labelledby={`${capability.slug}-industries`}>
            <p className="angel-capability__number">Contexts</p>
            <div>
              <h2 id={`${capability.slug}-industries`}>Industry contexts</h2>
              <p>Settings where this craft can support communication, learning, commerce and collaboration.</p>
              <ul className="angel-capability__source-list">{capability.industryContexts.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </section>
        )}

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-faq`}>
          <p className="angel-capability__number">Planning Questions</p>
          <div>
            <h2 id={`${capability.slug}-faq`}>Before you brief {capability.title}</h2>
            <div className="angel-domain__faq-list">
              {capabilityFaqs(capability).map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <LeadCtaBand
          eyebrow={`${capability.title} · Free Project Roadmap`}
          title={`Ready to scope your ${capability.title} project?`}
          description="Share the audience, outcome and launch context. The brief arrives with this capability pre-selected, ready to turn into a direction, prototype and production estimate conversation."
          discipline={disciplineForCapabilityRoute(capability.route)}
          topic={capability.title}
          goal={capability.overview}
          sourceRoute={capability.route}
          primaryLabel="Get My Free Roadmap"
          secondaryHref="/domains/"
          secondaryLabel="Explore all 63 specialist domains"
          compact
        />
      </div>
    </section>
  );
}
