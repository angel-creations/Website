import {
  buildContactHref,
  LEAD_BUSINESS_EMAIL,
  LEAD_INTENTS,
  LEAD_PHONE_DISPLAY,
  LEAD_PHONE_HREF,
  trackLeadEvent,
  type LeadIntent,
} from '../utils/leads';

type LeadCtaBandProps = {
  eyebrow?: string;
  title: string;
  description: string;
  discipline?: string;
  topic?: string;
  goal?: string;
  sourceRoute: string;
  intent?: LeadIntent;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  compact?: boolean;
};

export function LeadCtaBand({
  eyebrow = 'Free Project Roadmap',
  title,
  description,
  discipline,
  topic,
  goal,
  sourceRoute,
  intent = 'project-roadmap',
  primaryLabel = 'Get My Free Roadmap',
  secondaryHref,
  secondaryLabel,
  compact = false,
}: LeadCtaBandProps): JSX.Element {
  const contactHref = buildContactHref({ discipline, topic, goal, sourceRoute, intent });
  const intentDetails = LEAD_INTENTS[intent];

  return (
    <section
      className={`angel-lead-band${compact ? ' angel-lead-band--compact' : ''}`}
      aria-labelledby={`lead-band-${sourceRoute.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}`}
    >
      <div className="angel-lead-band__glow" aria-hidden="true" />
      <div className="angel-lead-band__copy">
        <p className="angel-lead-band__eyebrow">
          <span aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={`lead-band-${sourceRoute.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}`}>{title}</h2>
        <p>{description}</p>
        <ul className="angel-lead-band__proof" aria-label="What your roadmap includes">
          <li>Creative direction</li>
          <li>Prototype milestone</li>
          <li>Production route</li>
          <li>Scope inputs</li>
        </ul>
      </div>

      <div className="angel-lead-band__actions">
        <a
          className="angel-lead-band__primary"
          href={contactHref}
          data-lead-event="lead_cta_click"
          data-lead-intent={intent}
          data-lead-topic={topic || discipline || 'General project'}
          onClick={() => trackLeadEvent('lead_cta_click', {
            intent,
            topic: topic || discipline || 'General project',
            sourceRoute,
            cta: primaryLabel,
          })}
        >
          <span>{primaryLabel}</span>
          <span aria-hidden="true">↗</span>
        </a>
        <a
          className="angel-lead-band__secondary"
          href={LEAD_PHONE_HREF}
          data-lead-event="lead_call_click"
          data-lead-intent="discovery-call"
          onClick={() => trackLeadEvent('lead_call_click', { sourceRoute, topic: topic || discipline })}
        >
          Call {LEAD_PHONE_DISPLAY}
        </a>
        {secondaryHref && secondaryLabel ? (
          <a className="angel-lead-band__text-link" href={secondaryHref}>
            {secondaryLabel} <span aria-hidden="true">→</span>
          </a>
        ) : (
          <a
            className="angel-lead-band__text-link"
            href={`mailto:${LEAD_BUSINESS_EMAIL}?subject=${encodeURIComponent(`${intentDetails.subjectPrefix} — Angel Creations`)}`}
            data-lead-event="lead_email_click"
            onClick={() => trackLeadEvent('lead_email_click', { sourceRoute, intent, topic: topic || discipline })}
          >
            Email the studio <span aria-hidden="true">→</span>
          </a>
        )}
        <p>{intentDetails.outcome} No obligation.</p>
      </div>
    </section>
  );
}
