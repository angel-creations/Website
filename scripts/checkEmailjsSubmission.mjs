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
//   9. A throwing analytics layer (dataLayer.push aborts) after the internal
//      notification is accepted: the enquiry is still reported as sent, the
//      customer confirmation is still attempted, no false error event is
//      recorded, and no retry is offered.
//  10. A throwing analytics layer combined with a failed confirmation: the
//      partial-success message appears, the retry sends the confirmation only
//      (the internal notification is never duplicated) and the conversion is
//      still counted exactly once.
//
// The identifiers live in src/config/emailjs.ts, so the expected values are
// read from that single source of truth instead of being passed in as
// environment variables. Requests are still fully intercepted: nothing is
// delivered, and no request can leave the machine (see the network guard).
//
//   npm run build
//   node scripts/checkEmailjsSubmission.mjs
//
// Missing-configuration case: rebuild with VITE_EMAILJS_FORCE_UNCONFIGURED=true
// (the build-time test switch, never set in a real build), then run:
//   node scripts/checkEmailjsSubmission.mjs --unconfigured

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { startStaticServer } from './static-site-server.mjs';
import { resolveBrowser } from './playwright-browser.mjs';

const UNCONFIGURED = process.argv.includes('--unconfigured');
const VISITOR_EMAIL = 'asha.verma@example.com';

// Expected identifiers, parsed from the configuration module that the site is
// built from. Kept in sync automatically, so a changed identifier cannot make
// the assertions silently pass against stale values.
function readConfiguredIdentifier(field) {
  const source = readFileSync('src/config/emailjs.ts', 'utf8');
  const match = source.match(new RegExp(`${field}\\s*:\\s*'([^']*)'`));
  if (!match) throw new Error(`src/config/emailjs.ts is missing ${field}`);
  return match[1];
}

const SERVICE_ID = readConfiguredIdentifier('serviceId');
const NOTIFICATION_TEMPLATE = readConfiguredIdentifier('notificationTemplateId');
const CONFIRMATION_TEMPLATE = readConfiguredIdentifier('confirmationTemplateId');
const PUBLIC_KEY = readConfiguredIdentifier('publicKey');

const server = await startStaticServer({ root: 'dist', port: Number(process.env.PORT ?? 4312) });
const browserOptions = await resolveBrowser();
const browser = await chromium.launch({ headless: true, ...browserOptions });

const failures = [];
let passes = 0;
// In GitHub Actions the job log is not always reachable, so every failed
// assertion is also emitted as a workflow error annotation: the check run then
// shows exactly which assertion failed and why.
const IN_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

function check(label, condition, detail = '') {
  if (condition) {
    passes += 1;
    console.log(`  ✓ ${label}`);
  } else {
    const message = detail ? `${label} — ${detail}` : label;
    failures.push(message);
    console.log(`  ✗ ${message}`);
    if (IN_ACTIONS) {
      console.log(`::error title=EmailJS check failed::${message.replace(/[\r\n]+/g, ' ')}`);
    }
  }
}

// Unhandled rejections and uncaught exceptions must fail the run instead of
// being printed as a stray stack trace with a zero exit code.
process.on('unhandledRejection', (error) => {
  const message = `unhandled rejection: ${error instanceof Error ? error.message : String(error)}`;
  failures.push(message);
  console.error(`  ✗ ${message}`);
  if (IN_ACTIONS) console.log(`::error title=EmailJS check failed::${message}`);
});
process.on('uncaughtException', (error) => {
  const message = `uncaught exception: ${error instanceof Error ? error.message : String(error)}`;
  failures.push(message);
  console.error(`  ✗ ${message}`);
  if (IN_ACTIONS) console.log(`::error title=EmailJS check failed::${message}`);
});

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
  // Any request to a host other than the local static server or the inert
  // analytics hosts. Must stay empty for every scenario.
  const externalRequests = [];
  let emailjsRequestsSeen = 0;
  const isLocalUrl = (url) =>
    url.startsWith(server.url) || url.startsWith('data:') || url.startsWith('blob:');
  // Hosts the suite handles itself and answers locally: the inert analytics
  // stub and the intercepted EmailJS API. Anything else is unexpected.
  const isHandledHost = (url) =>
    url.includes('googletagmanager.com')
    || url.includes('google-analytics.com')
    || url.includes('api.emailjs.com');
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('api.emailjs.com')) emailjsRequestsSeen += 1;
    if (!isLocalUrl(url) && !isHandledHost(url)) externalRequests.push(url);
  });
  // Safety net, registered first so it is evaluated last. The build under test
  // now contains the real EmailJS identifiers, so a request that slipped past
  // the specific routes below would reach the live API and could deliver mail.
  // Anything that is not the local static server is aborted (or fulfilled for
  // the analytics hosts, which need a dummy response to stay inert).
  await page.route('**/*', (route) => {
    const url = route.request().url();
    const isLocal = url.startsWith(server.url) || url.startsWith('data:') || url.startsWith('blob:');
    if (isLocal) return route.continue();
    if (url.includes('googletagmanager.com')) {
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* blocked in tests */' });
    }
    if (url.includes('google-analytics.com')) {
      return route.fulfill({ status: 204, contentType: 'text/plain', body: '' });
    }
    return route.abort('blockedbyclient');
  });
  // Third-party analytics never runs. A CI runner has real network access, so
  // an unblocked GTM would (a) send real beacons from a test page and (b)
  // install its own dataLayer traffic, which makes the analytics-sabotage
  // scenarios non-deterministic. The catch-all above answers those hosts with
  // an inert stub; the routes below take priority over it.
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
  return { context, page, calls, pageErrors, externalRequests, emailjsRequestsSeen: () => emailjsRequestsSeen };
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

// UI state is asserted after React has committed it. Polling (instead of a
// single instant read) keeps the checks correct on slower CI runners without
// weakening them: the condition still has to become true within the window.
async function waitUntil(probe, { timeout = 5000, interval = 100 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await probe()) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

function waitForVisible(locator, timeout = 5000) {
  return waitUntil(() => locator.isVisible().catch(() => false), { timeout });
}

// Breaks the analytics layer at the exact call the wizard makes: replacing
// dataLayer.push makes the next lead event throw, just as a broken tag
// manager, a consent script, or storage-blocked browser would. Every pushed
// event name is recorded so the checks can prove what was attempted.
async function breakAnalytics(page) {
  await page.evaluate(() => {
    const dataLayer = (window.dataLayer = window.dataLayer || []);
    const originalPush = dataLayer.push.bind(dataLayer);
    window.__analyticsAttempts = [];
    dataLayer.push = (...events) => {
      const names = events.map((event) => event && event.event);
      // Only the wizard's own lead events are sabotaged. Anything else (for
      // example a tag manager's internal pushes) behaves normally so the test
      // measures the product, not its own interference.
      if (names.some((name) => name === 'generate_lead' || name === 'lead_submit_error')) {
        window.__analyticsAttempts.push(...names);
        throw new Error('analytics exploded');
      }
      return originalPush(...events);
    };
  });
}

async function analyticsAttempts(page) {
  return page.evaluate(() => window.__analyticsAttempts ?? []);
}

function assertNoLeaks(label, session) {
  check(`${label}: every EmailJS request was intercepted (none reached the network)`,
    session.emailjsRequestsSeen() === session.calls.length,
    `saw ${session.emailjsRequestsSeen()} requests, intercepted ${session.calls.length}`);
  check(`${label}: no unhandled page errors`, session.pageErrors.length === 0, session.pageErrors.join(' | '));
  // Belt and braces now that real identifiers are compiled in: even if a route
  // were misconfigured, nothing may have left the machine.
  check(`${label}: no unexpected request left the page`,
    session.externalRequests.length === 0, `unexpected: ${session.externalRequests.join(', ')}`);
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
  check('configured service and public key used',
    notification?.service_id === SERVICE_ID && notification?.user_id === PUBLIC_KEY);

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
    await waitForVisible(page.locator('span.contact-prepared__send', { hasText: 'Enquiry sent' })));
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
    await waitForVisible(page.locator('button.contact-prepared__send', { hasText: 'Resend confirmation email' })));

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
    await waitForVisible(page.locator('button.contact-prepared__send', { hasText: 'Resend confirmation email' })));

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
  const session = await newWizardPage(() => ({ status: 200, delayMs: 1500 }));
  const { page, calls } = session;
  await completeWizard(page);
  const sendButton = page.locator('button.contact-prepared__send');
  await sendButton.click();
  check('button disabled while sending', await waitUntil(() => sendButton.isDisabled(), { timeout: 3000 }));
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

// Regression: a throwing analytics layer must not be able to report an
// accepted enquiry as failed, and must not skip the customer confirmation.
async function scenarioAnalyticsThrows() {
  console.log('\n[9] Analytics throws after the internal notification is accepted');
  const session = await newWizardPage(() => ({ status: 200 }));
  const { page, calls } = session;
  await completeWizard(page);
  await breakAnalytics(page);
  await page.locator('button.contact-prepared__send').click();
  // Reaching this status proves the delivery outcome survived the throw. The
  // wait is non-fatal so a regression is reported as failed checks rather
  // than aborting the rest of the scenario.
  let reportedSuccess = true;
  try {
    await waitForStatus(page, 'confirmation email has been sent');
  } catch {
    reportedSuccess = false;
  }

  const notifications = calls.filter((c) => c.template_id === NOTIFICATION_TEMPLATE).length;
  const confirmations = calls.filter((c) => c.template_id === CONFIRMATION_TEMPLATE).length;
  check('delivery reported as success, not failure', reportedSuccess, 'status never reported a complete send');
  check('customer confirmation still sent after the throw', confirmations === 1, `got ${confirmations}`);
  check('exactly one internal notification', notifications === 1, `got ${notifications}`);

  const statusText = (await page.locator('.contact-send-status').innerText()).toLowerCase();
  check('no false "could not send" message', !statusText.includes('could not send your enquiry'));
  check('no false partial-failure message', !statusText.includes('could not send the confirmation'));
  check('sent state replaces the send button',
    await waitForVisible(page.locator('span.contact-prepared__send', { hasText: 'Enquiry sent' })));
  check('no retry offered after a complete send',
    (await page.locator('button.contact-prepared__send').count()) === 0);
  check('email-draft fallback still available',
    await waitForVisible(page.locator('.contact-prepared__actions a[href^="mailto:business@angelcreations.in"]').first()));
  check('copy fallback still available', await page.getByRole('button', { name: 'Copy enquiry text' }).isVisible());

  const attempts = await analyticsAttempts(page);
  check('analytics sabotage was exercised (generate_lead threw)', attempts.filter((e) => e === 'generate_lead').length === 1,
    `attempts: ${JSON.stringify(attempts)}`);
  check('no error event recorded for a delivered enquiry', !attempts.includes('lead_submit_error'),
    `attempts: ${JSON.stringify(attempts)}`);
  assertNoLeaks('analytics-throws', session);
  await session.context.close();
}

// Regression: analytics throwing while the confirmation fails must still
// allow a confirmation-only retry, and that retry must never resend the
// internal notification or re-count the conversion.
async function scenarioAnalyticsThrowsWithPartialFailure() {
  console.log('\n[10] Analytics throws while the confirmation fails: retry stays confirmation-only');
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
  await breakAnalytics(page);
  await page.locator('button.contact-prepared__send').click();
  let reportedPartial = true;
  try {
    await waitForStatus(page, 'could not send the confirmation email');
  } catch {
    reportedPartial = false;
  }

  check('partial success reported despite the analytics throw', reportedPartial, 'partial-success copy never appeared');
  check('retry is labelled confirmation-only',
    await waitForVisible(page.locator('button.contact-prepared__send', { hasText: 'Resend confirmation email' })));

  await page.locator('button.contact-prepared__send').click();
  let retrySucceeded = true;
  try {
    await waitForStatus(page, 'confirmation email has been sent');
  } catch {
    retrySucceeded = false;
  }
  check('confirmation-only retry succeeds', retrySucceeded, 'retry never reported a completed confirmation');

  const notifications = calls.filter((c) => c.template_id === NOTIFICATION_TEMPLATE).length;
  const confirmations = calls.filter((c) => c.template_id === CONFIRMATION_TEMPLATE).length;
  check('retry sent exactly one more confirmation', confirmations === 2, `got ${confirmations}`);
  check('internal notification was never duplicated', notifications === 1, `got ${notifications}`);

  const attempts = await analyticsAttempts(page);
  check('conversion counted exactly once across the retry',
    attempts.filter((e) => e === 'generate_lead').length === 1, `attempts: ${JSON.stringify(attempts)}`);
  check('no error event recorded for a delivered enquiry', !attempts.includes('lead_submit_error'),
    `attempts: ${JSON.stringify(attempts)}`);
  assertNoLeaks('analytics-throws-partial', session);
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
    await scenarioAnalyticsThrows();
    await scenarioAnalyticsThrowsWithPartialFailure();
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
