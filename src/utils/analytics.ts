// Measurement core: one place that decides what leaves the browser.
//
// The site has two analytics destinations and they are not interchangeable:
//
//   window.dataLayer  read by Google Tag Manager (container GTM-MMFB2VZ)
//   window.gtag()     the direct GA4 Google tag for G-T4G74DNBP9
//
// The published GTM container currently holds no tags, so a dataLayer push on
// its own would leave an event stranded in the browser. Every event therefore
// goes to both: dataLayer keeps the container importable and inspectable, gtag
// is what actually reaches GA4 today.
//
// Rules this module enforces so that measurement can never damage the product:
//
//   1. It never throws. A blocked storage API, a consent script, or a broken
//      tag manager aborts the event, not the enquiry.
//   2. It never carries personal data. Names, emails, phone numbers, free-text
//      briefs and anything else identifying stay in the EmailJS payload. What
//      leaves is structural: which page, which step, which discipline.
//   3. Event names are snake_case GA4 recommended names (generate_lead,
//      form_start, page_view) so GA4 reports and audiences work without a
//      custom mapping layer.
//   4. camelCase payload keys are normalised to snake_case for GA4, so
//      `sourceRoute` arrives as `source_route` instead of creating two
//      unrelated dimensions.
//
// Anything that needs the raw DOM event keeps using trackLeadEvent() in
// ./leads, which wraps this module and additionally emits the
// `angel:lead-event` CustomEvent.

type TrackPayload = Record<string, string | number | boolean | undefined>;

type BrowserWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
};

/** Values GA4 accepts for a custom parameter: strings, numbers, booleans. */
const MAX_PARAM_LENGTH = 100;
const MAX_EVENT_NAME_LENGTH = 40;

const SNAKE_CASE = /([a-z0-9])([A-Z])/g;

export function toSnakeCase(key: string): string {
  return key.replace(SNAKE_CASE, '$1_$2').toLowerCase();
}

/**
 * Drop empty parameters, clamp long strings and normalise key casing.
 * GA4 truncates event names and parameters silently; doing it here means the
 * dataLayer and GA4 agree, which matters when a GTM tag is built later.
 */
function normalise(payload: TrackPayload): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === '') continue;
    clean[toSnakeCase(key)] = typeof value === 'string' ? value.slice(0, MAX_PARAM_LENGTH) : value;
  }
  return clean;
}

/**
 * Send one event to GTM and to GA4.
 *
 * `eventName` must be snake_case; it is passed through unchanged.
 */
export function trackEvent(eventName: string, payload: TrackPayload = {}): void {
  if (typeof window === 'undefined') return;
  const name = eventName.slice(0, MAX_EVENT_NAME_LENGTH);
  const params = normalise(payload);
  const browserWindow = window as BrowserWindow;

  // Two independent destinations, two independent try blocks: a tag manager
  // that throws must not stop the direct GA4 hit, and vice versa.
  try {
    browserWindow.dataLayer = browserWindow.dataLayer || [];
    browserWindow.dataLayer.push({ event: name, ...params });
  } catch {
    // A broken dataLayer is a measurement problem, never a site problem.
  }

  try {
    browserWindow.gtag?.('event', name, {
      page_path: `${window.location.pathname}${window.location.search}`,
      page_location: window.location.href,
      page_title: document.title,
      ...params,
    });
  } catch {
    // Same reasoning: never let telemetry break the page.
  }
}

/* -------------------------------------------------------------------------- */
/* Form funnels                                                               */
/* -------------------------------------------------------------------------- */

// A "form start" is the first real interaction with a form, not every render.
// These refs make each form report at most once per page load, so a visitor who
// types, deletes and retypes still counts as one start rather than five.
const startedForms = new Set<string>();

/**
 * Report that a visitor has begun filling in a form.
 *
 * Called from the first keystroke, dropdown open or step advance, never from a
 * mount effect: a form that scrolls into view has not been started, and
 * counting module loads as starts inflates the top of the funnel by an order of
 * magnitude. The ratio of form_start to generate_lead is the single most
 * useful number this site can report, so it has to mean something.
 */
export function trackFormStart(formName: string, payload: TrackPayload = {}): void {
  if (startedForms.has(formName)) return;
  startedForms.add(formName);
  trackEvent('form_start', { form_name: formName, ...payload });
}

/** Test-only reset: lets a scripted session drive two forms as two visitors. */
export function resetFormStartTracking(): void {
  startedForms.clear();
}
