import React, { useEffect, useRef, useState, useCallback, type ChangeEvent } from 'react';
import { navigate } from '../utils/routes';

type FieldKind = 'input' | 'textarea' | 'select';
type EnquiryField = {
  id: string;
  shortLabel: string;
  name: string;
  label: string;
  hint: string;
  kind: FieldKind;
  inputType?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  options?: string[];
  presets?: string[];
  placeholder?: string;
};

const fields: EnquiryField[] = [
  {
    id: 'name',
    shortLabel: 'Name',
    name: 'Name',
    label: "Ahoy. What's your name?",
    hint: 'Who should our executive producer address?',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'name',
    placeholder: 'e.g. Aarav Mehta',
  },
  {
    id: 'company',
    shortLabel: 'Company',
    name: 'Company',
    label: "What's the name of your company or organization?",
    hint: 'Brand, studio, agency, or venture name.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'organization',
    placeholder: 'e.g. Horizon Labs / Studio',
  },
  {
    id: 'email',
    shortLabel: 'Email',
    name: 'Email',
    label: "What's your work email address?",
    hint: 'We will send our discovery deck and production response here.',
    kind: 'input',
    inputType: 'email',
    autoComplete: 'email',
    placeholder: 'name@company.com',
  },
  {
    id: 'phone',
    shortLabel: 'Phone',
    name: 'Phone',
    label: "What's the best phone or WhatsApp number to reach you?",
    hint: 'Include country code for international scheduling.',
    kind: 'input',
    inputType: 'tel',
    autoComplete: 'tel',
    placeholder: '+91 98765 43210',
  },
  {
    id: 'country',
    shortLabel: 'Location',
    name: 'Country',
    label: 'Which country or city are you contacting us from?',
    hint: 'Helps us align with your local timezone.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'country-name',
    presets: ['India', 'United States', 'United Kingdom', 'UAE / Dubai', 'Singapore', 'Europe'],
    placeholder: 'e.g. Bengaluru, India',
  },
  {
    id: 'projectType',
    shortLabel: 'Discipline',
    name: 'Project type',
    label: 'What would you like to build with Angel Creations?',
    hint: 'Choose a primary capability or select the closest match.',
    kind: 'select',
    options: [
      'Metaverse & Virtual Worlds',
      'Mixed & Augmented Reality (XR)',
      'Virtual Reality Simulation',
      'Animation + 3D + VFX',
      'Brand & Campaign Systems',
      'Film & Media Production',
      'Event / Live Experience',
      'Creative Technology & Web',
      'Something Else',
    ],
  },
  {
    id: 'description',
    shortLabel: 'Brief',
    name: 'Project description',
    label: 'Tell us about your vision, audience, or challenge.',
    hint: 'Share the core idea, target platforms, deliverables, or goals.',
    kind: 'textarea',
    placeholder:
      'Describe what you are looking to create, key objectives, and any reference touchpoints…',
  },
  {
    id: 'timeline',
    shortLabel: 'Timeline',
    name: 'Timeline',
    label: 'What timeline or launch window are you working toward?',
    hint: 'Pick a target window or type a specific milestone date.',
    kind: 'input',
    inputType: 'text',
    presets: [
      'Immediate / Urgent Sprint',
      '1 – 2 Months',
      '3 – 6 Months',
      'Q4 / Upcoming Launch',
      'Flexible / Exploring',
    ],
    placeholder: 'e.g. Target launch in 8 weeks',
  },
  {
    id: 'investment',
    shortLabel: 'Investment',
    name: 'Investment range',
    label: 'What investment range are you considering?',
    hint: 'Helps us recommend the right production tier and team architecture.',
    kind: 'input',
    inputType: 'text',
    presets: [
      'Pilot / Prototype Scope',
      '$10k – $25k Equivalent',
      '$25k – $75k Equivalent',
      '$75k+ Enterprise Flagship',
      'Need Scope Estimate',
    ],
    placeholder: 'Select a range above or enter custom budget',
  },
  {
    id: 'referral',
    shortLabel: 'Source',
    name: 'How they found Angel',
    label: 'How did you discover Angel Creations?',
    hint: 'Referral, showcase, search, or social.',
    kind: 'input',
    inputType: 'text',
    presets: [
      'Client / Industry Referral',
      'Google / Web Search',
      'YouTube / Works Archive',
      'Instagram / LinkedIn',
      'Live Event / Showcase',
    ],
    placeholder: 'e.g. Recommended by a colleague',
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
  const [mode, setMode] = useState<'guided' | 'sheet'>('guided');
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.id, '']))
  );
  const [attempted, setAttempted] = useState<Set<number>>(() => new Set());
  const [prepared, setPrepared] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const controlRef = useRef<HTMLElement | null>(null);

  const field = fields[step];
  const currentValue = values[field.id];
  const currentValid = isValid(field, currentValue);
  const currentErrorId = `contact-field-${field.id}-error`;

  const completedCount = fields.filter((f) => isValid(f, values[f.id])).length;
  const completionPct = Math.round((completedCount / fields.length) * 100);

  useEffect(() => {
    if (mode === 'guided' && !prepared) {
      controlRef.current?.focus();
    }
  }, [step, mode, prepared]);

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
    setStep((current) => current + 1);
  };

  const handleSheetSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (honeypot.trim()) return;
    const firstInvalidIdx = fields.findIndex((f) => !isValid(f, values[f.id]));
    if (firstInvalidIdx >= 0) {
      const nextAttempted = new Set(attempted);
      fields.forEach((f, idx) => {
        if (!isValid(f, values[f.id])) nextAttempted.add(idx);
      });
      setAttempted(nextAttempted);
      setStep(firstInvalidIdx);
      setFormStatus(`Please complete "${fields[firstInvalidIdx].name}" before continuing.`);
      return;
    }
    setPrepared(true);
  };

  const previous = (): void => {
    if (step > 0) setStep((current) => current - 1);
  };

  const reset = (): void => {
    setPrepared(false);
    setStep(0);
    setAttempted(new Set());
    setHoneypot('');
    setFormStatus('');
    setValues(Object.fromEntries(fields.map((item) => [item.id, ''])));
  };

  const handleCopyText = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    });
  }, []);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(path);
  }, []);

  const setInputRef = (element: HTMLInputElement | null): void => {
    controlRef.current = element;
  };
  const setTextareaRef = (element: HTMLTextAreaElement | null): void => {
    controlRef.current = element;
  };
  const setSelectRef = (element: HTMLSelectElement | null): void => {
    controlRef.current = element;
  };

  const renderGuidedControl = (): JSX.Element => {
    const ariaInvalid: 'true' | 'false' = showCurrentError() ? 'true' : 'false';
    const shared = {
      id: `contact-field-${field.id}`,
      name: field.id,
      className: 'apple-contact-input ac-input wpcf7-form-control wpcf7-validates-as-required',
      autoComplete: field.autoComplete,
      'aria-required': true,
      'aria-invalid': ariaInvalid,
      'aria-describedby': showCurrentError() ? currentErrorId : undefined,
      value: currentValue,
      required: true,
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => updateFieldValue(field.id, event.target.value),
    };

    if (field.kind === 'textarea') {
      return (
        <textarea
          {...shared}
          ref={setTextareaRef}
          rows={4}
          placeholder={field.placeholder}
        />
      );
    }

    if (field.kind === 'select') {
      return (
        <div className="apple-contact-select-group">
          <div
            className="apple-contact-chip-grid"
            role="radiogroup"
            aria-label={field.label}
          >
            {field.options?.map((option) => {
              const isSelected = currentValue === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`apple-contact-choice-chip${isSelected ? ' is-selected' : ''}`}
                  onClick={() => updateFieldValue(field.id, option)}
                >
                  <span className="apple-contact-choice-chip__dot" aria-hidden="true" />
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
          {/* Keep accessible native select synced for assistive technologies */}
          <select {...shared} ref={setSelectRef} className="sr-only">
            <option value="">Choose a project type</option>
            {field.options?.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="apple-contact-input-stack">
        {field.presets && field.presets.length > 0 && (
          <div className="apple-contact-preset-bar" aria-label={`Quick presets for ${field.name}`}>
            {field.presets.map((preset) => {
              const isSelected = currentValue === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`apple-contact-preset-pill${isSelected ? ' is-selected' : ''}`}
                  onClick={() => updateFieldValue(field.id, preset)}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        )}
        <input
          {...shared}
          ref={setInputRef}
          type={field.inputType ?? 'text'}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div
      className="apple-inner-page apple-contact-page"
      style={
        {
          '--route-accent': '#64d2ff',
          '--route-accent-secondary': '#5e5ce6',
          '--route-accent-rgb': '100, 210, 255',
        } as React.CSSProperties
      }
    >
      <section className="apple-hero-stage" id="contact-top" aria-labelledby="contact-page-title">
        <div className="apple-hero-stage__ambient" aria-hidden="true" />

        <div className="apple-hero-container">
          {/* Top Bar */}
          <div className="apple-hero-topbar">
            <a
              href="/"
              className="apple-back-pill"
              onClick={(e) => handleLinkClick(e, '/')}
              aria-label="Back to Home"
            >
              <span className="apple-back-pill__arrow" aria-hidden="true">
                ←
              </span>
              <span>Return to 3D Stage</span>
            </a>

            <div className="apple-contact-mode-switcher" role="group" aria-label="Form view mode">
              <button
                type="button"
                className={`apple-pill-control${mode === 'guided' && !prepared ? ' is-active' : ''}`}
                onClick={() => {
                  setPrepared(false);
                  setMode('guided');
                }}
              >
                <span>Guided Concierge (10 Steps)</span>
              </button>
              <button
                type="button"
                className={`apple-pill-control${mode === 'sheet' && !prepared ? ' is-active' : ''}`}
                onClick={() => {
                  setPrepared(false);
                  setMode('sheet');
                }}
              >
                <span>Express Brief (All Fields)</span>
              </button>
            </div>
          </div>

          {/* Editorial Title Block */}
          <header className="apple-works-hero-head">
            <div className="apple-hero-badge">
              <span className="apple-hero-badge__index">Studio Concierge</span>
              <span className="apple-hero-badge__sep" aria-hidden="true">
                ·
              </span>
              <span className="apple-hero-badge__cat">
                New Projects, Spatial Worlds &amp; Production Partnerships
              </span>
            </div>

            <h1 id="contact-page-title" className="apple-hero-title">
              Let’s Build Something Extraordinary Together.
            </h1>

            <p className="apple-hero-lead">
              Share your vision using our interactive project configurator below, or reach our
              executive production and support desks directly. Your responses remain private in
              your browser until you dispatch your brief.
            </p>
          </header>

          {/* Main Two-Column Concierge Workbench */}
          <div className="apple-contact-layout">
            {/* LEFT COLUMN: Interactive Configurator / Sheet / Prepared Dossier */}
            <div className="apple-contact-stage-card">
              <form
                id="booking-form"
                className="wpcf7-form init apple-contact-form"
                aria-label="Project enquiry"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (mode === 'sheet') {
                    handleSheetSubmit(event);
                  } else {
                    next();
                  }
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
                  /* PREPARED DOSSIER REVIEW VIEW */
                  <section className="apple-contact-prepared" aria-labelledby="enquiry-ready-title">
                    <div className="apple-workbench-card__meta">
                      <span className="apple-workbench-card__step-badge">
                        ✓ Project Dossier Ready
                      </span>
                      <span className="apple-workbench-card__category-pill">
                        10 / 10 Specifications Complete
                      </span>
                    </div>

                    <h2 id="enquiry-ready-title" className="apple-workbench-card__title">
                      Your Project Brief Is Prepared for Dispatch.
                    </h2>
                    <p className="apple-workbench-card__desc">
                      Review your structured project dossier below. You can launch your default
                      email client pre-addressed to{' '}
                      <strong>business@angelcreations.in</strong>, or copy the formatted brief to
                      paste into any webmail or messaging channel.
                    </p>

                    {/* Review Grid of All 10 Answers */}
                    <div className="apple-contact-review-grid">
                      {fields.map((item, idx) => (
                        <div
                          key={item.id}
                          className="apple-contact-review-item"
                          onClick={() => {
                            setPrepared(false);
                            setMode('guided');
                            setStep(idx);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setPrepared(false);
                              setMode('guided');
                              setStep(idx);
                            }
                          }}
                          title={`Click to edit ${item.name}`}
                        >
                          <div className="apple-contact-review-item__head">
                            <span className="apple-contact-review-item__label">
                              {String(idx + 1).padStart(2, '0')} · {item.name}
                            </span>
                            <span className="apple-contact-review-item__edit">Edit ✎</span>
                          </div>
                          <strong className="apple-contact-review-item__val">
                            {values[item.id] || '—'}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="apple-hero-actions" style={{ marginTop: '1.75rem' }}>
                      <a className="apple-cta-primary" href={createMailto(values)}>
                        <span>Open Email Draft to Angel Creations</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                      <button
                        type="button"
                        className="apple-cta-secondary"
                        onClick={() => handleCopyText(formatBriefBody(values), 'brief')}
                      >
                        <span>
                          {copiedKey === 'brief'
                            ? '✓ Brief Copied to Clipboard'
                            : 'Copy Formatted Brief'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="apple-tactile-btn"
                        onClick={() => setPrepared(false)}
                      >
                        Edit Answers
                      </button>
                      <button type="button" className="apple-tactile-btn" onClick={reset}>
                        Start Fresh
                      </button>
                    </div>
                  </section>
                ) : mode === 'sheet' ? (
                  /* EXPRESS SHEET VIEW (ALL 10 FIELDS AT ONCE) */
                  <div className="apple-contact-sheet">
                    <div className="apple-workbench-card__meta">
                      <span className="apple-workbench-card__step-badge">
                        Express Project Sheet
                      </span>
                      <span className="apple-workbench-card__category-pill">
                        {completedCount} of {fields.length} Completed
                      </span>
                    </div>

                    <h2 className="apple-workbench-card__title">
                      Complete Project Specification Sheet
                    </h2>

                    <div className="apple-contact-sheet-grid">
                      {fields.map((item, idx) => {
                        const val = values[item.id];
                        const hasErr = attempted.has(idx) && !isValid(item, val);
                        return (
                          <div
                            key={item.id}
                            className={`apple-contact-sheet-field${
                              item.kind === 'textarea' || item.kind === 'select'
                                ? ' apple-contact-sheet-field--full'
                                : ''
                            }`}
                          >
                            <label
                              htmlFor={`sheet-field-${item.id}`}
                              className="apple-contact-sheet-field__label"
                            >
                              <span>
                                {String(idx + 1).padStart(2, '0')}. {item.name}
                              </span>
                              {isValid(item, val) && (
                                <span className="apple-contact-sheet-field__ok">✓</span>
                              )}
                            </label>

                            {item.kind === 'textarea' ? (
                              <textarea
                                id={`sheet-field-${item.id}`}
                                rows={3}
                                value={val}
                                placeholder={item.placeholder}
                                className="apple-contact-input"
                                onChange={(e) => updateFieldValue(item.id, e.target.value)}
                              />
                            ) : item.kind === 'select' ? (
                              <div className="apple-contact-chip-grid">
                                {item.options?.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    className={`apple-contact-choice-chip${
                                      val === opt ? ' is-selected' : ''
                                    }`}
                                    onClick={() => updateFieldValue(item.id, opt)}
                                  >
                                    <span
                                      className="apple-contact-choice-chip__dot"
                                      aria-hidden="true"
                                    />
                                    <span>{opt}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <input
                                id={`sheet-field-${item.id}`}
                                type={item.inputType ?? 'text'}
                                value={val}
                                placeholder={item.placeholder}
                                className="apple-contact-input"
                                onChange={(e) => updateFieldValue(item.id, e.target.value)}
                              />
                            )}

                            {hasErr && (
                              <span className="apple-contact-error">
                                {item.inputType === 'email' && val.trim()
                                  ? 'Please enter a valid email address.'
                                  : 'Please complete this field.'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {formStatus && <p className="apple-contact-error">{formStatus}</p>}

                    <div className="apple-workbench-card__nav" style={{ marginTop: '1.75rem' }}>
                      <button type="submit" className="apple-cta-primary">
                        <span>Prepare Project Dossier</span>
                        <span aria-hidden="true">→</span>
                      </button>
                      <button
                        type="button"
                        className="apple-tactile-btn"
                        onClick={() => setMode('guided')}
                      >
                        Switch to Step-by-Step View
                      </button>
                    </div>
                  </div>
                ) : (
                  /* GUIDED STEP-BY-STEP CONCIERGE VIEW */
                  <div className="apple-contact-guided">
                    {/* Interactive Step Progress Rail */}
                    <div
                      className="apple-contact-step-rail"
                      role="tablist"
                      aria-label="Project enquiry steps"
                    >
                      {fields.map((item, idx) => {
                        const isCurrent = idx === step;
                        const isDone = isValid(item, values[item.id]);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={isCurrent}
                            className={`apple-contact-step-pill${isCurrent ? ' is-current' : ''}${
                              isDone ? ' is-done' : ''
                            }`}
                            onClick={() => setStep(idx)}
                          >
                            <span className="apple-contact-step-pill__num">
                              {isDone && !isCurrent ? '✓' : String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="apple-contact-step-pill__name">{item.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="tab-pane" id={`step${step + 1}`}>
                      <div className="apple-workbench-card__meta">
                        <span className="apple-workbench-card__step-badge">
                          Step {String(step + 1).padStart(2, '0')} of{' '}
                          {String(fields.length).padStart(2, '0')}
                        </span>
                        <span className="apple-workbench-card__category-pill">{field.name}</span>
                      </div>

                      <p className="sr-only" aria-live="polite">
                        Question {step + 1} of {fields.length}: {field.name}
                      </p>

                      <label
                        className="apple-contact-question-label"
                        htmlFor={`contact-field-${field.id}`}
                      >
                        <h2>{field.label}</h2>
                      </label>
                      <p className="apple-contact-question-hint">{field.hint}</p>

                      {renderGuidedControl()}

                      <div className="errorTxt" id={currentErrorId} aria-live="polite">
                        {showCurrentError() ? (
                          <span className="apple-contact-error">
                            {field.inputType === 'email' && currentValue.trim()
                              ? 'Please enter a valid work email address.'
                              : 'Please complete this field before continuing.'}
                          </span>
                        ) : null}
                      </div>

                      <div className="apple-contact-actions-bar">
                        <button
                          className={`apple-tactile-btn prev-btn prev-btn${step + 1}`}
                          type="button"
                          aria-label="Previous question"
                          disabled={step === 0}
                          onClick={previous}
                        >
                          ← Previous
                        </button>

                        <button
                          className={`apple-cta-primary ${
                            step === fields.length - 1
                              ? 'submit-btn next-btn'
                              : `next-btn next-btn${step + 1}`
                          }`}
                          type="submit"
                          aria-label={
                            step === fields.length - 1
                              ? 'Prepare project enquiry'
                              : 'Next question'
                          }
                        >
                          <span>
                            {step === fields.length - 1
                              ? 'Review & Prepare Enquiry'
                              : `Continue to ${fields[step + 1].shortLabel}`}
                          </span>
                          <span aria-hidden="true">→</span>
                        </button>

                        {completedCount >= 3 && (
                          <button
                            type="button"
                            className="apple-tactile-btn"
                            onClick={() => setMode('sheet')}
                          >
                            View All 10 Fields
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* RIGHT COLUMN: Live Project Brief Dossier & Direct Studio Desks */}
            <aside className="apple-contact-sidebar" aria-label="Live project summary and direct contact">
              {/* Live Dossier Progress Card */}
              <div className="apple-glass-card apple-contact-summary-card">
                <div className="apple-contact-summary-head">
                  <div>
                    <span className="apple-card-kicker">Live Project Dossier</span>
                    <h3>Specification Progress</h3>
                  </div>
                  <strong className="apple-contact-summary-pct">{completionPct}%</strong>
                </div>

                <div className="apple-contact-progress-track" aria-hidden="true">
                  <div
                    className="apple-contact-progress-fill"
                    style={{ width: `${Math.max(completionPct, 6)}%` }}
                  />
                </div>

                <ul className="apple-contact-summary-list">
                  {fields.map((item, idx) => {
                    const val = values[item.id]?.trim();
                    const isActive = mode === 'guided' && !prepared && idx === step;
                    return (
                      <li
                        key={item.id}
                        className={`apple-contact-summary-row${isActive ? ' is-active' : ''}${
                          val ? ' is-filled' : ''
                        }`}
                        onClick={() => {
                          setPrepared(false);
                          setMode('guided');
                          setStep(idx);
                        }}
                      >
                        <span className="apple-contact-summary-row__key">
                          {String(idx + 1).padStart(2, '0')} · {item.shortLabel}
                        </span>
                        <span className="apple-contact-summary-row__val">
                          {val ? (val.length > 28 ? `${val.slice(0, 26)}…` : val) : 'Pending'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Direct Studio Desks Bento */}
              <div className="apple-glass-card apple-glass-card--accent apple-contact-desks-card">
                <span className="apple-card-kicker">Direct Studio Desks</span>
                <h3>Prefer Direct Email?</h3>
                <p style={{ marginBottom: '1.15rem', fontSize: '0.92rem' }}>
                  Reach our business development or client support teams directly at any time:
                </p>

                <div className="apple-contact-desk-box">
                  <span className="apple-contact-desk-box__label">
                    New Business &amp; Production Partnerships
                  </span>
                  <div className="apple-contact-desk-box__row">
                    <a
                      href="mailto:business@angelcreations.in"
                      className="apple-contact-desk-box__mail"
                    >
                      business@angelcreations.in
                    </a>
                    <button
                      type="button"
                      className="apple-contact-copy-chip"
                      onClick={() =>
                        handleCopyText('business@angelcreations.in', 'business-email')
                      }
                    >
                      {copiedKey === 'business-email' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="apple-contact-desk-box">
                  <span className="apple-contact-desk-box__label">
                    Client &amp; Technical Support Desk
                  </span>
                  <div className="apple-contact-desk-box__row">
                    <a
                      href="mailto:support@angelcreations.in"
                      className="apple-contact-desk-box__mail"
                    >
                      support@angelcreations.in
                    </a>
                    <button
                      type="button"
                      className="apple-contact-copy-chip"
                      onClick={() =>
                        handleCopyText('support@angelcreations.in', 'support-email')
                      }
                    >
                      {copiedKey === 'support-email' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
