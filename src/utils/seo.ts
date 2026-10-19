import type { SeoData } from '../types/legacy';
import { resolveJsonLdUploads, socialTagsFor } from './social';

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

export function applySeo(page: SeoData): void {
  document.title = page.title || 'Angel Creations - A Creative Powerhouse';
  upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: page.robots || 'noindex, nofollow' });

  if (page.canonical) {
    upsertCanonical(page.canonical);
  }

  // The captured social tags are kept, and the ones the source never carried are filled in. Any
  // captured upload under /wp-content is replaced by the site's share card, because the static
  // build does not serve that path.
  Object.entries(socialTagsFor(page.meta)).forEach(([key, content]) => {
    if (key.startsWith('og:')) {
      upsertMeta(`meta[property="${key}"]`, { property: key, content });
    }
    if (key.startsWith('twitter:')) {
      upsertMeta(`meta[name="${key}"]`, { name: key, content });
    }
  });

  document.head.querySelectorAll('script[data-legacy-jsonld="true"]').forEach((item) => item.remove());
  page.jsonLd.forEach((data) => {
    try {
      JSON.parse(data);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.legacyJsonld = 'true';
      // Captured upload URLs point at the preserved copies the build actually serves.
      script.text = resolveJsonLdUploads(data);
      document.head.appendChild(script);
    } catch {
      // A malformed legacy structured-data block stays in the raw evidence but is not executed locally.
    }
  });
}
