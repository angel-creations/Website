import { lazy, Suspense, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { FloatingScrollTop } from '../components/FloatingScrollTop';
import { Header } from '../components/Header';
import { ImmersivePageEffects } from '../components/ImmersivePageEffects';
import { HomeSlideshow } from '../components/HomeSlideshow';
import { SiteFooter } from '../components/SiteFooter';
import { capabilityForRoute } from '../data/capabilities';
import { domainFaqs, domainForRoute, domains, domainsForParent } from '../data/domains';
import { capabilityFaqs } from '../data/leadFaqs';
import { slideExperienceForRoute } from '../data/slideExperiences';
import innerHeroVisuals from '../data/innerHeroVisuals.json';
import routeSeo from '../data/routeSeo.json';
import type { PageDocument } from '../types/content';
import { captureLeadAttribution, trackLeadEvent } from '../utils/leads';
import { currentRoute, isInternalHref, navigate, normaliseRoute, toLocalRoute } from '../utils/routes';
import { applySeo } from '../utils/seo';
import {
  capabilitySeoCluster,
  clusterKeywords,
  experienceSeoFaqs,
  ORGANIZATION_SEO,
  parentSeoCluster,
} from '../utils/seoKeywords';

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

const DomainDetail = lazy(async () => {
  const module = await import('../components/DomainDetail');
  return { default: module.DomainDetail };
});

const DomainIndex = lazy(async () => {
  const module = await import('../components/DomainIndex');
  return { default: module.DomainIndex };
});

const SliderExperience = lazy(async () => {
  const module = await import('../components/SliderExperience');
  return { default: module.SliderExperience };
});

const homeFallback: PageDocument = {
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

const notFoundFallback: PageDocument = {
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

const retiredFallback: PageDocument = {
  ...notFoundFallback,
  route: '/360-video/',
  status: 410,
  kind: 'gone',
  title: 'Experience retired | Angel Creations',
  description: 'The old 360 video address has been retired. Explore current work or contact the studio for help finding something.',
  bodyClasses: ['gone'],
};

const retiredRoutes = new Set(['/360-video/']);

const archivedRoutes = new Set([
  '/', '/about/', '/animation/', '/augment-reality/', '/brand-advertisement/',
  '/contact/', '/media-production/', '/metaverse/', '/mixed-reality/', '/privacy-policy/',
  '/terms-of-service/', '/virtual-reality/', '/works/',
]);

function faqJsonLd(id: string, items: Array<{ question: string; answer: string }>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });
}

function domainListJsonLd(route: string, name: string, records: typeof domains): string {
  const canonical = `https://angelcreations.in${route}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonical}#domain-service-list`,
    name,
    numberOfItems: records.length,
    itemListElement: records.map((record, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        '@id': `https://angelcreations.in${record.route}#service`,
        name: `${record.contextualTitle} — ${record.parentLabel}`,
        alternateName: record.seoAliases,
        url: `https://angelcreations.in${record.route}`,
      },
    })),
  });
}

function RouteLoading({ message }: { message: string }): JSX.Element {
  return (
    <main id="main" className="site-main">
      <p className="angel-route-loading" aria-live="polite">{message}</p>
    </main>
  );
}

function pageContent(page: PageDocument, route: string): JSX.Element {
  const domain = domainForRoute(route);
  if (domain) {
    return (
      <>
        <main id="main" className="site-main">
          <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading domain.</p>}>
            <DomainDetail domain={domain} />
          </Suspense>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (route === '/domains/') {
    return (
      <>
        <main id="main" className="site-main">
          <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading domain directory.</p>}>
            <DomainIndex />
          </Suspense>
        </main>
        <SiteFooter />
      </>
    );
  }

  const capability = capabilityForRoute(route);
  if (capability) {
    return (
      <>
        <main id="main" className="site-main">
          <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading capability.</p>}>
            <CapabilityDetail capability={capability} />
          </Suspense>
        </main>
        <SiteFooter />
      </>
    );
  }

  const experience = slideExperienceForRoute(route);
  if (experience) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading experience." />}>
          <SliderExperience experience={experience} />
        </Suspense>
        <SiteFooter />
      </>
    );
  }

  if (route === '/') {
    return <HomeSlideshow />;
  }

  if (route === '/about/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading studio." />}>
        <AboutPage />
      </Suspense>
    );
  }

  if (route === '/works/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading works archive.</p>}>
              <VideoArchive />
            </Suspense>
          </main>
          <SiteFooter />
        </div>
      </div>
    );
  }

  if (route === '/contact/') {
    return (
      <div id="content" className="site-content">
        <div id="primary" className="content-area">
          <main id="main" className="site-main">
            <Suspense fallback={<p className="angel-route-loading" aria-live="polite">Loading project enquiry.</p>}>
              <ContactWizard />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  if (route === '/privacy-policy/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading privacy policy." />}>
        <LegalPage kind="privacy" />
      </Suspense>
    );
  }

  if (route === '/terms-of-service/') {
    return (
      <Suspense fallback={<RouteLoading message="Loading terms of service." />}>
        <LegalPage kind="terms" />
      </Suspense>
    );
  }

  if (page.status === 410) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading retired experience." />}>
          <NotFoundPage attemptedPath={route} statusCode={410} />
        </Suspense>
        <SiteFooter />
      </>
    );
  }

  if (page.status === 404) {
    return (
      <>
        <Suspense fallback={<RouteLoading message="Loading page." />}>
          <NotFoundPage attemptedPath={route} />
        </Suspense>
        <SiteFooter />
      </>
    );
  }

  return <RouteLoading message="This page is unavailable." />;
}

export function App(): JSX.Element {
  const [route, setRoute] = useState<string>(() => currentRoute());
  const previousRouteRef = useRef(route);
  const isInitialRouteRef = useRef(true);

  useEffect(() => {
    const syncRoute = (): void => setRoute(currentRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    captureLeadAttribution();
  }, [route]);

  const capability = useMemo(() => capabilityForRoute(route), [route]);
  const domain = useMemo(() => domainForRoute(route), [route]);
  const experience = useMemo(() => slideExperienceForRoute(route), [route]);
  const isDedicatedSpatialRoute = Boolean(
    capability ||
      domain ||
      route === '/domains/' ||
      experience ||
      route === '/about/' ||
      route === '/works/' ||
      route === '/contact/' ||
      route === '/privacy-policy/' ||
      route === '/terms-of-service/'
  );
  const routeIsKnown = retiredRoutes.has(route) || archivedRoutes.has(route) || route === '/domains/' || Boolean(capability || domain || experience);
  const page = useMemo(() => {
    if (route === '/') return homeFallback;
    if (retiredRoutes.has(route)) return retiredFallback;
    if (!routeIsKnown) return notFoundFallback;
    return { ...homeFallback, route, status: 200, kind: 'page', meta: {} };
  }, [route, routeIsKnown]);

  useEffect(() => {
    if (previousRouteRef.current === route) return undefined;
    previousRouteRef.current = route;

    const timer = window.setTimeout(() => {
      const main = document.getElementById('main');
      if (!main) return;
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }, 90);

    return () => window.clearTimeout(timer);
  }, [route]);

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
      ?? domain?.seoTitle
      ?? (route === '/domains/' ? '63 XR, Animation, Film & Brand Services | Angel Creations' : null)
      ?? (capability ? `${capability.title} | Angel Creations` : null)
      ?? (experience ? `${experience.label} | Angel Creations` : null)
      ?? page.title;
    const description = routeMetadata?.description
      ?? domain?.seoDescription
      ?? (route === '/domains/' ? 'Explore 63 specialist services across VR, AR, metaverse, animation, brand campaigns and media production. Compare deliverables and start your project.' : null)
      ?? capability?.overview
      ?? experience?.summary
      ?? page.description;
    const shareTitle = routeMetadata?.shareTitle ?? title;
    const imageAlt = routeMetadata?.imageAlt ?? domain?.imageAlt ?? (route === '/domains/' ? 'Angel Creations domain directory artwork showing an immersive digital world' : title);
    const imagePath = routeMetadata?.image
      ?? domain?.image
      ?? (route === '/domains/' ? '/media/social/og/domains.jpg' : undefined)
      ?? innerHeroVisuals[route as keyof typeof innerHeroVisuals];
    const socialImage = imagePath ? new URL(imagePath, 'https://angelcreations.in').href : undefined;
    const isCuratedSocialImage = Boolean(imagePath?.includes('/media/social/og/'));
    const socialImageType = imagePath?.toLowerCase().endsWith('.png')
      ? 'image/png'
      : imagePath?.toLowerCase().endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    const parentDomains = experience ? domainsForParent(route) : [];
    const supplementalJsonLd = isErrorRoute ? [] : [
      ...(domain ? [faqJsonLd(`${canonical}#faq`, domainFaqs(domain))] : []),
      ...(capability ? [faqJsonLd(`${canonical}#faq`, capabilityFaqs(capability))] : []),
      ...(experience ? [faqJsonLd(`${canonical}#faq`, experienceSeoFaqs(experience, parentDomains.map((record) => record.contextualTitle)))] : []),
      ...(experience ? [domainListJsonLd(route, `${experience.label} domain services`, parentDomains)] : []),
      ...(route === '/domains/' ? [domainListJsonLd(route, 'Angel Creations domains', domains)] : []),
    ];
    const parentCluster = parentSeoCluster(route);
    const capabilityCluster = capabilitySeoCluster(route);
    const parentRoutes = [...new Set(domains.map((record) => record.parentRoute))];
    const seoKeywords = domain
      ? domain.seoKeywords
      : capability
        ? clusterKeywords(capabilityCluster)
        : experience
          ? clusterKeywords(parentCluster)
          : route === '/domains/'
            ? [...clusterKeywords(ORGANIZATION_SEO), ...parentRoutes.map((parentRoute) => parentSeoCluster(parentRoute)?.focus || '')]
              : route === '/works/'
                ? ['XR portfolio India', 'animation and VFX portfolio', 'brand film portfolio', 'film production portfolio', ...ORGANIZATION_SEO.services]
                : clusterKeywords(ORGANIZATION_SEO);
    const seoAlternateNames = domain
      ? domain.seoAliases
      : capability
        ? capabilityCluster?.aliases
        : experience
          ? parentCluster?.aliases
          : ORGANIZATION_SEO.aliases;
    const seoAudiences = domain
      ? domain.audiences
      : capability
        ? capabilityCluster?.audiences
        : experience
          ? parentCluster?.audiences
          : undefined;
    const relatedRoutes = domain
      ? [domain.parentRoute, ...domainsForParent(domain.parentRoute).filter((record) => record.route !== domain.route).slice(0, 5).map((record) => record.route)]
      : capability
        ? capability.domainRoutes
        : experience
          ? parentDomains.map((record) => record.route)
          : route === '/domains/'
            ? parentRoutes
            : undefined;
    const seoPage: PageDocument = {
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
          ...(isCuratedSocialImage ? {
            'og:image:width': '1200',
            'og:image:height': '630',
          } : {}),
          'og:image:type': socialImageType,
          'og:image:alt': imageAlt,
          'twitter:image': socialImage,
          'twitter:image:alt': imageAlt,
        } : {}),
      },
      jsonLd: supplementalJsonLd,
      keywords: isErrorRoute ? undefined : seoKeywords,
      alternateNames: isErrorRoute ? undefined : seoAlternateNames,
      audiences: isErrorRoute ? undefined : seoAudiences,
      relatedRoutes: isErrorRoute ? undefined : relatedRoutes,
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
  }, [page, capability, domain, experience, route, isDedicatedSpatialRoute]);

  // Virtual pageview for Google Tag Manager: the container's gtm.js event covers
  // the initial document load; in-site (SPA) navigations push a page_view event
  // once the SEO effect above has updated the document title.
  useEffect(() => {
    if (isInitialRouteRef.current) {
      isInitialRouteRef.current = false;
      return;
    }
    const browserWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    browserWindow.dataLayer = browserWindow.dataLayer || [];
    browserWindow.dataLayer.push({
      event: 'page_view',
      page_path: `${window.location.pathname}${window.location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [route]);

  const handleInternalLink = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;

    const rawHref = anchor.getAttribute('href') ?? '';
    if (!anchor.dataset.leadEvent && event.button === 0 && !event.defaultPrevented) {
      if (rawHref.startsWith('/contact/')) {
        trackLeadEvent('lead_cta_click', { sourceRoute: route, destination: rawHref });
      } else if (rawHref.startsWith('mailto:')) {
        trackLeadEvent('lead_email_click', { sourceRoute: route });
      } else if (rawHref.startsWith('tel:')) {
        trackLeadEvent('lead_call_click', { sourceRoute: route });
      }
    }

    if (
      anchor.target === '_blank' ||
      event.button !== 0 ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    const href = rawHref;
    if (!isInternalHref(href)) return;
    event.preventDefault();
    navigate(toLocalRoute(href));
  };

  return (
    <div className="archived-content" onClick={handleInternalLink}>
      <div id="page" className="site">
        <a
          className="angel-skip-link"
          href="#main"
          onClick={(event) => {
            const main = document.getElementById('main');
            if (!main) return;
            event.preventDefault();
            main.tabIndex = -1;
            main.focus({ preventScroll: false });
          }}
        >
          Skip to content
        </a>
        <Header />
        {pageContent(page, route)}
        <FloatingScrollTop pathname={route} />
        {route !== '/' && <ImmersivePageEffects route={route} />}
      </div>
    </div>
  );
}
