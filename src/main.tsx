import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import { App } from './app/App';
import { ApplicationErrorBoundary } from './components/ApplicationErrorBoundary';
import './styles/angel/structural-app.css';
import './styles/angel/structural-custom.css';
import './styles/angel/structural-dark-mode.css';
import './styles/baseline.css';
import './styles/enhancements.css';
import './styles/inner-experiences.css';
import './styles/immersive.css';
import './styles/domains.css';
import './styles/lead-generation.css';
/* Responsive layer (max-width: 1024px only) — must stay last. */
import './styles/responsive.css';

const container = document.getElementById('root')!;

createRoot(container).render(
  <StrictMode>
    <ApplicationErrorBoundary>
      <App />
    </ApplicationErrorBoundary>
  </StrictMode>,
);

// Every document carries a hidden boot fallback that a watchdog reveals when this bundle
// cannot run (a host publishing the repository root, or a cached document pointing at a
// bundle a later deploy replaced). Remove it once the app has actually committed; React
// renders asynchronously, so watch the container instead of assuming the first frame wins.
function dropBootFallback(): void {
  const fallback = document.getElementById('boot-fallback');
  if (!fallback) return;
  fallback.remove();
  document.documentElement.removeAttribute('data-boot-stalled');
}

if (container.childElementCount > 0) {
  dropBootFallback();
} else {
  const observer = new MutationObserver(() => {
    if (container.childElementCount === 0) return;
    observer.disconnect();
    dropBootFallback();
  });
  observer.observe(container, { childList: true });
}
