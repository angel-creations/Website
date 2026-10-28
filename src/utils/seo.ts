import type { SeoData } from '../types/content';
import { ORGANIZATION_SEO } from './seoKeywords';

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function syncCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

const SITE_URL = 'https://angelcreations.in';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SERVICE_ROUTES = new Set([
  '/metaverse/',
  '/mixed-reality/',
  '/virtual-reality/',
  '/augment-reality/',
  '/animation/',
  '/brand-advertisement/',
  '/media-production/',
]);

const SERVICE_LABELS: Record<string, string> = {
  '/metaverse/': 'Metaverse',
  '/mixed-reality/': 'Mixed Reality',
  '/virtual-reality/': 'Virtual Reality',
  '/augment-reality/': 'Augmented Reality',
  '/animation/': 'Animation',
  '/brand-advertisement/': 'Brand Advertisement',
  '/media-production/': 'Media Production',
};

function buildRouteSchema(page: SeoData): string | null {
  if (!page.canonical) return null;

  let pathname = '/';
  try {
    pathname = new URL(page.canonical).pathname;
  } catch {
    return null;
  }

  const titleParts = page.title.split(' | ').map((part) => part.trim()).filter(Boolean);
  const name = titleParts[0] || page.title;
  const pathSegments = pathname.split('/').filter(Boolean);
  const parentServiceRoute = pathSegments.length === 2 ? `/${pathSegments[0]}/` : null;
  const isDomainRoute = Boolean(parentServiceRoute && SERVICE_ROUTES.has(parentServiceRoute));
  const parentServiceName = isDomainRoute && parentServiceRoute ? SERVICE_LABELS[parentServiceRoute] : null;
  const image = page.meta['og:image'];
  const imageAlt = page.meta['og:image:alt'] || page.title;
  const pageType = pathname === '/about/'
    ? 'AboutPage'
    : pathname === '/contact/'
      ? 'ContactPage'
      : pathname === '/works/'
        ? 'CollectionPage'
        : 'WebPage';
  const isServiceRoute = pathname.startsWith('/capabilities/') || SERVICE_ROUTES.has(pathname) || isDomainRoute;
  const webPageId = `${page.canonical}#webpage`;
  const imageId = `${page.canonical}#primaryimage`;
  const serviceId = `${page.canonical}#service`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Angel Creations',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/media/logos/logo-rectangle-1.png`,
      },
      image: `${SITE_URL}/media/social/og/home.jpg`,
      description:
        'Angel Creations is an XR, animation, VFX and film studio in Jaipur, India crafting virtual worlds, AR/VR/MR experiences, brand campaigns and cinematic media for clients worldwide.',
      slogan: 'Immersive worlds. Human stories.',
      knowsAbout: [
        ORGANIZATION_SEO.focus,
        ...ORGANIZATION_SEO.services,
        ...ORGANIZATION_SEO.aliases,
      ],
      areaServed: ORGANIZATION_SEO.locations,
      email: 'business@angelcreations.in',
      telephone: '+91-8058465733',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jaipur',
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
      location: [
        {
          '@type': 'Place',
          name: 'Angel Creations — Jaipur, India',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Jaipur',
            addressRegion: 'Rajasthan',
            addressCountry: 'IN',
          },
        },
        {
          '@type': 'Place',
          name: 'Angel Creations — Braintree, United Kingdom',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Braintree',
            addressCountry: 'GB',
          },
        },
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'business@angelcreations.in',
          telephone: '+91-8058465733',
          url: `${SITE_URL}/contact/`,
          areaServed: ['India', 'United Kingdom', 'Worldwide'],
          availableLanguage: ['English'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@angelcreations.in',
          url: `${SITE_URL}/contact/`,
          areaServed: ['India', 'United Kingdom', 'Worldwide'],
          availableLanguage: ['English'],
        },
      ],
      sameAs: [
        'https://www.instagram.com/angelcreations.digital/',
        'https://www.facebook.com/angelcreations.digital/',
        'https://www.youtube.com/AngelCreationsACreativeStudio',
        'https://www.linkedin.com/in/angelcreations/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: 'Angel Creations',
      publisher: { '@id': ORGANIZATION_ID },
      inLanguage: 'en-IN',
    },
    {
      '@type': pageType,
      '@id': webPageId,
      url: page.canonical,
      name: page.title,
      description: page.description,
      ...(page.keywords?.length ? { keywords: page.keywords } : {}),
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
      ...(pathname !== '/' ? { breadcrumb: { '@id': `${page.canonical}#breadcrumb` } } : {}),
      ...(image ? { primaryImageOfPage: { '@id': imageId } } : {}),
      ...(isServiceRoute ? { mainEntity: { '@id': serviceId } } : {}),
      inLanguage: 'en-IN',
    },
  ];

  if (image) {
    graph.push({
      '@type': 'ImageObject',
      '@id': imageId,
      url: image,
      contentUrl: image,
      caption: imageAlt,
      inLanguage: 'en-IN',
    });
  }

  if (pathname !== '/') {
    const breadcrumbs: Record<string, unknown>[] = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    ];
    if (pathname.startsWith('/capabilities/')) {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${SITE_URL}/about/`,
      });
    }
    if (isDomainRoute && parentServiceRoute && parentServiceName) {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: parentServiceName,
        item: `${SITE_URL}${parentServiceRoute}`,
      });
    }
    breadcrumbs.push({
      '@type': 'ListItem',
      position: breadcrumbs.length + 1,
      name,
      item: page.canonical,
    });
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${page.canonical}#breadcrumb`,
      itemListElement: breadcrumbs,
    });
  }

  if (isServiceRoute) {
    const relatedServices = (page.relatedRoutes || []).map((route) => ({ '@id': `${SITE_URL}${route}#service` }));
    graph.push({
      '@type': 'Service',
      '@id': serviceId,
      name: isDomainRoute && parentServiceName ? `${name} — ${parentServiceName}` : name,
      ...(page.alternateNames?.length ? { alternateName: page.alternateNames } : {}),
      serviceType: page.keywords?.[0] || name,
      description: page.description,
      ...(page.keywords?.length ? { keywords: page.keywords } : {}),
      url: page.canonical,
      provider: { '@id': ORGANIZATION_ID },
      areaServed: ORGANIZATION_SEO.locations,
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: `${SITE_URL}/contact/`,
        servicePhone: '+91-8058465733',
        availableLanguage: ['English'],
      },
      termsOfService: `${SITE_URL}/terms-of-service/`,
      ...(page.audiences?.length
        ? {
            audience: page.audiences.map((audience) => ({
              '@type': 'BusinessAudience',
              audienceType: audience,
            })),
          }
        : {
            audience: {
              '@type': 'BusinessAudience',
              audienceType: 'Brands, organisations, institutions and experience-led teams',
            },
          }),
      ...(relatedServices.length && isDomainRoute ? { isRelatedTo: relatedServices } : {}),
      ...(relatedServices.length && !isDomainRoute
        ? {
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `${name} services`,
              itemListElement: relatedServices.map((itemOffered) => ({
                '@type': 'Offer',
                itemOffered,
              })),
            },
          }
        : {}),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function addJsonLd(data: string): void {
  try {
    JSON.parse(data);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.angelRuntimeJsonld = 'true';
    script.text = data;
    document.head.appendChild(script);
  } catch {
    // Invalid structured data is not injected into the live document.
  }
}

export function applySeo(page: SeoData): void {
  const currentCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '';
  const routeChanged = currentCanonical !== page.canonical;

  document.title = page.title || 'Angel Creations | Immersive Experiences, VR, AR & Film';
  upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: page.robots || 'noindex, follow' });
  syncCanonical(page.canonical);

  const existingJsonLd = [...document.head.querySelectorAll('script[type="application/ld+json"]')];
  const staticJsonLd = existingJsonLd.filter(
    (item) => !item.hasAttribute('data-angel-runtime-jsonld')
  );

  if (routeChanged) {
    document.head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((item) => item.remove());
    existingJsonLd.forEach((item) => item.remove());
  } else {
    // Keep a static document's own schema on first load, but always refresh the runtime
    // copy. This also makes repeated effects (including development StrictMode) idempotent.
    existingJsonLd
      .filter((item) => item.hasAttribute('data-angel-runtime-jsonld'))
      .forEach((item) => item.remove());
  }

  const image = page.meta['og:image'];
  const socialMeta: Record<string, string> = page.canonical ? {
    'og:type': 'website',
    'og:site_name': 'Angel Creations',
    'og:locale': 'en_IN',
    'og:title': page.meta['og:title'] || page.title,
    'og:description': page.meta['og:description'] || page.description,
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': page.meta['og:title'] || page.title,
    'twitter:description': page.meta['og:description'] || page.description,
    ...page.meta,
  } : {};
  if (page.canonical) socialMeta['og:url'] = page.canonical;
  if (image) socialMeta['twitter:image'] = image;

  Object.entries(socialMeta).forEach(([key, content]) => {
    if (!content) return;
    if (key.startsWith('og:')) {
      upsertMeta(`meta[property="${key}"]`, { property: key, content });
    } else if (key.startsWith('twitter:')) {
      upsertMeta(`meta[name="${key}"]`, { name: key, content });
    }
  });

  if (routeChanged || staticJsonLd.length === 0) {
    const schema = buildRouteSchema(page);
    if (schema) addJsonLd(schema);
    // Supplemental entities (FAQ and service catalogues) are present in direct-load static
    // documents. Add the runtime copy only when this effect is rebuilding route schema,
    // which prevents duplicate FAQ/ItemList entities on first load.
    page.jsonLd.forEach(addJsonLd);
  }
}
