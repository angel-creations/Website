import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../utils/mediaPreferences';

const REVEAL_SELECTOR = [
  'main article',
  'main [class*="card"]',
  'main [class*="panel"]',
  'main [class*="tile"]',
  'main [class*="highlight"]',
  'main [class*="section__head"]',
  'main [class*="section-head"]',
  'main .angel-capability__section',
  'main .angel-capability__visual',
  'main .angel-capability__cta',
  'main .ac-legal-v2-article',
  'main .ac-support-section .supcom',
  'main .apple-explorer-header',
  'footer [class*="card"]',
  'footer [class*="desk"]',
].join(', ');

const PARALLAX_SELECTOR = [
  '.angel-capability__visual',
  '.ac-about-v2-bento-card--visual',
  '.ac-about-v2-product-card__media',
  '.apple-sector-card__media',
  '.apple-Finale-card',
  '.angel-archive__media',
  '.angel-domain__hero-media',
  '.angel-domain-index__media',
].join(', ');

const EXCLUDED_SELECTOR = [
  '#slideshow',
  'header',
  'nav',
  'form',
  '[role="dialog"]',
  '.menu',
  '.apple-hero-visual-wrap',
  '.apple-visual-stage',
  '.apple-process-stage',
  '.angel-immersive-atmosphere',
].join(', ');

export function ImmersivePageEffects({ route }: { route: string }): JSX.Element {
  const atmosphereRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const page = document.getElementById('page');
    if (!page) return undefined;

    page.classList.remove('angel-route-arriving');
    void page.offsetWidth;
    page.classList.add('angel-route-arriving');

    const timer = window.setTimeout(() => {
      page.classList.remove('angel-route-arriving');
    }, 820);

    return () => {
      window.clearTimeout(timer);
      page.classList.remove('angel-route-arriving');
    };
  }, [route]);

  useEffect(() => {
    const atmosphere = atmosphereRef.current;
    const progress = progressRef.current;
    if (!atmosphere || !progress) return undefined;

    let frame = 0;
    let parallaxDirty = true;
    let pointerX = window.innerWidth * 0.72;
    let pointerY = window.innerHeight * 0.18;
    let pointerTarget: EventTarget | null = null;
    let activeTilt: HTMLElement | null = null;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = prefersReducedMotion();

    const resetTilt = (): void => {
      if (!activeTilt) return;
      activeTilt.style.removeProperty('--immersive-rotate-x');
      activeTilt.style.removeProperty('--immersive-rotate-y');
      activeTilt.style.removeProperty('--immersive-sheen-x');
      activeTilt.style.removeProperty('--immersive-sheen-y');
      activeTilt = null;
    };

    const update = (): void => {
      frame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progressValue = Math.min(1, Math.max(0, window.scrollY / scrollable));
      progress.style.transform = `scaleX(${progressValue.toFixed(4)})`;
      atmosphere.style.setProperty('--angel-scroll-progress', progressValue.toFixed(4));
      atmosphere.style.setProperty(
        '--angel-grid-y',
        `${(-window.scrollY * 0.045).toFixed(1)}px`
      );

      if (parallaxDirty && !reducedMotion) {
        parallaxDirty = false;
        document
          .querySelectorAll<HTMLElement>('[data-immersive-parallax="true"]')
          .forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
            const centreDelta =
              (rect.top + rect.height / 2 - window.innerHeight / 2) /
              Math.max(1, window.innerHeight / 2 + rect.height / 2);
            const shift = Math.max(-16, Math.min(16, centreDelta * -16));
            element.style.setProperty('--immersive-parallax-y', `${shift.toFixed(1)}px`);
          });
      }

      if (reducedMotion || !finePointer) return;

      atmosphere.style.setProperty('--angel-pointer-x', `${pointerX.toFixed(1)}px`);
      atmosphere.style.setProperty('--angel-pointer-y', `${pointerY.toFixed(1)}px`);

      const nextTilt =
        pointerTarget instanceof Element
          ? pointerTarget.closest<HTMLElement>('.angel-immersive-tilt')
          : null;

      if (nextTilt !== activeTilt) resetTilt();
      if (!nextTilt) return;

      activeTilt = nextTilt;
      const rect = nextTilt.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const relativeX = Math.min(1, Math.max(0, (pointerX - rect.left) / rect.width));
      const relativeY = Math.min(1, Math.max(0, (pointerY - rect.top) / rect.height));
      nextTilt.style.setProperty(
        '--immersive-rotate-x',
        `${((0.5 - relativeY) * 3.4).toFixed(2)}deg`
      );
      nextTilt.style.setProperty(
        '--immersive-rotate-y',
        `${((relativeX - 0.5) * 3.8).toFixed(2)}deg`
      );
      nextTilt.style.setProperty('--immersive-sheen-x', `${(relativeX * 100).toFixed(1)}%`);
      nextTilt.style.setProperty('--immersive-sheen-y', `${(relativeY * 100).toFixed(1)}%`);
    };

    const schedule = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const scheduleParallax = (): void => {
      parallaxDirty = true;
      schedule();
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (event.pointerType === 'touch') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerTarget = event.target;
      schedule();
    };

    const onPointerLeave = (): void => {
      pointerTarget = null;
      resetTilt();
    };

    scheduleParallax();
    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax);
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resetTilt();
      window.removeEventListener('scroll', scheduleParallax);
      window.removeEventListener('resize', scheduleParallax);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const root = document.getElementById('page');
    if (!root) return undefined;

    const seen = new WeakSet<Element>();
    const settleTimers = new Set<number>();
    let scanTimer = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add('is-immersive-visible');
          observer.unobserve(element);

          const timer = window.setTimeout(() => {
            settleTimers.delete(timer);
            element.classList.remove('angel-immersive-reveal', 'is-immersive-visible');
            element.classList.add('is-immersive-settled');
          }, 980);
          settleTimers.add(timer);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -7% 0px' }
    );

    const isUsable = (element: HTMLElement): boolean => {
      if (seen.has(element) || element.closest(EXCLUDED_SELECTOR)) return false;
      if (element.closest('[data-immersive-reveal="true"]')) return false;

      const rect = element.getBoundingClientRect();
      if (rect.width < 110 || rect.height < 38 || rect.height > 1500) return false;

      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' &&
        style.position !== 'fixed' && style.position !== 'sticky';
    };

    const scan = (): void => {
      root.querySelectorAll<HTMLElement>(PARALLAX_SELECTOR).forEach((element) => {
        if (element.closest(EXCLUDED_SELECTOR) || !element.querySelector('img')) return;
        element.dataset.immersiveParallax = 'true';
        element.classList.add('angel-immersive-parallax');
      });

      const candidates = root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
      let marked = 0;

      candidates.forEach((element) => {
        if (marked >= 170 || !isUsable(element)) return;
        seen.add(element);
        element.dataset.immersiveReveal = 'true';
        element.classList.add('angel-immersive-reveal');

        if (
          element.matches('[class*="card"], [class*="tile"], .angel-capability__visual') &&
          !element.closest('.apple-workbench-card, .apple-process-stage')
        ) {
          element.classList.add('angel-immersive-tilt');
        }

        if (element.matches(PARALLAX_SELECTOR) && element.querySelector('img')) {
          element.dataset.immersiveParallax = 'true';
          element.classList.add('angel-immersive-parallax');
        }

        const siblings = element.parentElement
          ? Array.from(element.parentElement.children)
          : [];
        const siblingIndex = Math.max(0, siblings.indexOf(element));
        element.style.setProperty('--immersive-delay', `${(siblingIndex % 6) * 55}ms`);
        observer.observe(element);
        marked += 1;
      });
    };

    const scheduleScan = (): void => {
      if (scanTimer) return;
      scanTimer = window.setTimeout(() => {
        scanTimer = 0;
        scan();
      }, 110);
    };

    scan();
    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      if (scanTimer) window.clearTimeout(scanTimer);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={atmosphereRef} className="angel-immersive-atmosphere" aria-hidden="true">
        <span ref={progressRef} className="angel-global-progress" />
        <span className="angel-immersive-orb angel-immersive-orb--one" />
        <span className="angel-immersive-orb angel-immersive-orb--two" />
        <span className="angel-immersive-grid" />
      </div>
      <div key={route} className="angel-route-veil" aria-hidden="true">
        <span className="angel-route-veil__panel angel-route-veil__panel--one" />
        <span className="angel-route-veil__panel angel-route-veil__panel--two" />
        <span className="angel-route-veil__line" />
      </div>
    </>
  );
}
