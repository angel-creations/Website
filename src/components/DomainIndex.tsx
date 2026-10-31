import { useMemo, useState } from 'react';
import { domains } from '../data/domains';
import { slideExperiences } from '../data/slideExperiences';
import { LeadCtaBand } from './LeadCtaBand';
import { buildContactHref, disciplineForExperienceRoute, LEAD_PHONE_DISPLAY, LEAD_PHONE_HREF, trackLeadEvent } from '../utils/leads';
import { imageSize } from '../utils/imageDimensions';

export function DomainIndex(): JSX.Element {
  const [query, setQuery] = useState('');
  const [parentRoute, setParentRoute] = useState('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return domains.filter((domain) => {
      if (parentRoute !== 'all' && domain.parentRoute !== parentRoute) return false;
      if (!normalized) return true;
      const searchable = [
        domain.title,
        domain.contextualTitle,
        domain.parentLabel,
        domain.parentCategory,
        domain.subtitle,
        domain.description,
        domain.seoFocus,
        ...domain.seoAliases,
        ...domain.seoKeywords,
        ...domain.deliverables,
        ...domain.formats,
        ...domain.audiences,
      ].join(' ').toLowerCase();
      return normalized.split(/\s+/).every((term) => searchable.includes(term));
    });
  }, [parentRoute, query]);

  const selectedExperience = slideExperiences.find((experience) => experience.route === parentRoute);
  const leadTopic = query.trim()
    ? `${query.trim()} project`
    : selectedExperience
      ? `${selectedExperience.label} project`
      : 'Immersive project';
  const leadDiscipline = selectedExperience
    ? disciplineForExperienceRoute(selectedExperience.route)
    : 'Custom Multi-Discipline Commission';
  const heroContactHref = buildContactHref({
    discipline: leadDiscipline,
    intent: 'project-roadmap',
    sourceRoute: '/domains/',
    topic: leadTopic,
    goal: query.trim() ? `Domain search: ${query.trim()}` : selectedExperience?.summary,
  });

  return (
    <div className="angel-domain-index">
      <nav className="angel-domain__breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Domains</span>
      </nav>

      <section className="angel-domain-index__hero" aria-labelledby="domains-title">
        <p>XR, Animation, VFX & Film Services in India</p>
        <h1 id="domains-title">Every domain. Every world we can build.</h1>
        <p>
          Explore {domains.length} specialised services from a Jaipur-based studio working across India and
          worldwide—covering metaverse development, mixed reality, VR, AR and WebAR, 2D and 3D animation,
          VFX, brand films, ad campaigns, film and video production. Each domain explains deliverables,
          formats, audiences, the creation journey and related work.
        </p>
        <div className="angel-domain-index__stats" aria-label="Domain directory summary">
          <span><strong>{domains.length}</strong> Domain pages</span>
          <span><strong>{slideExperiences.length}</strong> Experience families</span>
          <span><strong>{domains.reduce((total, domain) => total + domain.deliverables.length, 0)}</strong> Listed deliverables</span>
        </div>
        <div className="angel-domain-index__hero-actions">
          <a
            href={heroContactHref}
            data-lead-event="lead_cta_click"
            data-lead-intent="project-roadmap"
            data-lead-topic={leadTopic}
            onClick={() => trackLeadEvent('lead_cta_click', {
              intent: 'project-roadmap',
              topic: leadTopic,
              sourceRoute: '/domains/',
              cta: 'Domain directory hero roadmap',
            })}
          >
            Get a Free Project Roadmap ↗
          </a>
          <a href={LEAD_PHONE_HREF}>Talk to a Producer · {LEAD_PHONE_DISPLAY}</a>
        </div>
      </section>


      <section className="angel-domain-index__controls" aria-labelledby="domains-filter-title">
        <div>
          <p id="domains-filter-title">Find a domain</p>
          <span id="domain-search-hint">Search by service, format, outcome or delivery style.</span>
        </div>
        <label className="angel-domain-index__search">
          <span className="sr-only">Search all domains</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search domains…"
            aria-describedby="domain-search-hint domain-results-count"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear domain search">×</button>}
        </label>
      </section>

      <div className="angel-domain-index__filters" role="group" aria-label="Filter domains by experience">
        <button type="button" className={parentRoute === 'all' ? 'is-active' : ''} aria-pressed={parentRoute === 'all'} onClick={() => setParentRoute('all')}>
          All Experiences <span>{domains.length}</span>
        </button>
        {slideExperiences.map((experience) => {
          const count = domains.filter((domain) => domain.parentRoute === experience.route).length;
          return (
            <button
              key={experience.route}
              type="button"
              className={parentRoute === experience.route ? 'is-active' : ''}
              aria-pressed={parentRoute === experience.route}
              onClick={() => setParentRoute(experience.route)}
            >
              {experience.label} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <p id="domain-results-count" className="angel-domain-index__count" aria-live="polite">
        Showing {filtered.length} of {domains.length} domain pages
      </p>

      {filtered.length > 0 ? (
        <div className="angel-domain-index__grid">
          {filtered.map((domain) => (
            <a
              key={domain.route}
              href={domain.route}
              className="angel-domain-index__card"
              style={{
                '--domain-accent': domain.accent,
                '--domain-accent-rgb': domain.accentRgb,
              } as React.CSSProperties}
            >
              <span className="angel-domain-index__media">
                <img src={domain.image}
                {...imageSize(domain.image)} alt="" loading="lazy" decoding="async" />
                <span>{domain.parentLabel}</span>
              </span>
              <span className="angel-domain-index__body">
                <small>{domain.parentCategory}</small>
                <strong>{domain.contextualTitle}</strong>
                <span>{domain.subtitle}</span>
                <span className="angel-domain-index__deliverables">
                  {domain.deliverables.slice(0, 3).map((item) => <em key={item}>{item}</em>)}
                </span>
                <span className="angel-domain-index__open">Open domain page ↗</span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="angel-domain-index__empty" role="status">
          <h2>No domain matches that search.</h2>
          <p>Try a broader word such as “virtual”, “animation”, “retail” or “production”.</p>
          <button type="button" onClick={() => { setQuery(''); setParentRoute('all'); }}>Show all domains</button>
          <p>
            <a href={heroContactHref}>Ask Angel Creations to map your idea →</a>
          </p>
        </div>
      )}

      <LeadCtaBand
        eyebrow="Not sure which domain fits?"
        title="Start with the outcome. We’ll map the domain."
        description="Tell us who the experience is for and what it must achieve. The free roadmap will frame the best format, specialist domain, prototype and production route—without forcing a technology choice too early."
        discipline={leadDiscipline}
        topic={leadTopic}
        goal={query.trim() ? `Domain search: ${query.trim()}` : selectedExperience?.summary}
        sourceRoute="/domains/"
        primaryLabel="Map My Project"
        secondaryHref="/works/"
        secondaryLabel="See the production archive"
      />
    </div>
  );
}
