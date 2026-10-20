# Production white screen — diagnosis and fix

**Reported:** `https://angelcreations.in/` showed a blank white page.
**Diagnosed:** 2026-10-20, from GitHub Actions runners (read-only probes; see the
`live-site-diagnostics` job) and from a local rehearsal of the static build.

## What the live server was actually returning

| URL | Status | Body | Meaning |
|---|---|---|---|
| `/` | 200 | 3,157 bytes, contains `#root` but **no `/assets/*.js`** | the **repository source** `index.html` (the Vite dev entry, which loads `/src/main.tsx`) |
| `/about/`, `/works/`, `/contact/`, `/metaverse/` | 404 | Hostinger error page | route documents are not on the server |
| `/404.html`, `/robots.txt`, `/sitemap.xml` | 404 | Hostinger error page | nothing from the build is on the server |

3,157 bytes is exactly the size of `index.html` in the repository root. That document
loads `/src/main.tsx`, a TypeScript module that only exists while Vite is running. A
browser cannot execute it, no React bundle is ever loaded, and `#root` stays empty — a
white page.

So the domain's document root held the **repository source**, not the build output.

## Two defects, both fixed

### 1. Generated route documents had an unterminated `<script>` (build defect)

`scripts/generateStaticFallbacks.mjs` copied Vite's entry tag with a regex that matched
only the opening tag:

```html
<script type="module" crossorigin src="/assets/index-….js">   <!-- no </script> -->
```

Every generated route document (about, works, metaverse, contact, capabilities, …) shipped
like that. Browsers treat everything after an opened script element as script text, so
`<div id="root">` and the whole fallback were swallowed and the `<body>` ended up empty.
Only `/` (the document Vite writes itself) was intact.

Fixed by copying script tags with their closing tag, plus three guards:

- `scripts/generateStaticFallbacks.mjs` refuses to emit unbalanced script markup.
- `scripts/verifyStaticOutput.mjs` (part of `npm run build`) parses every document in
  `dist/` and fails if a route has no `#root`, no module entry, an unclosed script, or a
  reference to an asset that was not emitted.
- `npm run test:static` serves `dist/` the way a static host does (no SPA fallback) and
  Playwright-checks 18 routes at desktop and mobile.

### 2. The served directory is the repository, not `dist/` (hosting defect)

`.github/workflows/verify-production-build.yml` rsyncs `dist/` to
`HOSTINGER_DOCUMENT_ROOT` (`/home/…/domains/angelcreations.in/public_html`) and verifies it
over SSH. A deploy at 19:49 UTC did land — the built site was live for a few minutes — and
then the document root was replaced by repository source again. That is the signature of a
second, automatic deployment (Hostinger's **Advanced → Git** deployment) resetting the same
directory to the repository contents on every push.

The CI deploy cannot be permanent until the two deployments stop fighting.

## What to do in hPanel (choose one)

1. **Disable Hostinger's Git deployment for `angelcreations.in`** and let the GitHub Actions
   deploy own the document root. Optionally protect `main` so only reviewed merges deploy.
2. **Or** keep Hostinger's Git deployment and configure it to build the site: build command
   `npm run build`, output/public directory `dist`. A default Hostinger Git deployment does
   not run a build, so it will always publish the source tree.

After either change, the deploy job now proves the result over the public internet: it
fetches `https://angelcreations.in/`, requires a document that references a `/assets/*.js`
bundle, requires that bundle to return 200, and requires `/about/`, `/works/` and
`/contact/` to serve mountable documents. If the served document is the repository source
again, the job fails with that exact message instead of silently leaving a blank page.

Run it with **Actions → Verify production build → Run workflow** (the
`Live site diagnostics` job prints the same measurements for any branch push).

## Safety net: the source document can no longer be blank

`index.html` now renders a styled, fully readable fallback (`#boot-fallback`) immediately,
containing the headline, studio description and the full navigation. `src/main.tsx` removes
it as soon as the application mounts. If a host ever publishes the repository root again,
visitors see real content and working links instead of a white page.
`npm run test:fallback` asserts this by serving the repository root and checking the
rendered result.

## Verification commands

```bash
npm ci
npm run build          # includes verifyStaticOutput
npm run test:static    # Playwright against dist/ served like a static host
npm run test:fallback  # source document must never render blank
```
