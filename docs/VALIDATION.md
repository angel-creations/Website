# Local Validation

**Validation date:** 2026-10-05 (local-only)

## Commands run

```bash
npm install
npm run build
npm audit --json
npm run preview -- --port 4173
```

## Results

| Check | Result |
|---|---|
| TypeScript build | Passed (`tsc -b`) |
| Vite production build | Passed (Vite 6.4.3) |
| Production dependency audit | 0 vulnerabilities |
| Full dependency audit | 0 vulnerabilities |
| Preview server | Started on `0.0.0.0:4173` and accepts the sandbox preview host |
| Direct HTML route checks | 55/55 React route records returned HTTP 200 and the React root |
| Archived asset checks | 113/113 inventoried downloaded asset URLs returned HTTP 200 |
| CSS font-compatibility mirror | 4/4 representative legacy relative font paths returned HTTP 200 |
| Feed source documents | Preserved under `docs/live-html/feed/` and `docs/live-html/comments/feed/`; not rendered as SPA pages |

## Route-test scope

The direct route test covered every captured `text/html` source record: all content pages, search/pagination paths, work entries, alias paths, captured linked legacy `.html`/work paths that currently produce an HTTP 404 template, taxonomy-like literal-space paths, and the intentional live 404 test route.

## Runtime/visual limitation

This workspace did not contain a browser binary or browser automation runtime. Therefore console output, click-through visual interaction, original-vs-local screenshots, and pixel comparison were **not** claimed as browser-verified. The local production server was tested at HTTP level only. The exact screenshot follow-up matrix is in [`baseline/README.md`](./baseline/README.md).

## Build observation retained, not optimised

Vite emitted a chunk-size advisory because the React bundle embeds typed representations of the captured page content. It is a non-fatal build warning. No code-splitting/content optimisation was applied in this preservation phase.
