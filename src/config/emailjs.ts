// Central EmailJS configuration for the contact wizard.
//
// These are the project's EmailJS identifiers. They are configured here in
// source so the static site builds and works on Hostinger with no build-time
// environment variables: the GitHub Actions workflow and the host need no
// EmailJS settings at all.
//
// Security note — the "public key" is NOT a secret. EmailJS is designed for
// browser-side use: this value is compiled into the public JavaScript bundle
// and is downloadable by anyone who visits the site. It grants no access to
// the mailbox or to the EmailJS account. What actually protects the account is
// configured in the EmailJS dashboard, not here:
//   - allowed origins restricted to the production domain,
//   - rate limiting / anti-abuse controls,
//   - the connected service's own sending limits.
// Allowed origins and rate limits are therefore load-bearing, because the key
// and the template IDs are public by design. See docs/EMAILJS_SETUP.md.
//
// What must never be added to this file: Microsoft 365 passwords, OAuth
// tokens, private API keys, SMTP credentials, or internal/BCC recipient
// addresses. Recipients (including the private BCC inboxes) live only in the
// EmailJS dashboard, never in client code.

export type EmailJsConfig = {
  serviceId: string;
  notificationTemplateId: string;
  confirmationTemplateId: string;
  publicKey: string;
};

export const EMAILJS_CONFIG: EmailJsConfig = {
  // EmailJS service that performs both sends. The sender identity, the
  // recipients and the BCC list live in the EmailJS dashboard templates, never
  // here. Mail for this domain is hosted by Hostinger (there is no Microsoft
  // 365 on this domain) — see docs/DELIVERABILITY.md before changing anything.
  serviceId: 'service_85q82kl',
  // Internal enquiry notification, addressed to the studio (recipients and
  // BCC are defined in the dashboard template, not here).
  notificationTemplateId: 'template_m0s0taz',
  // Customer confirmation, addressed to the visitor who submitted the form.
  confirmationTemplateId: 'template_xoqfbrj',
  // Browser-visible public key (see the security note above).
  publicKey: 'QEFeEiM-AvVEb3L_F',
};

// Build-time switch used only by the automated checks to exercise the
// "configuration unavailable" fallback UI. It is unset in every real build,
// so Vite compiles this to `false` and the branch disappears from the bundle.
// It can only ever force the safe direction (fallback mode), never bypass
// anything.
const buildEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const FORCE_UNCONFIGURED = buildEnv.VITE_EMAILJS_FORCE_UNCONFIGURED === 'true';

/**
 * Returns the EmailJS configuration, or `null` when it is incomplete so the
 * wizard can fall back to the email-draft and copy actions instead of failing
 * silently. Kept as a runtime check because a mistaken edit to this module
 * must degrade gracefully rather than break enquiry submission.
 */
export function getEmailJsConfig(): EmailJsConfig | null {
  if (FORCE_UNCONFIGURED) return null;

  const { serviceId, notificationTemplateId, confirmationTemplateId, publicKey } = EMAILJS_CONFIG;
  const values = [serviceId, notificationTemplateId, confirmationTemplateId, publicKey];
  if (values.some((value) => typeof value !== 'string' || !value.trim())) return null;

  return {
    serviceId: serviceId.trim(),
    notificationTemplateId: notificationTemplateId.trim(),
    confirmationTemplateId: confirmationTemplateId.trim(),
    publicKey: publicKey.trim(),
  };
}
