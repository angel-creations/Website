import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import {
  captureLeadAttribution,
  formatLeadAttribution,
  getLeadAttribution,
  trackLeadEvent,
  type LeadAttribution,
} from '../utils/leads';

// Measurement is best-effort. A tag manager, a consent script, or blocked
// storage can throw from inside the dataLayer/gtag calls. Analytics must never
// change what the visitor is told about the enquiry, never re-arm a send, and
// never surface visitor data: a failed measurement is swallowed silently.
function dispatchLeadEvent(
  eventName: string,
  payload: Record<string, string | number | boolean | undefined>,
): void {
  try {
    trackLeadEvent(eventName, payload);
  } catch {
    // Intentionally silent: the EmailJS delivery outcome stands on its own.
  }
}

const backIcon = '/media/icons/contact-back.png';
const nextIcon = '/media/icons/contact-forward.png';
const downIcon = '/media/icons/contact-down.png';

type FieldKind = 'input' | 'textarea' | 'select';

type SelectOptionItem = {
  value: string;
  code: string;
  tag: string;
  description: string;
};

type EnquiryField = {
  id: string;
  name: string;
  category: string;
  label: string;
  hint: string;
  kind: FieldKind;
  inputType?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  options?: SelectOptionItem[];
  quickSuggestions?: string[];
  placeholder?: string;
  optional?: boolean;
  maxLength?: number;
};

const IMMERSIVE_DISCIPLINE_OPTIONS: SelectOptionItem[] = [
  {
    value: 'Metaverse',
    code: '01',
    tag: 'Spatial World',
    description: 'Persistent 3D virtual worlds, spatial commerce & digital twins',
  },
  {
    value: 'Virtual Reality (VR)',
    code: '02',
    tag: 'Immersive XR',
    description: 'Headset-native interactive simulations, training & VR cinema',
  },
  {
    value: 'Augmented Reality (AR)',
    code: '03',
    tag: 'Immersive XR',
    description: 'WebAR, mobile AR lenses, virtual try-ons & spatial overlays',
  },
  {
    value: 'Mixed Reality (MR)',
    code: '04',
    tag: 'Spatial Computing',
    description: 'Passthrough spatial apps & physical-digital environment fusion',
  },
  {
    value: '360° Immersive Video',
    code: '05',
    tag: 'Spherical Film',
    description: '8K spherical live-action capture, VR domes & spatial tours',
  },
  {
    value: '3D Animation & VFX',
    code: '06',
    tag: 'Motion & Craft',
    description: 'Cinematic 3D character animation, CGI worlds & visual effects',
  },
  {
    value: 'Brand Advertisement',
    code: '07',
    tag: 'Campaigns',
    description: 'High-impact commercial films, product launches & brand storytelling',
  },
  {
    value: 'Media Production',
    code: '08',
    tag: 'Film & Post',
    description: 'End-to-end live-action direction, cinematography & post-production',
  },
  {
    value: 'Experiential Installation',
    code: '09',
    tag: 'Live Activation',
    description: 'Projection mapping, interactive exhibition booths & live stage tech',
  },
  {
    value: 'Custom Multi-Discipline Commission',
    code: '10',
    tag: 'Bespoke Scope',
    description: 'Tailored blend of XR, 3D animation, film, and creative technology',
  },
];

// 8 rewritten, executive-grade conversational questions (with former #5 Country and #10 Referral removed)
const fields: EnquiryField[] = [
  {
    id: 'name',
    name: 'Name',
    category: 'Identity',
    label: 'Hello. Who do we have the pleasure of speaking with?',
    hint: 'Share your full name so our executive producer can address you personally.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'name',
    maxLength: 120,
    placeholder: 'Enter your full name…',
  },
  {
    id: 'company',
    name: 'Company',
    category: 'Organization',
    label: 'Which company, brand, or studio do you represent?',
    hint: 'Optional — tell us the organization, agency, or venture behind this commission.',
    kind: 'input',
    inputType: 'text',
    autoComplete: 'organization',
    optional: true,
    maxLength: 160,
    placeholder: 'Your company, brand, or independent studio…',
  },
  {
    id: 'email',
    name: 'Email',
    category: 'Direct Email',
    label: 'What email address should our studio use to follow up?',
    hint: 'We will use this address to reply to your project enquiry.',
    kind: 'input',
    inputType: 'email',
    autoComplete: 'email',
    maxLength: 254,
    placeholder: 'name@company.com',
  },
  {
    id: 'phone',
    name: 'Phone',
    category: 'Direct Line',
    label: 'What is the best phone number to reach you on?',
    hint: 'Optional — include your country code if you would prefer a direct phone follow-up.',
    kind: 'input',
    inputType: 'tel',
    autoComplete: 'tel',
    optional: true,
    maxLength: 40,
    placeholder: '+91 98765 43210',
  },
  {
    id: 'projectType',
    name: 'Immersive Discipline',
    category: 'Discipline',
    label: 'Which immersive or creative discipline are you looking to build?',
    hint: 'Open the spatial selector below or tap a discipline pill to choose your focus.',
    kind: 'select',
    options: IMMERSIVE_DISCIPLINE_OPTIONS,
  },
  {
    id: 'description',
    name: 'Project Vision',
    category: 'Project Brief',
    label: 'Tell us about your vision and what you want to create.',
    hint: 'Share your creative goals, target audience, platform, or key deliverables.',
    kind: 'textarea',
    maxLength: 1200,
    placeholder: 'Describe the experience, story, audience, or creative challenge…',
  },
  {
    id: 'timeline',
    name: 'Target Timeline',
    category: 'Schedule',
    label: 'When are you looking to launch or go live?',
    hint: 'Optional — share a target launch window, exhibition date, or production schedule.',
    kind: 'input',
    inputType: 'text',
    optional: true,
    maxLength: 120,
    placeholder: 'Select a timeframe below or type your target launch date…',
    quickSuggestions: [
      'Immediate / Urgent',
      'Within 1 – 2 Months',
      'Within 3 – 6 Months',
      'Upcoming Exhibition / Event',
      'Flexible / Exploring Scope',
    ],
  },
  {
    id: 'investment',
    name: 'Estimated Investment',
    category: 'Scope & Budget',
    label: 'What investment range have you allocated for this project?',
    hint: 'Optional — an approximate range can help us discuss a suitable project scope.',
    kind: 'input',
    inputType: 'text',
    optional: true,
    maxLength: 100,
    placeholder: 'Select a bracket below or type your estimated budget…',
    quickSuggestions: [
      'Under $15k / ₹12L',
      '$15k – $50k / ₹12L – ₹40L',
      '$50k – $150k / ₹40L – ₹1.2Cr',
      '$150k+ / Enterprise Commission',
      'Need Scope & Budget Guidance',
    ],
  },
];

function isValid(field: EnquiryField, value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) return Boolean(field.optional);
  return field.inputType !== 'email' || /^\S+@\S+\.\S+$/.test(cleaned);
}

function isComplete(field: EnquiryField, value: string): boolean {
  return Boolean(value.trim()) && isValid(field, value);
}

function createMailto(values: Record<string, string>): string {
  const body = fields
    .filter((field) => !field.optional || values[field.id].trim())
    .map((field) => `${field.name}: ${values[field.id].trim()}`)
    .join('\n\n');
  return `mailto:business@angelcreations.in?subject=${encodeURIComponent(
    'New Angel Creations Project Enquiry'
  )}&body=${encodeURIComponent(body)}`;
}

export function ContactWizard(): JSX.Element {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initialValues = Object.fromEntries(fields.map((field) => [field.id, ''])) as Record<string, string>;
    const requestedDiscipline = new URLSearchParams(window.location.search).get('discipline');
    if (requestedDiscipline && IMMERSIVE_DISCIPLINE_OPTIONS.some((option) => option.value === requestedDiscipline)) {
      initialValues.projectType = requestedDiscipline;
    }
    return initialValues;
  });
  const [attempted, setAttempted] = useState<Set<number>>(() => new Set());
  const [prepared, setPrepared] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const controlRef = useRef<HTMLElement | null>(null);
  const dropdownWrapRef = useRef<HTMLDivElement | null>(null);
  const copyFeedbackTimerRef = useRef<number | null>(null);
  // Duplicate-submission guard. Once the internal studio notification has
  // been accepted, this stays set for the life of the prepared enquiry:
  // editing an answer afterwards must never re-arm a second internal
  // notification. Only a full reset (which wipes every answer) clears it.
  const internalSentRef = useRef(false);

  const field = fields[step];
  const currentValue = values[field.id];
  const currentValid = isValid(field, currentValue);
  const currentLabelId = `contact-field-${field.id}-label`;
  const currentHintId = `contact-field-${field.id}-hint`;
  const currentErrorId = `contact-field-${field.id}-error`;
  const progressRatio = ((step + 1) / fields.length) * 100;
  const completedFields = fields
    .map((item, index) => ({ item, index, value: values[item.id].trim() }))
    .filter((entry) => isComplete(entry.item, entry.value));

  useEffect(() => {
    setDropdownOpen(false);
    if (!prepared) {
      controlRef.current?.focus();
    }
  }, [step, prepared]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handlePointerDown = (event: MouseEvent): void => {
      if (
        dropdownWrapRef.current &&
        !dropdownWrapRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [dropdownOpen]);

  useEffect(() => () => {
    if (copyFeedbackTimerRef.current !== null) window.clearTimeout(copyFeedbackTimerRef.current);
  }, []);

  const updateValue = (value: string): void => {
    // Deliberately no setSent(false) here: once the studio notification has
    // been accepted, editing an answer must not make the whole enquiry
    // sendable again, or a retry after a partial failure would duplicate
    // the internal notification. Amendments go through the email-draft and
    // copy actions on the prepared screen.
    setFormStatus(
      internalSentRef.current
        ? 'Your enquiry has already been sent to Angel Creations. To share updated answers, please use “Open email draft” or copy the enquiry text.'
        : ''
    );
    setValues((current) => ({ ...current, [field.id]: value }));
  };

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
    setDropdownOpen(false);
    if (step === fields.length - 1) {
      setPrepared(true);
      return;
    }
    setStep((current) => current + 1);
  };

  const previous = (): void => {
    setDropdownOpen(false);
    if (step > 0) setStep((current) => current - 1);
  };

  const reset = (): void => {
    setPrepared(false);
    setIsSending(false);
    setSent(false);
    setConfirmationSent(false);
    // Every answer is wiped below, so the next submission is a genuinely
    // new enquiry and the duplicate guard can be released.
    internalSentRef.current = false;
    setDropdownOpen(false);
    setStep(0);
    setAttempted(new Set());
    setHoneypot('');
    setFormStatus('');
    setValues(Object.fromEntries(fields.map((item) => [item.id, ''])));
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      next();
    }
  };

  const handleDropdownKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const opts = field.options ?? [];
    if (!opts.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!dropdownOpen) {
        setDropdownOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % opts.length);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!dropdownOpen) {
        setDropdownOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + opts.length) % opts.length);
      }
    } else if (event.key === 'Enter') {
      if (dropdownOpen) {
        event.preventDefault();
        const chosen = opts[highlightedIndex];
        if (chosen) {
          updateValue(chosen.value);
          setDropdownOpen(false);
        }
      } else if (currentValid) {
        event.preventDefault();
        next();
      } else {
        event.preventDefault();
        setDropdownOpen(true);
      }
    } else if (event.key === 'Escape') {
      if (dropdownOpen) {
        event.preventDefault();
        setDropdownOpen(false);
      }
    } else if (event.key === ' ') {
      event.preventDefault();
      setDropdownOpen((open) => !open);
    }
  };

  const copyToClipboard = async (text: string, label: string): Promise<void> => {
    let copied = false;
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // Try the lightweight selection fallback below when browser clipboard permission is denied.
      }
    }

    if (!copied) {
      const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.left = '0';
      helper.style.top = '0';
      helper.style.width = '1px';
      helper.style.height = '1px';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      helper.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
    }

    if (!copied) {
      setFormStatus('Copy is unavailable in this browser. You can still select the details shown on this page.');
      return;
    }

    setFormStatus('');
    setCopiedChannel(label);
    if (copyFeedbackTimerRef.current !== null) window.clearTimeout(copyFeedbackTimerRef.current);
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopiedChannel(null);
      copyFeedbackTimerRef.current = null;
    }, 2200);
  };

  const copyEnquiryText = (): void => {
    const body = fields
      .filter((item) => !item.optional || values[item.id].trim())
      .map((item) => `${item.name}: ${values[item.id].trim()}`)
      .join('\n');
    void copyToClipboard(body, 'summary');
  };

  const sendEnquiry = async (): Promise<void> => {
    if (isSending || (internalSentRef.current && confirmationSent)) return;
    if (honeypot.trim()) {
      setFormStatus('Please review your enquiry and try again.');
      return;
    }

    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
    const serviceId = env.VITE_EMAILJS_SERVICE_ID?.trim();
    const notificationTemplateId = env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID?.trim();
    const confirmationTemplateId = env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID?.trim();
    const publicKey = env.VITE_EMAILJS_PUBLIC_KEY?.trim();

    if (!serviceId || !notificationTemplateId || !confirmationTemplateId || !publicKey) {
      setFormStatus('We can’t send this form directly right now. Your answers are ready below—please use “Open email draft” or copy the enquiry text to reach the studio.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const intent = params.get('intent')?.slice(0, 80) || '';
    const source = params.get('source')?.slice(0, 240) || window.location.pathname;
    const topic = params.get('topic')?.slice(0, 180) || '';
    const goal = params.get('goal')?.slice(0, 220) || '';

    // The eight answers plus template aliases. This is the complete set of
    // fields the customer confirmation may receive. Studio-only context —
    // campaign attribution, click IDs and the composed internal message —
    // is added to the internal notification further below and must never be
    // included in the customer-facing send.
    const fieldParams: Record<string, string> = {
      // Exact identifiers used by the current eight-question form and saved templates.
      name: values.name.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      projectType: values.projectType.trim(),
      description: values.description.trim(),
      timeline: values.timeline.trim(),
      investment: values.investment.trim(),
      // Compatibility aliases for existing template variants.
      contact_name: values.name.trim(),
      contact_email: values.email.trim(),
      project_type: values.projectType.trim(),
      project_description: values.description.trim(),
    };

    const sendEmail = async (templateId: string, templateParams: Record<string, string>): Promise<void> => {
      // Bound every request: a hung connection must fall through to the
      // email-draft/copy fallback instead of leaving "Sending…" forever.
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: templateParams,
          }),
        });
        if (!response.ok) {
          throw new Error(`EmailJS returned HTTP ${response.status}`);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    // The customer confirmation receives only the visitor's own answers —
    // no attribution, click IDs, internal recipients or studio context.
    const sendConfirmation = async (): Promise<boolean> => {
      try {
        await sendEmail(confirmationTemplateId, {
          ...fieldParams,
          to_email: values.email.trim(),
          subject: `${values.name.trim()}, your project enquiry with Angel Creations`,
          reply_to: 'business@angelcreations.in',
        });
        setConfirmationSent(true);
        return true;
      } catch {
        return false;
      }
    };

    setIsSending(true);

    // Lead events are collected while the enquiry is being delivered and
    // dispatched only after the delivery state has settled, so measurement
    // can never influence the outcome reported to the visitor.
    const pendingLeadEvents: Array<{
      name: string;
      payload: Record<string, string | number | boolean | undefined>;
    }> = [];

    try {
      if (!internalSentRef.current) {
        setFormStatus('Sending your enquiry…');
        // Attribution enriches the studio notification only. A storage or
        // parsing failure must never stop the enquiry from being sent.
        let attribution: LeadAttribution = {};
        let attributionLines: string[] = [];
        try {
          captureLeadAttribution();
          attribution = getLeadAttribution();
          attributionLines = formatLeadAttribution(attribution);
        } catch {
          attribution = {};
          attributionLines = [];
        }
        const contextLines = [
          intent ? `Enquiry intent: ${intent}` : '',
          topic ? `Topic: ${topic}` : '',
          goal ? `Goal: ${goal}` : '',
          `Source route: ${source}`,
        ].filter(Boolean);
        const answerLines = fields
          .map((item) => `${item.name}: ${values[item.id].trim() || 'Not provided'}`);
        const message = [
          'New project enquiry from angelcreations.in',
          '',
          ...contextLines,
          '',
          ...answerLines,
          '',
          'Attribution',
          ...(attributionLines.length ? attributionLines : ['No attribution data available']),
        ].join('\n');
        const notificationSubject = `${intent ? `${intent.replace(/[-_]/g, ' ')} — ` : ''}New Angel Creations Project Enquiry`;

        // Send the internal notification first. Its EmailJS template should
        // use business@angelcreations.in in To and BCC the three private
        // Gmail inboxes. Attribution stays in this studio-facing send only.
        await sendEmail(notificationTemplateId, {
          ...fieldParams,
          intent,
          topic,
          goal,
          source_route: source,
          first_landing_page: attribution.firstLandingPage || '',
          last_landing_page: attribution.lastLandingPage || '',
          referrer: attribution.referrer || '',
          utm_source: attribution.utmSource || '',
          utm_medium: attribution.utmMedium || '',
          utm_campaign: attribution.utmCampaign || '',
          utm_term: attribution.utmTerm || '',
          utm_content: attribution.utmContent || '',
          gclid: attribution.gclid || '',
          fbclid: attribution.fbclid || '',
          msclkid: attribution.msclkid || '',
          message,
          to_email: 'business@angelcreations.in',
          subject: notificationSubject,
          reply_to: values.email.trim(),
        });

        // EmailJS has accepted the enquiry for the studio. Lock it before
        // attempting the confirmation so neither a retry nor a later edit
        // can duplicate the internal notification.
        internalSentRef.current = true;
        setSent(true);
        pendingLeadEvents.push({
          name: 'generate_lead',
          payload: {
            form_provider: 'emailjs',
            intent: intent || undefined,
            source_route: source,
            discipline: values.projectType || undefined,
          },
        });
      }

      if (!confirmationSent) {
        setFormStatus('Your enquiry has been sent to Angel Creations. Sending your confirmation…');
        const confirmed = await sendConfirmation();
        setFormStatus(
          confirmed
            ? 'Thank you — your enquiry has been sent to Angel Creations, and a confirmation email has been sent to your inbox.'
            : 'Your enquiry has been sent to Angel Creations, but we could not send the confirmation email. The studio has your enquiry and can follow up using the email address you provided. You can retry just the confirmation below.'
        );
      }
    } catch {
      setFormStatus('We could not send your enquiry just now. Your answers are still here—please use “Open email draft” or copy the enquiry text below.');
      pendingLeadEvents.push({
        name: 'lead_submit_error',
        payload: {
          form_provider: 'emailjs',
          intent: intent || undefined,
          source_route: source,
        },
      });
    } finally {
      setIsSending(false);
    }

    // Dispatched strictly after delivery has settled and outside the delivery
    // try/catch above. EmailJS delivery alone decides what the visitor is
    // told: a throwing tag manager cannot turn an accepted enquiry into a
    // failure message, skip the customer confirmation, or resend the internal
    // notification. Every payload stays PII-free.
    for (const event of pendingLeadEvents) {
      dispatchLeadEvent(event.name, event.payload);
    }
  };

  const setInputRef = (element: HTMLInputElement | null): void => {
    controlRef.current = element;
  };
  const setTextareaRef = (element: HTMLTextAreaElement | null): void => {
    controlRef.current = element;
  };
  const setDropdownTriggerRef = (element: HTMLButtonElement | null): void => {
    controlRef.current = element;
  };

  const renderControl = (): JSX.Element => {
    const ariaInvalid: 'true' | 'false' = showCurrentError() ? 'true' : 'false';
    const shared = {
      id: `contact-field-${field.id}`,
      name: field.id,
      className: 'ac-input wpcf7-form-control wpcf7-validates-as-required',
      autoComplete: field.autoComplete,
      maxLength: field.maxLength,
      'aria-required': !field.optional,
      'aria-invalid': ariaInvalid,
      'aria-labelledby': currentLabelId,
      'aria-describedby': showCurrentError()
        ? `${currentHintId} ${currentErrorId}`
        : currentHintId,
      value: currentValue,
      required: !field.optional,
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => updateValue(event.target.value),
    };

    if (field.kind === 'select') {
      const options = field.options ?? [];
      const selectedOption = options.find((item) => item.value === currentValue);

      return (
        <div className="ac-field-block" ref={dropdownWrapRef}>
          {/* Redesigned Apple Liquid Glass Spatial Dropdown */}
          <div
            className={`ac-custom-select${dropdownOpen ? ' is-open' : ''}${
              selectedOption ? ' has-value' : ''
            }`}
          >
            {/* Hidden native select for form semantics */}
            <select
              id={`contact-field-${field.id}-native`}
              name={field.id}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              value={currentValue}
              onChange={(e) => updateValue(e.target.value)}
            >
              <option value="">Select a discipline…</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>

            <button
              id={`contact-field-${field.id}`}
              ref={setDropdownTriggerRef}
              type="button"
              role="combobox"
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              aria-controls="ac-discipline-listbox"
              aria-activedescendant={dropdownOpen ? `ac-discipline-option-${highlightedIndex}` : undefined}
              aria-required={!field.optional}
              aria-invalid={ariaInvalid}
              aria-labelledby={currentLabelId}
              aria-describedby={showCurrentError()
                ? `${currentHintId} ${currentErrorId}`
                : currentHintId}
              className="ac-custom-select__trigger"
              onClick={() => {
                const idx = options.findIndex((o) => o.value === currentValue);
                setHighlightedIndex(idx >= 0 ? idx : 0);
                setDropdownOpen((open) => !open);
              }}
              onKeyDown={handleDropdownKeyDown}
            >
              {selectedOption ? (
                <span className="ac-custom-select__selected">
                  <span className="ac-custom-select__code">{selectedOption.code}</span>
                  <span className="ac-custom-select__text-group">
                    <span className="ac-custom-select__value">{selectedOption.value}</span>
                    <span className="ac-custom-select__desc">
                      {selectedOption.description}
                    </span>
                  </span>
                  <span className="ac-custom-select__tag">{selectedOption.tag}</span>
                </span>
              ) : (
                <span className="ac-custom-select__placeholder">
                  Select an immersive or creative discipline…
                </span>
              )}

              <span className="ac-custom-select__right">
                {currentValid && (
                  <span className="ac-valid-badge ac-valid-badge--inline" aria-hidden="true">
                    ✓ Ready
                  </span>
                )}
                <span
                  className={`ac-custom-select__chevron${dropdownOpen ? ' is-open' : ''}`}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 5.25L7 9.25L11 5.25"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </button>

            <span className="ac-focus-line" aria-hidden="true" />

            {/* Sculptural Liquid Glass Popover Menu */}
            {dropdownOpen && (
              <div
                id="ac-discipline-listbox"
                role="listbox"
                aria-label="Immersive and creative disciplines"
                className="ac-custom-select__popover"
              >
                <div className="ac-custom-select__popover-head">
                  <span>Select Your Project Discipline</span>
                  <span>{options.length} Capabilities</span>
                </div>
                <div className="ac-custom-select__grid">
                  {options.map((opt, idx) => {
                    const isSelected = currentValue === opt.value;
                    const isHighlighted = highlightedIndex === idx;
                    return (
                      <button
                        key={opt.value}
                        id={`ac-discipline-option-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`ac-custom-select__option${
                          isSelected ? ' is-selected' : ''
                        }${isHighlighted ? ' is-highlighted' : ''}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => {
                          updateValue(opt.value);
                          setDropdownOpen(false);
                        }}
                      >
                        <div className="ac-custom-select__option-top">
                          <span className="ac-custom-select__option-code">{opt.code}</span>
                          <span className="ac-custom-select__option-tag">{opt.tag}</span>
                          {isSelected && (
                            <span className="ac-custom-select__option-check" aria-hidden="true">
                              ✓
                            </span>
                          )}
                        </div>
                        <strong className="ac-custom-select__option-title">
                          {opt.value}
                        </strong>
                        <span className="ac-custom-select__option-sub">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick-Select Immersive Pills directly below the dropdown */}
          <div className="ac-quick-options" aria-label="Quick discipline selection">
            <span className="ac-quick-options__label">Immersive &amp; Core:</span>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`ac-quick-pill${currentValue === opt.value ? ' is-selected' : ''}`}
                onClick={() => {
                  updateValue(opt.value);
                  setDropdownOpen(false);
                }}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="ac-field-block">
        <div className="ac-field-wrap">
          {field.kind === 'textarea' ? (
            <textarea
              {...shared}
              ref={setTextareaRef}
              rows={3}
              placeholder={field.placeholder}
              onKeyDown={handleTextareaKeyDown}
            />
          ) : (
            <input
              {...shared}
              ref={setInputRef}
              type={field.inputType ?? 'text'}
              placeholder={field.placeholder}
            />
          )}
          <span className="ac-focus-line" aria-hidden="true" />
          {currentValid && (
            <span className="ac-valid-badge" aria-hidden="true">
              ✓ Ready
            </span>
          )}
        </div>

        {field.quickSuggestions && field.quickSuggestions.length > 0 && (
          <div className="ac-quick-options" aria-label={`Quick suggestions for ${field.name}`}>
            <span className="ac-quick-options__label">Quick select:</span>
            {field.quickSuggestions.map((option) => (
              <button
                key={option}
                type="button"
                className={`ac-quick-pill${currentValue === option ? ' is-selected' : ''}`}
                onClick={() => updateValue(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="angel-contact-redesign">
      {/* Ambient Spatial Background Grid & Light Orbs */}
      <div className="ac-ambient-backdrop" aria-hidden="true">
        <div className="ac-ambient-orb ac-ambient-orb--cyan" />
        <div className="ac-ambient-orb ac-ambient-orb--indigo" />
        <div className="ac-ambient-grid" />
      </div>

      <div className="contact-section-min">
        <section className="section-contact">
          <div className="contact-inner">
            {/* Editorial Studio Header */}
            <header className="ac-studio-hero">
              <div className="ac-studio-hero__left">
                <div className="ac-studio-eyebrow">
                  <span className="ac-studio-eyebrow__dot" aria-hidden="true" />
                  <span>Angel Creations · Global Production Concierge</span>
                </div>
                <h1 className="ac-studio-title">
                  Let’s build what doesn’t exist yet.
                </h1>
                <p className="ac-studio-subtitle">
                  Complete our 8-step brief below and send your project enquiry directly to the studio, or contact us using the details below.
                </p>
              </div>

              <div className="ac-studio-hero__right">
                <a href="#direct-contact-channels" className="ac-direct-jump-pill">
                  <span>Direct Email &amp; +91-8058465733</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </header>

            {/* Sculptural Liquid Glass Stage wrapping the Original N° One-at-a-Time Form */}
            <div className="ac-wizard-shell">
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
                  <section className="contact-prepared" aria-labelledby="enquiry-ready-title">
                    {formStatus && (
                      <p className={`contact-send-status${sent ? ' is-success' : ''}`} role="status" aria-live="polite">
                        {formStatus}
                      </p>
                    )}
                    <div className="contact-prepared__header">
                      <div>
                        <p className="contact-prepared__eyebrow">
                          N° 08 / 08 · Project Enquiry Prepared
                        </p>
                        <h2 id="enquiry-ready-title">Your project brief is ready.</h2>
                        <p className="contact-prepared__lead">
                          Click any answer below to refine it, then send your enquiry directly to
                          the studio or call our executive line on <strong>+91-8058465733</strong>.
                        </p>
                      </div>
                      <span className="contact-prepared__badge">08 / 08 Complete</span>
                    </div>

                    <dl className="contact-prepared__summary">
                      {fields.map((item, idx) => (
                        <div
                          key={item.id}
                          className="contact-prepared__row"
                          onClick={() => {
                            setPrepared(false);
                            setStep(idx);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setPrepared(false);
                              setStep(idx);
                            }
                          }}
                          title={`Edit ${item.name}`}
                        >
                          <dt>
                            <span>N° {String(idx + 1).padStart(2, '0')}</span> {item.name}
                            <em className="contact-prepared__edit-tag">Edit ✎</em>
                          </dt>
                          <dd>{values[item.id].trim() || (item.optional ? 'Not provided' : '')}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="contact-prepared__actions">
                      {!sent ? (
                        <button
                          className="contact-prepared__send"
                          type="button"
                          onClick={() => void sendEnquiry()}
                          disabled={isSending}
                        >
                          {isSending ? 'Sending enquiry…' : 'Send enquiry'} <span aria-hidden="true">↗</span>
                        </button>
                      ) : confirmationSent ? (
                        <span className="contact-prepared__send">✓ Enquiry sent</span>
                      ) : (
                        <button
                          className="contact-prepared__send"
                          type="button"
                          onClick={() => void sendEnquiry()}
                          disabled={isSending}
                        >
                          {isSending ? 'Sending confirmation…' : 'Resend confirmation email'} <span aria-hidden="true">↗</span>
                        </button>
                      )}
                      <a className="contact-prepared__edit" href={createMailto(values)}>
                        Open email draft <span aria-hidden="true">↗</span>
                      </a>
                      <button
                        className="contact-prepared__edit"
                        type="button"
                        onClick={copyEnquiryText}
                      >
                        {copiedChannel === 'summary'
                          ? '✓ Copied to clipboard'
                          : 'Copy enquiry text'}
                      </button>
                      <a className="contact-prepared__edit" href="tel:+918058465733">
                        Call +91-8058465733
                      </a>
                      <button
                        className="contact-prepared__edit"
                        type="button"
                        onClick={() => setPrepared(false)}
                      >
                        Edit answers
                      </button>
                      <button className="contact-prepared__edit" type="button" onClick={reset}>
                        Start again
                      </button>
                    </div>
                  </section>
                ) : (
                  <div className="tab-content">
                    <div
                      key={field.id}
                      className="tab-pane ac-step-stage"
                      id={`step${step + 1}`}
                      style={{ display: 'block' }}
                    >
                      {/* Signature N° Progress Header + Category Badge + Interactive Step Rail */}
                      <div className="step-title">
                        <div className="ac-progress-header" aria-hidden="true">
                          <span className="ac-slider-progress">
                            <span className="ac-slider-prefix">
                              N<small>o</small>
                            </span>
                            <span className="ac-step-current">
                              {String(step + 1).padStart(2, '0')}
                            </span>
                          </span>

                          <span className="ac-progress-line">
                            <span
                              className="ac-progress-line__fill"
                              style={{ width: `${progressRatio}%` }}
                            />
                          </span>

                          <span className="ac-step-total">
                            {String(fields.length).padStart(2, '0')}
                          </span>

                          <span className="ac-step-category-pill">{field.category}</span>
                        </div>

                        {/* Interactive Step Number Rail */}
                        <div className="ac-step-dots" role="group" aria-label="Enquiry steps">
                          {fields.map((item, idx) => {
                            const isCurrent = idx === step;
                            const isDone = isComplete(item, values[item.id]);
                            const canJump = idx <= step || isDone;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                aria-current={isCurrent ? 'step' : undefined}
                                aria-label={`Step ${idx + 1}: ${item.name}`}
                                title={`Step ${idx + 1}: ${item.name}`}
                                disabled={!canJump}
                                className={`ac-step-dot${isCurrent ? ' is-current' : ''}${
                                  isDone ? ' is-done' : ''
                                }`}
                                onClick={() => canJump && setStep(idx)}
                              >
                                {String(idx + 1).padStart(2, '0')}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <p className="sr-only" aria-live="polite">
                        Question {step + 1} of {fields.length}: {field.name}
                      </p>

                      <ul className="ac-question-list">
                        <li className="ac-question-li">
                          <div className="ac-active ac-label">
                            <h3 id={currentLabelId}>{field.label}</h3>
                            <span id={currentHintId} className="ac-question-hint">
                              {field.hint}
                            </span>
                          </div>

                          {renderControl()}

                          <div className="errorTxt" id={currentErrorId} aria-live="polite">
                            {showCurrentError() ? (
                              <span className="error">
                                {field.inputType === 'email' && currentValue.trim()
                                  ? 'Please enter a valid email address before continuing.'
                                  : 'Please complete this question before continuing.'}
                              </span>
                            ) : null}
                          </div>
                        </li>

                        <li
                          className="action_li"
                          style={{ listStyle: 'none', display: 'flex' }}
                        >
                          <div className="ac-nav-group">
                            <button
                              className={`prev-btn prev-btn${step + 1}`}
                              type="button"
                              aria-label="Previous question"
                              disabled={step === 0}
                              onClick={previous}
                            >
                              <img src={backIcon} alt="" />
                              <span className="ac-btn-label">Prev</span>
                            </button>

                            <button
                              className={
                                step === fields.length - 1
                                  ? 'submit-btn next-btn'
                                  : `next-btn next-btn${step + 1}`
                              }
                              type="submit"
                              aria-label={
                                step === fields.length - 1
                                  ? 'Prepare project enquiry'
                                  : 'Next question'
                              }
                            >
                              <span className="ac-btn-label">
                                {step === fields.length - 1 ? 'Prepare Enquiry' : 'Next'}
                              </span>
                              <img src={nextIcon} alt="" />
                            </button>
                          </div>

                          <div className="ac-stage-meta">
                            <span className="ac-enter-hint" aria-hidden="true">
                              {field.kind === 'textarea'
                                ? 'Press ⌘ + Enter ↵ to continue'
                                : 'Press Enter ↵ to continue'}
                            </span>
                          </div>
                        </li>
                      </ul>

                      {/* Live Answered Trail Strip for Instant Jump-Back Editing */}
                      {completedFields.length > 0 && (
                        <div className="ac-answered-trail" aria-label="Answered questions">
                          <span className="ac-answered-trail__title">Your brief so far:</span>
                          <div className="ac-answered-trail__chips">
                            {completedFields.map(({ item, index, value }) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`ac-answered-chip${index === step ? ' is-active' : ''}`}
                                onClick={() => setStep(index)}
                                title={`Jump to Step ${index + 1}: ${item.name}`}
                              >
                                <span className="ac-answered-chip__num">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="ac-answered-chip__key">{item.name}:</span>
                                <span className="ac-answered-chip__val">
                                  {value.length > 26 ? `${value.slice(0, 26)}…` : value}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Redesigned Bottom Direct Contact Section: Customer Supports, Customer Business & Mobile +91-8058465733 */}
      <section
        id="direct-contact-channels"
        className="ac-support-section"
        aria-label="Direct email and mobile contacts"
      >
        <div className="genralinformation">
          <div className="ac-support-header">
            <span className="ac-support-header__eyebrow">Direct Studio Desks</span>
            <h2 className="ac-support-header__title">
              Prefer direct email or a phone conversation?
            </h2>
          </div>

          <div className="supportmail">
            {/* 1. For Customer Supports */}
            <div className="supcom leftsupport">
              <div className="supcom__top">
                <span className="supcom__badge">01 · Support Desk</span>
                <button
                  type="button"
                  className="supcom__copy-btn"
                  onClick={() =>
                    copyToClipboard('support@angelcreations.in', 'support')
                  }
                >
                  {copiedChannel === 'support' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <h4>For Customer Supports</h4>
              <div className="downicon">
                <img src={downIcon} alt="" />
                <p>
                  <a href="mailto:support@angelcreations.in">support@angelcreations.in</a>
                </p>
              </div>
              <span className="supcom__sub">
                Client care, technical support &amp; active project assistance
              </span>
            </div>

            {/* 2. For Customer Business */}
            <div className="supcom rightsupport">
              <div className="supcom__top">
                <span className="supcom__badge">02 · Business Desk</span>
                <button
                  type="button"
                  className="supcom__copy-btn"
                  onClick={() =>
                    copyToClipboard('business@angelcreations.in', 'business')
                  }
                >
                  {copiedChannel === 'business' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <h4>For Customer Business</h4>
              <div className="downicon">
                <img src={downIcon} alt="" />
                <p>
                  <a href="mailto:business@angelcreations.in">business@angelcreations.in</a>
                </p>
              </div>
              <span className="supcom__sub">
                New commissions, brand partnerships &amp; enterprise RFPs
              </span>
            </div>

            {/* 3. Direct Mobile Number: +91-8058465733 */}
            <div className="supcom mobilesupport">
              <div className="supcom__top">
                <span className="supcom__badge">03 · Direct Mobile</span>
                <button
                  type="button"
                  className="supcom__copy-btn"
                  onClick={() => copyToClipboard('+91-8058465733', 'mobile')}
                >
                  {copiedChannel === 'mobile' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <h4>For Direct Call &amp; Mobile</h4>
              <div className="downicon">
                <img src={downIcon} alt="" />
                <p>
                  <a href="tel:+918058465733">+91-8058465733</a>
                </p>
              </div>
              <span className="supcom__sub">
                Direct producer line · Instant voice &amp; studio consultation
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
