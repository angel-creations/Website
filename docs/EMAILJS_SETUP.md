# EmailJS contact form setup

> **Deliverability:** authentication, DNS records, the inbox-vs-spam rules and the
> verification procedure live in [DELIVERABILITY.md](./DELIVERABILITY.md). Read it
> before changing the email service, the templates or DNS.

The existing eight-question contact wizard sends two emails after the visitor presses **Send enquiry**: an internal enquiry notification first, followed by a personalised confirmation to the visitor. The approved visual design and the mailto/copy fallbacks remain available.

## Configuration lives in source

All EmailJS identifiers are defined in **`src/config/emailjs.ts`** and imported by `src/components/ContactWizard.tsx`:

- **Service ID:** `service_0kxsu92` — EmailJS service backed by **Hostinger SMTP**
  for `business@angelcreations.in`
- **Internal notification template ID:** `template_m0s0taz`
- **Customer confirmation template ID:** `template_xoqfbrj`
- **Public key:** stored in the same module (see the note below)

### Verified sending route

Two delivered messages were inspected (see [DELIVERABILITY.md](./DELIVERABILITY.md) §1):

- **Customer confirmation** — sent through Hostinger SMTP
  (`smtp-svr-02.emailjs.com` → MailChannels), `Return-Path: business@angelcreations.in`,
  `DKIM d=angelcreations.in s=hostingermail1`, **SPF + DKIM + DMARC all pass.**
  The Hostinger route works and is fully aligned.
- **An older internal notification** — sent through a personal **Outlook**
  account: `Return-Path: outlook.com`, DKIM of `outlook.com`, **DMARC fail**,
  because the visible From was `business@angelcreations.in` and neither SPF nor
  DKIM aligned with it. That is the confirmed cause of those messages being
  filtered.

Both sends in one submission share a single `service_id`, so a mixed pair cannot
come from one submission. Check EmailJS **Smart Router**: if the old Outlook
service is still set as **Detour**, it will silently re-send any failed request
and reintroduce DMARC failures. Remove that assignment.

Fixed subject copy (composed in `ContactWizard.tsx`, so it applies whether the
template uses `{{subject}}` or a literal):

| Email | Subject |
| --- | --- |
| Internal notification | `New Website Enquiry — {name} — Angel Creations` |
| Customer confirmation | `We Received Your Enquiry — Angel Creations` |

### Service history

| Service ID | Status | Notes |
| --- | --- | --- |
| `service_0kxsu92` | **Active** | Hostinger SMTP, authenticating as `business@angelcreations.in`. The SMTP username and password are held by EmailJS only. |
| `service_85q82kl` | **Retired** | Previous service. Kept here for audit only — it is not referenced by any code, test or workflow. |

**Migrating a service again:** change `serviceId` in `src/config/emailjs.ts`, then run
`npm run test:config` and `npm run test:emailjs`. The two template IDs travel with the
templates, not the service, so they do **not** change when the sending service changes.

**No GitHub Actions variables, no `.env.local`, and no Hostinger settings are required.** The static site builds with this configuration on any machine, and the deployed bundle already contains it. To change an identifier, edit that module and rebuild.

**The public key is not a secret.** EmailJS is designed for browser-side use: this key is compiled into the public JavaScript bundle and is downloadable by any visitor. It grants no access to the mailbox or to the EmailJS account. What actually protects the account is the EmailJS dashboard (allowed origins, rate limits, anti-abuse), which is why those settings matter — see "Security and delivery notes". Never add Microsoft 365 passwords, OAuth tokens, SMTP credentials, private API keys, or recipient addresses to that module; recipients (including the private BCC inboxes) stay in the dashboard.

## 1. Configure the internal notification template

In EmailJS, open the internal notification template (`template_m0s0taz`).

- **To Email:** `business@angelcreations.in`
- **BCC:** Add the three private Gmail inboxes in the EmailJS template's BCC field, if supported. Keep them out of To/CC so the recipient list is not exposed. **This is the only template that may carry BCC recipients — the customer confirmation template must have none.**
- **From Name:** `Angel Creations`
- **From Email:** `business@angelcreations.in` — valid only because the domain itself is authenticated (SPF + DKIM). There is **no Microsoft 365 on this domain**: mail is hosted by Hostinger, so "the verified sender of the connected M365 service" does not exist. See [DELIVERABILITY.md](./DELIVERABILITY.md) before touching the service.
- **Reply-To:** `{{email}}`
- **Subject:** A new enquiry subject, for example `New Project Enquiry | {{name}}`

The notification template should include the eight fields used by the current contact form:
- `{{name}}`
- `{{company}}`
- `{{email}}`
- `{{phone}}`
- `{{projectType}}`
- `{{description}}`
- `{{timeline}}`
- `{{investment}}`

The integration also supplies snake_case aliases such as `{{contact_name}}`, `{{contact_email}}`, `{{project_type}}`, and `{{project_description}}` for compatibility with older template variants.

The code additionally sends `to_email`, `subject`, and `reply_to` parameters with every send. Those parameters only take effect where the template's own To/Subject/Reply-To fields reference them (for example a Subject of `{{subject}}`); hard-coded dashboard values simply ignore the parameters. Either approach is fine, but verify each template field in the dashboard so the effective sender, recipients, subject, and reply-to are the intended ones.

## 2. Configure the customer confirmation template

Use a separate EmailJS template for the visitor's confirmation:

- **To Email:** `{{email}}`
- **From Name:** `Angel Creations`
- **From Email:** `business@angelcreations.in` (same rule and same caveat as the internal template — see [DELIVERABILITY.md](./DELIVERABILITY.md)).
- **Reply-To:** `business@angelcreations.in`
- **Subject:** `{{name}}, your project enquiry with Angel Creations`

Include the same eight form fields in the email body and the public company contact details: `business@angelcreations.in`, `support@angelcreations.in`, `+91 80584 65733`, and `https://angelcreations.in`. Do not put the private Gmail recipients in the customer-facing template or its To/CC/BCC fields.

The confirmation send receives **only** the visitor's eight answers (plus the aliases above). Campaign attribution, click IDs (`gclid`/`fbclid`/`msclkid`), referrer/landing-page data, and the composed internal `message` are sent to the internal notification only, so they cannot leak into the customer email even if the template references a variable the code never sends it.

## 3. Local development

Nothing to configure: `npm install && npm run dev` uses the identifiers in `src/config/emailjs.ts`. `.env.example` is kept only for an unrelated optional lead endpoint; the four `VITE_EMAILJS_*` entries have been removed and are no longer read anywhere.

To exercise the "configuration unavailable" fallback locally, build with the test-only switch (never set in a real build):

```bash
VITE_EMAILJS_FORCE_UNCONFIGURED=true npm run build
node scripts/checkEmailjsSubmission.mjs --unconfigured
```

## 4. Production builds

GitHub Actions and Hostinger need **no EmailJS configuration**. The workflow runs `npm run build` exactly as you would locally, and the identifiers come from source.

Two guards keep this honest:

1. `node scripts/checkEmailjsConfig.mjs` fails the build if the module is missing an identifier, has a wrong-shaped value, contains an email address or credential material, or if client code/workflow still references the old `VITE_EMAILJS_*` variables.
2. `node scripts/checkEmailjsConfig.mjs --bundle dist` runs after the build and verifies the identifiers actually reached the compiled bundle — a configuration that silently dropped out of the build would otherwise ship the form in fallback mode. It reports presence only and never prints the key.

**Merge gate:** the contact form is only live once a deploy of this code reaches production. Until then production keeps its previous mailto/copy behaviour.

## 5. Verify before launch

### Automated checks (mocked — no real email is ever sent)

`scripts/checkEmailjsSubmission.mjs` drives the real wizard against the built site with every EmailJS request intercepted and answered locally. Expected identifiers are read from `src/config/emailjs.ts`, so the assertions cannot drift from the real configuration. It covers both-sends success and field mapping, internal failure (HTTP 500/429 and network abort), partial failure with confirmation-only retry, empty optional answers, invalid-email validation, double-submission, the client timeout, and the analytics-isolation regression.

```bash
npm run build && npm run test:emailjs
```

Because the build now contains the real identifiers, the suite also installs a catch-all route: anything that is not the local static server is intercepted, fulfilled with an inert stub, or aborted, and each scenario asserts that no unexpected request left the page. A leaked request therefore cannot deliver mail — but the guarantee still comes from interception, never from the identifiers being fake.

The missing-configuration case uses the build switch described in section 3:

```bash
VITE_EMAILJS_FORCE_UNCONFIGURED=true npm run build
node scripts/checkEmailjsSubmission.mjs --unconfigured
```

GitHub Actions runs both modes automatically in the `mocked-emailjs-checks` job (see `.github/workflows/verify-production-build.yml`) on every push and pull request: it builds a throwaway copy, runs the suite, rebuilds with the fallback switch on, and runs the fallback checks. That job uploads no artifacts and is separate from the deployable build, so it can never replace what would be deployed. Configuration itself is guarded by `checkEmailjsConfig` (source and bundle) in `build-and-verify` and again in the deploy job.

### Manual mailbox verification (still required)

An EmailJS API success response means the request was accepted, not that any mailbox received the message. Before launch:

- Test with an email address you control and confirm the internal notification arrives at `business@angelcreations.in` and the three BCC recipients.
- Confirm the customer confirmation arrives at the submitted visitor email address.
- Check that the internal notification Reply-To targets the visitor, and customer confirmation Reply-To targets `business@angelcreations.in`.
- Check that the three Gmail addresses are not visible in the customer email.
- Verify all eight form answers, including blank optional answers, render correctly.
- Test a failed internal notification and confirm the visitor can still open the email draft or copy the brief.
- Test the partial-failure case: if the internal notification succeeds but the customer confirmation fails, the page offers **Resend confirmation email**, which retries only the confirmation. The internal notification is never sent twice for one prepared enquiry — including after editing an answer (edits after a successful send show a notice and leave the sent state locked; amendments go through the email-draft/copy actions).
- Confirm a hung or very slow connection gives up after ~20 seconds and restores the fallback instead of leaving "Sending…" on screen.
- In the EmailJS dashboard **History**, confirm a normal enquiry shows exactly two accepted sends (one per template), and that a confirmation-only retry adds one confirmation with **no second notification**.
- Restrict EmailJS allowed origins to the intended website domains and configure anti-abuse controls.

## Security and delivery notes

The form sends the internal notification first. Only if that succeeds does it send the customer confirmation, and the `generate_lead` analytics event (which carries no form answers or contact details) fires only after the internal send is accepted. If the first message fails, the user can still open the email draft or copy the enquiry. If the internal message succeeds but the confirmation fails, the page reports that partial outcome and offers a confirmation-only retry.

EmailJS uses a browser-visible public key; it is not a secret, and the service/template identifiers are visible in the built JavaScript. Protect the integration in the EmailJS dashboard instead: restrict allowed origins to `angelcreations.in` (plus `localhost` for development), disable API access for non-browser applications, and review rate limits — anyone can otherwise call the API directly and consume quota or trigger confirmation emails to arbitrary addresses. Remember each enquiry consumes **two** EmailJS requests, so the EmailJS plan's own monthly allowance (200 sends on the free plan) is exhausted after roughly **100 enquiries** — the provider behind the service does not raise that ceiling. A personal mailbox service also imposes its own daily limits and should not be the production sender; [DELIVERABILITY.md](./DELIVERABILITY.md) explains why and what to use instead.

This is a client-side integration, not a server-side lead database. Actual delivery must be verified in the receiving mailboxes. For durable CRM storage, server-side validation, guaranteed retries, or stronger rate limiting, add a backend/CRM endpoint later.

Merging this integration and deploying it to production each require separate, explicit approval; completing the checks above does not authorise either.
