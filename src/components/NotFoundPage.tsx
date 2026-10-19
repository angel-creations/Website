type NotFoundPageProps = {
  attemptedPath?: string;
  statusCode?: 404 | 410;
};

export function NotFoundPage({ attemptedPath, statusCode = 404 }: NotFoundPageProps): JSX.Element {
  const requestedPath = attemptedPath?.trim();
  const isGone = statusCode === 410;
  const statusLabel = isGone ? 'Retired experience' : 'Error 404';

  return (
    <main id="main" className="site-main angel-not-found">
      <section className="angel-not-found__layout" aria-labelledby="not-found-title">
        <div className="angel-not-found__visual" aria-hidden="true">
          <span className="angel-not-found__visual-label">SIGNAL / {statusCode}</span>
          <span className="angel-not-found__orbit angel-not-found__orbit--outer" />
          <span className="angel-not-found__orbit angel-not-found__orbit--middle" />
          <span className="angel-not-found__orbit angel-not-found__orbit--inner" />
          <span className="angel-not-found__planet">
            <span>{statusCode}</span>
            <i />
          </span>
          <span className="angel-not-found__visual-coordinate">{isGone ? 'AC / RETIRED' : 'AC / LOST IN SPACE'}</span>
        </div>

        <div className="angel-not-found__content">
          <p className="angel-not-found__eyebrow">Angel Creations <span>/ {statusLabel}</span></p>
          <p className="angel-not-found__code">
            {isGone ? 'EXPERIENCE RETIRED' : 'PAGE NOT FOUND'} <span aria-hidden="true">—</span> {statusCode}
          </p>
          <h1 id="not-found-title">
            {isGone ? <>This experience has <em>retired.</em></> : <>This page is <em>out of orbit.</em></>}
          </h1>
          <p className="angel-not-found__description">
            {isGone
              ? 'The old 360 video address has been retired. Explore current work or contact the studio for help finding something.'
              : 'That address doesn’t lead to a page here. Let’s get you back to something worth exploring.'}
          </p>

          {requestedPath ? (
            <div className="angel-not-found__requested">
              <span>Requested address</span>
              <code>{requestedPath}</code>
            </div>
          ) : null}

          <nav className="angel-not-found__actions" aria-label="Continue exploring Angel Creations">
            <a className="angel-not-found__action angel-not-found__action--primary" href="/">
              <span>Back to home</span><span aria-hidden="true">↗</span>
            </a>
            <a className="angel-not-found__action" href="/works/">Explore the work</a>
            <a className="angel-not-found__action" href="/contact/">Contact the studio</a>
          </nav>

          <p className="angel-not-found__footnote">
            {isGone ? 'THE OLD ROUTE IS RETIRED' : 'GOOD THINGS ARE STILL AHEAD'} <span aria-hidden="true">·</span> KEEP EXPLORING
          </p>
        </div>
      </section>
    </main>
  );
}
