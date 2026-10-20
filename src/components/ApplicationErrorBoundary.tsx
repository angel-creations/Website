import { Component, type ErrorInfo, type ReactNode } from 'react';

type ApplicationErrorBoundaryProps = {
  children: ReactNode;
};

type ApplicationErrorBoundaryState = {
  hasError: boolean;
};

export class ApplicationErrorBoundary extends Component<
  ApplicationErrorBoundaryProps,
  ApplicationErrorBoundaryState
> {
  state: ApplicationErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep diagnostics local; the site has no error-reporting service configured.
    console.error('Angel Creations application rendering failed.', error, info.componentStack);
  }

  private reloadPage = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main id="main" className="angel-app-error" aria-labelledby="app-error-title">
        <section className="angel-app-error__content">
          <p className="angel-app-error__eyebrow">Angel Creations <span>/ Application issue</span></p>
          <p className="angel-app-error__code">THE EXPERIENCE PAUSED <span aria-hidden="true">—</span> RETRY</p>
          <h1 id="app-error-title">This page didn’t load as expected.</h1>
          <p className="angel-app-error__description" role="alert">
            A technical problem interrupted this page. You can try reloading it, return to the home page, or contact the studio.
          </p>
          <nav className="angel-app-error__actions" aria-label="Recover from the page error">
            <button type="button" onClick={this.reloadPage}>Reload page</button>
            <a href="/">Back to home</a>
            <a href="/contact/">Contact the studio</a>
          </nav>
        </section>
      </main>
    );
  }
}
