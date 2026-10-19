import { lazy, Suspense, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { AboutReveal } from '../components/AboutReveal';
import { ContactWizard } from '../components/ContactWizard';
import { Header } from '../components/Header';
import { HomeSlideshow } from '../components/HomeSlideshow';
import { LegacyRenderer } from '../components/LegacyRenderer';
import { LegacyFooter } from '../components/LegacyFooter';
import { PanoramaPage } from '../components/PanoramaPage';
import { NotFoundPage } from '../components/NotFoundPage';
import { CapabilityIndex } from '../components/CapabilityIndex';
import { capabilityForRoute } from '../data/capabilities';
import { slideExperienceForRoute } from '../data/slideExperiences';
import routeSeo from '../data/routeSeo.json';
import type { LegacyPage } from '../types/legacy';
import { currentRoute, isInternalHref, navigate, normaliseRoute, toLocalRoute } from '../utils/routes';
import { applySeo } from '../utils/seo';

// Keep the immersive home stage out of the legacy-content bundle. Captured inner-page data
// loads after first paint and is never a prerequisite for the original homepage experience.
const homeFallback: LegacyPage = {
  url: 'https://angelcreations.in/', route: '/', status: 200, kind: 'home', bodyClasses: ['home'],
  title: 'Angel Creations - A Creative Powerhouse The Art of Storytelling. The Power of Design.',
  description: 'Experience the future with Angel Creations, an immersive technology company pushing boundaries with virtual reality, augmented reality, and more.',
  canonical: 'https://angelcreations.in/', robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  meta: { 'og:title': 'Home', 'og:description': 'Experience the future with Angel Creations, an immersive technology company pushing boundaries with virtual reality, augmented reality, and more.', 'og:url': 'https://angelcreations.in/' },
  jsonLd: [], children: [],
};
// Routes retained for visitors are the captured Angel core—not the source CMS's test, author,
// search, duplicate-copy and forensic paths. Unknown/non-core paths receive the Angel 404 state.
const publicLegacyRoutes = new Set([
  '/', '/360-video/', '/about/', '/animation/', '/augment-reality/', '/brand-advertisement/',
  '/contact/', '/media-production/', '/metaverse/', '/mixed-reality/', '/privacy-policy/',
  '/terms-of-service/', '/virtual-reality/', '/works/',
]);

const VideoArchive = lazy(async () => {
  const module = await import('../components/VideoArchive');
  return { default: module.VideoArchive };
});
const CapabilityDetail = lazy(async () => {
  const module = await import('../components/CapabilityDetail');
  return { default: module.CapabilityDetail };
});
const SliderExperience = lazy(async () => {
  const module = await import('../components/SliderExperience');
  return { default: module.SliderExperience };
});

function useRoute(): string {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onPopState = (): void => setRoute(currentRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return route;
}

function useLegacyPages(route: string, hasDedicatedRoute: boolean): LegacyPage[] | null {
  const [pages, setPages] = useState<LegacyPage[] | null>(null);
  useEffect(() => {
    if (pages) return undefined;
    let active = true;
    let timer: number | null = null;
    let idleHandle: number | null = null;
    const load = (): void => {
      void import('../data/legacyPages.json').then((module) => {
        if (active) setPages(module.default as unknown as LegacyPage[]);
      });
    };

    // Capability and slide-experience routes have source-qualified dedicated payloads; the
    // captured WordPress page archive is not requested for them. Home can stand alone until idle.
    if (hasDedicatedRoute) return () => { active = false; };
    if (route !== '/') {
      load();
    } else {
      const idleWindow = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      if (typeof idleWindow.requestIdleCallback === 'function') idleHandle = idleWindow.requestIdleCallback(load, { timeout: 5000 });
      else timer = window.setTimeout(load, 3500);
    }

    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
      const idleWindow = window as Window & { cancelIdleCallback?: (handle: number) => void };
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }, [hasDedicatedRoute, pages, route]);
  return pages;
}

function routePage(route: string, pages: LegacyPage[]): LegacyPage {
  const exact = pages.find((page) => page.route === route);
  if (exact && exact.status === 200 && publicLegacyRoutes.has(exact.route)) return exact;

  return pages.find((page) => page.status === 404) ?? pages[0];
}

function pageContent(page: LegacyPage, route: string): JSX.Element {
  const experience = slideExperienceForRoute(route);
  if (experience) return <Suspense fallback={<main id="main" className="site-main"><p className="angel-route-loading" aria-live="polite">Loading Angel.</p></main>}><SliderExperience experience={experience} /></Suspense>;
  const capability = capabilityForRoute(route);
  if (capability) {
    return <main id="main" className="site-main"><Suspense fallback={<p className="angel-capability-loading" aria-live="polite">Loading capability.</p>}><CapabilityDetail capability={capability} /></Suspense></main>;
  }
  if (route === '/360-video/' || page.route === '/360-video/') return <PanoramaPage />;
  if (route === '/contact/' || page.route === '/contact/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <ContactWizard />
            <LegacyFooter />
          </main>
        </div>
      </div>
    );
  }
  if (route === '/works/' || page.route === '/works/') {
    return (
      <main id="main" className="site-main">
        <Suspense fallback={<p className="angel-archive-loading" aria-live="polite">Loading archive.</p>}>
          <VideoArchive />
        </Suspense>
      </main>
    );
  }
  if (page.status === 404) return <NotFoundPage />;
  if (page.route === '/') return <HomeSlideshow />;
  const isAbout = page.route === '/about/';
  return (
    <div id="content" className="site-content" data-about-page-reveal={isAbout || undefined}>
      <div id="primary" className="content-area"><main id="main" className="site-main"><LegacyRenderer nodes={page.children} />{isAbout && <CapabilityIndex />}{isAbout && <AboutReveal />}{isAbout && <LegacyFooter />}</main></div>
    </div>
  );
}

export function App(): JSX.Element {
  const route = useRoute();
  const capability = useMemo(() => capabilityForRoute(route), [route]);
  const experience = useMemo(() => slideExperienceForRoute(route), [route]);
  const isDedicatedSpatialRoute = Boolean(
    capability ||
      experience ||
      route === '/works/' ||
      route === '/contact/' ||
      route === '/360-video/'
  );
  const legacyPages = useLegacyPages(route, isDedicatedSpatialRoute);
  const page = useMemo(() => legacyPages ? routePage(route, legacyPages) : homeFallback, [route, legacyPages]);

  useEffect(() => {
    const actualRoute = `${window.location.pathname}${window.location.search}`;
    if (normaliseRoute(actualRoute) !== actualRoute) window.history.replaceState({}, '', route);
  }, [route]);

  useEffect(() => {
    const routeDescription = routeSeo[route as keyof typeof routeSeo]?.description ?? routeSeo[page.route as keyof typeof routeSeo]?.description ?? '';
    const sourceDescription = page.description || page.meta.description || routeDescription;
    const seoPage = capability ? {
      ...page,
      title: `${capability.title} | Angel Creations`,
      description: capability.overview,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: `https://angelcreations.in${capability.route}`,
      meta: { ...page.meta, 'og:title': `${capability.title} | Angel Creations`, 'og:description': capability.overview, 'og:url': `https://angelcreations.in${capability.route}` },
      jsonLd: [],
    } : experience ? {
      ...page,
      title: `${experience.label} | Angel Creations`,
      description: experience.summary,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: `https://angelcreations.in${experience.route}`,
      meta: { ...page.meta, 'og:title': `${experience.label} | Angel Creations`, 'og:description': experience.summary, 'og:url': `https://angelcreations.in${experience.route}` },
      jsonLd: [],
    } : route === '/works/' ? {
      ...page,
      route: '/works/',
      title: 'Works Archive - Angel Creations - A Creative Powerhouse',
      description: routeDescription,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: 'https://angelcreations.in/works/',
      meta: { ...page.meta, 'og:title': 'Works Archive', 'og:description': routeDescription, 'og:url': 'https://angelcreations.in/works/' },
      jsonLd: [],
    } : route === '/contact/' ? {
      ...page,
      route: '/contact/',
      title: 'Contact - Angel Creations - A Creative Powerhouse',
      description: routeDescription,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: 'https://angelcreations.in/contact/',
      meta: { ...page.meta, 'og:title': 'Contact', 'og:description': routeDescription, 'og:url': 'https://angelcreations.in/contact/' },
      jsonLd: [],
    } : {
      ...page,
      description: sourceDescription,
      meta: sourceDescription ? { ...page.meta, 'og:description': page.meta['og:description'] || sourceDescription } : page.meta,
    };
    applySeo(seoPage);
    document.body.className = isDedicatedSpatialRoute
      ? 'angel-experience-route js'
      : [...page.bodyClasses.filter((className) => className !== 'no-js'), 'js'].join(' ') || 'js';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page, capability, experience, route, isDedicatedSpatialRoute]);

  const handleInternalLink = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.target === '_blank' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = anchor.getAttribute('href') ?? '';
    if (!isInternalHref(href)) return;
    event.preventDefault();
    navigate(toLocalRoute(href));
  };

  const waitingForLegacyPage = !legacyPages && route !== '/' && !isDedicatedSpatialRoute;
  return (
    <div className="legacy-shell" onClick={handleInternalLink}>
      <div id="page" className="site">
        <Header />
        {waitingForLegacyPage ? <main id="main" className="site-main"><p className="angel-route-loading" aria-live="polite">Loading Angel.</p></main> : pageContent(page, route)}
      </div>
    </div>
  );
}
