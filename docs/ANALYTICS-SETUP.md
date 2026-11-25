# Measurement setup — GA4, GTM and Search Console

Everything in this file is dashboard configuration. No credentials are stored in
the repository, and none of it needs a code change: the site already emits every
event described here.

---

## 1. What the site emits today

Two analytics destinations are installed on all 95 generated documents:

| Destination | Identifier | Role |
| --- | --- | --- |
| Google Tag Manager | `GTM-MMFB2VZ` | Container, deliberately **tagless**. Receives every event on `window.dataLayer` for future tags. |
| GA4 Google tag | `G-T4G74DNBP9` | Direct `gtag.js` in the document head. This is what actually reports. |

Because GA4 runs from the direct Google tag, **do not add a GA4 configuration
tag inside GTM**. A second GA4 config would double every pageview and every
conversion.

`src/utils/analytics.ts` is the single place that sends an event. It pushes to
`window.dataLayer` *and* calls `window.gtag()`, so GTM can be given tags later
without a code change, and GA4 receives the event today.

## 2. The events, and what each one answers

| Event | Fires when | Key parameters | The question it answers |
| --- | --- | --- | --- |
| `page_view` | Every in-site navigation, after the title updates | `page_path`, `page_title` | Which pages get read, on which route |
| `form_start` | First keystroke in a form, **once per form per page load** | `form_name`, `source_route` | How many visitors begin an enquiry |
| `contact_step_complete` | Each advance through the 8-question wizard | `step_number` (1-based), `step_id`, `depth` | Which question loses people |
| `generate_lead` | The studio's EmailJS notification is accepted | `form_name`, `discipline`, `entry_intent`, `investment_band`, `timeline`, `landing_page`, `source_route`, `utm_source`, `utm_medium`, `utm_campaign` | How many enquirers converted, and what produced them |
| `lead_submit_error` | The delivery request failed | `form_name`, `source_route` | Whether the form itself is losing leads |
| `lead_cta_click` | Any link to `/contact/` | `source_route`, `destination`, `cta` | Which call to action earns the click |
| `lead_email_click` | Any `mailto:` link | `source_route` | Email enquiries that never reached the form |
| `lead_call_click` | Any `tel:` link | `source_route` | Phone enquiries, especially mobile |
| `outbound_click` | Any off-site link | `destination_host`, `link_kind` (`social` or `outbound`) | Whether visitors leave for Instagram/YouTube instead of converting |
| `internship_domain_select` | Discipline card opened in the form | `domain` | Which programme areas attract applicants |
| `internship_apply_click` | "Apply" scrolls to the form | — | Internship landing-page intent |
| `internship_application_submitted` | Studio notification accepted | `domain`, `form_name` | Application volume |
| `internship_application_error` | Delivery failed | — | Application loss |
| `internship_application_copy` | "Copy application" used | — | Fallback usage |
| `certificate_preview_open` | Certificate lightbox opened | `sourceRoute` | Trust-asset engagement |

**No personal data leaves the browser.** Names, emails, phone numbers and the
free-text project brief stay inside the EmailJS payload. `scripts/checkAnalytics.mjs`
asserts this: it fails if a visitor's email, phone, name or brief ever appears in
a `generate_lead` payload.

`investment_band` and `timeline` are text inputs with preset chips, so a visitor
can type anything into them. Only an exact match against a chip the studio wrote
is reported; any typed answer arrives as the single value `custom`. The useful
distinction — preset band versus typed answer — survives, and visitor-authored
text never reaches the analytics property.

`form_start` means *first keystroke*. It does not fire when a form merely
renders. The ratio `generate_lead ÷ form_start` is therefore a real completion
rate; if it were counted on render, the number would be meaningless.

## 3. GA4 — mark the conversions

Admin → **Events** → toggle **Mark as key event** on:

| Event | Why it is a key event |
| --- | --- |
| `generate_lead` | The one commercial outcome of the site. Set it as the **primary** conversion. |
| `internship_application_submitted` | Recruiting pipeline, not revenue. Mark it, but keep it out of the primary conversion count. |

Then Admin → **Custom definitions** → **Create custom dimension** for each
parameter that will be segmented in reports (event-scoped):

`form_name`, `discipline`, `entry_intent`, `investment_band`, `timeline`,
`landing_page`, `source_route`, `step_number`, `step_id`, `step_label`, `depth`,
`destination_host`, `link_kind`, `cta`, `domain`.

Custom dimensions only appear in reports from the moment they are created, so
create them **before** judging any campaign.

### Three settings that must stay off

Admin → **Data streams** → the web stream → **Enhanced measurement** →
**Page changes based on browser history events**: **off**.

The site sends its own `page_view` after every client-side navigation, once the
document title has been updated. Leaving GA4's history-based pageview on counts
every navigation twice.

**Scroll** and **outbound clicks** may stay on, but the site now reports
outbound clicks itself as `outbound_click` with a `link_kind` of `social` or
`outbound`. Use the site's event for reporting and leave GA4's version alone so
the two are not summed together.

### Reports worth building (Explore → Blank)

The point of the funnel events is these four tables, not a vanity traffic chart.

1. **Enquiry funnel by landing page** — Dimensions: `landing_page`; Metrics:
   `form_start`, `generate_lead`. Sorted by leads. This is the list that says
   which pages actually sell and which only attract traffic.
2. **Wizard drop-off** — Dimensions: `step_number`, `step_label`; Metric: event
   count for `contact_step_complete`. The first real drop is the question that
   costs money.
3. **Traffic to lead rate** — Dimension: `session default channel group`;
   Metrics: sessions, `form_start`, `generate_lead` per channel. Organic search
   looks very different once it is measured per lead instead of per visit.
4. **Social leakage** — Dimensions: `destination_host`, `link_kind`; Metric:
   event count for `outbound_click`, compared against `generate_lead` on the same
   pages.

## 4. GTM — build these three tags when you are ready

The container is installed and receives every event, but holds no tags. Nothing
below is required for GA4 reporting; each item buys something GA4 alone cannot.

### 4a. Search Console verification through GTM (optional)

Search Console is already verified by the token file
`public/googleb16a568f6f3a241d.html`, which ships with every build. No GTM tag is
needed. Keep the file: `verifyStaticOutput.mjs` fails the build if it is missing
or altered.

### 4b. Meta (Facebook/Instagram) lead event — the one worth doing first

The studio already runs social profiles; an enquiry from Instagram should be
attributable to Instagram.

1. GTM → **Tags** → New → **Custom HTML**, trigger **Custom Event** matching
   `generate_lead`.
2. Tag HTML:

   ```html
   <script>
     if (typeof fbq === 'function') {
       fbq('track', 'Lead', {
         content_category: {{DLV - discipline}},
         content_name: {{DLV - entry_intent}}
       });
     }
   </script>
   ```

3. Create **Data Layer Variables** for `discipline` and `entry_intent`
   (`DLV - discipline`, `DLV - entry_intent`).
4. Add the Meta Pixel base code as a second Custom HTML tag on **All Pages**,
   *after* the consent decision. Without a consent banner, only enable this if
   the studio accepts pixel-based tracking for all visitors — see
   `docs/DELIVERABILITY.md` and the privacy policy before switching it on.

### 4c. A single Google Ads / Meta conversion link, when paid spend starts

Trigger on the same `generate_lead` event, and use `investment_band` as the
conversion value multiplier if a value is needed. Do not fire a conversion on
`form_start`.

## 5. Search Console — the workflow that makes this pay off

1. **Sitemaps** → submit `https://angelcreations.in/sitemap.xml` once. Every URL
   now carries a real `<lastmod>` taken from git history, so the recrawl
   prioritises pages that actually changed.
2. **Settings → Crawl stats** → watch `Discovery → Sitemap` against
   `Refresh → Lastmod`. If lastmod is being ignored, the dates have drifted from
   reality — regenerate with `npm run sitemap:lastmod`.
3. **Performance → Pages** → sort by impressions. For each of the top 10 pages
   with an average position between 8 and 20, that page is one improvement away
   from real traffic. That is the content queue, not a keyword-tool export.
4. **Indexing → Pages** → any URL in `Excluded` that is also in the sitemap is a
   defect; the build's own verification should make that impossible.

### Keeping `lastmod` honest

```
npm run sitemap:lastmod   # reads git history, writes src/data/sitemapLastmod.json
npm run build             # regenerates dist/, public/ and the root sitemap copies
npm run sitemap:check     # fails if the committed map has drifted from history
```

The map is a committed file rather than a git call inside the build because CI
uses a shallow clone, where `git log` sees one commit dated "now" and would
stamp every URL with a synthetic date. Dates that Google can prove are wrong get
discounted, and then the whole sitemap's lastmod is ignored.

## 6. What is still not measured

Stated plainly so nobody reads more into the dashboard than is there:

- **Phone calls off-site.** A `tel:` click is counted; whether the call
  connected, and what it was worth, is not. Call tracking numbers are the only
  fix and they need a telephony provider.
- **Email replies.** A `mailto:` click is counted; the reply is not tracked.
- **Assisted conversions across sessions.** Attribution is captured per session
  in `sessionStorage` (`LEAD_ATTRIBUTION_STORAGE_KEY`). A visitor who researches
  on a phone and enquires on a laptop is two sessions. GA4's own cross-device
  reporting handles this only when users are signed in.
- **Lead quality.** `generate_lead` counts enquiries, not good ones. The
  `investment_band` and `timeline` parameters are the closest proxy until closed
  deals are imported back into GA4 as an offline conversion — worth doing only
  once monthly enquiry volume reliably exceeds 20.
