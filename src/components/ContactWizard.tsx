import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';

const backIcon = '/legacy-assets/icons/contact-back.png';
const nextIcon = '/legacy-assets/icons/contact-forward.png';
const downIcon = '/legacy-assets/icons/contact-down.png';

// A visitor who leaves the enquiry and returns should not lose what they typed. The draft lives
// in sessionStorage only; it is never transmitted and it is cleared once an enquiry is sent.
const DRAFT_KEY = 'angel:enquiry-draft';

type FieldKind = 'input' | 'textarea' | 'select';
type EnquiryField = {
  id: string;
  name: string;
  label: string;
  kind: FieldKind;
  inputType?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  options?: string[];
  placeholder?: string;
};

// The questions retain the source's one-at-a-time Angel contact rhythm while collecting the
// qualified enquiry information requested for a future, real delivery endpoint.
const fields: EnquiryField[] = [
  { id: 'name', name: 'Name', label: "Ahoy. What's your name?", kind: 'input', inputType: 'text', autoComplete: 'name' },
  { id: 'company', name: 'Company', label: "What's the name of your company?", kind: 'input', inputType: 'text', autoComplete: 'organization' },
  { id: 'email', name: 'Email', label: "What's your email?", kind: 'input', inputType: 'email', autoComplete: 'email' },
  { id: 'phone', name: 'Phone', label: "What's your phone number?", kind: 'input', inputType: 'tel', autoComplete: 'tel' },
  { id: 'country', name: 'Country', label: 'Which country are you contacting us from?', kind: 'input', inputType: 'text', autoComplete: 'country-name' },
  {
    id: 'projectType',
    name: 'Project type',
    label: 'What would you like to make with Angel?',
    kind: 'select',
    options: ['Brand', 'Design', 'Content', 'Film', 'Animation + 3D', 'Digital', 'Event / Experience', 'Creative Technology', 'Something Else'],
  },
  { id: 'description', name: 'Project description', label: 'Tell us a bit about your project.', kind: 'textarea', placeholder: 'The context, idea, audience, or challenge.' },
  { id: 'timeline', name: 'Timeline', label: 'What timeline are you working with?', kind: 'input', inputType: 'text', placeholder: 'A start date, launch date, or timing to discuss.' },
  { id: 'investment', name: 'Investment range', label: 'What investment range are you considering?', kind: 'input', inputType: 'text', placeholder: 'A range helps us understand the scope.' },
  { id: 'referral', name: 'How they found Angel', label: 'How did you find Angel?', kind: 'input', inputType: 'text', placeholder: 'A recommendation, search, social platform, or something else.' },
];

function isValid(field: EnquiryField, value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) return false;
  return field.inputType !== 'email' || /^\S+@\S+\.\S+$/.test(cleaned);
}

function createMailto(values: Record<string, string>): string {
  const body = fields.map((field) => `${field.name}: ${values[field.id].trim()}`).join('\n\n');
  return `mailto:business@angelcreations.in?subject=${encodeURIComponent('New Angel project enquiry')}&body=${encodeURIComponent(body)}`;
}

export function ContactWizard(): JSX.Element {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const blank = Object.fromEntries(fields.map((field) => [field.id, '']));
    try {
      const stored = window.sessionStorage.getItem(DRAFT_KEY);
      if (!stored) return blank;
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      return Object.fromEntries(fields.map((field) => [field.id, typeof parsed[field.id] === 'string' ? parsed[field.id] as string : '']));
    } catch {
      return blank;
    }
  });
  const [attempted, setAttempted] = useState<Set<number>>(() => new Set());
  const [prepared, setPrepared] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const controlRef = useRef<HTMLElement | null>(null);
  const field = fields[step];
  const currentValue = values[field.id];
  const currentValid = isValid(field, currentValue);
  const currentErrorId = `contact-field-${field.id}-error`;

  useEffect(() => {
    controlRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (prepared) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      // Private browsing without storage keeps the enquiry usable; only recovery is lost.
    }
  }, [values, prepared]);

  const updateValue = (value: string): void => {
    setFormStatus('');
    setCopied(false);
    setValues((current) => ({ ...current, [field.id]: value }));
  };

  const showCurrentError = (): boolean => attempted.has(step) && !currentValid;

  const next = (): void => {
    // A local honeypot adds friction for basic automated fills. There is intentionally no claim
    // of server-side spam/rate protection while this local build has no form endpoint.
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

  const previous = (): void => {
    if (step > 0) setStep((current) => current - 1);
  };

  const reset = (): void => {
    setPrepared(false);
    setStep(0);
    setAttempted(new Set());
    setHoneypot('');
    setFormStatus('');
    setCopied(false);
    setValues(Object.fromEntries(fields.map((item) => [item.id, ''])));
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Storage is optional; a cleared session draft is best effort only.
    }
  };

  // Enter continues the questionnaire from a single-line control, exactly as the arrow button
  // does. The multi-line project description keeps its normal newline behaviour.
  const onFormKeyDown = (event: ReactKeyboardEvent<HTMLFormElement>): void => {
    if (event.key !== 'Enter' || event.defaultPrevented || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target instanceof HTMLTextAreaElement) return;
    if (target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement) return;
    event.preventDefault();
    next();
  };

  const copyEnquiry = async (): Promise<void> => {
    const body = fields.map((item) => `${item.name}: ${values[item.id].trim()}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(`Subject: New Angel project enquiry\n\n${body}`);
      setCopied(true);
      setFormStatus('Enquiry copied. Paste it into an email to business@angelcreations.in.');
    } catch {
      setFormStatus('Copying is unavailable in this browser. Use “Open email draft” instead.');
    }
  };

  const setInputRef = (element: HTMLInputElement | null): void => { controlRef.current = element; };
  const setTextareaRef = (element: HTMLTextAreaElement | null): void => { controlRef.current = element; };
  const setSelectRef = (element: HTMLSelectElement | null): void => { controlRef.current = element; };

  const renderControl = (): JSX.Element => {
    const ariaInvalid: 'true' | 'false' = showCurrentError() ? 'true' : 'false';
    const shared = {
      id: `contact-field-${field.id}`,
      name: field.id,
      className: 'ac-input wpcf7-form-control wpcf7-validates-as-required',
      autoComplete: field.autoComplete,
      'aria-required': true,
      'aria-invalid': ariaInvalid,
      'aria-describedby': showCurrentError() ? currentErrorId : undefined,
      value: currentValue,
      required: true,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => updateValue(event.target.value),
    };

    if (field.kind === 'textarea') return <textarea {...shared} ref={setTextareaRef} rows={4} placeholder={field.placeholder} />;
    if (field.kind === 'select') return (
      <select {...shared} ref={setSelectRef}>
        <option value="">Choose a project type</option>
        {field.options?.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    );
    return <input {...shared} ref={setInputRef} type={field.inputType ?? 'text'} placeholder={field.placeholder} />;
  };

  return (
    <>
      <div className="contact-section-min">
        <section className="section-contact">
          <div className="contact-inner">
            <form
              id="booking-form"
              className="wpcf7-form init"
              aria-label="Project enquiry"
              noValidate
              onSubmit={(event) => { event.preventDefault(); next(); }}
              onKeyDown={onFormKeyDown}
            >
              <div className="angel-honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
              </div>
              <p className="sr-only" aria-live="polite">{formStatus}</p>
              {prepared ? (
                <section className="contact-prepared" aria-labelledby="enquiry-ready-title">
                  <p className="contact-prepared__eyebrow">Project enquiry / ready</p>
                  <h2 id="enquiry-ready-title">Your enquiry is prepared.</h2>
                  <p>This preview has no delivery endpoint. Your answers stay in this browser until you choose to open an email draft.</p>
                  <dl className="contact-prepared__review">
                    {fields.map((item) => (
                      <div className="contact-prepared__row" key={item.id}>
                        <dt>{item.name}</dt>
                        <dd>{values[item.id].trim() || <span className="contact-prepared__empty">Not provided</span>}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="contact-prepared__actions">
                    <a className="contact-prepared__send" href={createMailto(values)}>Open email draft</a>
                    <button className="contact-prepared__edit" type="button" onClick={() => void copyEnquiry()}>Copy enquiry</button>
                    <button className="contact-prepared__edit" type="button" onClick={() => setPrepared(false)}>Edit answers</button>
                    <button className="contact-prepared__edit" type="button" onClick={reset}>Start again</button>
                  </div>
                </section>
              ) : (
                <div className="tab-content">
                  <div className="tab-pane" id={`step${step + 1}`} style={{ display: 'block' }}>
                    <div className="step-title" aria-hidden="true"><span className="ac-slider-progress"><span className="ac-slider-prefix">N<small>o</small></span><span>{step + 1}</span></span></div>
                    <p className="sr-only" aria-live="polite">Question {step + 1} of {fields.length}: {field.name}</p>
                    <ul><li>
                      <label className="ac-active ac-label" htmlFor={`contact-field-${field.id}`}><h3>{field.label}</h3></label>
                      {renderControl()}
                      <div className="errorTxt" id={currentErrorId} aria-live="polite">
                        {showCurrentError() ? <span className="error">{field.inputType === 'email' && currentValue.trim() ? 'Please enter a valid email address.' : 'Please complete this field before continuing.'}</span> : null}
                      </div>
                    </li><li className="action_li" style={{ listStyle: 'none', display: 'inline' }}>
                      <button className={`prev-btn prev-btn${step + 1}`} type="button" aria-label="Previous question" disabled={step === 0} onClick={previous}><img src={backIcon} alt="" /></button>
                      <button className={step === fields.length - 1 ? 'submit-btn next-btn' : `next-btn next-btn${step + 1}`} type="submit" aria-label={step === fields.length - 1 ? 'Prepare project enquiry' : 'Next question'}><img src={nextIcon} alt="" /></button>
                    </li></ul>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
      <section><div className="genralinformation"><div className="supportmail">
        <div className="supcom leftsupport"><h4>For Customer Supports</h4><div className="downicon"><img src={downIcon} alt="" /><p><a href="mailto:support@angelcreations.in">support@angelcreations.in</a></p></div></div>
        <div className="supcom rightsupport"><h4>For Customer Business</h4><div className="downicon"><img src={downIcon} alt="" /><p><a href="mailto:business@angelcreations.in">business@angelcreations.in</a></p></div></div>
      </div></div></section>
    </>
  );
}
