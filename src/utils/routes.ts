const LOCAL_HOSTS = new Set(['angelcreations.in', 'www.angelcreations.in']);

export function normaliseRoute(route: string): string {
  const queryIndex = route.search(/[?#]/);
  const pathname = queryIndex === -1 ? route : route.slice(0, queryIndex);
  const suffix = queryIndex === -1 ? '' : route.slice(queryIndex);
  let normalisedPath = pathname || '/';

  // The captured site uses /works/. Preserve its one canonical spelling while accepting the
  // obvious singular request and normalising extension-free internal route paths.
  if (normalisedPath === '/work' || normalisedPath === '/work/') normalisedPath = '/works/';
  if (normalisedPath !== '/' && !normalisedPath.endsWith('/') && !normalisedPath.split('/').pop()?.includes('.')) normalisedPath = `${normalisedPath}/`;

  return `${normalisedPath}${suffix}`;
}

export function currentRoute(): string {
  return normaliseRoute(`${window.location.pathname}${window.location.search}`);
}

export function isInternalHref(href: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  if (href.startsWith('/')) {
    return true;
  }

  try {
    return LOCAL_HOSTS.has(new URL(href).hostname);
  } catch {
    return false;
  }
}

export function toLocalRoute(href: string): string {
  if (href.startsWith('/')) {
    return normaliseRoute(href);
  }

  const url = new URL(href);
  return normaliseRoute(`${url.pathname}${url.search}`);
}

export function navigate(route: string, state: Record<string, unknown> = {}): void {
  const nextRoute = toLocalRoute(route);
  if (nextRoute === currentRoute()) {
    return;
  }
  window.history.pushState(state, '', nextRoute);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
