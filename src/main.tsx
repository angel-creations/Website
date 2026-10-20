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
import './styles/baseline.css';
import './styles/enhancements.css';
import './styles/inner-experiences.css';

const container = document.getElementById('root')!;

createRoot(container).render(
  <StrictMode>
    <ApplicationErrorBoundary>
      <App />
    </ApplicationErrorBoundary>
  </StrictMode>,
);

// The pre-render fallback in index.html keeps the page readable if this bundle never
// runs (for example when a host publishes the repository root instead of the built
// site, so /src/main.tsx cannot execute). Remove it as soon as the app is on screen.
requestAnimationFrame(() => {
  if (!container.childElementCount) return;
  document.documentElement.classList.add('app-booted');
  document.getElementById('boot-fallback')?.remove();
});
