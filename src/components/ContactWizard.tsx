import React, { useEffect, useRef, useState, useCallback, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { navigate } from '../utils/routes';

type FieldKind = 'input' | 'textarea' | 'select';
type DisciplineOption = {
  value: string;
  index: string;
  tag: string;
  blurb: string;
};
type EnquiryField = {
  id: string;
  category: string;
  shortLabel: string;
  name: string;
  label: string;
  hint: string;
  kind: FieldKind;
  inputType?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  options?: DisciplineOption[];
  presets?: string[];
  placeholder?: string;
};

const disciplineOptions: DisciplineOption[] = [
  {
    index: '01',
    value: 'Metaverse',
    tag: 'Spatial World',
    blurb: 'Persistent 3D virtual worlds, spatial commerce & digital twins',
  },
  {
    index: '02',
    value: 'Virtual Reality (VR)',
    tag: 'Immersive XR',
    blurb: 'Headset-native interactive simulations, training & VR cinema',
  },
  {
    index: '03',
    value: 'Augmented Reality (AR)',
    tag: 'Immersive XR',
    blurb: 'WebAR, mobile AR lenses, virtual try-ons & spatial overlays',
  },
  {
    index: '04',
    value: 'Mixed Reality (MR)',
    tag: 'Spatial Computing',
    blurb: 'Passthrough spatial apps & physical-digital environment fusion',
  },
  {
    index: '05',
    value: '360° Immersive Video',
    tag: 'Spherical Film',
    blurb: '8K spherical live-action capture, VR domes & spatial tours',
  },
  {
    index: '06',
    value: '3D Animation & VFX',
    tag: 'Motion & Craft',
    blurb: 'Cinematic 3D character animation, CGI worlds & visual effects',
  },
  {
    index: '07',
    value: 'Brand Advertisement',
    tag: 'Campaigns',
    blurb: 'High-impact commercial films, product launches & brand storytelling',
  },
  {
    index: '08',
    value: 'Media Production',
    tag: 'Film & Post',
    blurb: 'End-to-end live-action direction, cinematography & post-production',
  },
  {
    index: '09',
    value: 'Experiential Installation',
    tag: 'Live Activation',
    blurb: 'Projection mapping, interactive exhibition booths & live stage tech',
  },
  {
    index: '10',
    value: 'Custom Multi-Discipline Commission',
    tag: 'Bespoke Scope',
    blurb: 'Tailored blend of XR, 3D animation, film, and creative technology',
  },
];

const fields: EnquiryField[] = [
  {
    id: 'name',
    category: 'Identity',
    shortLabel: 'Name',
    name: 'Full Name',
    label: 'Hello. Who do we have the pleasure of speaking with?',
    hint: 'Share your full name so our executive producer can address you personally.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'name',
    placeholder: 'e.g. Aarav Mehta',
  },
  {
    id: 'company',
    category: 'Organization',
    shortLabel: 'Organization',
    name: 'Company / Organization',
    label: 'Which company, brand, or studio do you represent?',
    hint: 'Tell us the organization, agency, or venture behind this commission.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'organization',
    placeholder: 'e.g. Horizon Studios',
  },
  {
    id: 'email',
    category: 'Direct Email',
    shortLabel: 'Email',
    name: 'Email Address',
    label: 'Where should we send your tailored project proposal?',
    hint: 'Your primary email address for our producer’s response and deck.',
    kind: 'input',
    inputType: 'email',
    autoComplete: 'email',
    placeholder: 'name@company.com',
  },
  {
    id: 'phone',
    category: 'Direct Line',
    shortLabel: 'Phone',
    name: 'Phone Number',
    label: 'What is the best phone number to reach you on?',
    hint: 'Include your country code for a direct producer call or WhatsApp follow-up.',
    kind: 'input',
    inputType: 'tel',
    autoComplete: 'tel',
    placeholder: '+91 98765 43210',
  },
  {
    id: 'projectType',
    category: 'Discipline',
    shortLabel: 'Discipline',
    name: 'Project Discipline',
    label: 'Which immersive or creative discipline are you looking to build?',
    hint: 'Open the spatial selector below or tap a discipline pill to choose your focus.',
    kind: 'select',
    options: disciplineOptions,
  },
  {
    id: 'description',
    category: 'Project Brief',
    shortLabel: 'Brief',
    name: 'Project Brief',
    label: 'Tell us about your vision and what you want to create.',
    hint: 'Share your creative goals, target audience, platform, or key deliverables.',
    kind: 'textarea',
    placeholder:
      'Describe the experience you imagine, the audience it serves, and what success looks like…',
  },
  {
    id: 'timeline',
    category: 'Schedule',
    shortLabel: 'Schedule',
    name: 'Launch Schedule',
    label: 'When are you looking to launch or go live?',
    hint: 'Let us know your target launch window, exhibition date, or production schedule.',
    kind: 'input',
    inputType: 'text',
    presets: [
      'Immediate / Urgent',
      'Within 1 – 2 Months',
      'Within 3 – 6 Months',
      'Upcoming Exhibition / Event',
      'Flexible / Exploring Scope',
    ],
    placeholder: 'e.g. Target launch in 8 weeks',
  },
  {
    id: 'investment',
    category: 'Scope & Budget',
    shortLabel: 'Investment',
    name: 'Investment Range',
    label: 'What investment range have you allocated for this project?',
    hint: 'An approximate range helps us architect the right technical and creative scope.',
    kind: 'input',
    inputType: 'text',
    presets: [
      'Under $15k / ₹12L',
      '$15k – $50k / ₹12L – ₹40L',
      '$50k – $150k / ₹40L – ₹1.2Cr',
      '$150k+ / Enterprise Commission',
      'Need Scope & Budget Guidance',
    ],
    placeholder: 'Select a range above or enter a custom scope',
  },
];

const supportChannels = [
  {
    index: '01',
    desk: 'Support Desk',
    purpose: 'For Customer Supports',
    value: 'support@angelcreations.in',
    href: 'mailto:support@angelcreations.in',
    classes: 'supcom leftsupport',
    copyKey: 'support-email',
  },
  {
    index: '02',
    desk: 'Business Desk',
    purpose: 'For Customer Business',
    value: 'business@angelcreations.in',
    href: 'mailto:business@angelcreations.in',
    classes: 'supcom',
    copyKey: 'business-email',
  },
  {
    index: '03',
    desk: 'Direct Mobile',
    purpose: 'For Direct Call & Mobile',
    value: '+91-8058465733',
    href: 'tel:+918058465733',
    classes: 'supcom rightsupport',
    copyKey: 'direct-mobile',
  },
];

function isValid(field: EnquiryField, value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) return false;
  return field.inputType !== 'email' || /^\S+@\S+\.\S+$/.test(cleaned);
}

function formatBriefBody(values: Record<string, string>): string {
  return fields
    .map((field) => `${field.name}: ${values[field.id]?.trim() || '—'}`)
    .join('\n\n');
}

function createMailto(values: Record<string, string>): string {
  const body = formatBriefBody(values);
  const subject = values.projectType
    ? `New Project Enquiry: ${values.projectType} — ${values.company || values.name || 'Angel Creations'}`
    : 'New Angel Creations Project Enquiry';
  return `mailto:business@angelcreations.in?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function ContactWizard(): JSX.Element {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.id, '']))
  );
  const [attempted, setAttempted] = useState<Set<number>>(() => new Set());
  const [prepared, setPrepared] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectHighlight, setSelectHighlight] = useState(0);
  const controlRef = useRef<HTMLElement | null>(null);
  const selectWrapRef = useRef<HTMLDivElement | null>(null);
  const selectMenuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  const field = fields[step];
  const currentValue = values[field.id];
  const currentValid = isValid(field, currentValue);
  const currentErrorId = `contact-field-${field.id}-error`;
  const selectOptions = field.options ?? [];
  const selectedOption = selectOptions.find((option) => option.value === currentValue);

  const answeredCount = fields.filter((item) => isValid(item, values[item.id])).length;
  const progressPct = Math.round(((step + 1) / fields.length) * 100);

  useEffect(() => {
    if (!prepared) {
      controlRef.current?.focus();
    }
  }, [step, prepared]);

  useEffect(() => {
    setSelectOpen(false);
  }, [step, prepared]);

  useEffect(() => {
    if (!selectOpen) return undefined;
    selectMenuRef.current?.focus();
    const onPointerDown = (event: PointerEvent): void => {
      if (!selectWrapRef.current?.contains(event.target as Node)) {
        setSelectOpen(false);
        controlRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [selectOpen]);

  useEffect(() => {
    if (!selectOpen) return;
    optionRefs.current[selectHighlight]?.scrollIntoView({ block: 'nearest' });
  }, [selectOpen, selectHighlight]);

  const updateFieldValue = useCallback((fieldId: string, value: string): void => {
    setFormStatus('');
    setValues((current) => ({ ...current, [fieldId]: value }));
  }, []);

  const showCurrentError = (): boolean => attempted.has(step) && !currentValid;

  const next = (): void => {
    if (honeypot.trim()) {
      setFormStatus('Please review your enquiry and try again.');
      return;
    }
    if (!currentValid) {
      setAttempted((current) => new Set(current).add(step));
      return;
    }
    if (step === fields.length - 1) {
      setPrepared(true);
      return;
    }
    setMaxStep((current) => Math.max(current, step + 1));
    setStep((current) => current + 1);
  };

  const previous = (): void => {
    if (step > 0) setStep((current) => current - 1);
  };

  const jumpToStep = (target: number): void => {
    setPrepared(false);
    setStep(target);
  };

  const reset = (): void => {
    setPrepared(false);
    setStep(0);
    setMaxStep(0);
    setAttempted(new Set());
    setHoneypot('');
    setFormStatus('');
    setValues(Object.fromEntries(fields.map((item) => [item.id, ''])));
  };

  const handleCopyText = useCallback((text: string, key: string): void => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2200);
    });
  }, []);

  const handleLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(path);
  }, []);

  const openSelect = (): void => {
    const currentIndex = selectOptions.findIndex((option) => option.value === currentValue);
    setSelectHighlight(currentIndex >= 0 ? currentIndex : 0);
    setSelectOpen(true);
  };

  const closeSelect = (refocus: boolean): void => {
    setSelectOpen(false);
    if (refocus) controlRef.current?.focus();
  };

  const chooseDiscipline = (value: string): void => {
    updateFieldValue(field.id, value);
    closeSelect(true);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (selectOpen) closeSelect(false);
      else openSelect();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!selectOpen) {
        setSelectHighlight(
          selectedOption ? selectOptions.indexOf(selectedOption) : selectOptions.length - 1
        );
        setSelectOpen(true);
      }
      return;
    }
    if (event.key === 'Escape' && selectOpen) {
      event.preventDefault();
      closeSelect(false);
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const total = selectOptions.length;
    if (!total) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectHighlight((current) => (current + 2) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectHighlight((current) => (current - 2 + total) % total);
        break;
      case 'ArrowRight':
        event.preventDefault();
        setSelectHighlight((current) => (current + 1) % total);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setSelectHighlight((current) => (current - 1 + total) % total);
        break;
      case 'Home':
        event.preventDefault();
        setSelectHighlight(0);
        break;
      case 'End':
        event.preventDefault();
        setSelectHighlight(total - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        chooseDiscipline(selectOptions[selectHighlight].value);
        break;
      case 'Escape':
        event.preventDefault();
        closeSelect(true);
        break;
      case 'Tab':
        setSelectOpen(false);
        break;
      default:
        break;
    }
  };

  const setInputRef = (element: HTMLInputElement | null): void => {
    controlRef.current = element;
  };
  const setTextareaRef = (element: HTMLTextAreaElement | null): void => {
    controlRef.current = element;
  };
  const setTriggerRef = (element: HTMLButtonElement | null): void => {
    controlRef.current = element;
  };

  const renderUnderlinedField = (isTextarea: boolean): JSX.Element => (
    <div className={`ac-field${isTextarea ? ' ac-field--textarea' : ''}${currentValid ? ' is-filled' : ''}`}>
      {field.presets && field.presets.length > 0 && (
        <div className="ac-preset-bar" aria-label={`Quick-select for ${field.name}`}>
          {field.presets.map((preset) => {
            const isSelected = currentValue === preset;
            return (
              <button
                key={preset}
                type="button"
                className={`ac-preset-pill${isSelected ? ' is-selected' : ''}`}
                onClick={() => updateFieldValue(field.id, preset)}
              >
                {preset}
              </button>
            );
          })}
        </div>
      )}
      {isTextarea ? (
        <textarea
          id={`contact-field-${field.id}`}
          name={field.id}
          className="ac-input ac-input--textarea wpcf7-form-control wpcf7-validates-as-required"
          ref={setTextareaRef}
          rows={5}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          aria-required="true"
          aria-invalid={showCurrentError() ? 'true' : 'false'}
          aria-describedby={showCurrentError() ? currentErrorId : undefined}
          value={currentValue}
          required
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            updateFieldValue(field.id, event.target.value)
          }
        />
      ) : (
        <input
          id={`contact-field-${field.id}`}
          name={field.id}
          className="ac-input wpcf7-form-control wpcf7-validates-as-required"
          ref={setInputRef}
          type={field.inputType ?? 'text'}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          aria-required="true"
          aria-invalid={showCurrentError() ? 'true' : 'false'}
          aria-describedby={showCurrentError() ? currentErrorId : undefined}
          value={currentValue}
          required
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateFieldValue(field.id, event.target.value)
          }
        />
      )}
      <span className="ac-focus-line" aria-hidden="true" />
      {currentValid && (
        <span className="ac-ready-badge" aria-live="polite">
          ✓ Ready
        </span>
      )}
    </div>
  );

  const renderDisciplineSelect = (): JSX.Element => (
    <div className="ac-discipline-stack">
      <div className={`ac-custom-select${selectOpen ? ' is-open' : ''}`} ref={selectWrapRef}>
        <button
          type="button"
          id={`contact-field-${field.id}`}
          className="ac-custom-select__trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={selectOpen}
          aria-controls="ac-discipline-menu"
          aria-label={field.label}
          ref={setTriggerRef}
          onClick={() => (selectOpen ? closeSelect(true) : openSelect())}
          onKeyDown={handleTriggerKeyDown}
        >
          {selectedOption ? (
            <span className="ac-custom-select__value">
              <span className="ac-custom-select__value-index">{selectedOption.index}</span>
              <span className="ac-custom-select__value-name">{selectedOption.value}</span>
              <span className="ac-custom-select__value-tag">{selectedOption.tag}</span>
            </span>
          ) : (
            <span className="ac-custom-select__placeholder">
              Choose your focus discipline…
            </span>
          )}
          <span className="ac-custom-select__chevron" aria-hidden="true" />
        </button>

        {selectOpen && (
          <div
            className="ac-custom-select__popover"
            id="ac-discipline-menu"
            role="listbox"
            aria-label="Immersive & creative disciplines"
            aria-activedescendant={`ac-discipline-option-${selectHighlight}`}
            ref={selectMenuRef}
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
          >
            {selectOptions.map((option, optionIndex) => {
              const isHighlighted = optionIndex === selectHighlight;
              const isSelected = currentValue === option.value;
              return (
                <div
                  key={option.value}
                  className={`ac-custom-select__option${isHighlighted ? ' is-highlighted' : ''}${
                    isSelected ? ' is-selected' : ''
                  }`}
                  id={`ac-discipline-option-${optionIndex}`}
                  role="option"
                  aria-selected={isSelected}
                  ref={(element) => {
                    optionRefs.current[optionIndex] = element;
                  }}
                  onMouseEnter={() => setSelectHighlight(optionIndex)}
                  onClick={() => chooseDiscipline(option.value)}
                >
                  <span className="ac-custom-select__option-index">{option.index}</span>
                  <span className="ac-custom-select__option-body">
                    <span className="ac-custom-select__option-row">
                      <span className="ac-custom-select__option-title">{option.value}</span>
                      <span className="ac-custom-select__option-tag">{option.tag}</span>
                    </span>
                    <span className="ac-custom-select__option-blurb">{option.blurb}</span>
                  </span>
                  {isSelected && (
                    <span className="ac-custom-select__option-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Accessible native select kept in sync for assistive technologies */}
        <select
          className="sr-only"
          name={field.id}
          value={currentValue}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            updateFieldValue(field.id, event.target.value)
          }
        >
          <option value="">Choose a discipline</option>
          {selectOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.index} — {option.value} ({option.tag})
            </option>
          ))}
        </select>
      </div>

      <div className="ac-preset-bar ac-discipline-pills" aria-label="Quick-select discipline pills">
        {selectOptions.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`ac-preset-pill${isSelected ? ' is-selected' : ''}`}
              onClick={() => updateFieldValue(field.id, option.value)}
            >
              <span className="ac-preset-pill__index">{option.index}</span>
              {option.value}
            </button>
          );
        })}
      </div>
      {currentValid && (
        <span className="ac-ready-badge ac-ready-badge--inline" aria-live="polite">
          ✓ Ready
        </span>
      )}
    </div>
  );

  const answeredFields = fields.filter((item) => isValid(item, values[item.id]));

  return (
    <div
      className="angel-contact-redesign"
      style={
        {
          '--route-accent': '#64d2ff',
          '--route-accent-secondary': '#5e5ce6',
          '--route-accent-rgb': '100, 210, 255',
        } as React.CSSProperties
      }
    >
      {/* Ambient spatial grid / orb backdrop */}
      <div className="ac-ambient-backdrop" aria-hidden="true">
        <span className="ac-ambient-backdrop__orb ac-ambient-backdrop__orb--violet" />
        <span className="ac-ambient-backdrop__orb ac-ambient-backdrop__orb--cyan" />
        <span className="ac-ambient-backdrop__orb ac-ambient-backdrop__orb--magenta" />
        <span className="ac-ambient-backdrop__grid" />
      </div>

      {/* Editorial studio header */}
      <header className="ac-studio-hero" aria-labelledby="contact-page-title">
        <p className="ac-studio-hero__eyebrow">
          <span className="ac-studio-hero__eyebrow-dot" aria-hidden="true" />
          Angel Creations · Global Production Concierge
        </p>
        <h1 id="contact-page-title" className="ac-studio-hero__title">
          Let’s build what <span className="ac-studio-hero__title-accent">doesn’t exist yet.</span>
        </h1>
        <p className="ac-studio-hero__lead">
          Answer eight executive questions and our production desk will return a tailored
          proposal deck. Prefer to talk first? Jump straight to our direct channels.
        </p>
        <div className="ac-studio-hero__actions">
          <a className="ac-jump-pill" href="#direct-contact-channels">
            <span>Direct contact channels</span>
            <span className="ac-jump-pill__arrow" aria-hidden="true">
              ↓
            </span>
          </a>
          <a
            className="ac-back-link"
            href="/"
            onClick={(event) => handleLinkClick(event, '/')}
          >
            ← Back to homepage
          </a>
        </div>
      </header>

      {/* Sculptural Apple Liquid Glass wizard stage */}
      <section className="section-contact ac-wizard-section" aria-label="Guided project enquiry">
        <div className="contact-inner ac-wizard-shell">
          <form
            id="booking-form"
            className="wpcf7-form init"
            aria-label="Project enquiry"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              next();
            }}
          >
            <div className="angel-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field empty</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>
            <p className="sr-only" aria-live="polite">
              {formStatus}
            </p>

            {prepared ? (
              /* PREPARED ENQUIRY SUMMARY */
              <section className="ac-summary" aria-labelledby="ac-summary-title">
                <div className="ac-summary__badge-row">
                  <span className="ac-summary__badge">✓ Enquiry prepared</span>
                  <span className="ac-step-category-pill">N° 08 — 08 · All steps complete</span>
                </div>
                <h2 id="ac-summary-title" className="ac-summary__title">
                  Your enquiry summary is ready for dispatch.
                </h2>
                <p className="ac-summary__lead">
                  Review your brief below, then open a pre-addressed email draft to{' '}
                  <strong>business@angelcreations.in</strong>, copy the enquiry text, or call our
                  production desk directly.
                </p>

                <div className="ac-summary__grid">
                  {fields.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className="ac-summary__item"
                      onClick={() => jumpToStep(index)}
                      title={`Edit N° ${String(index + 1).padStart(2, '0')} — ${item.name}`}
                    >
                      <span className="ac-summary__item-label">
                        <span>
                          N° {String(index + 1).padStart(2, '0')} · {item.name}
                        </span>
                        <span className="ac-summary__item-edit">Edit ✎</span>
                      </span>
                      <span className="ac-summary__item-value">{values[item.id] || '—'}</span>
                    </button>
                  ))}
                </div>

                <div className="ac-summary__actions">
                  <a className="ac-cta ac-cta--primary" href={createMailto(values)}>
                    <span>Open email draft ↗</span>
                  </a>
                  <button
                    type="button"
                    className="ac-cta ac-cta--ghost"
                    onClick={() => handleCopyText(formatBriefBody(values), 'brief')}
                  >
                    <span>{copiedKey === 'brief' ? '✓ Copied to clipboard' : 'Copy enquiry text'}</span>
                  </button>
                  <a className="ac-cta ac-cta--ghost" href="tel:+918058465733">
                    <span>Call +91-8058465733</span>
                  </a>
                  <button
                    type="button"
                    className="ac-cta ac-cta--text"
                    onClick={() => setPrepared(false)}
                  >
                    Edit answers
                  </button>
                  <button type="button" className="ac-cta ac-cta--text" onClick={reset}>
                    Start again
                  </button>
                </div>
              </section>
            ) : (
              /* GUIDED ONE-QUESTION-AT-A-TIME WIZARD */
              <div className="ac-wizard">
                {/* Signature N° progress header */}
                <div className="step-title ac-progress-head">
                  <span className="ac-slider-progress ac-progress-head__count" aria-live="polite">
                    <span className="ac-slider-prefix">
                      N<small>o</small>
                    </span>
                    <span className="ac-progress-head__current" data-index={step + 1}>
                      {String(step + 1).padStart(2, '0')}
                    </span>
                    <span className="ac-progress-head__total">— 08</span>
                  </span>
                  <span className="ac-step-category-pill">{field.category}</span>
                </div>

                <div className="ac-progress-line" aria-hidden="true">
                  <span
                    className="ac-progress-line__fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="ac-step-dots" role="group" aria-label="Jump to a completed question">
                  {fields.map((item, index) => {
                    const isCurrent = index === step;
                    const isAnswered = isValid(item, values[item.id]);
                    const isUnlocked = index <= maxStep;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`ac-step-dot${isCurrent ? ' is-current' : ''}${
                          isAnswered ? ' is-answered' : ''
                        }`}
                        disabled={!isUnlocked && !isAnswered}
                        aria-label={`Question ${index + 1} of ${fields.length}: ${item.name}${
                          isAnswered ? ' (answered)' : ''
                        }`}
                        aria-current={isCurrent ? 'step' : undefined}
                        onClick={() => jumpToStep(index)}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>

                <div className="tab-pane ac-step-pane" id={`step${step + 1}`}>
                  <p className="sr-only" aria-live="polite">
                    Question {step + 1} of {fields.length}: {field.name}
                  </p>

                  <label className="ac-question-label" htmlFor={`contact-field-${field.id}`}>
                    <span className="ac-question-index">
                      N° {String(step + 1).padStart(2, '0')} — {field.category}
                    </span>
                    <h2 className="ac-question-title">{field.label}</h2>
                  </label>
                  <p className="ac-question-hint">{field.hint}</p>

                  {field.kind === 'select'
                    ? renderDisciplineSelect()
                    : renderUnderlinedField(field.kind === 'textarea')}

                  <div className="errorTxt ac-error-row" id={currentErrorId} aria-live="polite">
                    {showCurrentError() ? (
                      <span className="ac-error">
                        {field.inputType === 'email' && currentValue.trim()
                          ? 'Please enter a valid email address.'
                          : 'Please answer this question to continue.'}
                      </span>
                    ) : null}
                  </div>

                  <ul className="ac-wizard-nav">
                    <li className="action_li" style={{ listStyle: 'none', display: 'inline' }}>
                      <button
                        className={`ac-nav-btn ac-nav-btn--prev prev-btn prev-btn${step + 1}`}
                        type="button"
                        aria-label="Previous question"
                        disabled={step === 0}
                        onClick={previous}
                      >
                        <span aria-hidden="true">←</span> Prev
                      </button>
                    </li>
                    <li className="action_li" style={{ listStyle: 'none', display: 'inline' }}>
                      <button
                        className={`ac-nav-btn ac-nav-btn--next ${
                          step === fields.length - 1
                            ? 'submit-btn next-btn'
                            : `next-btn next-btn${step + 1}`
                        }`}
                        type="submit"
                        aria-label={
                          step === fields.length - 1 ? 'Prepare enquiry summary' : 'Next question'
                        }
                      >
                        {step === fields.length - 1 ? 'Prepare summary' : 'Next'}{' '}
                        <span aria-hidden="true">→</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Live answered-brief trail */}
                <aside className="ac-answered-trail" aria-label="Your brief so far">
                  <span className="ac-answered-trail__label">
                    Your brief so far · {answeredCount} of {String(fields.length).padStart(2, '0')}
                  </span>
                  {answeredFields.length > 0 ? (
                    <ul className="ac-answered-trail__chips">
                      {answeredFields.map((item) => {
                        const index = fields.indexOf(item);
                        const raw = values[item.id].trim();
                        const clipped = raw.length > 26 ? `${raw.slice(0, 24)}…` : raw;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className={`ac-answered-chip${index === step ? ' is-current' : ''}`}
                              onClick={() => jumpToStep(index)}
                              title={`${item.shortLabel}: ${raw} — click to revisit`}
                            >
                              <span className="ac-answered-chip__key">{item.shortLabel}</span>
                              <span className="ac-answered-chip__value">{clipped}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="ac-answered-trail__empty">
                      Your answers appear here as you progress through the eight questions.
                    </p>
                  )}
                </aside>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Direct Contact Deck */}
      <section
        id="direct-contact-channels"
        className="ac-support-section"
        aria-labelledby="direct-contact-title"
      >
        <header className="ac-support-section__head">
          <p className="ac-support-section__kicker">Direct Contact Channels</p>
          <h2 id="direct-contact-title" className="ac-support-section__title">
            Prefer a direct line to the studio?
          </h2>
          <p className="ac-support-section__lead">
            Reach the right Angel Creations desk in one tap — or copy any address straight to your
            clipboard.
          </p>
        </header>

        <div className="genralinformation">
          <div className="supportmail">
            {supportChannels.map((channel) => (
              <article key={channel.copyKey} className={`${channel.classes} ac-support-card`}>
                <span className="ac-support-card__index">{channel.index} · {channel.desk}</span>
                <h3 className="ac-support-card__purpose">{channel.purpose}</h3>
                <div className="ac-support-card__row">
                  <a className="ac-support-card__value" href={channel.href}>
                    {channel.value}
                  </a>
                  <button
                    type="button"
                    className="ac-support-card__copy"
                    onClick={() => handleCopyText(channel.value, channel.copyKey)}
                  >
                    {copiedKey === channel.copyKey ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
