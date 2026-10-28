# EmailJS contact form setup

The existing eight-question contact wizard sends two emails after the visitor presses **Send enquiry**: an internal enquiry notification first, followed by a personalised confirmation to the visitor. The approved visual design and the mailto/copy fallbacks remain available. No email credentials or real configuration values should be committed to Git.

## 1. Configure the internal notification template

In EmailJS, use the internal notification template ID supplied in the deployment environment.

- **To Email:** `business@angelcreations.in`
- **BCC:** Add the three private Gmail inboxes in the EmailJS template's BCC field, if supported. Keep them out of To/CC so the recipient list is not exposed.
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

## 2. Configure the customer confirmation template

Use a separate EmailJS template for the visitor's confirmation:

- **To Email:** `{{email}}`
- **From Name:** `Angel Creations`
- **From Email:** Leave the verified sender associated with the connected Microsoft 365 service.
- **Reply-To:** `business@angelcreations.in`
- **Subject:** `{{name}}, your project enquiry with Angel Creations`

Include the same eight form fields in the email body and the public company contact details: `business@angelcreations.in`, `support@angelcreations.in`, `+91 80584 65733`, and `https://angelcreations.in`. Do not put the private Gmail recipients in the customer-facing template or its To/CC/BCC fields.

## 3. Configure local development

Copy `.env.example` to `.env.local` and replace the placeholders with:

- `VITE_EMAILJS_SERVICE_ID`: EmailJS service ID
- `VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID`: internal notification template ID
- `VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID`: customer confirmation template ID
- `VITE_EMAILJS_PUBLIC_KEY`: EmailJS public key

Do not commit `.env.local` or private API keys. The public key is intended for browser use, but should still be configured only for the intended site.

## 4. Configure production builds

Vite embeds `VITE_*` values at build time. Set all four variables in the production build environment used by the deployment workflow, then rebuild and deploy. Setting variables only in the browser or after static files have been built will not configure the form.

## 5. Verify before launch

- Test with an email address you control and confirm the internal notification arrives at `business@angelcreations.in` and the three BCC recipients.
- Confirm the customer confirmation arrives at the submitted visitor email address.
- Check that the internal notification Reply-To targets the visitor, and customer confirmation Reply-To targets `business@angelcreations.in`.
- Check that the three Gmail addresses are not visible in the customer email.
- Verify all eight form answers, including blank optional answers, render correctly.
- Test a failed internal notification and confirm the visitor can still open the email draft or copy the brief.
- Test the partial-failure case: if the internal notification succeeds but the customer confirmation fails, the UI must not encourage a resubmission that would duplicate the enquiry.
- Restrict EmailJS allowed origins to the intended website domains and configure anti-abuse controls.

## Security and delivery notes

The form sends the internal notification first. Only if that succeeds does it send the customer confirmation. If the first message fails, the user can still open the email draft or copy the enquiry. If the internal message succeeds but the confirmation fails, the page reports that partial outcome without inviting a duplicate internal submission.

EmailJS uses a browser-visible public key; it is not a secret. This is a client-side integration, not a server-side lead database. EmailJS service/template configuration and abuse controls are important, and actual delivery must be verified in the receiving mailboxes. For durable CRM storage, server-side validation, guaranteed retries, or stronger rate limiting, add a backend/CRM endpoint later.
