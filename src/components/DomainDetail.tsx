import { useEffect, useMemo, useState } from 'react';
import rawArchive from '../data/videoArchive.json';
import { capabilityForRoute } from '../data/capabilities';
import { domainFaqs, domainsForParent, siblingDomains, type DomainRecord } from '../data/domains';
import { LeadCtaBand } from './LeadCtaBand';
import { cleanArchiveTitle } from '../utils/archiveCopy';
import { buildContactHref, trackLeadEvent } from '../utils/leads';

type VideoRecord = {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  tags?: string[];
  duration?: string;
  thumbnail?: string;
};

const archive = (rawArchive as VideoRecord[]).map((record) => ({
  ...record,
  title: cleanArchiveTitle(record.title),
}));

function relatedWork(domain: DomainRecord): Array<VideoRecord & { score: number }> {
  const scored = archive.map((record, index) => {
    const title = record.title.toLowerCase();
    const category = `${record.category || ''} ${(record.tags ?? []).join(' ')}`.toLowerCase();
    const description = record.description.toLowerCase();
    let score = 0;

    if (title.includes(domain.title.toLowerCase())) score += 18;
    if (title.includes(domain.contextualTitle.toLowerCase())) score += 18;

    domain.searchTerms.forEach((term) => {
      const normalized = term.toLowerCase();
      if (normalized.length < 3) return;
      if (title.includes(normalized)) score += normalized.length > 5 ? 6 : 4;
      if (category.includes(normalized)) score += 3;
      if (description.includes(normalized)) score += 1;
    });

    domain.parent.workTitleTerms.forEach((term) => {
      if (title.includes(term.toLowerCase())) score += 3;
    });

    return { ...record, score, index };
  })
    .filter((record) => record.score >= 7)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3);

  if (scored.length > 0) return scored;

  return archive
    .filter((record) => domain.parent.workTitleTerms.some((term) => record.title.toLowerCase().includes(term.toLowerCase())))
    .slice(0, 3)
    .map((record) => ({ ...record, score: 0 }));
}

function blueprintClusters(domain: DomainRecord) {
  const items = domain.deliverables;
  const first = Math.ceil(items.length / 3);
  const second = Math.ceil((items.length - first) / 2);
  return [
    {
      label: 'Signature Moments',
      heading: 'The moments people remember',
      description: `The defining beats of ${domain.contextualTitle}—the first impression, the discovery and the moment the idea becomes personal.`,
      items: items.slice(0, first),
    },
    {
      label: 'Experience Systems',
      heading: 'The systems beneath the magic',
      description: `The interaction, content and production systems that make ${domain.title} coherent, usable and ready to scale.`,
      items: items.slice(first, first + second),
    },
    {
      label: 'Launch Assets',
      heading: 'What the experience leaves behind',
      description: 'The reusable assets, formats and content extensions that carry the idea into campaigns, training, events and everyday use.',
      items: items.slice(first + second),
    },
  ].filter((cluster) => cluster.items.length > 0);
}

export function DomainDetail({ domain }: { domain: DomainRecord }): JSX.Element {
  const clusters = useMemo(() => blueprintClusters(domain), [domain]);
  const [activeCluster, setActiveCluster] = useState(0);
  const work = useMemo(() => relatedWork(domain), [domain]);
  const capabilities = useMemo(
    () => domain.parent.capabilityRoutes.map(capabilityForRoute).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 4),
    [domain]
  );
  const siblings = useMemo(() => siblingDomains(domain), [domain]);
  const parentDomains = useMemo(() => domainsForParent(domain.parentRoute), [domain]);
  const previous = parentDomains[(domain.siblingIndex - 1 + parentDomains.length) % parentDomains.length];
  const next = parentDomains[(domain.siblingIndex + 1) % parentDomains.length];
  const relatedSiblings = siblings.slice(0, 3);
  const contactHref = buildContactHref({
    discipline: domain.enquiryDiscipline,
    intent: 'project-roadmap',
    sourceRoute: domain.route,
    topic: domain.contextualTitle,
    goal: domain.subtitle,
  });
  const style = {
    '--domain-accent': domain.accent,
    '--domain-accent-secondary': domain.accentSecondary,
    '--domain-accent-rgb': domain.accentRgb,
  } as React.CSSProperties;

  useEffect(() => {
    setActiveCluster(0);
  }, [domain.route]);

  const cluster = clusters[activeCluster] ?? clusters[0];

  return (
    <div className="angel-domain" style={style}>
      <nav className="angel-domain__breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href={domain.parentRoute}>{domain.parentLabel}</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{domain.title}</span>
      </nav>

      <section className="angel-domain__hero" aria-labelledby="domain-title">
        <div className="angel-domain__hero-copy">
          <p className="angel-domain__eyebrow">{domain.parentLabel} Services in India · {domain.parentCategory}</p>
          <h1 id="domain-title">{domain.contextualTitle}</h1>
          <p className="angel-domain__subtitle">{domain.subtitle}</p>
          <p className="angel-domain__lead">{domain.description}</p>
          <div className="angel-domain__chips" aria-label={`${domain.title} highlights`}>
            {domain.deliverables.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="angel-domain__actions">
            <a
              className="angel-domain__button angel-domain__button--primary"
              href={contactHref}
              data-lead-event="lead_cta_click"
              data-lead-intent="project-roadmap"
              data-lead-topic={domain.contextualTitle}
              onClick={() => trackLeadEvent('lead_cta_click', {
                intent: 'project-roadmap',
                topic: domain.contextualTitle,
                sourceRoute: domain.route,
                cta: 'Domain hero project CTA',
              })}
            >
              Start a {domain.title} project <span aria-hidden="true">↗</span>
            </a>
            <a className="angel-domain__button" href={`${domain.parentRoute}#inner-domains`}>
              All {domain.parentLabel} domains <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="angel-lead-microcopy" aria-label="Project enquiry benefits">
            <span>Free roadmap</span>
            <span>No obligation</span>
            <span>{domain.parentLabel} pre-selected</span>
            <span>Jaipur · India · Worldwide</span>
          </div>
          <p className="angel-domain__meta">One of {domain.siblingCount} specialised {domain.parentLabel} domains at Angel Creations.</p>
        </div>

        <figure className="angel-domain__hero-media">
          <img src={domain.image} alt={domain.imageAlt} decoding="async" fetchPriority="high" />
          <span className="angel-domain__hero-orbit" aria-hidden="true" />
          <figcaption>
            <span>{domain.imageCaption}</span>
            <strong>{domain.subtitle}</strong>
          </figcaption>
        </figure>
      </section>

      <section id="domain-overview" className="angel-domain__section angel-domain__overview" aria-labelledby="domain-overview-title">
        <div className="angel-domain__section-head">
          <p>Overview</p>
          <h2 id="domain-overview-title">{domain.contextualTitle} services in India</h2>
        </div>
        <div className="angel-domain__overview-grid">
          <div className="angel-domain__editorial">
            <p className="angel-domain__statement">{domain.description}</p>
            <p>
              Within {domain.parentLabel}, {domain.title} is shaped around {domain.subtitle.toLowerCase()}. We connect
              the creative idea to the audience, the setting and the production system—so the experience is not only
              striking, but clear, usable and ready for the real world.
            </p>
            <p>
              Angel Creations provides {domain.seoFocus} from Jaipur, Rajasthan, working with clients
              across India and worldwide.
            </p>
            <p>{domain.parent.summary}</p>
            {domain.closing && <blockquote>{domain.closing}</blockquote>}
          </div>
          <div className="angel-domain__principles">
            {domain.principles.map((principle) => (
              <article key={principle.title} className="angel-domain__principle-card">
                <span aria-hidden="true" />
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="domain-blueprint" className="angel-domain__section" aria-labelledby="domain-blueprint-title">
        <div className="angel-domain__section-head">
          <p>Experience Blueprint</p>
          <h2 id="domain-blueprint-title">What our {domain.contextualTitle} services can include</h2>
          <span>Choose a layer to explore the deliverables behind {domain.contextualTitle}.</span>
        </div>

        <div className="angel-domain__blueprint">
          <div className="angel-domain__tabs" role="group" aria-label="Domain blueprint layers">
            {clusters.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={index === activeCluster ? 'is-active' : ''}
                aria-pressed={index === activeCluster}
                onClick={() => setActiveCluster(index)}
              >
                <span>{item.label}</span>
                <small>{item.items.length} deliverables</small>
              </button>
            ))}
          </div>

          {cluster && (
            <article key={cluster.label} className="angel-domain__blueprint-panel" aria-live="polite">
              <p>{cluster.label}</p>
              <h3>{cluster.heading}</h3>
              <p>{cluster.description}</p>
              <ul>
                {cluster.items.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span>
                    <strong>{item}</strong>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        <div className="angel-domain__context-grid">
          <article className="angel-domain__context-card">
            <p>Formats & Touchpoints</p>
            <h3>Where {domain.title} can live</h3>
            <ul>{domain.formats.map((format) => <li key={format}>{format}</li>)}</ul>
          </article>
          <article className="angel-domain__context-card">
            <p>Best Suited For</p>
            <h3>Who {domain.title} can serve</h3>
            <ul>{domain.audiences.map((audience) => <li key={audience}>{audience}</li>)}</ul>
          </article>
        </div>
      </section>

      <section id="domain-journey" className="angel-domain__section" aria-labelledby="domain-journey-title">
        <div className="angel-domain__section-head">
          <p>Creation Journey</p>
          <h2 id="domain-journey-title">{domain.journeyTitle}</h2>
          <span>{domain.journeyIntro}</span>
        </div>
        <ol className="angel-domain__journey">
          {domain.journey.map((step, index) => (
            <li key={step.title} className="angel-domain__journey-card">
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="angel-domain__journey-note">
          <h3>From first conversation to launch</h3>
          <p>
            A {domain.title} commission begins with the audience and the outcome. We then prototype the defining
            moment, build the full experience system, test it in context and refine the details people feel—not just
            the ones they see.
          </p>
        </div>
      </section>

      <section id="domain-work" className="angel-domain__section" aria-labelledby="domain-work-title">
        <div className="angel-domain__section-head">
          <p>Selected Work</p>
          <h2 id="domain-work-title">Related productions from the archive</h2>
          <span>Work connected to {domain.parentLabel} and the craft behind {domain.title}. Explore the complete <a href="/works/">Works archive</a> for all 47 productions.</span>
        </div>
        {work.length > 0 ? (
          <div className="angel-domain__work-grid">
            {work.map((record) => (
              <a key={record.id} className="angel-domain__work-card" href={record.url} target="_blank" rel="noreferrer">
                {record.thumbnail && <img src={record.thumbnail} alt={record.title} loading="lazy" decoding="async" />}
                <span>{record.category || domain.parentLabel}{record.duration ? ` · ${record.duration}` : ''}</span>
                <strong>{record.title}</strong>
                <small>Watch on YouTube ↗</small>
              </a>
            ))}
          </div>
        ) : (
          <p className="angel-domain__empty">Explore the <a href="/works/">Works archive</a> to see the studio’s wider production history.</p>
        )}
      </section>

      <section className="angel-domain__section" aria-labelledby="domain-capabilities-title">
        <div className="angel-domain__section-head">
          <p>Studio Capabilities</p>
          <h2 id="domain-capabilities-title">The disciplines behind the domain</h2>
        </div>
        <div className="angel-domain__capability-grid">
          {capabilities.map((capability) => (
            <a key={capability.route} href={capability.route} className="angel-domain__capability-card">
              <span>{capability.eyebrow}</span>
              <strong>{capability.title}</strong>
              <small>{capability.overview}</small>
              <em>Explore capability ↗</em>
            </a>
          ))}
        </div>
      </section>

      <section id="domain-faq" className="angel-domain__section" aria-labelledby="domain-faq-title">
        <div className="angel-domain__section-head">
          <p>Questions</p>
          <h2 id="domain-faq-title">{domain.contextualTitle} FAQs</h2>
        </div>
        <div className="angel-domain__faq-list">
          {domainFaqs(domain).map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="angel-domain__section" aria-labelledby="domain-siblings-title">
        <div className="angel-domain__section-head">
          <p>Continue Exploring</p>
          <h2 id="domain-siblings-title">Related {domain.parentLabel} services</h2>
        </div>
        <div className="angel-domain__sibling-grid">
          {relatedSiblings.map((sibling) => (
            <a key={sibling.route} href={sibling.route} className="angel-domain__sibling-card">
              <img src={sibling.image} alt={sibling.imageAlt} loading="lazy" decoding="async" />
              <span>{sibling.parentLabel} Domain</span>
              <strong>{sibling.contextualTitle}</strong>
              <small>{sibling.subtitle}</small>
              <em>Open domain page ↗</em>
            </a>
          ))}
        </div>
        <nav className="angel-domain__prev-next" aria-label="Previous and next domain">
          {previous && <a href={previous.route}><span>Previous domain</span><strong>← {previous.contextualTitle}</strong></a>}
          {next && <a href={next.route}><span>Next domain</span><strong>{next.contextualTitle} →</strong></a>}
        </nav>
      </section>

      <LeadCtaBand
        eyebrow={`${domain.parentLabel} · ${domain.title} · Free Project Roadmap`}
        title={`Have an idea for ${domain.title}?`}
        description="Tell us what you want people to experience, understand or remember. Your brief arrives pre-set for this domain, and the roadmap turns it into a creative direction, prototype milestone and production route."
        discipline={domain.enquiryDiscipline}
        topic={domain.contextualTitle}
        goal={domain.subtitle}
        sourceRoute={domain.route}
        secondaryHref="/works/"
        secondaryLabel="See related production work"
      />
    </div>
  );
}
