import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AUDIENCE_NOTE,
  CERTIFICATE_PREVIEW,
  DECLARATIONS,
  FEE_INCLUDES,
  HERO,
  INTERNSHIP_DOMAINS,
  INTERNSHIP_FAQS,
  JOURNEY_STAGES,
  LEARNING_EXPERIENCE,
  PROGRAMME_APPROACH,
  PROGRAMME_DETAILS,
  PROGRAMME_FACTS,
} from '../data/internship';
import {
  sendInternshipApplication,
  type ApplicationPayload,
} from '../utils/internshipApplication';
import { LEAD_DRAFT_STORAGE_KEY, trackLeadEvent } from '../utils/leads';

const DRAFT_STORAGE_KEY = 'angel-creations:internship-draft:v1';


/**
 * Editorial rhythm for the discipline grid (12-column track):
 * 7+5 · 6+6 · 5+7 · 6+6 · 6+6 · 12. Every row is exactly full at every width,
 * so the asymmetry is composed rather than accidental: the opening spread and
 * the mid-page mirror carry the weight, the pairs sit quieter between them, and
 * the closing entry runs the full measure.
 */
const DISCIPLINE_RHYTHM = [
  'lead', 'end',
  'half', 'half',
  'offset', 'feature',
  'half', 'half',
  'half', 'half',
  'full',
];

/**
 * Discipline picker.
 * ---------------------------------------------------------------------------
 * A native <select> cannot be styled past its closed state, so every option
 * list inherits the OS menu — which is what made this field look unfinished
 * next to the rest of the form. This is a WAI-ARIA combobox + listbox pair
 * instead: searchable by typing, fully keyboard driven, and it renders the
 * real discipline list with each domain's role count.
 *
 * The form still posts a plain `domain` id, so validation and the EmailJS
 * payload are unchanged.
 */
function DomainPicker({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Where the panel can physically go. On phones and tablets the field often
  // sits low in the viewport, and a 19rem panel dropped below it would run off
  // the bottom of the screen — so the panel measures the space on both sides
  // and opens upward when that is the roomier direction.
  const [placement, setPlacement] = useState<{ above: boolean; maxHeight: number }>({
    above: false,
    maxHeight: 304,
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selected = INTERNSHIP_DOMAINS.find((group) => group.id === value);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return INTERNSHIP_DOMAINS;
    return INTERNSHIP_DOMAINS.filter((group) =>
      `${group.title} ${group.eyebrow} ${group.roles.join(' ')}`.toLowerCase().includes(needle),
    );
  }, [query]);

  // Clamp the active row whenever the result set shrinks under it.
  useEffect(() => {
    setActive((current) => (current > results.length - 1 ? Math.max(results.length - 1, 0) : current));
  }, [results.length]);

  // Close on outside pointer, but never steal focus while doing it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Decide above/below whenever the panel is open, and keep it correct while the
  // user scrolls or rotates the device.
  useEffect(() => {
    if (!open) return;
    const EDGE = 12;
    const RECLAIM = 124; // leave the field itself and its label reachable
    const measure = () => {
      const control = inputRef.current;
      if (!control) return;
      const rect = control.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - EDGE;
      const spaceAbove = rect.top - EDGE - RECLAIM;
      const above = spaceBelow < 240 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, Math.min(304, above ? spaceAbove : spaceBelow));
      setPlacement((current) =>
        current.above === above && Math.abs(current.maxHeight - maxHeight) < 2
          ? current
          : { above, maxHeight },
      );
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [open]);

  // Keep the active row visible during keyboard navigation.
  useEffect(() => {
    if (!open) return;
    const row = listRef.current?.children[active] as HTMLElement | undefined;
    row?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  const commit = (group: (typeof INTERNSHIP_DOMAINS)[number]) => {
    onChange(group.id);
    setOpen(false);
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        if (next < 0) return results.length - 1;
        if (next > results.length - 1) return 0;
        return next;
      });
      return;
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault();
      const group = results[active];
      if (group) commit(group);
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setQuery('');
      return;
    }
    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === 'End' && open) {
      event.preventDefault();
      setActive(results.length - 1);
    }
  };

  const listId = 'domain-listbox';

  return (
    <div className={`ac-intern__picker${placement.above ? ' is-above' : ''}`} ref={rootRef}>
      {/* The form field itself. It carries the committed label so assistive
          tech announces the choice, and it doubles as the search box. */}
      <div className={`ac-intern__picker-control${open ? ' is-open' : ''}`}>
        <input
          ref={inputRef}
          id="domain"
          name="domain"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `domain-option-${results[active].id}` : undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          aria-required="true"
          autoComplete="off"
          value={open ? query : (selected?.title ?? '')}
          placeholder="Select a discipline"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          // A keyboard user tabbing away should still register a real value.
          onBlur={() => {
            if (!selected) onChange('');
          }}
        />
        <span className="ac-intern__picker-chevron" aria-hidden="true" />
      </div>

      {open ? (
        <ul
          className={`ac-intern__picker-list${placement.above ? ' is-above' : ''}`}
          id={listId}
          role="listbox"
          aria-label="Internship disciplines"
          ref={listRef}
          style={{ maxHeight: `${placement.maxHeight}px` }}
        >
          {results.length === 0 ? (
            <li className="ac-intern__picker-empty">No discipline matches “{query}”.</li>
          ) : (
            results.map((group, index) => (
              <li
                key={group.id}
                id={`domain-option-${group.id}`}
                role="option"
                aria-selected={group.id === value}
                className={`ac-intern__picker-option${index === active ? ' is-active' : ''}${group.id === value ? ' is-selected' : ''}`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  commit(group);
                }}
                onPointerEnter={() => setActive(index)}
              >
                <span className="ac-intern__picker-mark" aria-hidden="true">{group.code}</span>
                <span className="ac-intern__picker-text">
                  <span className="ac-intern__picker-title">{group.title}</span>
                  <span className="ac-intern__picker-meta">
                    {group.eyebrow} · {group.roles.length} roles
                  </span>
                </span>
                <span className="ac-intern__picker-tick" aria-hidden="true" />
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

type FieldErrors = Record<string, string>;

/**
 * The short application: five questions. Everything the studio previously
 * collected here (role, mode, motivation, skills, portfolio, resume) is now
 * gathered in the review conversation instead, so nothing is lost downstream —
 * the delivery payload simply carries the fields that exist.
 */
const INITIAL_VALUES: Record<string, string> = {
  fullName: '',
  email: '',
  mobile: '',
  domain: '',
  college: '',
};

const INITIAL_DECLARATIONS: Record<string, boolean> = DECLARATIONS.reduce(
  (accumulator, item) => ({ ...accumulator, [item.id]: false }),
  {},
);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?$/i;

function validate(values: Record<string, string>, declarations: Record<string, boolean>): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullName.trim()) errors.fullName = 'Please enter your full name.';
  else if (values.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';

  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address.';

  if (!values.mobile.trim()) errors.mobile = 'Please enter your WhatsApp number.';
  else if (!MOBILE_PATTERN.test(values.mobile.trim())) errors.mobile = 'Please enter a valid contact number.';

  if (!values.domain) errors.domain = 'Please select your preferred internship domain.';

  if (!values.college.trim()) errors.college = 'Please enter your college or institution.';

  if (!declarations.terms) errors.declarations = 'Please confirm the declaration to continue.';

  return errors;
}

function readDraft(): { values: Record<string, string>; declarations: Record<string, boolean> } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { values?: Record<string, string>; declarations?: Record<string, boolean> };
    if (!parsed.values) return null;
    return {
      values: { ...INITIAL_VALUES, ...parsed.values },
      declarations: { ...INITIAL_DECLARATIONS, ...(parsed.declarations ?? {}) },
    };
  } catch {
    return null;
  }
}

function track(eventName: string, payload: Record<string, string | number | boolean | undefined> = {}): void {
  try {
    trackLeadEvent(eventName, payload);
  } catch {
    // Measurement is best-effort and must never affect what the applicant is told.
  }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export function InternshipPage(): JSX.Element {
  const [values, setValues] = useState<Record<string, string>>(INITIAL_VALUES);
  const [declarations, setDeclarations] = useState<Record<string, boolean>>(INITIAL_DECLARATIONS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef(false);
  const certificateTriggerRef = useRef<HTMLButtonElement | null>(null);
  const certificateDialogRef = useRef<HTMLDivElement | null>(null);
  const certificateCloseRef = useRef<HTMLButtonElement | null>(null);

  // Certificate lightbox: trap focus, close on Escape, and hand focus back to the
  // thumbnail that opened it. Mirrors the focus behaviour of the site menu.
  useEffect(() => {
    if (!certificateOpen) return undefined;

    const dialog = certificateDialogRef.current;
    const trigger = certificateTriggerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      certificateCloseRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setCertificateOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, a[href]'),
      ).filter((item) => item.getClientRects().length > 0);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = bodyOverflow;
      (trigger ?? previouslyFocused)?.focus();
    };
  }, [certificateOpen]);

  // Restore an in-progress application so a refresh never loses a long answer.
  useEffect(() => {
    const draft = readDraft();
    if (!draft) return;
    const hasContent = Object.values(draft.values).some(Boolean);
    if (!hasContent) return;
    setValues(draft.values);
    setDeclarations(draft.declarations);
    setDraftRestored(true);
  }, []);

  // Persist the draft, but never after submission.
  useEffect(() => {
    if (status === 'sent') {
      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* storage is optional */
      }
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ values, declarations }));
      } catch {
        /* storage is optional */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, declarations, status]);

  const totalRoles = INTERNSHIP_DOMAINS.reduce((count, group) => count + group.roles.length, 0);

  const setField = useCallback((name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setField(name, value);
  };

  const openDomainInForm = (groupId: string): void => {
    setValues((current) => ({ ...current, domain: groupId }));
    track('internship_domain_select', { domain: groupId });
    const form = document.getElementById('apply');
    if (form) {
      form.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        document.getElementById('domain')?.focus({ preventScroll: true });
      }, 480);
    }
  };

  const scrollToForm = (): void => {
    document.getElementById('apply')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    track('internship_apply_click');
  };

  const focusFirstError = (nextErrors: FieldErrors): void => {
    const order = ['fullName', 'email', 'mobile', 'domain', 'college', 'declarations'];
    const firstKey = order.find((key) => nextErrors[key]);
    if (!firstKey) return;
    const target = formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)
      ?? document.getElementById('declarations-group');
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => target?.focus?.({ preventScroll: true }), 420);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === 'sending' || submittedRef.current) return;

    if (honeypotRef.current?.value.trim()) {
      // A bot filled an invisible field. Report success without sending.
      setStatus('sent');
      setStatusMessage('Thank you. Your application has been received.');
      return;
    }

    const nextErrors = validate(values, declarations);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      setStatus('error');
      setStatusMessage('Please review the highlighted fields before submitting.');
      return;
    }

    setStatus('sending');
    setStatusMessage('Sending your application…');

    const domainLabel = INTERNSHIP_DOMAINS.find((item) => item.id === values.domain)?.title ?? values.domain;
    const payload: ApplicationPayload = {
      values: { ...values, domain: domainLabel },
      declarations,
      declarationLabels: DECLARATIONS.map((item) => item.label),
      resume: null,
      attribution: {
        source_route: '/internship/',
        first_landing_page: window.location.pathname,
        referrer: document.referrer || 'direct',
      },
    };

    const result = await sendInternshipApplication(payload);

    if (result.studioNotified) {
      submittedRef.current = true;
      setStatus('sent');
      setStatusMessage(
        result.confirmationSent
          ? 'Thank you. Your application has been sent to the Angel Creations team and a confirmation email is on its way to your inbox.'
          : 'Thank you. Your application has been sent to the Angel Creations team. We could not send the confirmation email, but the studio has your application and can reply to the address you provided.',
      );
      track('internship_application_submitted', {
        domain: domainLabel,
        form_provider: 'emailjs',
      });
      window.setTimeout(() => {
        statusRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        statusRef.current?.focus({ preventScroll: true });
      }, 120);
    } else {
      setStatus('error');
      setStatusMessage(
        'We could not send your application just now. Your answers are saved in this browser — please use “Copy application” below and email it to business@angelcreations.in, or try again in a moment.',
      );
      track('internship_application_error');
    }
  };

  const copyApplication = async (): Promise<void> => {
    const domainLabel = INTERNSHIP_DOMAINS.find((item) => item.id === values.domain)?.title ?? values.domain;
    const lines = [
      'Internship application — Angel Creations',
      '',
      `Full name: ${values.fullName}`,
      `Email: ${values.email}`,
      `WhatsApp number: ${values.mobile}`,
      `Preferred domain: ${domainLabel}`,
      `College / Institution: ${values.college}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
      track('internship_application_copy');
    } catch {
      setCopied(false);
    }
  };

  const startOver = (): void => {
    setValues(INITIAL_VALUES);
    setDeclarations(INITIAL_DECLARATIONS);
    setErrors({});
    setStatus('idle');
    setStatusMessage('');
    submittedRef.current = false;
    setDraftRestored(false);
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* storage is optional */
    }
  };

  const visibleFaqs = showAllFaqs ? INTERNSHIP_FAQS : INTERNSHIP_FAQS.slice(0, 6);

  return (
    <div className="ac-intern">
      {/* 01 — HERO */}
      <section className="ac-intern__hero" aria-labelledby="internship-title">
        <div className="ac-intern__hero-shell">
          <div className="ac-intern__hero-copy">
            <p className="ac-intern__eyebrow">
              <span aria-hidden="true" />
              {HERO.eyebrow}
            </p>

            <h1 id="internship-title">
              {HERO.headline}
              <em>{HERO.headlineEmphasis}</em>
            </h1>

            <p className="ac-intern__hero-support">{HERO.support}</p>

            <div className="ac-intern__hero-actions">
              <button type="button" className="ac-intern__btn ac-intern__btn--primary" onClick={scrollToForm}>
                {HERO.primaryCta}
              </button>
              <a className="ac-intern__btn ac-intern__btn--ghost" href="#philosophy">
                {HERO.secondaryCta}
              </a>
            </div>

            <p className="ac-intern__hero-audience">{AUDIENCE_NOTE}</p>
          </div>

          <figure className="ac-intern__hero-visual">
            <img
              className="ac-intern__hero-img"
              src={HERO.image}
              alt={HERO.imageAlt}
              width={HERO.imageWidth}
              height={HERO.imageHeight}
              fetchPriority="high"
              decoding="async"
            />
            <img
              className="ac-intern__hero-inset"
              src={HERO.insetImage}
              alt={HERO.insetAlt}
              width={HERO.insetWidth}
              height={HERO.insetHeight}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>

        <dl className="ac-intern__hero-facts">
          {HERO.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 02 — PHILOSOPHY */}
      <section className="ac-intern__philosophy" id="philosophy" aria-labelledby="philosophy-title">
        <div className="ac-intern__wrap">
          <div className="ac-intern__philosophy-grid">
            <div className="ac-intern__philosophy-lead">
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                The philosophy
              </p>
              <h2 id="philosophy-title">
                Less theory.
                <em>More doing.</em>
              </h2>
            </div>

            <div className="ac-intern__philosophy-body">
              <p className="ac-intern__philosophy-intro">
                Nobody learns to make good work by reading about it. Participants here are given
                supervised practical assignments, held to professional standards, and reviewed the way
                studio work is reviewed.
              </p>
              <p>
                That means working inside real workflows — briefs, drafts, handoffs, critique and
                delivery — alongside a team rather than in isolation. The point is not to finish an
                exercise, but to build the habits that make someone employable: reliability, judgement
                and the ability to take feedback without losing the idea.
              </p>
            </div>
          </div>

          <figure className="ac-intern__philosophy-visual">
            <img
              src="/media/library/animation/app-03-2d-animation.jpg"
              alt="Illustrator drawing a concept on a tablet at a studio desk"
              width="1920"
              height="1280"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Concept development — where a brief becomes a direction.</figcaption>
          </figure>

          <ul className="ac-intern__approach">
            {PROGRAMME_APPROACH.map((item) => (
              <li key={item.code}>
                <span className="ac-intern__approach-code">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 — DISCIPLINES */}
      <section className="ac-intern__disciplines" id="disciplines" aria-labelledby="disciplines-title">
        <div className="ac-intern__wrap">
          <header className="ac-intern__disciplines-head">
            <div>
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                {INTERNSHIP_DOMAINS.length} disciplines
              </p>
              <h2 id="disciplines-title">Find your place in the creative industry.</h2>
            </div>
            <p className="ac-intern__disciplines-note">
              Choose the discipline you want to be considered for. You will confirm your specific
              role during the review conversation, so you are not locked in by this choice.
            </p>
          </header>

          <div className="ac-intern__discipline-grid">
            {INTERNSHIP_DOMAINS.map((group, index) => (
              <article
                key={group.id}
                className={`ac-intern__discipline ac-intern__discipline--${DISCIPLINE_RHYTHM[index % DISCIPLINE_RHYTHM.length]}`}
              >
                <img
                  className={group.imageFit === 'contain' ? 'is-contain' : undefined}
                  src={group.image}
                  alt={group.imageAlt}
                  width="900"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  style={group.imagePosition ? { objectPosition: group.imagePosition } : undefined}
                />
                <div className="ac-intern__discipline-body">
                  <p className="ac-intern__discipline-meta">
                    <span>{group.code}</span>
                    {group.eyebrow}
                  </p>
                  <h3>{group.title}</h3>
                  <p className="ac-intern__discipline-summary">{group.summary}</p>
                  <ul className="ac-intern__rolelist">
                    {group.roles.map((role) => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="ac-intern__discipline-cta"
                    onClick={() => openDomainInForm(group.id)}
                  >
                    Apply in this discipline
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — LEARNING EXPERIENCE */}
      <section className="ac-intern__learning" id="experience" aria-labelledby="learning-title">
        <div className="ac-intern__wrap">
          <header className="ac-intern__learning-head">
            <p className="ac-intern__eyebrow">
              <span aria-hidden="true" />
              The learning experience
            </p>
            <h2 id="learning-title">Experience what the classroom can’t teach.</h2>
          </header>

          <div className="ac-intern__learning-flow">
            {LEARNING_EXPERIENCE.map((item, index) => (
              <article
                key={item.code}
                className={`ac-intern__learning-row${index % 2 === 1 ? ' ac-intern__learning-row--flip' : ''}`}
              >
                <figure className="ac-intern__learning-media">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="ac-intern__learning-copy">
                  <span className="ac-intern__learning-code">{item.code}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <p className="ac-intern__learning-caveat">
            Participants are given practical assignments and may be involved in supervised project
            work. Access to live client projects, direct client contact or confidential material
            depends on discipline, demonstrated capability, project availability, supervision and
            confidentiality requirements, and is not guaranteed. Independent ownership of client work
            is not part of this programme.
          </p>
        </div>
      </section>

      {/* 05 — 90-DAY JOURNEY */}
      <section className="ac-intern__journey" id="journey" aria-labelledby="journey-title">
        <div className="ac-intern__wrap">
          <header className="ac-intern__journey-head">
            <div>
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                The 90-day journey
              </p>
              <h2 id="journey-title">Three months, deliberately structured.</h2>
            </div>
            <p className="ac-intern__journey-note">
              Each stage builds on the last, with reviews built into the process rather than saved
              for the end.
            </p>
          </header>

          <ol className="ac-intern__timeline">
            {JOURNEY_STAGES.map((stage) => (
              <li key={stage.code} className="ac-intern__timeline-stage">
                <div className="ac-intern__timeline-marker" aria-hidden="true">
                  {/* The number is only shown in the stacked (small-screen)
                      stepper, where it replaces a bare dot. On the wide
                      three-column timeline the dot stays unlabelled. */}
                  <span>{stage.code}</span>
                </div>
                {/* The card is its own element so that the small-screen stepper
                    can place the node in a column *outside* the bordered box.
                    On wide screens this wrapper is layout-transparent. */}
                <div className="ac-intern__timeline-card">
                  <p className="ac-intern__timeline-month">{stage.month}</p>
                  <h3>{stage.title}</h3>
                  <p className="ac-intern__timeline-summary">{stage.summary}</p>
                  <ul>
                    {stage.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 06 — RECOGNITION */}
      <section className="ac-intern__recognition" id="recognition" aria-labelledby="recognition-title">
        <div className="ac-intern__wrap">
          <header className="ac-intern__recognition-head">
            <p className="ac-intern__eyebrow">
              <span aria-hidden="true" />
              Recognition
            </p>
            <h2 id="recognition-title">Your effort deserves recognition.</h2>
            <p>
              Participants who complete the programme and satisfy the required evaluation criteria
              receive an official Certificate of Internship from Angel Creations.
            </p>
          </header>

          <figure className="ac-intern__cert-figure">
            <button
              type="button"
              ref={certificateTriggerRef}
              className="ac-intern__cert-frame"
              onClick={() => {
                track('certificate_preview_open', { sourceRoute: '/internship/' });
                setCertificateOpen(true);
              }}
              aria-label="Open a larger preview of the Angel Creations internship certificate"
            >
              <img
                src={CERTIFICATE_PREVIEW.image}
                alt={CERTIFICATE_PREVIEW.alt}
                width={CERTIFICATE_PREVIEW.width}
                height={CERTIFICATE_PREVIEW.height}
                loading="lazy"
                decoding="async"
              />
              <span className="ac-intern__cert-zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M15.4 15.4 21 21M10.5 7.5v6M7.5 10.5h6" />
                </svg>
                View larger
              </span>
            </button>
          </figure>

          <p className="ac-intern__cert-disclaimer">{CERTIFICATE_PREVIEW.disclaimer}</p>
        </div>
      </section>

      {/* 07 — PROGRAMME DETAILS */}
      <section className="ac-intern__details" id="details" aria-labelledby="details-title">
        <div className="ac-intern__wrap">
          <div className="ac-intern__details-grid">
            <div className="ac-intern__details-lead">
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                Programme details
              </p>
              <h2 id="details-title">Everything you should know before you apply.</h2>
              <p className="ac-intern__details-price">
                <span>{PROGRAMME_FACTS.fee}</span>
                <em>{PROGRAMME_FACTS.feeNote}</em>
              </p>
              <p className="ac-intern__details-copy">
                The fee is for a structured learning programme. It covers supervised learning
                activities, practical assignments, domain-specific exposure and performance
                evaluation. Payment is requested only after an application is reviewed and accepted —
                never before.
              </p>
              <ul className="ac-intern__checklist">
                {FEE_INCLUDES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="ac-intern__details-panel">
              <h3>At a glance</h3>
              <dl className="ac-intern__details-list">
                {PROGRAMME_DETAILS.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>
                      {row.value}
                      {'note' in row && row.note ? <small>{row.note}</small> : null}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="ac-intern__details-note">
                This programme does not imply university accreditation. No stipend, salary, placement
                or employment is offered or promised.
              </p>
            </div>
          </div>

          <div className="ac-intern__policy-grid">
            <article id="programme-terms">
              <h3>Programme terms</h3>
              <ul>
                <li>The programme runs for three months from the agreed start date.</li>
                <li>Participation is online and remote, with project collaboration where applicable.</li>
                <li>Selection is based on application review and suitability for the chosen discipline.</li>
                <li>Participants are expected to meet attendance, assignment and conduct requirements.</li>
                <li>The studio may end participation where conduct or performance requirements are not met.</li>
              </ul>
            </article>
            <article id="fee-refund">
              <h3>Fee &amp; refund policy</h3>
              <ul>
                <li>The programme fee is {PROGRAMME_FACTS.fee}, paid once after acceptance.</li>
                <li>No payment is collected before an application is reviewed and accepted.</li>
                <li>The fee covers the structured learning programme described on this page.</li>
                <li>No stipend, salary or placement is provided in exchange for the fee.</li>
                <li>Refund eligibility depends on the stage at which a participant withdraws; contact the studio before paying to confirm the current policy.</li>
              </ul>
            </article>
            <article id="certificate-eligibility">
              <h3>Certificate eligibility criteria</h3>
              <ul>
                <li>Completion of the three-month programme.</li>
                <li>Fulfilment of attendance and assignment requirements.</li>
                <li>Satisfactory conduct throughout the programme.</li>
                <li>Successful performance evaluation and completion assessment.</li>
                <li>Certification is not guaranteed and is never issued on payment alone.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 08 — APPLICATION */}
      <section className="ac-intern__apply" id="apply" aria-labelledby="apply-title">
        <div className="ac-intern__wrap">
          <div className="ac-intern__apply-grid">
            <div className="ac-intern__apply-lead">
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                Application
              </p>
              <h2 id="apply-title">Your next chapter starts here.</h2>
              <p className="ac-intern__apply-intro">
                Five details, under a minute. There is nothing to upload and nothing to pay at this
                stage.
              </p>
              <ol className="ac-intern__apply-steps">
                <li>
                  <span><strong>Apply.</strong> Send the short application.</span>
                </li>
                <li>
                  <span><strong>Review.</strong> We review it and contact you by email or WhatsApp.</span>
                </li>
                <li>
                  <span><strong>Clarity first.</strong> Programme details, eligibility, fees and next steps are explained before enrolment.</span>
                </li>
              </ol>
              <p className="ac-intern__apply-alt">
                Prefer email?{' '}
                <a href={`mailto:business@angelcreations.in?subject=${encodeURIComponent('Internship application — Angel Creations')}`}>
                  business@angelcreations.in
                </a>
              </p>
            </div>

            <div className="ac-intern__apply-panel">
              {draftRestored && status === 'idle' ? (
                <p className="ac-intern__draft-note" role="status">
                  We restored a draft application saved in this browser.{' '}
                  <button type="button" onClick={startOver}>Start fresh</button>
                </p>
              ) : null}

              {status === 'sent' ? (
                <div className="ac-intern__confirm" ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
                  <p className="ac-intern__confirm-badge">Application received</p>
                  <h3>Thank you — your application is with us.</h3>
                  {statusMessage.includes('could not send') ? <p>{statusMessage}</p> : null}
                  <ol className="ac-intern__confirm-steps">
                    <li><strong>Application received.</strong> Your details are with the Angel Creations team.</li>
                    <li><strong>Review and contact.</strong> We review every application and get in touch by email or WhatsApp.</li>
                    <li><strong>Before enrolment.</strong> Programme details, eligibility, fees and next steps are explained to you first.</li>
                  </ol>
                  <p className="ac-intern__confirm-note">
                    No payment is collected at this stage, and a review does not guarantee selection,
                    certification or placement.
                  </p>
                  <div className="ac-intern__confirm-actions">
                    <a className="ac-intern__btn ac-intern__btn--primary" href="/">Back to the studio</a>
                    <button type="button" className="ac-intern__btn ac-intern__btn--ghost" onClick={startOver}>
                      Submit another application
                    </button>
                  </div>
                </div>
              ) : (
                <form className="ac-intern__form ac-intern__form--short" ref={formRef} onSubmit={handleSubmit} noValidate>
                  <input
                    ref={honeypotRef}
                    type="text"
                    name="companyWebsite"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="ac-intern__honeypot"
                  />

                  <label className="ac-intern__field">
                    <span>Full name <em aria-hidden="true">*</em></span>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={values.fullName}
                      onChange={handleInput}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                      required
                    />
                    {errors.fullName ? <small id="error-fullName" className="ac-intern__error">{errors.fullName}</small> : null}
                  </label>

                  <label className="ac-intern__field">
                    <span>Email address <em aria-hidden="true">*</em></span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleInput}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      required
                    />
                    {errors.email ? <small id="error-email" className="ac-intern__error">{errors.email}</small> : null}
                  </label>

                  <label className="ac-intern__field">
                    <span>WhatsApp number <em aria-hidden="true">*</em></span>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={values.mobile}
                      onChange={handleInput}
                      aria-invalid={Boolean(errors.mobile)}
                      aria-describedby={errors.mobile ? 'error-mobile' : 'hint-mobile'}
                      required
                    />
                    <small id="hint-mobile" className="ac-intern__hint">Include your country code, for example +91.</small>
                    {errors.mobile ? <small id="error-mobile" className="ac-intern__error">{errors.mobile}</small> : null}
                  </label>

                  <label className="ac-intern__field">
                    <span>Preferred internship domain <em aria-hidden="true">*</em></span>
                    <DomainPicker
                      value={values.domain}
                      onChange={(next) => setField('domain', next)}
                      invalid={Boolean(errors.domain)}
                      describedBy={errors.domain ? 'error-domain' : undefined}
                    />
                    {errors.domain ? <small id="error-domain" className="ac-intern__error">{errors.domain}</small> : null}
                  </label>

                  <label className="ac-intern__field">
                    <span>College / Institution name <em aria-hidden="true">*</em></span>
                    <input
                      id="college"
                      name="college"
                      type="text"
                      autoComplete="organization"
                      value={values.college}
                      onChange={handleInput}
                      aria-invalid={Boolean(errors.college)}
                      aria-describedby={errors.college ? 'error-college' : undefined}
                      required
                    />
                    {errors.college ? <small id="error-college" className="ac-intern__error">{errors.college}</small> : null}
                  </label>

                  <div className="ac-intern__declarations" id="declarations-group" tabIndex={-1}>
                    {DECLARATIONS.map((item) => (
                      <label key={item.id} className="ac-intern__checkbox">
                        <input
                          type="checkbox"
                          name={item.id}
                          checked={declarations[item.id] ?? false}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setDeclarations((current) => ({ ...current, [item.id]: checked }));
                            setErrors((current) => {
                              if (!current.declarations) return current;
                              const next = { ...current };
                              delete next.declarations;
                              return next;
                            });
                          }}
                          aria-invalid={Boolean(errors.declarations)}
                          aria-describedby={errors.declarations ? 'error-declarations' : undefined}
                        />
                        <span>
                          {item.label}{' '}
                          <a href="/privacy-policy/">Privacy Policy</a> and{' '}
                          <a href="/terms-of-service/">Terms of Service</a>.
                        </span>
                      </label>
                    ))}
                    {errors.declarations ? (
                      <small id="error-declarations" className="ac-intern__error" role="alert">{errors.declarations}</small>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="ac-intern__btn ac-intern__btn--primary ac-intern__btn--submit"
                    disabled={status === 'sending'}
                    aria-busy={status === 'sending'}
                  >
                    {status === 'sending' ? 'Applying…' : HERO.primaryCta}
                  </button>

                  <div
                    className={`ac-intern__status${status === 'error' ? ' is-error' : ''}`}
                    ref={statusRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                  >
                    {statusMessage}
                    {status === 'error' ? (
                      <button type="button" className="ac-intern__copy" onClick={copyApplication}>
                        {copied ? 'Copied' : 'Copy application'}
                      </button>
                    ) : null}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 09 — FAQ */}
      <section className="ac-intern__faq-section" id="faq" aria-labelledby="faq-title">
        <div className="ac-intern__wrap">
          <div className="ac-intern__faq-layout">
            <header className="ac-intern__faq-head">
              <p className="ac-intern__eyebrow">
                <span aria-hidden="true" />
                Questions
              </p>
              <h2 id="faq-title">Answers before you apply.</h2>
              <p className="ac-intern__faq-intro">
                Eligibility, fees, mode, mentorship, certification and what happens afterwards.
              </p>
            </header>

            <div className="ac-intern__faq">
              {visibleFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const panelId = `faq-panel-${index}`;
                const buttonId = `faq-button-${index}`;
                return (
                  <div key={faq.question} className={`ac-intern__faq-item${isOpen ? ' is-open' : ''}`}>
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span>{faq.question}</span>
                        <span className="ac-intern__faq-icon" aria-hidden="true" />
                      </button>
                    </h3>
                    <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                );
              })}

              {INTERNSHIP_FAQS.length > 6 ? (
                <button
                  type="button"
                  className="ac-intern__faq-more"
                  onClick={() => setShowAllFaqs((current) => !current)}
                  aria-expanded={showAllFaqs}
                >
                  {showAllFaqs ? 'Show fewer questions' : `Show all ${INTERNSHIP_FAQS.length} questions`}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Certificate lightbox — portalled to <body> so it sits above the fixed
          site header regardless of this page's stacking context. */}
      {certificateOpen ? createPortal(
        <div
          className="ac-intern__lightbox"
          ref={certificateDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={CERTIFICATE_PREVIEW.lightboxLabel}
          onClick={(event) => {
            if (event.target === event.currentTarget) setCertificateOpen(false);
          }}
        >
          <div className="ac-intern__lightbox-panel">
            <button
              type="button"
              ref={certificateCloseRef}
              className="ac-intern__lightbox-close"
              onClick={() => setCertificateOpen(false)}
            >
              <span>Close</span>
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5 5 19" />
                </svg>
              </span>
            </button>
            <img
              src={CERTIFICATE_PREVIEW.image}
              alt={CERTIFICATE_PREVIEW.alt}
              width={CERTIFICATE_PREVIEW.width}
              height={CERTIFICATE_PREVIEW.height}
              decoding="async"
            />
            <p className="ac-intern__lightbox-caption">{CERTIFICATE_PREVIEW.disclaimer}</p>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
