# EmailJS contact form setup

The contact wizard sends the completed project brief to the Angel Creations business inbox through EmailJS's browser send API. The existing visual design and mailto/copy fallbacks remain available.

## 1. Create the EmailJS service and template

In the EmailJS dashboard:

1. Connect the mailbox that should receive enquiry notifications.
2. Create an email template and set **To Email** to `{{to_email}}` (the form supplies `business@angelcreations.in`).
3. Set **Reply-To** to `{{reply_to}}` so replying reaches the prospective client.
4. Use `{{subject}}` for the subject.
5. Add these variables to the template body as useful:
   - `{{from_name}}`, `{{from_email}}`, `{{company}}`, `{{phone}}`
   - `{{project_type}}`, `{{project_description}}`, `{{timeline}}`, `{{investment}}`
   - `{{intent}}`, `{{topic}}`, `{{goal}}`, `{{source_route}}`
   - `{{first_landing_page}}`, `{{last_landing_page}}`, `{{referrer}}`
   - `{{utm_source}}`, `{{utm_medium}}`, `{{utm_campaign}}`, `{{utm_term}}`, `{{utm_content}}`
   - `{{gclid}}`, `{{fbclid}}`, `{{msclkid}}`
   - `{{message}}` (a complete readable brief including all answers and attribution)

The form sends only when the visitor presses **Send enquiry**. A successful EmailJS response triggers the `generate_lead` analytics event; personal form values are not sent to analytics.

## 2. Configure local development

Copy `.env.example` to `.env.local` and replace the placeholders with the EmailJS **Service ID**, **Template ID**, and **Public Key**. Do not commit `.env.local`.

## 3. Configure production builds

Vite embeds `VITE_*` values at build time. Set all three variables in the production build environment used by the deployment workflow, then rebuild and deploy. Setting variables only in the browser or after the static files have been built will not configure the form.

## 4. Verify before launch

- Submit a test enquiry using an address you control.
- Confirm the message reaches `business@angelcreations.in`.
- Reply to the received email and verify it targets the submitted visitor email.
- Test optional answers and URL context parameters (`intent`, `source`, `topic`, `goal`).
- Test a failed request and confirm the visitor can still open the email draft or copy the brief.
- Restrict EmailJS allowed origins to the intended website domains and configure service rate limits / anti-abuse controls.

## Security note

EmailJS uses a browser-visible public key; it is not a secret. This is a client-side integration, not a server-side lead database. EmailJS service/template configuration and abuse controls are important, and successful delivery should be verified in the receiving mailbox. For durable CRM storage, server-side validation, guaranteed retries, or stronger rate limiting, add a backend/CRM endpoint later.
