import { useEffect, useState } from 'react';
import { LegacyRenderer } from './LegacyRenderer';
import type { LegacyPage } from '../types/legacy';
import { LegacyFooter } from './LegacyFooter';
import { NotFoundPage } from './NotFoundPage';

type LegacyFallbackPayload = Pick<LegacyPage, 'route' | 'status' | 'children'>;

function fallbackFileForRoute(route: string): string {
  const slug = route.replace(/^\/+|\/+$/g, '').replace(/\//g, '--') || 'home';
  return `/legacy-page-fallbacks/${slug}.json`;
}

/**
 * Route-scoped compatibility fallback for explicitly whitelisted public routes.
 * The build emits one small JSON payload per public route; only the requested route
 * is fetched, and only when no dedicated Angel component handles that route.
 */
export function PublicLegacyFallback({ route }: { route: string }): JSX.Element {
  const [page, setPage] = useState<LegacyFallbackPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setPage(null);
    setFailed(false);

    fetch(fallbackFileForRoute(route), { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new Error(`Archived route returned ${response.status}.`);
        return response.json() as Promise<LegacyFallbackPayload>;
      })
      .then((record) => {
        if (active) setPage(record);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => { active = false; };
  }, [route]);

  if (!page && !failed) {
    return <main id="main" className="site-main"><p className="angel-route-loading" aria-live="polite">Loading archived page.</p></main>;
  }

  if (!page || page.status !== 200 || page.route !== route) {
    return (
      <>
        <NotFoundPage attemptedPath={route} />
        <LegacyFooter />
      </>
    );
  }

  // The global footer is the current site-wide shell; do not duplicate the captured theme footer.
  const contentNodes = page.children.filter((node) => !(node.type === 'element' && node.tag === 'footer'));
  return (
    <>
      <LegacyRenderer nodes={contentNodes} route={page.route} />
      <LegacyFooter />
    </>
  );
}
