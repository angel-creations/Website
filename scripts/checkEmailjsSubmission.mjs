// Proves the EmailJS contact-wizard submission sequence without sending mail.
//
// Every request to api.emailjs.com is intercepted by Playwright and answered
// locally, so this check can never deliver a real email. It drives the real
// eight-question wizard in the built site (dist/) and covers:
//
//   1. Internal notification + customer confirmation both succeed, in order,
//      with the eight answers mapped to the template variables, attribution
//      present in the internal send only, and a PII-free generate_lead event.
//   2. Internal notification failure (HTTP 500, HTTP 429, network abort):
//      no false success, no analytics conversion, mailto/copy fallback alive,
//      submit button restored.
//   3. Partial failure (internal accepted, confirmation failed): the retry
//      sends only the confirmation — even after editing an answer — so the
//      studio notification is never duplicated.
//   4. Empty optional answers stay empty strings (never "undefined").
//   5. Invalid email is stopped by wizard validation before any request.
//   6. Rapid repeated submission attempts produce one internal notification.
//   7. A hung EmailJS request is abandoned by the client timeout and falls
//      back instead of leaving "Sending…" forever.
//
// The site under test must be built with these fake test identifiers (they
// only exist so the form takes the direct-send path; intercepted requests
// never leave the machine):
//
//   VITE_EMAILJS_SERVICE_ID=test-service \
//   VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID=test-notification-template \
//   VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=test-confirmation-template \
//   VITE_EMAILJS_PUBLIC_KEY=test-public-key \
//   npm run build
//   node scripts/checkEmailjsSubmission.mjs
//
// Missing-configuration case: build without the variables, then run:
//   node scripts/checkEmailjsSubmission.mjs --unconfigured

import { chromium } from 'playwright';
import { startStaticServer } from './static-site-server.mjs';
import { resolveBrowser } from './playwright-browser.mjs';

const UNCONFIGURED = process.argv.includes('--unconfigured');
const SERVICE_ID = 'test-service';
const NOTIFICATION_TEMPLATE = 'test-notification-template';
const CONFIRMATION_TEMPLATE = 'test-confirmation-template';
const VISITOR_EMAIL = 'asha.verma@example.com';

const server = await startStaticServer({ root: 'dist', port: Number(process.env.PORT ?? 4312) });
const browserOptions = await resolveBrowser();
const browser = await chromium.launch({ headless: true, ...browserOptions });

const failures = [];
let passes = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passes += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(detail ? `${label} — ${detail}` : label);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Creates a page whose EmailJS traffic is fully intercepted. `plan(call)`
// decides each response: { status } to fulfill, { abort: true } for a
// network failure, { delayMs } to respond slowly. The interceptor never
// calls route.continue(), so no request can reach the real EmailJS API.
async function newWizardPage(plan) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const calls = [];
  const pageErrors = [];
  let emailjsRequestsSeen = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes('api.emailjs.com')) emailjsRequestsSeen += 1;
  });
  await page.route('**://api.emailjs.com/**', async (route) => {
    let body = {};
    try {
      body = route.request().postDataJSON() ?? {};
    } catch {
      body = {};
    }
    const call = {
      service_id: body.service_id,
      template_id: body.template_id,
      user_id: body.user_id,
      template_params: body.template_params ?? {},
    };
    calls.push(call);
    const decision = plan(call, calls.length) ?? { status: 200 };
    if (decision.delayMs) await delay(decision.delayMs);
    if (decision.abort) {
      await route.abort('failed');
    } else {
      await route.fulfill({
        status: decision.status ?? 200,
        contentType: 'text/plain',
        body: decision.status && decision.status >= 400 ? 'Mock EmailJS failure' : 'OK',
      });
    }
  });
  return { context, page, calls, pageErrors, emailjsRequestsSeen: () => emailjsRequestsSeen };
}

async function clickNext(page) {
  await page.locator('button.next-btn').first().click();
}

async function fillStep(page, placeholder, value) {
  const control = page.getByPlaceholder(placeholder);
  await control.waitFor({ state: 'visible', timeout: 15000 });
  if (value !== null) await control.fill(value);
  await clickNext(page);
}

// Drives the real wizard to the prepared screen. The discipline is prefilled
// through the same ?discipline= parameter the site's own CTAs use.
async function completeWizard(page, { withOptionals = true } = {}) {
  const query = new URLSearchParams({
    discipline: 'Virtual Reality (VR)',
    intent: 'project-roadmap',
    source: '/virtual-reality/',
    topic: 'VR Training',
    goal: 'Safer warehouse onboarding',
    utm_source: 'test-source',
    utm_medium: 'test-medium',
    utm_campaign: 'test-campaign',
    gclid: 'test-click-id',
  });
  await page.goto(`${server.url}/contact/?${query.toString()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await fillStep(page, 'Enter your full name…', 'Asha Verma');
  await fillStep(page, 'Your company, brand, or independent studio…', withOptionals ? 'Verma Retail Group' : null);
  await fillStep(page, 'name@company.com', VISITOR_EMAIL);
  await fillStep(page, '+91 98765 43210', withOptionals ? '+91 98290 00000' : null);
  // Discipline arrives prefilled, so the step is already valid.
  await page.locator('.ac-custom-select, #contact-field-projectType').first().waitFor({ state: 'visible', timeout: 15000 });
  await clickNext(page);
  await fillStep(
    page,
    'Describe the experience, story, audience, or creative challenge…',
    'We want a VR safety-training experience for warehouse teams on standalone headsets.'
  );
  await fillStep(page, 'Select a timeframe below or type your target launch date…', withOptionals ? 'Within 3 – 6 Months' : null);
  await fillStep(page, 'Select a bracket below or type your estimated budget…', withOptionals ? '$15k – $50k / ₹12L – ₹40L' : null);
  await page.getByText('Your project brief is ready.').waitFor({ state: 'visible', timeout: 15000 });
}

async function waitForStatus(page, fragment, timeout = 15000) {
  await page.locator('.contact-send-status', { hasText: fragment }).waitFor({ state: 'visible', timeout });
}

async function dataLayerEvents(page) {
  return page.evaluate(() => JSON.stringify(window.dataLayer ?? []));
}

function assertNoLeaks(label, session) {
  check(`${label}: every EmailJS request was intercepted (none reached the network)`,
    session.emailjsRequestsSeen() === session.calls.length,
    `saw ${session.emailjsRequestsSeen()} requests, intercepted ${session.calls.length}`);
  check(`${label}: no unhandled page errors`, session.pageErrors.length === 0, session.pageErrors.join(' | '));
}

async function scenarioBothSucceed() {
  console.log('\n[1] Both emails succeed');
  const session = await newWizardPage(() => ({ status: 200 }));
  const { page, calls } = session;
  await completeWizard(page);
  await page.locator('button.contact-prepared__send').click();
  await waitForStatus(page, 'confirmation email has been sent');

  check('exactly two EmailJS calls', calls.length === 2, `got ${calls.length}`);
  const [notification, confirmation] = calls;
  check('internal notification sent first', notification?.template_id === NOTIFICATION_TEMPLATE);
  check('customer confirmation sent second', confirmation?.template_id === CONFIRMATION_TEMPLATE);
  check('test service/public key used', notification?.service_id === SERVICE_ID && notification?.user_id === 'test-public-key');

  const np = notification?.template_params ?? {};
  check('notification carries name', np.name === 'Asha Verma');
  check('notification carries company', np.company === 'Verma Retail Group');
  check('notification carries email', np.email === VISITOR_EMAIL);
  check('notification carries phone', np.phone === '+91 98290 00000');
  check('notification carries projectType', np.projectType === 'Virtual Reality (VR)');
  check('notification carries description', (np.description ?? '').includes('VR safety-training'));
  check('notification carries timeline', np.timeline === 'Within 3 – 6 Months');
  check('notification carries investment', np.investment === '$15k – $50k / ₹12L – ₹40L');
  check('notification to_email is the studio', np.to_email === 'business@angelcreations.in');
  check('notification reply_to is the visitor', np.reply_to === VISITOR_EMAIL);
  check('notification carries attribution (utm_source)', np.utm_source === 'test-source');
  check('notification carries attribution (gclid)', np.gclid === 'test-click-id');
  check('notification message includes answers', (np.message ?? '').includes('Asha Verma'));

  const cp = confirmation?.template_params ?? {};
  check('confirmation to_email is the visitor', cp.to_email === VISITOR_EMAIL);
  check('confirmation reply_to is the studio', cp.reply_to === 'business@angelcreations.in');
  check('confirmation carries the eight answers',
    cp.name === 'Asha Verma' && cp.email === VISITOR_EMAIL && cp.projectType === 'Virtual Reality (VR)'
    && (cp.description ?? '').includes('VR safety-training'));
  const forbidden = ['gclid', 'fbclid', 'msclkid', 'message', 'referrer', 'utm_source', 'utm_medium',
    'utm_campaign', 'utm_term', 'utm_content', 'first_landing_page', 'last_landing_page',
    'source_route', 'intent', 'topic', 'goal'];
  const leaked = forbidden.filter((key) => key in cp);
  check('confirmation contains no attribution/internal context', leaked.length === 0, `leaked: ${leaked.join(', ')}`);
  check('no payload renders "undefined"',
    !JSON.stringify(calls).includes('undefined') && Object.values(cp).every((v) => typeof v === 'string'));

  check('sent state replaces the send button',
    await page.locator('span.contact-prepared__send', { hasText: 'Enquiry sent' }).isVisible());
  const events = await dataLayerEvents(page);
  check('generate_lead fired after internal acceptance', events.includes('generate_lead'));
  check('analytics payload carries no visitor email', !events.includes(VISITOR_EMAIL));
  assertNoLeaks('both-succeed', session);
  await session.context.close();
}

async function scenarioInternalFails(label, decision) {
  console.log(`\n[2] Internal notification fails (${label})`);
  const session = await newWizardPage((call) => (call.template_id === NOTIFICATION_TEMPLATE ? decision : { status: 200 }));
  const { page, calls } = session;
  await completeWizard(page);
  const sendButton = page.locator('button.contact-prepared__send');
  await sendButton.click();
  await waitForStatus(page, 'could not send your enquiry just now');

  check('only the internal notification was attempted', calls.length === 1 && calls[0]?.template_id === NOTIFICATION_TEMPLATE, `got ${calls.length}`);
  check('send button restored and enabled', await sendButton.isVisible() && await sendButton.isEnabled());
  const mailto = page.locator('.contact-prepared__actions a[href^="mailto:business@angelcreations.in"]').first();
  const href = (await mailto.getAttribute('href')) ?? '';
  check('email-draft fallback present with answers', href.includes('mailto:business@angelcreations.in') && decodeURIComponent(href).includes('Asha Verma'));
  check('copy fallback present', await page.getByRole('button', { name: 'Copy enquiry text' }).isVisible());
  const events = await dataLayerEvents(page);
  check('no generate_lead on failure', !events.includes('generate_lead'));
  check('lead_submit_error tracked', events.includes('lead_submit_error'));
  assertNoLeaks(`internal-fails-${label}`, session);
  await session.context.close();
}

async function scenarioPartialFailure() {
  console.log('\n[3] Partial failure: confirmation fails, retry resends confirmation only');
  let confirmationAttempts = 0;
  const session = await newWizardPage((call) => {
    if (call.template_id === CONFIRMATION_TEMPLATE) {
      confirmationAttempts += 1;
      return { status: confirmationAttempts === 1 ? 500 : 200 };
    }
    return { status: 200 };
  });
  const { page, calls } = session;
  await completeWizard(page);
  await page.locator('button.contact-prepared__send').click();
  await waitForStatus(page, 'could not send the confirmation email');

  const notifications = () => calls.filter((c) => c.template_id === NOTIFICATION_TEMPLATE).length;
  const confirmations = () => calls.filter((c) => c.template_id === CONFIRMATION_TEMPLATE).length;
  check('one internal + one confirmation attempt', notifications() === 1 && confirmations() === 1);
  check('retry is labelled confirmation-only',
    await page.locator('button.contact-prepared__send', { hasText: 'Resend confirmation email' }).isVisible());

  // Edit an answer after the partial failure: this must not re-arm the full
  // enquiry send (the duplicate-notification path).
  await page.locator('.contact-prepared__row').first().click();
  const nameControl = page.getByPlaceholder('Enter your full name…');
  await nameControl.waitFor({ state: 'visible', timeout: 15000 });
  await nameControl.fill('Asha Verma Updated');
  for (let i = 0; i < 10; i += 1) {
    if (await page.getByText('Your project brief is ready.').isVisible().catch(() => false)) break;
    await clickNext(page);
    await page.waitForTimeout(250);
  }
  await page.getByText('Your project brief is ready.').waitFor({ state: 'visible', timeout: 15000 });
  check('after editing, action is still confirmation-only',
    await page.locator('button.contact-prepared__send', { hasText: 'Resend confirmation email' }).isVisible());

  await page.locator('button.contact-prepared__send').click();
  await waitForStatus(page, 'confirmation email has been sent');
  check('internal notification was never duplicated', notifications() === 1, `got ${notifications()}`);
  check('confirmation retried exactly once', confirmations() === 2, `got ${confirmations()}`);
  assertNoLeaks('partial-failure', session);
  await session.context.close();
}

async function scenarioEmptyOptionals() {
  console.log('\n[4] Empty optional answers');
  const session = await newWizardPage(() => ({ status: 200 }));
  const { page, calls } = session;
  await completeWizard(page, { withOptionals: false });
  await page.locator('button.contact-prepared__send').click();
  await waitForStatus(page, 'confirmation email has been sent');
  const np = calls[0]?.template_params ?? {};
  check('optional fields are empty strings',
    np.company === '' && np.phone === '' && np.timeline === '' && np.investment === '');
  check('internal message marks blanks as Not provided', (np.message ?? '').includes('Not provided'));
  check('no payload renders "undefined"', !JSON.stringify(calls).includes('undefined'));
  assertNoLeaks('empty-optionals', session);
  await session.context.close();
}

async function scenarioInvalidEmail() {
  console.log('\n[5] Invalid email is blocked by validation');
  const session = await newWizardPage(() => ({ status: 200 }));
  const { page, calls } = session;
  await page.goto(`${server.url}/contact/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await fillStep(page, 'Enter your full name…', 'Asha Verma');
  await fillStep(page, 'Your company, brand, or independent studio…', null);
  const emailControl = page.getByPlaceholder('name@company.com');
  await emailControl.waitFor({ state: 'visible', timeout: 15000 });
  await emailControl.fill('not-an-email');
  await clickNext(page);
  check('validation error shown', await page.getByText('Please enter a valid email address before continuing.').isVisible());
  check('wizard did not advance', await emailControl.isVisible());
  check('no EmailJS calls made', calls.length === 0);
  assertNoLeaks('invalid-email', session);
  await session.context.close();
}

async function scenarioDoubleSubmit() {
  console.log('\n[6] Rapid repeated submission attempts');
  const session = await newWizardPage(() => ({ status: 200, delayMs: 700 }));
  const { page, calls } = session;
  await completeWizard(page);
  const sendButton = page.locator('button.contact-prepared__send');
  await sendButton.click();
  check('button disabled while sending', await sendButton.isDisabled());
  // Programmatic re-clicks during the in-flight request must be ignored by
  // the disabled state and the in-flight guard alike.
  await page.evaluate(() => {
    const el = document.querySelector('button.contact-prepared__send');
    if (el instanceof HTMLElement) {
      el.click();
      el.click();
    }
  });
  await waitForStatus(page, 'confirmation email has been sent', 20000);
  const notifications = calls.filter((c) => c.template_id === NOTIFICATION_TEMPLATE).length;
  check('exactly one internal notification', notifications === 1, `got ${notifications}`);
  check('exactly two calls total', calls.length === 2, `got ${calls.length}`);
  assertNoLeaks('double-submit', session);
  await session.context.close();
}

async function scenarioHungRequest() {
  console.log('\n[7] Hung EmailJS request is abandoned by the client timeout');
  const session = await newWizardPage(() => ({ status: 200, delayMs: 30000 }));
  const { page, calls } = session;
  await completeWizard(page);
  const sendButton = page.locator('button.contact-prepared__send');
  await sendButton.click();
  // The wizard aborts after 20s; allow margin for the fallback render.
  await waitForStatus(page, 'could not send your enquiry just now', 35000);
  check('fallback reached after timeout', true);
  check('send button restored after timeout', await sendButton.isEnabled());
  check('only the hung internal attempt was made', calls.length === 1, `got ${calls.length}`);
  assertNoLeaks('hung-request', session);
  await session.context.close();
}

async function scenarioUnconfigured() {
  console.log('\n[8] Missing EmailJS configuration (unconfigured build)');
  const session = await newWizardPage(() => ({ status: 200 }));
  const { page, calls } = session;
  await completeWizard(page);
  await page.locator('button.contact-prepared__send').click();
  await waitForStatus(page, 'can’t send this form directly right now');
  check('no EmailJS calls attempted', calls.length === 0, `got ${calls.length}`);
  check('email-draft fallback present', await page.locator('.contact-prepared__actions a[href^="mailto:business@angelcreations.in"]').first().isVisible());
  check('copy fallback present', await page.getByRole('button', { name: 'Copy enquiry text' }).isVisible());
  assertNoLeaks('unconfigured', session);
  await session.context.close();
}

try {
  if (UNCONFIGURED) {
    await scenarioUnconfigured();
  } else {
    await scenarioBothSucceed();
    await scenarioInternalFails('HTTP 500', { status: 500 });
    await scenarioInternalFails('HTTP 429 rate limit', { status: 429 });
    await scenarioInternalFails('network abort', { abort: true });
    await scenarioPartialFailure();
    await scenarioEmptyOptionals();
    await scenarioInvalidEmail();
    await scenarioDoubleSubmit();
    await scenarioHungRequest();
  }
} finally {
  await browser.close();
  await server.close();
}

console.log(`\n${passes} checks passed, ${failures.length} failed.`);
if (failures.length) {
  console.error('EmailJS submission check failed:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
