import type { SeoData } from '../types/content';

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

function buildRouteSchema(page: SeoData): string | null {
  if (!page.canonical) return null;

  let pathname = '/';
  try {
    pathname = new URL(page.canonical).pathname;
  } catch {
    return null;
  }

  const name = page.title.split(' | ')[0] || page.title;
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://angelcreations.in/' },
  ];
  if (pathname.startsWith('/capabilities/')) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Capabilities',
      item: 'https://angelcreations.in/about/',
    });
  }
  if (pathname !== '/') {
    breadcrumbs.push({ '@type': 'ListItem', position: breadcrumbs.length + 1, name, item: page.canonical });
  }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': page.canonical,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${page.canonical}#breadcrumb`,
      itemListElement: breadcrumbs,
    },
  ];
  if (pathname.startsWith('/capabilities/')) {
    graph.push({
      '@type': 'Service',
      '@id': `${page.canonical}#service`,
      name,
      description: page.description,
      url: page.canonical,
      provider: { '@type': 'Organization', name: 'Angel Creations', url: 'https://angelcreations.in/' },
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

  if (routeChanged) {
    document.head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((item) => item.remove());
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((item) => item.remove());
  } else {
    document.head.querySelectorAll('script[data-source-jsonld="true"], script[data-angel-runtime-jsonld="true"]').forEach((item) => item.remove());
  }

  const image = page.meta['og:image'];
  const socialMeta: Record<string, string> = page.canonical ? {
    'og:type': 'website',
    'og:site_name': 'Angel Creations',
    'og:locale': 'en_US',
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

  if (routeChanged) {
    if (page.jsonLd.length) page.jsonLd.forEach(addJsonLd);
    else {
      const schema = buildRouteSchema(page);
      if (schema) addJsonLd(schema);
    }
  } else if (page.jsonLd.length && !document.head.querySelector('script[type="application/ld+json"]')) {
    page.jsonLd.forEach(addJsonLd);
  }
}
