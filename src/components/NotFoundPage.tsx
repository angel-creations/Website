export function NotFoundPage(): JSX.Element {
  return (
    <main id="main" className="site-main angel-not-found">
      <section aria-labelledby="not-found-title">
        <p className="angel-not-found__number" aria-hidden="true">404</p>
        <h1 id="not-found-title">This route is out of view.</h1>
        <p>The page is not part of the available Angel archive.</p>
        <nav aria-label="Continue exploring Angel"><a href="/">Return home</a><a href="/works/">Explore work</a><a href="/contact/">Start a project</a></nav>
      </section>
    </main>
  );
}
