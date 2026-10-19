# Hostinger deployment checklist

## Build contract

This repository is a Vite + React + TypeScript static-front-end site. The production build is:

```sh
npm ci
npm run build
```

The publishable website is the **contents of `dist/`**, not the repository root. The build also runs `scripts/generateStaticFallbacks.mjs`, which creates route-specific HTML documents, a sitemap and robots.txt.

## Important: do not deploy the repository root as a static website

The source `index.html` imports `/src/main.tsx`. That is a development entry point and is not a browser-ready production bundle. Deploying the repository root directly to a static document root can therefore leave the previous site visible or produce a broken page.

## Recommended deployment path

1. Run the GitHub Actions **Verify production build** workflow and confirm all steps pass.
2. Download the `angel-creations-dist` artifact from that successful run and inspect the extracted files. It contains the static output only.
3. Deploy to a **separate preview/staging target first**. Keep the existing production document root and DNS untouched during this test.
4. Verify the homepage, all generated routes, local stylesheet and video requests, mobile layout, contact flow, and browser console.
5. Only after the preview is approved, publish the contents of `dist/` to the actual production document root or configure Hostinger's Node.js web-app deployment with build command `npm run build` and output directory `dist`, depending on the hosting product in use.
6. Confirm the deployment commit and successful deployment in Hostinger's Deployments/Git history. Keep a recoverable copy of the currently live site before switching production files.

## Hostinger product distinction

Hostinger's regular **Advanced → Git** integration deploys repository files and is intended for static/PHP workflows; it does not imply that Vite's build runs automatically. Hostinger's **Node.js Web App** flow supports Vite builds on eligible plans and allows the output directory to be configured as `dist`. Select the flow that matches the actual hosting plan and current site setup.

## Do not guess these values

Before production cutover, confirm the domain's document root, whether the site is managed through regular Git or Node.js Web Apps, and whether any WordPress installation or other site shares that directory. Never overwrite a shared `public_html` until this is verified.
