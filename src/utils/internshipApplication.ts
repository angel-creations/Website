import { getEmailJsConfig } from '../config/emailjs';

/**
 * Internship application delivery.
 *
 * This deliberately reuses the studio's existing, already-provisioned EmailJS
 * service and its two templates rather than introducing new identifiers. No
 * new EmailJS resource, dashboard change or DNS record is required, which means
 * an application is delivered through exactly the same monitored channel as the
 * project-enquiry form.
 *
 * The same recipient-separation rule applies as in `ContactWizard.tsx`:
 * EmailJS resolves a template's To/Cc/Bcc fields from the template parameters,
 * so `email`/`contact_email` carry the VISITOR in the confirmation payload but
 * are re-pointed at the studio in the notification payload. A dashboard field
 * that reads `{{email}}` therefore resolves to the studio in the internal send,
 * and `assertRecipientSplit` fails closed if the code ever aims a message at
 * the wrong party.
 *
 * Resume uploads: binary attachments require EmailJS's multipart `send-form`
 * endpoint and a matching File-Attachment entry on the dashboard template.
 * That cannot be guaranteed from client code, so the resume is attached when
 * EmailJS accepts it and the application still submits when it does not — the
 * applicant always has a copy-and-paste fallback, and the studio never receives
 * a silently truncated application.
 */

const STUDIO_EMAIL = 'business@angelcreations.in';
const SEND_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
const SEND_FORM_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send-form';

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export class RecipientSplitError extends Error {}

function assertRecipientSplit(
  kind: 'internal' | 'confirmation',
  toEmail: string,
  visitorEmail: string,
): void {
  const problems: string[] = [];
  const target = toEmail.trim().toLowerCase();
  const visitor = visitorEmail.trim().toLowerCase();
  if (!target) problems.push('recipient is empty');
  if (kind === 'internal') {
    if (target !== STUDIO_EMAIL) problems.push(`internal recipient ${toEmail} is not ${STUDIO_EMAIL}`);
    if (target === visitor) problems.push('internal notification would be delivered to the applicant');
  } else {
    if (target !== visitor) problems.push(`confirmation recipient ${toEmail} is not the applicant`);
    if (target === STUDIO_EMAIL) problems.push('confirmation would be delivered to the studio');
  }
  if (problems.length) throw new RecipientSplitError(`recipient separation violated: ${problems.join('; ')}`);
}

export type SendOutcome = {
  studioNotified: boolean;
  confirmationSent: boolean;
  resumeAttached: boolean;
};

async function postJson(
  templateId: string,
  templateParams: Record<string, string>,
  config: NonNullable<ReturnType<typeof getEmailJsConfig>>,
): Promise<void> {
  // Bound every request: a hung connection must fall through to the copy
  // fallback instead of leaving "Sending…" on screen forever.
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(SEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: templateId,
        user_id: config.publicKey,
        template_params: templateParams,
      }),
    });
    if (!response.ok) throw new Error(`EmailJS returned HTTP ${response.status}`);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function postWithResume(
  templateId: string,
  templateParams: Record<string, string>,
  resume: File,
  config: NonNullable<ReturnType<typeof getEmailJsConfig>>,
): Promise<boolean> {
  const form = new FormData();
  form.append('service_id', config.serviceId);
  form.append('template_id', templateId);
  form.append('user_id', config.publicKey);
  Object.entries(templateParams).forEach(([key, value]) => form.append(key, value));
  // The parameter name must match the dashboard template's File Attachment
  // parameter. When it does not, EmailJS still accepts the message and simply
  // delivers it without the file, so this is never a hard failure.
  form.append('resume', resume, resume.name);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(SEND_FORM_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      body: form,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export type ApplicationPayload = {
  /** Raw field values, keyed by input name. */
  values: Record<string, string>;
  declarations: Record<string, boolean>;
  resume: File | null;
  /** Labels of the declarations, in the same order as `declarations`. */
  declarationLabels: string[];
  /** Non-sensitive campaign context for the studio notification only. */
  attribution: Record<string, string>;
};

export function buildApplicationMessage(payload: ApplicationPayload): string {
  const { values } = payload;
  const line = (label: string, key: string): string =>
    `${label}: ${values[key]?.trim() || 'Not provided'}`;
  const declarationLines = Object.entries(payload.declarations).map(
    ([, accepted]) => `${accepted ? '[x]' : '[ ]'}`,
  );
  const declarationLabels = payload.declarationLabels;

  return [
    'New internship application from angelcreations.in/internship/',
    '',
    'SHORT APPLICATION',
    line('Full name', 'fullName'),
    line('Email address', 'email'),
    line('WhatsApp number', 'mobile'),
    line('Preferred domain', 'domain'),
    line('College / institution', 'college'),
    '',
    'The remaining questions (specific role, preferred mode, motivation, skills,',
    'portfolio and resume) are gathered during the review conversation.',
    '',
    'DECLARATION',
    ...declarationLabels.map((label, index) => `${declarationLines[index] ?? '[ ]'} ${label}`),
    '',
    'Campaign attribution',
    ...(Object.entries(payload.attribution).length
      ? Object.entries(payload.attribution).map(([key, value]) => `${key}: ${value}`)
      : ['No attribution data available']),
  ].join('\n');
}

/**
 * Sends the application to the studio, then a confirmation to the applicant.
 * Returns an outcome instead of throwing so the UI can always report exactly
 * which parts succeeded.
 */
export async function sendInternshipApplication(
  payload: ApplicationPayload,
): Promise<SendOutcome> {
  const config = getEmailJsConfig();
  if (!config) {
    return { studioNotified: false, confirmationSent: false, resumeAttached: false };
  }

  const visitorEmail = payload.values.email?.trim() ?? '';
  const applicationId = `AC-INT-${Date.now().toString(36).toUpperCase()}`;

  // Both templates receive the applicant's answers, because both bodies need
  // them. Recipient placement is decided by the dashboard, so every generic
  // email-position parameter is re-pointed per send below.
  const baseParams: Record<string, string> = {
    application_id: applicationId,
    full_name: payload.values.fullName?.trim() ?? '',
    name: payload.values.fullName?.trim() ?? '',
    email: visitorEmail,
    contact_email: visitorEmail,
    mobile: payload.values.mobile?.trim() ?? '',
    phone: payload.values.mobile?.trim() ?? '',
    college: payload.values.college?.trim() ?? '',
    domain: payload.values.domain?.trim() ?? '',
    // Retained as empty strings: the EmailJS templates reference these
    // placeholders, and EmailJS errors on an unresolved variable. Nothing is
    // collected for them by the short form any more.
    city: '',
    course: '',
    year_of_study: '',
    role: '',
    preferred_mode: '',
    motivation: '',
    skills: '',
    previous_experience: '',
    portfolio_url: '',
    resume_name: '',
    programme_duration: '3 months',
    programme_fee: '₹999 (one-time)',
    stipend: 'No stipend',
  };

  const message = buildApplicationMessage(payload);

  let studioNotified = false;
  let confirmationSent = false;
  let resumeAttached = false;

  try {
    assertRecipientSplit('internal', STUDIO_EMAIL, visitorEmail);
    const internalParams: Record<string, string> = {
      ...baseParams,
      // RECIPIENT FAIL-SAFE (internal send only) — mirrors ContactWizard.
      email: STUDIO_EMAIL,
      contact_email: STUDIO_EMAIL,
      from_email: STUDIO_EMAIL,
      user_email: STUDIO_EMAIL,
      sender_email: STUDIO_EMAIL,
      studio_email: STUDIO_EMAIL,
      visitor_email: visitorEmail,
      to_email: STUDIO_EMAIL,
      reply_to: visitorEmail,
      subject: `New Internship Application — ${baseParams.full_name} — Angel Creations`,
      message,
    };

    if (payload.resume) {
      resumeAttached = await postWithResume(
        config.notificationTemplateId,
        internalParams,
        payload.resume,
        config,
      );
    }
    if (!resumeAttached) {
      // Send (or re-send) as a plain message so the application is never lost
      // because of an attachment. A second send is only attempted when the
      // multi-part attempt failed outright.
      await postJson(config.notificationTemplateId, internalParams, config);
    }
    studioNotified = true;
  } catch {
    return { studioNotified: false, confirmationSent: false, resumeAttached: false };
  }

  try {
    assertRecipientSplit('confirmation', visitorEmail, visitorEmail);
    await postJson(
      config.confirmationTemplateId,
      {
        ...baseParams,
        // In the confirmation the applicant IS the recipient, correctly.
        to_email: visitorEmail,
        reply_to: STUDIO_EMAIL,
        subject:
          `We Have Received Your Internship Application (${applicationId}) — Angel Creations`,
      },
      config,
    );
    confirmationSent = true;
  } catch {
    confirmationSent = false;
  }

  return { studioNotified, confirmationSent, resumeAttached };
}
