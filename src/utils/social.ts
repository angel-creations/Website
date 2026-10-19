/*
 * Shared social metadata for the site's public surfaces.
 *
 * The captured WordPress source published one share image for the whole site:
 *   https://angelcreations.in/wp-content/uploads/2023/08/59c9d53b-…-1024x660.png
 * That binary was never duplicated into the preservation snapshot, and the static build does not
 * serve the /wp-content path, so the original card resolved to an HTML fallback instead of an
 * image on every route that referenced it. `public/social/angel-creations-card.png` replaces it:
 * the preserved "Angel Creations" wordmark on the site's own black field, rendered at 1024x660 —
 * the captured image's own geometry, so its og:image:width / og:image:height / og:image:type
 * stay truthful. See scripts/generateSocialCard.sh.
 *
 * The same applies to the captured structured data, which points a few ImageObject records at
 * uploads under /wp-content. The preservation manifest (docs/asset-manifest.json) records each
 * original upload together with the preserved copy and its SHA-256 digest; the mapping below is
 * taken from that manifest, so every rewritten reference is the file the build actually serves.
 */

/** The site's share card, at the captured share image's own 1024x660 geometry. */
export const SHARE_CARD = 'https://angelcreations.in/social/angel-creations-card.png';
export const SHARE_CARD_WIDTH = '1024';
export const SHARE_CARD_HEIGHT = '660';
export const SITE_NAME = 'Angel Creations - A Creative Powerhouse';
export const SITE_TWITTER = '@angelcreation0';

const UPLOAD_PREFIX = 'https://angelcreations.in/wp-content/uploads/';

/** Captured uploads that the captured structured data still points at, and where they live now. */
const preservedUploadPaths: Record<string, string> = {
  'https://angelcreations.in/wp-content/uploads/2022/12/about.jpg':
    '/legacy-assets/images/wp-content/uploads/2022/12/about.jpg',
  'https://angelcreations.in/wp-content/uploads/2023/01/logo.webp':
    '/legacy-assets/logos/wp-content/uploads/2023/01/logo.webp',
  // The captured site icon was never duplicated into the snapshot. The manifest-verified 64x64
  // Angel Creations icon stands in for it; it matches the width, height and caption the source
  // declared for that record.
  'https://angelcreations.in/wp-content/uploads/2023/01/logo-1-e1673178398663.webp':
    '/legacy-assets/logos/wp-content/uploads/2023/01/logo.webp',
};

/** True when a captured value points at an upload the static build does not serve. */
export function isCapturedUpload(value: string): boolean {
  return typeof value === 'string' && value.startsWith(UPLOAD_PREFIX);
}

/** A captured upload has no served original, so the site share card stands in for it. */
export function resolveSocialImage(value: string): string {
  if (!value) return value;
  return isCapturedUpload(value) ? SHARE_CARD : value;
}

/** Rewrites captured upload URLs inside a structured-data block to the preserved copies. */
export function resolveJsonLdUploads(json: string): string {
  return json.replace(
    /https:\/\/angelcreations\.in\/wp-content\/uploads\/[^"\\]+/g,
    (url) => {
      const preserved = preservedUploadPaths[url];
      return preserved ? `https://angelcreations.in${preserved}` : url;
    },
  );
}

/**
 * The social tags a route publishes, with the captured values kept and the missing ones filled.
 * Twitter does not fall back to og:image, so the twitter:image and twitter:card pair has to be
 * stated explicitly for a card to render. The declared image dimensions only describe the share
 * card, so they are left out when a route publishes its own image.
 */
export function socialTagsFor(meta: Record<string, string>, image = SHARE_CARD): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (!value) continue;
    if (key === 'og:image' || key === 'twitter:image') {
      resolved[key] = resolveSocialImage(value);
      continue;
    }
    resolved[key] = value;
  }
  const publishedImage = resolved['og:image'] ?? image;
  // A route that never carried a share image still publishes the site card, so every page has a
  // resolvable preview rather than none.
  resolved['og:image'] = publishedImage;
  const filled: Record<string, string> = {
    'og:site_name': SITE_NAME,
    'twitter:card': 'summary_large_image',
    'twitter:site': SITE_TWITTER,
    'twitter:image': publishedImage,
    ...resolved,
  };
  if (publishedImage === SHARE_CARD) {
    filled['og:image:width'] = SHARE_CARD_WIDTH;
    filled['og:image:height'] = SHARE_CARD_HEIGHT;
    filled['og:image:type'] = 'image/png';
  }
  return filled;
}
