type NetworkInformation = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithNetworkInformation = Navigator & {
  connection?: NetworkInformation;
};

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getNetworkInformation(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as NavigatorWithNetworkInformation).connection;
}

export function prefersReducedData(): boolean {
  const connection = getNetworkInformation();
  return Boolean(
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  );
}

export function shouldAutoplayAmbientMedia(): boolean {
  return !prefersReducedMotion() && !prefersReducedData();
}
