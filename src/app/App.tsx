import { lazy, Suspense, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { AboutPage } from '../components/AboutPage';
import { ContactWizard } from '../components/ContactWizard';
import { FloatingScrollTop } from '../components/FloatingScrollTop';
import { Header } from '../components/Header';
import { HomeSlideshow } from '../components/HomeSlideshow';
import { LegacyRenderer } from '../components/LegacyRenderer';
import { LegacyFooter } from '../components/LegacyFooter';
import { LegalPage } from '../components/LegalPage';
import { PanoramaPage } from '../components/PanoramaPage';
import { NotFoundPage } from '../components/NotFoundPage';
import { capabilityForRoute } from '../data/capabilities';
import { slideExperienceForRoute } from '../data/slideExperiences';
import routeSeo from '../data/routeSeo.json';
import type { LegacyPage } from '../types/legacy';
import { currentRoute, isInternalHref, navigate, normaliseRoute, toLocalRoute } from '../utils/routes';
import { applySeo } from '../utils/seo';

const homeFallback: LegacyPage = {
  url: 'https://angelcreations.in/', route: '/', status: 200, kind: 'home', bodyClasses: ['home'],
  title: 'Angel Creations - A Creative Powerhouse The Art of Storytelling. The Power of Design.',
  description: 'Experience the future with Angel Creations, an immersive technology company pushing boundaries with virtual reality, augmented reality, and more.',
  canonical: 'https://angelcreations.in/', robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  meta: { 'og:title': 'Home', 'og:description': 'Experience the future with Angel Creations, an immersive technology company pushing boundaries with virtual reality, augmented reality, and more.', 'og:url': 'https://angelcreations.in/' },
  jsonLd: [], children: [],
};

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

let cachedLegacyPages: LegacyPage[] | null = null;
let legacyPagesRequest: Promise<LegacyPage[]> | null = null;

function loadLegacyPages(): Promise<LegacyPage[]> {
  if (cachedLegacyPages) return Promise.resolve(cachedLegacyPages);
  if (!legacyPagesRequest) {
    legacyPagesRequest = import('../data/legacyPages.json').then((module) => {
      cachedLegacyPages = module.default as unknown as LegacyPage[];
      return cachedLegacyPages;
    });
  }
  return legacyPagesRequest;
}

function routePage(route: string, pages: LegacyPage[]): LegacyPage {
  const exact = pages.find((page) => page.route === route);
  if (exact && publicLegacyRoutes.has(exact.route)) return exact;
  return pages.find((page) => page.route === '/404/') ?? {
    ...homeFallback,
    route: '/404/',
    status: 404,
    kind: '404',
    title: 'Page not found - Angel Creations - A Creative Powerhouse',
    description: routeSeo['/404/'].description,
    robots: 'noindex, follow',
    canonical: '',
    bodyClasses: ['error404'],
  };
}

function useLegacyPages(route: string, skipLoad: boolean): LegacyPage[] | null {
  const [pages, setPages] = useState<LegacyPage[] | null>(cachedLegacyPages);
  useEffect(() => {
    if (route === '/' || skipLoad || cachedLegacyPages) return;
    let active = true;
    loadLegacyPages().then((loaded) => {
      if (active) setPages(loaded);
    });
    return () => {
      active = false;
    };
  }, [route, skipLoad]);
  return pages;
}

function pageContent(page: LegacyPage, route: string): JSX.Element {
  const capability = capabilityForRoute(route);
  if (capability) {
    return (
      <main id="main" className="site-main">
        <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading capability.</p>}>
          <CapabilityDetail capability={capability} />
        </Suspense>
        <LegacyFooter />
      </main>
    );
  }
  const experience = slideExperienceForRoute(route);
  if (experience) {
    return (
      <main id="main" className="site-main">
        <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading experience.</p>}>
          <SliderExperience experience={experience} />
        </Suspense>
        <LegacyFooter />
      </main>
    );
  }
  if (route === '/') {
    return (
      <main id="main" className="site-main">
        <HomeSlideshow />
      </main>
    );
  }
  if (route === '/about/') {
    return <AboutPage />;
  }
  if (route === '/works/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading works archive.</p>}>
              <VideoArchive />
            </Suspense>
            <LegacyFooter />
          </main>
        </div>
      </div>
    );
  }
  if (route === '/contact/') {
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
  if (route === '/360-video/') {
    return (
      <>
        <PanoramaPage />
        <LegacyFooter />
      </>
    );
  }
  if (route === '/privacy-policy/' || page.route === '/privacy-policy/') {
    return <LegalPage kind="privacy" />;
  }
  if (route === '/terms-of-service/' || page.route === '/terms-of-service/') {
    return <LegalPage kind="terms" />;
  }
  if (page.route === '/404/' || page.status === 404) {
    return (
      <>
        <NotFoundPage attemptedPath={route} />
        <LegacyFooter />
      </>
    );
  }
  // Some captured legacy pages still embed the original color_creme footer node; the global
  // architectural footer replaces it, so the duplicate source footer is filtered out.
  const contentNodes = page.children.filter((node) => !(node.type === 'element' && node.tag === 'footer'));
  return (
    <>
      <LegacyRenderer nodes={contentNodes} route={page.route} />
      <LegacyFooter />
    </>
  );
}

export function App(): JSX.Element {
  const [route, setRoute] = useState<string>(() => currentRoute());
  useEffect(() => {
    const syncRoute = (): void => setRoute(currentRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const capability = useMemo(() => capabilityForRoute(route), [route]);
  const experience = useMemo(() => slideExperienceForRoute(route), [route]);
  const isDedicatedSpatialRoute = Boolean(
    capability ||
      experience ||
      route === '/about/' ||
      route === '/works/' ||
      route === '/contact/' ||
      route === '/privacy-policy/' ||
      route === '/terms-of-service/' ||
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
    } : route === '/about/' ? {
      ...page,
      route: '/about/',
      title: 'About - Angel Creations - A Creative Powerhouse',
      description: routeDescription,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: 'https://angelcreations.in/about/',
      meta: { ...page.meta, 'og:title': 'About', 'og:description': routeDescription, 'og:url': 'https://angelcreations.in/about/' },
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
    } : route === '/privacy-policy/' ? {
      ...page,
      route: '/privacy-policy/',
      title: 'Privacy Policy - Angel Creations - A Creative Powerhouse',
      description: routeDescription,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: 'https://angelcreations.in/privacy-policy/',
      meta: { ...page.meta, 'og:title': 'Privacy Policy', 'og:description': routeDescription, 'og:url': 'https://angelcreations.in/privacy-policy/' },
      jsonLd: [],
    } : route === '/terms-of-service/' ? {
      ...page,
      route: '/terms-of-service/',
      title: 'Terms of Service - Angel Creations - A Creative Powerhouse',
      description: routeDescription,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical: 'https://angelcreations.in/terms-of-service/',
      meta: { ...page.meta, 'og:title': 'Terms of Service', 'og:description': routeDescription, 'og:url': 'https://angelcreations.in/terms-of-service/' },
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
        <FloatingScrollTop pathname={route} />
      </div>
    </div>
  );
}
