import rawArchive from '../data/videoArchive.json';
import type { Capability } from '../data/capabilities';

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

const archive = rawArchive as VideoRecord[];

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

  return (
    <section className={`angel-capability${includeHero ? '' : ' angel-capability--extension'}`} aria-labelledby={`capability-${capability.slug}-title`}>
      <header className="angel-capability__hero">
        <p className="angel-capability__eyebrow">{capability.eyebrow}</p>
        <Title id={`capability-${capability.slug}-title`}>{capability.title}</Title>
        <p className="angel-capability__overview">{capability.overview}</p>
        <a className="angel-capability__hero-cta" href="/contact/">Need this capability? Start a project <span aria-hidden="true">↗</span></a>
      </header>

      <div className="angel-capability__sections">
        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-creates`}>
          <p className="angel-capability__number" aria-hidden="true">01</p>
          <div>
            <h2 id={`${capability.slug}-creates`}>What Angel creates</h2>
            <p>Current public Angel source material lists:</p>
            <ul className="angel-capability__source-list">{capability.creates.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-contexts`}>
          <p className="angel-capability__number" aria-hidden="true">02</p>
          <div>
            <h2 id={`${capability.slug}-contexts`}>What it can support</h2>
            <p>These are application contexts named in the captured Angel source. They are not claimed as case-study outcomes.</p>
            <ul className="angel-capability__source-list">{capability.applications.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-approach`}>
          <p className="angel-capability__number" aria-hidden="true">03</p>
          <div>
            <h2 id={`${capability.slug}-approach`}>Creative approach</h2>
            <p>{capability.approach}</p>
          </div>
        </section>

        {visualExamples.length > 0 && (
          <section className="angel-capability__visuals" aria-labelledby={`${capability.slug}-visuals`}>
            <div className="angel-capability__section-heading"><p className="angel-capability__number" aria-hidden="true">04</p><h2 id={`${capability.slug}-visuals`}>Visual examples</h2></div>
            <div className="angel-capability__visual-list">
              {visualExamples.map((record) => (
                <a href={record.url} target="_blank" rel="noreferrer" key={record.id} className="angel-capability__visual">
                  {record.thumbnail && <picture><source srcSet={webpSource(record.thumbnail)} type="image/webp" /><img src={record.thumbnail} alt="" loading="lazy" decoding="async" /></picture>}
                  <span>{record.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-work`}>
          <p className="angel-capability__number" aria-hidden="true">05</p>
          <div>
            <h2 id={`${capability.slug}-work`}>Relevant public work</h2>
            <p>Source records are matched only by their published title, description, or tags. Explore the full <a href="/works/">Works archive</a> for all 47 records.</p>
            {relatedWork.length > 0 ? (
              <ol className="angel-capability__work-list">
                {relatedWork.map((record) => <li key={record.id}><a href={record.url} target="_blank" rel="noreferrer">{record.title}</a><span>{[record.category, record.duration, sourceDate(record)].filter(Boolean).join(' / ')}</span></li>)}
              </ol>
            ) : <p className="angel-capability__quiet">No public source record can be matched without stretching the evidence.</p>}
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-related`}>
          <p className="angel-capability__number" aria-hidden="true">06</p>
          <div>
            <h2 id={`${capability.slug}-related`}>Related capabilities</h2>
            <ul className="angel-capability__related-list">{capability.related.map((item, index) => <li key={item}><a href={capability.relatedRoutes[index]}>{item}</a></li>)}</ul>
          </div>
        </section>

        <section className="angel-capability__section" aria-labelledby={`${capability.slug}-insights`}>
          <p className="angel-capability__number" aria-hidden="true">07</p>
          <div>
            <h2 id={`${capability.slug}-insights`}>Relevant insights</h2>
            <p>No separate authored insight record is asserted here without a verified source. The closest source-qualified material is the <a href="/works/">public Works archive</a>, where titles, descriptions, dates, and available metadata remain attached to their original records.</p>
          </div>
        </section>

        {capability.industryContexts && (
          <section className="angel-capability__section" aria-labelledby={`${capability.slug}-industries`}>
            <p className="angel-capability__number" aria-hidden="true">08</p>
            <div>
              <h2 id={`${capability.slug}-industries`}>Relevant industry contexts</h2>
              <p>Only source-qualified application contexts are included; this is not an industry-location page system.</p>
              <ul className="angel-capability__source-list">{capability.industryContexts.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </section>
        )}

        <section className="angel-capability__cta" aria-label={`Start a ${capability.title} project`}>
          <p>{capability.title} / a conversation starts here.</p>
          <a href="/contact/">Start a project <span aria-hidden="true">↗</span></a>
        </section>
      </div>
    </section>
  );
}
