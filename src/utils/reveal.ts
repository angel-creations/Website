/*
 * Scroll-triggered reveals for the sections Angel already ships.
 *
 * This is an enhancement layer only. It never changes markup, class names or layout: it sets a
 * single data attribute on existing section elements, and the stylesheet fades/rises them in.
 *
 * Safety rules
 * - Nothing is hidden until this module decides to hide it, so a failure in this file (or a
 *   browser without IntersectionObserver) leaves the original page exactly as it was.
 * - `prefers-reduced-motion: reduce` reveals everything immediately.
 * - Elements already inside the viewport when the scan runs are revealed at once, so a deep link
 *   never lands on an apparently empty section.
 * - If the observer never reports a single intersection, every pending element is revealed.
 */

// Only existing Angel components and their established sections are targeted.
const componentTargets = [
  '.angel-archive__intro',
  '.angel-archive__item',
  '.angel-capability__hero',
  '.angel-capability__section',
  '.angel-capability__visuals',
  '.angel-capability__cta',
  '.angel-experience__section',
  '.angel-experience__work-list > li',
  '.angel-experience__conversation',
  '.angel-explorer',
].join(', ');

// Captured WordPress pages render through the allowlisted renderer. Their top-level blocks are
// the natural reveal unit; tiny helper nodes are left alone so nothing small blinks.
const legacyBlockSelector = '#main > *';

const MIN_BLOCK_HEIGHT = 140;
const STAGGER_STEP_MS = 70;
const STAGGER_MAX_STEPS = 5;
const OBSERVER_FAILSAFE_MS = 2500;

function isRevealableBlock(element: HTMLElement): boolean {
  if (element.dataset.angelReveal !== undefined) return false;
  // The About template has its own source-faithful line-reveal; never compete with it.
  if (element.querySelector('.reveal-text, [data-about-revealed], [data-split-text]')) return false;
  if (element.closest('[data-about-page-reveal]')) return false;
  return element.getBoundingClientRect().height >= MIN_BLOCK_HEIGHT;
}

function collectTargets(root: HTMLElement): HTMLElement[] {
  // Component sections win over the generic block that wraps them, so a page reveals section by
  // section instead of fading in one large container.
  const components = Array.from(root.querySelectorAll<HTMLElement>(componentTargets))
    .filter((element) => element.dataset.angelReveal === undefined);

  const isInsideComponent = (element: HTMLElement): boolean =>
    components.some((component) => component !== element && component.contains(element));

  const legacyBlocks = Array.from(root.querySelectorAll<HTMLElement>(legacyBlockSelector))
    .filter((element) => element.dataset.angelReveal === undefined)
    .filter((element) => isRevealableBlock(element) && !isInsideComponent(element))
    .filter((element) => !components.some((component) => element.contains(component)));

  return [...components, ...legacyBlocks];
}

function revealAll(targets: HTMLElement[]): void {
  targets.forEach((element) => {
    element.dataset.angelReveal = 'in';
    element.style.transitionDelay = '';
  });
}

/**
 * Observes the existing sections inside `root` and returns a teardown function.
 * Teardown disconnects the observer and leaves any revealed element revealed.
 */
export function observeReveals(root: HTMLElement): () => void {
  const targets = collectTargets(root);
  if (targets.length === 0) return () => undefined;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealAll(targets);
    return () => undefined;
  }

  let reported = false;
  const observer = new IntersectionObserver(
    (entries) => {
      reported = true;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.dataset.angelReveal = 'in';
        const delay = element.dataset.angelRevealDelay;
        if (delay) window.setTimeout(() => { element.style.transitionDelay = ''; }, Number(delay) + 900);
        observer.unobserve(element);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
  );

  const groups = new Map<Element, number>();
  targets.forEach((element) => {
    const parent = element.parentElement;
    const position = parent ? groups.get(parent) ?? 0 : 0;
    if (parent) groups.set(parent, position + 1);
    const delay = Math.min(position, STAGGER_MAX_STEPS) * STAGGER_STEP_MS;
    element.dataset.angelReveal = 'pending';
    if (delay > 0) {
      element.dataset.angelRevealDelay = String(delay);
      element.style.transitionDelay = `${delay}ms`;
    }
    observer.observe(element);
  });

  // Fail-open: if the observer never fires (background tab, print, unusual browsing context),
  // the visitor still gets the complete original page content.
  const failsafe = window.setTimeout(() => { if (!reported) { observer.disconnect(); revealAll(targets); } }, OBSERVER_FAILSAFE_MS);

  return () => {
    window.clearTimeout(failsafe);
    observer.disconnect();
  };
}
