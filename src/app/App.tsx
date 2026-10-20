import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { FloatingScrollTop } from '../components/FloatingScrollTop';
import { Header } from '../components/Header';
import { HomeSlideshow } from '../components/HomeSlideshow';
import { LegacyFooter } from '../components/LegacyFooter';
import { capabilityForRoute } from '../data/capabilities';
import { slideExperienceForRoute } from '../data/slideExperiences';
import innerHeroVisuals from '../data/innerHeroVisuals.json';
import routeSeo from '../data/routeSeo.json';
import type { LegacyPage } from '../types/legacy';
import { currentRoute, isInternalHref, navigate, normaliseRoute, toLocalRoute } from '../utils/routes';
import { applySeo } from '../utils/seo';

const AboutPage = lazy(async () => {
  const module = await import('../components/AboutPage');
  return { default: module.AboutPage };
});

const ContactWizard = lazy(async () => {
  const module = await import('../components/ContactWizard');
  return { default: module.ContactWizard };
});

const LegalPage = lazy(async () => {
  const module = await import('../components/LegalPage');
  return { default: module.LegalPage };
});

const NotFoundPage = lazy(async () => {
  const module = await import('../components/NotFoundPage');
  return { default: module.NotFoundPage };
});

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

const PublicLegacyFallback = lazy(async () => {
  const module = await import('../components/PublicLegacyFallback');
  return { default: module.PublicLegacyFallback };
});

const homeFallback: LegacyPage = {
  url: 'https://angelcreations.in/', route: '/', status: 200, kind: 'home', bodyClasses: ['home'],
  title: routeSeo['/'].title,
  description: routeSeo['/'].description,
  canonical: 'https://angelcreations.in/', robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  meta: {
    'og:title': routeSeo['/'].title,
    'og:description': routeSeo['/'].description,
    'og:url': 'https://angelcreations.in/',
  },
  jsonLd: [], children: [],
};

const notFoundFallback: LegacyPage = {
  ...homeFallback,
  route: '/404/',
  status: 404,
  kind: '404',
  title: routeSeo['/404/'].title,
  description: routeSeo['/404/'].description,
  robots: 'noindex, follow',
  canonical: '',
  meta: {},
  bodyClasses: ['error404'],
};

const retiredFallback: LegacyPage = {
  ...notFoundFallback,
  route: '/360-video/',
  status: 410,
  kind: 'gone',
  title: 'Experience retired | Angel Creations',
  description: 'The old 360 video address has been retired. Explore current work or contact the studio for help finding something.',
  bodyClasses: ['gone'],
};

const retiredRoutes = new Set(['/360-video/']);

const publicLegacyRoutes = new Set([
  '/', '/about/', '/animation/', '/augment-reality/', '/brand-advertisement/',
  '/contact/', '/media-production/', '/metaverse/', '/mixed-reality/', '/privacy-policy/',
  '/terms-of-service/', '/virtual-reality/', '/works/',
]);

function RouteLoading({ message, insideMain = false }: { message: string; insideMain?: boolean }): JSX.Element {
  const content = (
    <section className="angel-route-loading" role="status" aria-live="polite" aria-busy="true">
      <p className="angel-route-loading__eyebrow">Angel Creations / Please wait</p>
      <h1>{message.replace(/[.]$/, '')}</h1>
      <p className="angel-route-loading__copy">The page is getting ready. You can continue as soon as it appears.</p>
      <span className="angel-route-loading__indicator" aria-hidden="true" />
    </section>
  );
  return insideMain
    ? <>{content}</>
    : <main id="main" className="site-main" aria-busy="true">{content}</main>;
}

function DismissStaticFallback(): null {
  useLayoutEffect(() => {
    document.getElementById('static-route-fallback')?.remove();
  }, []);
  return null;
}

function pageContent(page: LegacyPage, route: string): JSX.Element {
  const capability = capabilityForRoute(route);
  if (capability) {
    return (
      <>
        <main id="main" className="site-main">
          <Suspense fallback={<RouteLoading message="Loading capability." insideMain />}>
            <>
              <CapabilityDetail capability={capability} />
              <DismissStaticFallback />
            </>
          </Suspense>
        </main>
        <LegacyFooter />
      </>
    );
  }

  const experience = slideExperienceForRoute(route);
  if (experience) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading experience." />}>
          <>
            <SliderExperience experience={experience} />
            <DismissStaticFallback />
          </>
        </Suspense>
        <LegacyFooter />
      </>
    );
  }

  if (route === '/') {
    return <><HomeSlideshow /><DismissStaticFallback /></>;
  }

  if (route === '/about/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading studio." />}>
        <><AboutPage /><DismissStaticFallback /></>
      </Suspense>
    );
  }

  if (route === '/works/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <Suspense fallback={<RouteLoading message="Loading works archive." insideMain />}>
              <><VideoArchive /><DismissStaticFallback /></>
            </Suspense>
          </main>
          <LegacyFooter />
        </div>
      </div>
    );
  }

  if (route === '/contact/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <Suspense fallback={<RouteLoading message="Loading project enquiry." insideMain />}>
              <><ContactWizard /><DismissStaticFallback /></>
            </Suspense>
          </main>
          <LegacyFooter />
        </div>
      </div>
    );
  }

  if (route === '/privacy-policy/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading privacy policy." />}>
        <><LegalPage kind="privacy" /><DismissStaticFallback /></>
      </Suspense>
    );
  }

  if (route === '/terms-of-service/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading terms of service." />}>
        <><LegalPage kind="terms" /><DismissStaticFallback /></>
      </Suspense>
    );
  }

  if (page.status === 410) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading retired experience." />}>
          <><NotFoundPage attemptedPath={route} statusCode={410} /><DismissStaticFallback /></>
        </Suspense>
        <LegacyFooter />
      </>
    );
  }

  if (page.status === 404) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading page." />}>
          <><NotFoundPage attemptedPath={route} /><DismissStaticFallback /></>
        </Suspense>
        <LegacyFooter />
      </>
    );
  }

  if (publicLegacyRoutes.has(route)) {
    return (
      <Suspense fallback={<RouteLoading message="Loading archived page." />}>
        <><PublicLegacyFallback route={route} /><DismissStaticFallback /></>
      </Suspense>
    );
  }

  return <RouteLoading message="This page is unavailable." />;
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
      route === '/terms-of-service/'
  );
  const routeIsKnown = retiredRoutes.has(route) || publicLegacyRoutes.has(route) || Boolean(capability || experience);
  const page = useMemo(() => {
    if (route === '/') return homeFallback;
    if (retiredRoutes.has(route)) return retiredFallback;
    if (!routeIsKnown) return notFoundFallback;
    return { ...homeFallback, route, status: 200, kind: 'page', meta: {} };
  }, [route, routeIsKnown]);

  useEffect(() => {
    const pathname = window.location.pathname;
    const normalizedPath = normaliseRoute(pathname);
    if (normalizedPath !== pathname) {
      // Normalize route spelling without stripping UTM or other query parameters.
      window.history.replaceState(
        window.history.state,
        '',
        `${normalizedPath}${window.location.search}${window.location.hash}`,
      );
    }
  }, [route]);

  useEffect(() => {
    const routeMetadata = (routeSeo as Record<string, {
      title?: string;
      description?: string;
      shareTitle?: string;
      image?: string;
      imageAlt?: string;
    }>)[route];
    const isErrorRoute = page.status === 404 || page.status === 410;
    const canonical = isErrorRoute ? '' : `https://angelcreations.in${route}`;
    const title = routeMetadata?.title
      ?? (capability ? `${capability.title} | Angel Creations` : null)
      ?? (experience ? `${experience.label} | Angel Creations` : null)
      ?? page.title;
    const description = routeMetadata?.description
      ?? capability?.overview
      ?? experience?.summary
      ?? page.description;
    const shareTitle = routeMetadata?.shareTitle ?? title;
    const imageAlt = routeMetadata?.imageAlt ?? title;
    const imagePath = routeMetadata?.image
      ?? innerHeroVisuals[route as keyof typeof innerHeroVisuals];
    const socialImage = imagePath ? new URL(imagePath, 'https://angelcreations.in').href : undefined;
    const seoPage: LegacyPage = {
      ...page,
      title,
      description,
      robots: isErrorRoute
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      canonical,
      meta: isErrorRoute ? {} : {
        ...page.meta,
        'og:title': shareTitle,
        'og:description': description,
        'og:url': canonical,
        'twitter:title': shareTitle,
        'twitter:description': description,
        ...(socialImage ? {
          'og:image': socialImage,
          'og:image:secure_url': socialImage,
          'og:image:width': '1200',
          'og:image:height': '630',
          'og:image:type': 'image/jpeg',
          'og:image:alt': imageAlt,
          'twitter:image': socialImage,
          'twitter:image:alt': imageAlt,
        } : {}),
      },
      jsonLd: page.jsonLd,
    };

    applySeo(seoPage);
    const routeBodyClass = isDedicatedSpatialRoute
      ? 'angel-experience-route js'
      : [...page.bodyClasses.filter((className) => className !== 'no-js'), 'js'].join(' ') || 'js';
    document.body.className = [
      ...routeBodyClass.split(/\s+/).filter(Boolean),
      ...(document.body.classList.contains('menu-open') ? ['menu-open'] : []),
    ].join(' ');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page, capability, experience, route, isDedicatedSpatialRoute]);

  const handleInternalLink = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (
      !anchor ||
      anchor.target === '_blank' ||
      event.button !== 0 ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    const href = anchor.getAttribute('href') ?? '';
    if (!isInternalHref(href)) return;
    event.preventDefault();
    navigate(toLocalRoute(href));
  };

  return (
    <div className="legacy-shell" onClick={handleInternalLink}>
      <div id="page" className="site">
        <Header />
        {pageContent(page, route)}
        <FloatingScrollTop pathname={route} />
      </div>
    </div>
  );
}
