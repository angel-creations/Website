// Verifies the measurement layer end to end, in a real browser, against the
// built site in dist/.
//
// What this proves
// ----------------
// The site reports two things that matter more than any other number: how many
// visitors start an enquiry, and how many finish it. If either event is
// silently missing, every SEO and content decision afterwards is guesswork. So
// this check drives the real pages and asserts on the real `window.dataLayer`,
// the same array the direct GA4 tag receives events through.
//
// Covered:
//   1. form_start fires on the first keystroke, not on render.
//   2. form_start fires exactly once per form per page load.
//   3. contact_step_complete fires once per advance, with a 1-based step
//      number and the step's stable id — never the visitor's answer.
//   4. generate_lead carries form_name, discipline, entry_intent, landing_page
//      and the UTM source, and carries no email address or phone number.
//   5. The internship form reports its own funnel separately.
//   6. outbound_click fires for a social profile link with destination_host and
//      link_kind, and does not fire for internal links.
//   7. A throwing dataLayer does not break the page or the funnel.
//
// Run: npm run build && node scripts/checkAnalytics.mjs

import { chromium } from 'playwright';
import { startStaticServer } from './static-site-server.mjs';
import { resolveBrowser } from './playwright-browser.mjs';

// Port 0 lets the OS pick a free port: this check must never collide with a
// smoke run that is already holding 4173.
const server = await startStaticServer({ root: 'dist', port: 0 });
const browserInfo = await resolveBrowser();
const failures = [];
let passes = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passes += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

const launchOptions = { ...browserInfo };
delete launchOptions.args;
const browser = await chromium.launch({ ...launchOptions, args: browserInfo.args ?? [] });

// Analytics hosts are answered with inert stubs: GTM and the GA4 tag must never
// make this check leave the machine. Anything else off-site is aborted.
async function newPage() {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(server.url) || url.startsWith('data:') || url.startsWith('blob:')) {
      return route.continue();
    }
    if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* blocked */' });
    }
    return route.abort('blockedbyclient');
  });
  return { context, page };
}

/** Every event name pushed to dataLayer, in order. */
async function events(page) {
  return page.evaluate(() => (window.dataLayer ?? [])
    .filter((entry) => entry && typeof entry === 'object' && entry.event)
    .map((entry) => entry.event));
}

/** The last dataLayer entry with a given event name. */
async function lastEvent(page, name) {
  return page.evaluate((eventName) => {
    const matching = (window.dataLayer ?? []).filter((entry) => entry && entry.event === eventName);
    return matching[matching.length - 1] ?? null;
  }, name);
}

const countEvents = (list, name) => list.filter((event) => event === name).length;

/* -------------------------------------------------------------------------- */
/* 1–4: contact wizard funnel                                                  */
/* -------------------------------------------------------------------------- */

console.log('\n[1] Contact wizard: form_start, steps, generate_lead');
{
  const { context, page } = await newPage();
  // The EmailJS endpoint is stubbed so the enquiry is "accepted" without mail.
  await page.route('**://api.emailjs.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/plain',
    body: 'OK',
  }));

  const query = new URLSearchParams({
    discipline: 'Virtual Reality (VR)',
    intent: 'project-roadmap',
    source: '/virtual-reality/',
  });
  await page.goto(`${server.url}/contact/?${query.toString()}`, { waitUntil: 'domcontentloaded' });

  // The wizard is a lazy route: wait for the first question before reading.
  await page.getByPlaceholder('Enter your full name…').waitFor({ state: 'visible', timeout: 20000 });

  const afterLoad = await events(page);
  check('no form_start before the visitor types', countEvents(afterLoad, 'form_start') === 0,
    `saw ${JSON.stringify(afterLoad)}`);

  await page.getByPlaceholder('Enter your full name…').fill('Asha Verma');
  const afterFirstKey = await events(page);
  check('form_start fires on the first keystroke', countEvents(afterFirstKey, 'form_start') === 1,
    `saw ${JSON.stringify(afterFirstKey)}`);
  const formStart = await lastEvent(page, 'form_start');
  check('form_start names the form', formStart?.form_name === 'contact_enquiry', JSON.stringify(formStart));
  check('form_start carries the source route', formStart?.source_route === '/contact/', JSON.stringify(formStart));

  // Retype: still one start.
  await page.getByPlaceholder('Enter your full name…').fill('Asha Ver');
  await page.getByPlaceholder('Enter your full name…').fill('Asha Verma');
  check('form_start fires only once per form', countEvents(await events(page), 'form_start') === 1);

  const next = () => page.locator('button.next-btn').first().click();
  await next(); // step 1 → 2
  await page.getByPlaceholder('Your company, brand, or independent studio…').fill('Verma Retail Group');
  await next(); // step 2 → 3
  await page.getByPlaceholder('name@company.com').fill('asha.verma@example.com');
  await next(); // step 3 → 4

  const stepEvent = await lastEvent(page, 'contact_step_complete');
  check('contact_step_complete fired', Boolean(stepEvent), JSON.stringify(stepEvent));
  check('step numbering is 1-based for the step just completed', stepEvent?.step_number === 3,
    `got ${stepEvent?.step_number}`);
  check('step id is a stable field id, not an answer', stepEvent?.step_id === 'email', `got ${stepEvent?.step_id}`);
  check('step event carries no visitor email', !JSON.stringify(stepEvent).includes('asha.verma'),
    JSON.stringify(stepEvent));
  check('step event classifies funnel depth', ['early', 'core', 'deep', 'complete'].includes(stepEvent?.depth),
    `got ${stepEvent?.depth}`);

  await page.getByPlaceholder('+91 98765 43210').fill('+91 98290 00000');
  await next(); // 4 → 5 (discipline prefilled)
  await page.locator('.ac-custom-select, #contact-field-projectType').first().waitFor({ state: 'visible' });
  await next(); // 5 → 6
  await page
    .getByPlaceholder('Describe the experience, story, audience, or creative challenge…')
    .fill('A VR safety-training experience for warehouse teams on standalone headsets.');
  await next(); // 6 → 7
  await page.getByPlaceholder('Select a timeframe below or type your target launch date…').fill('Within 3 – 6 Months');
  await next(); // 7 → 8
  await page.getByPlaceholder('Select a bracket below or type your estimated budget…').fill('$15k – $50k / ₹12L – ₹40L');
  await next(); // 8 → prepared

  const steps = (await events(page)).filter((event) => event === 'contact_step_complete');
  check('all eight steps reported', steps.length === 8, `got ${steps.length}`);
  check('the last step is classed complete', (await lastEvent(page, 'contact_step_complete'))?.depth === 'complete');

  await page.locator('button.contact-prepared__send').click();
  await page.waitForFunction(
    () => (window.dataLayer ?? []).some((entry) => entry?.event === 'generate_lead'),
    { timeout: 20000 },
  );

  const lead = await lastEvent(page, 'generate_lead');
  check('generate_lead fired', Boolean(lead));
  check('generate_lead names the form', lead?.form_name === 'contact_enquiry', JSON.stringify(lead));
  check('generate_lead carries the discipline', lead?.discipline === 'Virtual Reality (VR)', JSON.stringify(lead));
  check('generate_lead carries the entry intent', lead?.entry_intent === 'project-roadmap', JSON.stringify(lead));
  check('generate_lead carries the source route', lead?.source_route === '/virtual-reality/', JSON.stringify(lead));
  check('generate_lead carries the landing page for attribution',
    typeof lead?.landing_page === 'string' && lead.landing_page.startsWith('/'),
    JSON.stringify(lead?.landing_page));
  check('generate_lead carries a preset investment band', lead?.investment_band === '$15k – $50k / ₹12L – ₹40L',
    JSON.stringify(lead?.investment_band));
  check('generate_lead carries a preset timeline', lead?.timeline === 'Within 3 – 6 Months',
    JSON.stringify(lead?.timeline));

  const serialisedLead = JSON.stringify(lead);
  check('generate_lead carries no visitor email', !serialisedLead.includes('asha.verma'), serialisedLead);
  check('generate_lead carries no visitor phone', !serialisedLead.includes('98290'), serialisedLead);
  check('generate_lead carries no visitor name', !serialisedLead.includes('Asha'), serialisedLead);
  check('generate_lead carries no project brief', !serialisedLead.includes('warehouse'), serialisedLead);

  await context.close();
}

/* -------------------------------------------------------------------------- */
/* 5: internship funnel                                                        */
/* -------------------------------------------------------------------------- */

console.log('\n[2] Internship: its own funnel, reported separately');
{
  const { context, page } = await newPage();
  await page.route('**://api.emailjs.com/**', (route) => route.fulfill({
    status: 200, contentType: 'text/plain', body: 'OK',
  }));
  await page.goto(`${server.url}/internship/`, { waitUntil: 'domcontentloaded' });
  await page.locator('#apply').waitFor({ state: 'visible', timeout: 20000 });

  check('internship reports no form_start before interaction',
    countEvents(await events(page), 'form_start') === 0);

  const fullName = page.locator('input[name="fullName"]');
  await fullName.waitFor({ state: 'visible', timeout: 15000 });
  await fullName.fill('Asha Verma');

  const starts = (await events(page)).filter((event) => event === 'form_start');
  check('internship form_start fires once', starts.length === 1, `got ${starts.length}`);
  const start = await lastEvent(page, 'form_start');
  check('internship form_start is named distinctly', start?.form_name === 'internship_application',
    JSON.stringify(start));
  check('internship is not counted as an enquiry start', start?.form_name !== 'contact_enquiry');

  await context.close();
}

/* -------------------------------------------------------------------------- */
/* 6: outbound clicks                                                         */
/* -------------------------------------------------------------------------- */

console.log('\n[3] Outbound and social clicks');
{
  const { context, page } = await newPage();
  await page.goto(`${server.url}/about/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const before = await events(page);
  check('no outbound_click on load', countEvents(before, 'outbound_click') === 0);

  // The delegated handler lives on the site container, so probes are mounted
  // there — the same place every real link in the page sits.
  const mountProbe = (id, href, target = '') => page.evaluate(({ id, href, target }) => {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = id;
    anchor.id = id;
    if (target) {
      anchor.target = target;
      anchor.rel = 'noopener noreferrer';
    }
    document.querySelector('.archived-content').appendChild(anchor);
  }, { id, href, target });

  // An internal navigation must not be reported as outbound.
  await mountProbe('probe-internal', '/works/');
  await page.locator('#probe-internal').click();
  await page.waitForTimeout(400);
  check('internal link is not reported as outbound', countEvents(await events(page), 'outbound_click') === 0);

  // A social profile with target=_blank must be reported, and must not navigate
  // the page under test.
  await page.goto(`${server.url}/about/`, { waitUntil: 'domcontentloaded' });
  await mountProbe('probe-social', 'https://www.instagram.com/angelcreations.digital/', '_blank');
  await page.locator('#probe-social').click();
  await page.waitForTimeout(400);

  const outbound = await lastEvent(page, 'outbound_click');
  check('outbound_click fired for a social profile', Boolean(outbound), JSON.stringify(outbound));
  check('outbound_click reports the destination host', outbound?.destination_host === 'instagram.com',
    JSON.stringify(outbound?.destination_host));
  check('outbound_click classifies social separately', outbound?.link_kind === 'social',
    JSON.stringify(outbound?.link_kind));
  check('outbound_click reports where the click came from', outbound?.source_route === '/about/',
    JSON.stringify(outbound?.source_route));

  await context.close();
}

/* -------------------------------------------------------------------------- */
/* 7: a broken analytics layer must not break the site                        */
/* -------------------------------------------------------------------------- */

console.log('\n[4] A throwing dataLayer must not break the page');
{
  const { context, page } = await newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const dataLayer = (window.dataLayer = window.dataLayer || []);
    const originalPush = dataLayer.push.bind(dataLayer);
    const names = new Set();
    dataLayer.push = (...entries) => {
      for (const entry of entries) {
        if (entry && entry.event) names.add(entry.event);
        if (entry && entry.event === 'form_start') throw new Error('analytics exploded');
      }
      return originalPush(...entries);
    };
    window.__analyticsNames = names;
  });

  await page.goto(`${server.url}/contact/`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Enter your full name…').waitFor({ state: 'visible', timeout: 20000 });
  await page.getByPlaceholder('Enter your full name…').fill('Asha Verma');
  await page.locator('button.next-btn').first().click();

  // The wizard must keep working: the next question is on screen.
  const advanced = await page
    .getByPlaceholder('Your company, brand, or independent studio…')
    .isVisible()
    .catch(() => false);
  check('wizard still advances when the analytics layer throws', advanced);
  check('no unhandled page error from the analytics failure',
    pageErrors.every((message) => !message.includes('analytics exploded')), pageErrors.join(' | '));

  await context.close();
}

await browser.close();
await server.close();

console.log(`\n${passes} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('\nFailed checks:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('Analytics funnel checks passed.');
