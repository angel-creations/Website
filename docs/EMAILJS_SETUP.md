# EmailJS contact form setup

The existing eight-question contact wizard sends two emails after the visitor presses **Send enquiry**: an internal enquiry notification first, followed by a personalised confirmation to the visitor. The approved visual design and the mailto/copy fallbacks remain available. No email credentials or real configuration values should be committed to Git.

Configured EmailJS identifiers (these ship in the client bundle once deployed; the public key value itself is deliberately not recorded here — it belongs only in `.env.local` and the build environment):

- **Service ID:** `service_85q82kl`
- **Internal notification template ID:** `template_m0s0taz`
- **Customer confirmation template ID:** `template_xoqfbrj`

## 1. Configure the internal notification template

In EmailJS, use the internal notification template ID supplied in the deployment environment.

- **To Email:** `business@angelcreations.in`
- **BCC:** Add the three private Gmail inboxes in the EmailJS template's BCC field, if supported. Keep them out of To/CC so the recipient list is not exposed. **This is the only template that may carry BCC recipients — the customer confirmation template must have none.**
- **From Name:** `Angel Creations Website`
- **From Email:** Leave the verified sender associated with the connected Microsoft 365 service.
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
- **From Email:** Leave the verified sender associated with the connected Microsoft 365 service.
- **Reply-To:** `business@angelcreations.in`
- **Subject:** `{{name}}, your project enquiry with Angel Creations`

Include the same eight form fields in the email body and the public company contact details: `business@angelcreations.in`, `support@angelcreations.in`, `+91 80584 65733`, and `https://angelcreations.in`. Do not put the private Gmail recipients in the customer-facing template or its To/CC/BCC fields.

The confirmation send receives **only** the visitor's eight answers (plus the aliases above). Campaign attribution, click IDs (`gclid`/`fbclid`/`msclkid`), referrer/landing-page data, and the composed internal `message` are sent to the internal notification only, so they cannot leak into the customer email even if the template references a variable the code never sends it.

## 3. Configure local development

Copy `.env.example` to `.env.local` and replace the placeholders with:

- `VITE_EMAILJS_SERVICE_ID`: EmailJS service ID
- `VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID`: internal notification template ID
- `VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID`: customer confirmation template ID
- `VITE_EMAILJS_PUBLIC_KEY`: EmailJS public key

Do not commit `.env.local` or private API keys. The public key is intended for browser use, but should still be configured only for the intended site.

## 4. Configure production builds

Vite embeds `VITE_*` values at build time. This site is built in GitHub Actions and the static output is deployed to Hostinger, so **Hostinger needs no configuration** — setting variables there has no effect. Instead:

1. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add all four variables (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID`, `VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`). They are embedded in the public client bundle by design, so repository *variables* are appropriate; never put a private EmailJS API key in any `VITE_*` value.
2. `.github/workflows/verify-production-build.yml` passes these variables to **both** build steps (the verify job and the deploy job, which rebuilds from source). Both must have them, or the deployed bundle will differ from the verified one.
3. Rebuild and deploy. Changing any value requires a new build; editing variables alone does not update already-built files.

**Merge gate:** set the Actions variables *before* merging the EmailJS feature to `main`. A build without them ships the form in its safe fallback mode (direct sending reports itself unavailable and the visitor uses the email draft), which must not be mistaken for a working launch.

## 5. Verify before launch

### Automated checks (mocked — no real email is ever sent)

`scripts/checkEmailjsSubmission.mjs` drives the real wizard against the built site with every EmailJS request intercepted and answered locally. It covers both-sends success and field mapping, internal failure (HTTP 500/429 and network abort), partial failure with confirmation-only retry, empty optional answers, invalid-email validation, double-submission, and the client timeout. Build with the fake identifiers shown in the script header, then run:

```bash
npm run test:emailjs
```

For the missing-configuration case, build without the variables and run:

```bash
node scripts/checkEmailjsSubmission.mjs --unconfigured
```

GitHub Actions runs both modes automatically in the `mocked-emailjs-checks` job (see `.github/workflows/verify-production-build.yml`) on every push and pull request: it builds a throwaway copy of the site with hard-coded fake identifiers, runs the suite, then rebuilds without configuration and runs the fallback checks. That job uploads no artifacts and is separate from the deployable build, so its test build can never replace what would be deployed, and no real email can be sent. It also covers the analytics-isolation regression: a deliberately throwing analytics layer must not turn an accepted enquiry into an error message, must not skip the customer confirmation, and must never produce a second internal notification.

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

EmailJS uses a browser-visible public key; it is not a secret, and the service/template identifiers are visible in the built JavaScript. Protect the integration in the EmailJS dashboard instead: restrict allowed origins to `angelcreations.in` (plus `localhost` for development), disable API access for non-browser applications, and review rate limits — anyone can otherwise call the API directly and consume quota or trigger confirmation emails to arbitrary addresses. Remember each enquiry consumes **two** EmailJS requests and two sends from the connected Microsoft 365 mailbox, and personal mailbox services impose their own daily sending limits.

This is a client-side integration, not a server-side lead database. Actual delivery must be verified in the receiving mailboxes. For durable CRM storage, server-side validation, guaranteed retries, or stronger rate limiting, add a backend/CRM endpoint later.

Merging this integration and deploying it to production each require separate, explicit approval; completing the checks above does not authorise either.
