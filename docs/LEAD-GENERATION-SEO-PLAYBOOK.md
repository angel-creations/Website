# Angel Creations — Lead Generation Machine & All-Level SEO Playbook

**Date:** 28 October 2026  
**Scope:** Conversion architecture, lead qualification, analytics readiness, technical SEO, commercial-intent metadata, topical/internal linking, entity/local/global SEO, FAQ and AI-search support, image SEO, and safe image-performance improvements.  
**Status:** Implemented and verified locally. Nothing in this work has been committed or pushed.

> **Addendum (28 October 2026, owner direction):** the Contact page itself was restored in full to the original enquiry wizard — the on-page qualification extras, brief scoring, instant roadmap, FAQ section/schema and endpoint submission described below were retired from `/contact/`. Footer text was likewise restored to the original wording, and the footer was later removed from the contact page entirely. Contextual CTAs across the site still link to `/contact/` (the original wizard still honours the `?discipline=` prefill), and all other SEO/schema/architecture work remains in place. Sections below that describe the enhanced contact experience are retained as a record of what was built and can be re-enabled on request.
>
> **Addendum (analytics live):** Google Tag Manager container **GTM-MMFB2VZ** is installed on all 93 generated documents (head snippet + noscript iframe, including status pages), and the Search Console ownership token `public/googleb16a568f6f3a241d.html` ships with the build. `trackLeadEvent` already pushes to `window.dataLayer`, so `lead_cta_click`, `lead_email_click` and `lead_call_click` are immediately available as GTM Custom Event triggers; SPA navigations additionally push a GA4-shaped `page_view` (`page_path`, `page_location`, `page_title`) from `App.tsx`.

---

## 1. Executive verdict

Angel Creations now behaves as a coordinated lead-generation system rather than a portfolio with a generic contact page.

Every important service surface can send a visitor into a contextual enquiry with the discipline, service topic, intended outcome, source page, campaign attribution, and preferred next step already attached. The contact experience then qualifies the enquiry, scores brief completeness, generates an instant production roadmap, and gives the visitor four low-friction ways to act: email, call, copy, or download. A direct CRM/form endpoint can be activated through one build-time environment variable.

SEO now works at every practical on-site level:

- **Technical:** 85 indexable route documents, canonicals, robots, sitemap, static fallbacks, clean status handling, and valid structured data.
- **Commercial intent:** buyer-focused titles and descriptions for the homepage, seven parent services, eight capabilities, About, Works, Contact, the domain directory, and all 63 domain services.
- **Topical authority:** Home → seven parent experiences → 63 specialist domains, reinforced by eight capabilities that each link into six relevant domains.
- **Entity/local/global:** `en-IN`/`en_IN`, Jaipur/Rajasthan/India and Braintree/UK entity context, worldwide service area, rich Organization and Service schema.
- **FAQ/AI discovery:** 72 FAQPage entities in static output and a generated `llms.txt` with 81 canonical service/company links.
- **Image search/performance:** an image sitemap with 85 unique images and WebP derivatives for the domain library.

No pricing, ratings, testimonials, response-time guarantees, street addresses, calendar links, WhatsApp availability, or performance claims were invented.

---

## 2. Conversion architecture

### 2.1 Lead engine

`src/utils/leads.ts` is now the central conversion layer. It provides:

- Verified business/support contacts and `+91 80584 65733`.
- Four lead intents:
  1. **Free Project Roadmap**
  2. **Discovery Call**
  3. **Scope & Estimate**
  4. **General Project** fallback
- Contextual `/contact/` URL generation with:
  - `discipline`
  - `intent`
  - `source`
  - `topic`
  - `goal`
- Route-to-discipline mapping for parents, capabilities, domains, works, About, footer, and directory traffic.
- Session attribution for first/latest landing page, referrer, UTM fields, `gclid`, `fbclid`, and `msclkid`.
- Privacy-conscious analytics events through `window.dataLayer` and a DOM `angel:lead-event` CustomEvent.
- A deterministic brief-strength score from 0–100.
- An instant, intent-aware production roadmap.
- Optional JSON submission to `VITE_LEAD_FORM_ENDPOINT`.

### 2.2 Contextual entry points

Tracked, pre-filled enquiry paths now exist from:

- All **63 domain detail pages** (hero CTA and final lead band).
- All **8 capability pages** (hero CTA and final lead band).
- The **seven parent experience pages** (hero and finale CTAs, while preserving approved labels).
- The **domain directory**, including dynamic context from the selected experience/search and the no-results state.
- The **Works archive**, using the active work/category as enquiry context.
- **About**.
- The **site footer headline and primary Contact link**.

The reusable `LeadCtaBand` gives each context a roadmap CTA plus call/email alternatives without rebuilding the same conversion block in every component.

### 2.3 ContactWizard qualification flow

The upgraded contact experience now:

- Shows three explicit offers: Free Project Roadmap, Discovery Call, and Scope & Estimate.
- Reads intent, discipline, source, topic, and goal from the URL.
- Displays a visible “Brief pre-set” context banner.
- Restores an in-progress draft from local storage in the same browser.
- Clearly states that nothing is sent until the visitor chooses a channel.
- Tracks form view, intent selection, step completion, reset, brief-ready, email, call, copy, download, and endpoint outcomes—without sending answer values to analytics events.
- Shows live brief strength while answering.
- Allows optional questions to be skipped.
- Produces a prepared brief with:
  - Requested next step
  - Source/topic/goal context
  - All answers
  - Score and missing estimate boosters
  - Instant production roadmap
  - Campaign/source attribution
- Supports:
  - Subject-rich pre-addressed business email
  - Copy full brief
  - Download brief as text
  - Click-to-call
  - Optional direct endpoint submission
- Moves keyboard focus and scroll position to “Your project brief is ready” after preparation.
- Explains the next three steps and answers five planning FAQs.

### 2.4 Direct-submission activation

Direct submission is intentionally endpoint-agnostic because no CRM/form backend URL was supplied.

1. Copy `.env.example` to the deployment environment configuration.
2. Set:

   ```dotenv
   VITE_LEAD_FORM_ENDPOINT=https://your-secure-lead-endpoint.example/leads
   ```

3. Rebuild the site. Vite environment values are compiled at build time and must never contain secret API keys.
4. Make the endpoint accept a JSON `POST`, return HTTP 2xx, validate server-side, apply CORS for `https://angelcreations.in`, and add server-side spam/rate controls.

Payload sent by the site:

```json
{
  "submittedAt": "ISO-8601 timestamp",
  "intent": "project-roadmap",
  "intentLabel": "Free Project Roadmap",
  "context": {
    "sourceRoute": "/virtual-reality/healthcare/",
    "topic": "VR for Healthcare",
    "goal": "Surgical Rehearsal & Therapeutic VR Rehabilitation"
  },
  "answers": {
    "name": "...",
    "company": "...",
    "email": "...",
    "phone": "...",
    "projectType": "Virtual Reality (VR)",
    "description": "...",
    "timeline": "...",
    "investment": "..."
  },
  "briefStrength": {
    "score": 84,
    "label": "Strong project brief",
    "missingBoosters": ["company or brand", "direct phone number"]
  },
  "roadmap": ["..."],
  "attribution": {
    "firstLandingPage": "...",
    "lastLandingPage": "...",
    "referrer": "...",
    "utmSource": "...",
    "utmMedium": "...",
    "utmCampaign": "..."
  },
  "page": "https://angelcreations.in/contact/?...",
  "summary": "Full formatted project brief"
}
```

If no endpoint is configured, the email/copy/download/call flow remains fully functional.

---

## 3. SEO implementation

### 3.1 Commercial-intent metadata

`src/data/routeSeo.json` now contains 23 records. Twenty commercial records were refreshed or added, including a first-class `/domains/` record. The language now targets real buyer intent such as:

- “XR, Animation & Film Studio in India”
- “Virtual Reality Development Company in India”
- “Augmented Reality Development Services”
- “2D & 3D Animation Studio, VFX Services”
- “Film & Video Production Company in India”
- “Get a Free Project Roadmap”
- “63 XR, Animation, Film & Brand Services”

All 63 domain descriptions now use a consistent service + differentiator/subtitle + deliverable + free-roadmap structure while remaining unique and within the audit limit.

Across all 85 indexable documents:

- **85 unique titles**
- **85 unique descriptions**
- Title length: **30–65 characters**
- Description length: **118–158 characters**
- No duplicate title/description failures
- No missing canonicals

### 3.2 Technical SEO

- Static HTML exists for all 85 indexable routes and 93 total HTML outputs, including status/alias documents.
- Canonicals are absolute and route-accurate; only `/work/` intentionally canonicalizes to `/works/`.
- `robots.txt` allows crawling and references the sitemap.
- `sitemap.xml` contains 85 canonical URLs and 85 image entries.
- Error/alias documents remain non-indexable where appropriate.
- `lang="en-IN"` and `og:locale="en_IN"` are synchronized across runtime and static output.
- Open Graph/Twitter image type and dimensions are now accurate for curated social cards; non-curated domain visuals do not falsely claim 1200×630.
- Boot/degraded fallbacks preserve readable content if JavaScript assets fail.

### 3.3 Topical architecture and internal linking

The crawl and conversion graph is now:

```text
Home
├─ 7 parent experience services
│  └─ 63 dedicated domain services
├─ Works (47 productions)
├─ About
│  └─ 8 capabilities
│     └─ 6 curated specialist domains per capability
├─ Domain directory (all 63 domains)
└─ Contact / Free Project Roadmap
```

Additional reinforcement:

- Parent pages expose ItemLists of their child domain services.
- Domain pages link to parent, siblings, capabilities, Works, the full directory, and a contextual enquiry.
- Capability pages deep-link to six relevant domains rather than ending at a generic overview.
- Static no-JavaScript navigation now includes All Domains.
- Static fallback documents mirror the specialist-domain and FAQ internal links.

The end-to-end crawl found **2,775 static anchor instances**, **163 unique internal targets** (including intentional contextual contact variants), and **zero broken internal targets**.

### 3.4 Structured data and entity SEO

Static output includes valid JSON-LD with top-level graph counts:

| Entity | Count |
| --- | ---: |
| Organization | 85 |
| WebSite | 85 |
| BreadcrumbList | 85 |
| WebPage | 83 |
| Service | 78 |
| ImageObject | 77 |
| FAQPage | 72 |
| ItemList | 9 |
| CollectionPage | 2 |

Organization/service data now includes, where supported by known business facts:

- Business and support contact points
- Telephone
- Jaipur, Rajasthan, India
- Braintree, United Kingdom client-desk location
- India, United Kingdom, and Worldwide service areas
- `knowsAbout` service expertise
- Slogan
- ServiceChannel pointing to `/contact/`
- Terms of Service URL
- Parent/child Service relationships

Domain, capability, and contact FAQs are visible on-page and represented in schema. Runtime SPA navigation adds the same supplemental FAQ/ItemList entities once; direct static loads avoid duplication.

### 3.5 Local and international positioning

The site consistently signals:

- English (India) as the primary document locale.
- Jaipur/India as the studio base.
- Braintree/UK as an international client desk.
- Worldwide delivery.

No street address or map pin was added because no verified address was supplied. A Google Business Profile should only be created/claimed with an eligible real business address or a correctly configured service-area setup.

### 3.6 AI-search and answer-engine support

`public/llms.txt` is generated from the live service/domain registries during the build. It includes:

- A factual company summary
- Contact and location information
- Seven core experience areas
- Eight capabilities
- All 63 specialist domain services
- 81 unique canonical links; every linked route exists in the sitemap

This is an emerging discovery aid, not a ranking guarantee. The underlying static HTML, clear headings, FAQs, and schema remain the primary machine-readable foundation.

### 3.7 Image SEO and performance

All 63 domain application visuals are now WebP in the rendered site.

| Visual set | Before | After | Saving |
| --- | ---: | ---: | ---: |
| 53 converted JPG/PNG files | 8,135,684 B | 2,832,324 B | **5,303,360 B / 65.2%** |
| All 63 domain visuals (including 10 existing WebP) | 9,054,336 B equivalent | 3,750,976 B | **58.6%** |

Derivatives are capped at 1920px on the longest edge, orientation-corrected, stripped of unnecessary metadata, and encoded at quality 82. Original masters remain in the repository/public folder, so deployment-package size is larger even though browser transfer for domain cards/pages is substantially lower.

Production bundle highlights:

- CSS: 378.62 kB raw / 61.99 kB gzip
- Main JS: 307.40 kB raw / 92.25 kB gzip
- ContactWizard lazy chunk: 31.44 kB raw / 9.65 kB gzip
- Lead CTA band lazy chunk: 2.35 kB raw / 0.87 kB gzip

---

## 4. Analytics event dictionary

No analytics vendor script was installed because no GA4/GTM property or consent configuration was supplied. The site emits vendor-neutral events to `window.dataLayer` and dispatches `angel:lead-event`, making it ready for Google Tag Manager, GA4, Meta, LinkedIn, or a first-party collector.

| Event | Meaning | Recommended use |
| --- | --- | --- |
| `lead_cta_click` | A tracked enquiry CTA was clicked | CTA engagement by page/topic |
| `lead_form_view` | ContactWizard was viewed | Form-start denominator |
| `lead_intent_selected` | Roadmap/discovery/estimate offer changed | Offer demand |
| `lead_form_step_complete` | A step was completed; includes step/field, not the answer | Funnel drop-off |
| `lead_brief_ready` | A complete brief was prepared | High-intent micro-conversion |
| `lead_email_open` | Prepared email draft action clicked | Lead initiated; not proof the email was sent |
| `lead_email_click` | Other business/support email link clicked | Direct-contact engagement |
| `lead_call_click` | Telephone link clicked | Call intent |
| `lead_brief_copy` | Brief copied | Assisted/manual enquiry intent |
| `lead_brief_download` | Brief downloaded | Assisted/manual enquiry intent |
| `lead_submit_success` | Configured endpoint accepted the lead | **Primary conversion** |
| `lead_submit_error` | Configured endpoint failed | Reliability alert |
| `lead_form_reset` | Form reset | UX/friction analysis |

Common parameters include `pagePath`, `intent`, `sourceRoute`, `topic`, `cta`, `step`, `field`, `briefStrength`, and `channel` when relevant. Test verification confirmed that names, email addresses, and other direct answer values are not included in the captured analytics payload.

### Recommended KPI funnel

1. Organic impressions and CTR by service cluster (Search Console)
2. Landing sessions by parent/capability/domain
3. CTA click rate = `lead_cta_click` ÷ engaged sessions
4. Form completion rate = `lead_brief_ready` ÷ `lead_form_view`
5. Lead action rate = endpoint success + email-open + call ÷ brief-ready
6. Step abandonment = users reaching a step − users completing it
7. Qualified-lead rate from CRM, joined back by UTM/source/topic
8. Proposal and revenue rate by service topic and campaign

Use a consent-compliant tag setup for the markets served, and keep PII out of analytics platforms.

---

## 5. Verification evidence

| Verification | Result |
| --- | --- |
| Production build (`npm run build`) | **Passed** — 85 modules; 85 route documents; 93 HTML files |
| Dev smoke (`npm run test:smoke`) | **46/46 passed** |
| Static smoke (`npm run test:static`) | **46/46 passed** |
| Boot fallback (`npm run test:fallback`) | **Passed** |
| Degraded boot (`npm run test:degraded`) | **Passed** — 6 routes remain readable with JS assets forced to 404 |
| Static SEO audit (`auditStaticOutput.mjs`) | **Passed** — 93 documents, 85 sitemap routes, every failure list empty |
| End-to-end audit (`auditEndToEnd.mjs`) | **Passed** — 85/85 routes OK, 0 broken internal targets, 0 missing assets, 0 social issues |
| Dedicated lead-flow browser QA | **45/45 passed** |
| Runtime/static schema QA | **29/29 passed on preview and 29/29 on dev** |
| Domain directory/detail verifier | **Passed** |
| Whole-card domain-link verifier | **Passed** |
| Homepage restore verifier | **Passed** |
| Header-label verifier | **Passed** |
| Slider hero-button verifier | **Passed** |
| World-class immersive verifier | **Passed** |
| `git diff --check` | **Passed** |

Lead-flow browser evidence is retained in `.playwright-artifacts/lead-gen/` (ignored from Git by the repository’s existing Playwright-artifact rule).

---

## 6. Owner launch checklist

These items require business accounts, credentials, or verified facts and therefore cannot be completed truthfully from code alone.

### Measurement and lead operations

- [ ] Install GTM/GA4 through the chosen consent framework.
- [ ] Create Custom Event triggers for the lead events above.
- [ ] Mark `lead_submit_success` as the primary conversion if the endpoint is enabled; otherwise treat `lead_email_open` and `lead_call_click` as lead-initiated events.
- [ ] Connect `VITE_LEAD_FORM_ENDPOINT` to the CRM/inbox workflow and test one complete lead.
- [ ] Define CRM stages: New → Contacted → Discovery → Qualified → Proposal → Won/Lost.
- [ ] Decide an internal response SLA; do not publish it until operations can meet it.
- [ ] Use consistent UTM naming for LinkedIn, Instagram, YouTube, email, partners, and paid campaigns.

### Search platforms and authority

- [ ] Submit `https://angelcreations.in/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] Inspect and request indexing for Home, Contact, Domains, the seven parents, and priority money domains after deployment.
- [ ] Create/claim Google Business Profile only with eligible, verifiable Jaipur business details; keep name, phone, website, services, and hours consistent.
- [ ] Add the website and priority service URLs to real YouTube video descriptions, LinkedIn, Instagram, partner pages, and relevant industry directories.
- [ ] Publish permission-based case studies for the 47-work archive: client/sector, challenge, solution, deliverables, process, visuals/video, and measurable outcome only when verified.
- [ ] Add testimonials/reviews only from real, permissioned clients; never add rating schema without genuine review data and a compliant collection process.
- [ ] Expand high-demand domain pages using real sales questions, project constraints, delivery formats, equipment/platform decisions, and budget guidance only where the studio can support it.
- [ ] Avoid thin city-page duplication. Build location content only around real delivery capability, projects, partnerships, or service coverage.

### Conversion experiments to run after baseline data exists

- Offer order: Roadmap first vs Discovery Call first.
- CTA wording: “Get My Free Roadmap” vs “Plan My Project.”
- Domain hero proof placement using real related-work thumbnails.
- Short-form first step for paid traffic vs the full qualification flow.
- Capability-page specialist-domain ordering based on enquiry demand.
- Works-page “Create something like this” placement.

Measure experiments by qualified leads and proposals, not clicks alone.

---

## 7. Key files

- `src/utils/leads.ts` — lead intents, contextual URLs, attribution, events, scoring, roadmaps, endpoint
- `src/components/ContactWizard.tsx` — qualification and prepared-brief experience
- `src/components/LeadCtaBand.tsx` — reusable conversion band
- `src/data/leadFaqs.ts` — contact and capability FAQs
- `src/data/routeSeo.json` — commercial route metadata
- `src/data/domains.ts` — 63-domain registry, FAQs, generated SEO copy
- `src/data/capabilities.ts` — capability-to-domain relationships
- `src/data/explorerVisuals.json` — WebP domain-visual registry
- `src/app/App.tsx` — runtime attribution, supplemental schema, fallback click tracking
- `src/utils/seo.ts` — runtime entity/service schema and social metadata
- `scripts/generateStaticFallbacks.mjs` — static SEO/schema, image sitemap, robots, `llms.txt`
- `scripts/auditEndToEnd.mjs` — updated to expect `en_IN`
- `.env.example` — optional lead endpoint configuration
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt` — generated discovery files

---

## 8. Final assessment

The on-site system is ready to generate, qualify, attribute, and measure leads. Search engines receive complete static documents, unique commercial metadata, rich entity/service/FAQ data, an image sitemap, and a clean 85-route topical architecture. Visitors receive a relevant offer at every high-intent service moment and a useful roadmap before being asked to commit.

The remaining growth levers are off-site and operational: analytics/CRM connection, Search Console submission, eligible local profiles, authoritative backlinks, real case-study depth, and consistent follow-up. Those are the inputs that turn this implemented machine into compounding pipeline over time.
