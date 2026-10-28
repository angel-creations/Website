# Angel Creations — Keyword & Search Coverage Map

**Prepared:** 28 October 2026  
**Scope:** Semantic keyword architecture for the homepage, seven parent service pages, eight capabilities, 63 specialist domain pages, Works, About, Contact, the domain directory, structured data, static fallbacks, sitemap and `llms.txt`.

> This implementation expands relevant search coverage without keyword stuffing or a legacy meta-keywords tag. Each indexable URL has one primary search intent, supported by truthful secondary services, aliases, audiences, use cases, FAQs, internal links and India/Jaipur/UK/worldwide location variants where relevant. Search position cannot be guaranteed; rankings also depend on competition, authority, links, engagement, freshness and Search Console feedback after publication.

## Executive coverage summary

| Coverage layer | Implemented result |
|---|---:|
| Indexable route documents | 85 |
| Unique titles | 85 (32–65 characters) |
| Unique meta descriptions | 85 (118–158 characters) |
| Specialist domain pages | 63 |
| Main Service keyword occurrences (parents + capabilities + domains) | 1,268 |
| Unique normalized main-service keyword phrases | 1,167 |
| Domain keyword occurrences | 983 (938 unique; 11–16 per domain) |
| Domain alias occurrences | 210 (209 unique; curated overrides on 34 priority domains) |
| Parent keyword clusters | 7 × 20 phrases |
| Capability keyword clusters | 145 phrases (17–19 per capability) |
| FAQ pages / questions | 78 / 453 |
| Popular-search pathways retained in code/discovery files | 12 |
| Sitemap page URLs / image URLs | 85 / 85 |
| `llms.txt` | 38,007 bytes; 81 unique canonical links |

The shared source of truth is `src/data/seoKeywords.json`, consumed by `src/utils/seoKeywords.ts`, runtime schema, React content and `scripts/generateStaticFallbacks.mjs`. This keeps browser-rendered pages, direct static documents, no-JavaScript fallbacks and AI-discovery text aligned.

**Owner-directed exception:** the footer text and the Contact page were restored to the original site version — the original enquiry wizard component, original metadata, and no FAQ section or contact FAQ schema.

## Organization-level target

**Primary focus:** XR, animation, VFX and film studio in India

**Also described as:** immersive technology company in India; XR development company in India; virtual reality company in India; augmented reality company in India; mixed reality company in India; metaverse development company in India; 2D and 3D animation company in India; animation and VFX studio in Jaipur; film and video production company in Jaipur; immersive experience studio

**Core services:** virtual reality development; augmented reality development; mixed reality development; metaverse development; virtual world development; 2D animation; 3D animation; CGI animation; visual effects (VFX); motion graphics; animated explainer videos; brand films; ad film production; corporate video production; film production; video production; post-production; immersive events; real-time 3D experiences; architectural visualisation

**Audiences:** brands and marketing teams; enterprise and training teams; educators and cultural institutions; architects and real-estate teams; film, broadcast and event producers

**Locations represented truthfully in schema/content:** Jaipur, Rajasthan, India; India; Braintree, United Kingdom; United Kingdom; Worldwide

## Core page intent map

| URL | Primary intent | Title | Supporting coverage |
|---|---|---|---|
| `/` | Hire an XR, animation, VFX and film studio in India | XR, Animation & Film Studio in India \| Angel Creations | Organization focus, seven service families, Jaipur + worldwide delivery |
| `/about/` | About the Jaipur-based XR, animation, VFX and film studio | About Our XR, Animation & Film Studio \| Angel Creations | Studio credibility, disciplines, sectors, Jaipur HQ and Braintree UK desk |
| `/works/` | XR, animation, VFX and film portfolio | XR, Animation, VFX & Film Portfolio \| Angel Creations | 47 productions; VFX breakdowns, 2D/3D animation, architectural visualisation, commercials, live events |
| `/contact/` | Start a project enquiry | Start a Project Enquiry \| Angel Creations | Page restored in full to the original enquiry wizard at the owner’s request (no keyword-pass copy, no FAQ schema) |
| `/domains/` | Find XR, animation, VFX, brand and film services in India | XR, Animation & Film Services in India \| Angel Creations | 63 searchable specialist services with code-level alias, format, audience and deliverable matching |

## Parent service keyword map

| URL | Primary focus | Page title | Secondary aliases | Services | Audiences | Long-tail / transactional variants | FAQs |
|---|---|---|---|---|---|---|---:|
| `/metaverse/` | metaverse development company in India | Metaverse Development Company in India \| Angel Creations | metaverse development services; virtual world development company; 3D virtual world development; metaverse platform development; virtual event platform development | virtual worlds; virtual events; virtual product showcases; virtual marketplaces; virtual education; virtual workspaces; virtual brand experiences; metaverse games | brands and cultural institutions; event and entertainment producers; education and enterprise teams; communities and creators; retail and commerce teams | metaverse development services for brands; virtual world development for events; build a virtual product showcase; hire metaverse developers in India; custom virtual world development company | 5 |
| `/mixed-reality/` | mixed reality development company in India | Mixed Reality Development Company India \| Angel Creations | mixed reality development services; MR development company; mixed reality app development; spatial computing company; mixed reality solutions | mixed reality training; mixed reality education; MR architecture and design; MR remote collaboration; MR retail; MR media; MR entertainment; MR gaming | operations and training teams; designers and architects; educators and researchers; retail and media teams; enterprise collaboration teams | mixed reality training solutions for enterprises; spatial computing services in India; MR app development company in India; mixed reality for architecture and design; mixed reality remote collaboration solutions | 5 |
| `/virtual-reality/` | virtual reality development company in India | Virtual Reality Development Company in India \| Angel Creations | VR development company; VR development services; VR app development company; virtual reality solutions; VR simulation development | VR training and simulation; VR education; VR for healthcare; VR architectural visualisation; VR gaming; VR content development; VR video conferencing; VR marketing and branding | training and safety teams; educators and cultural institutions; healthcare and research teams; architects and real-estate teams; entertainment and brand teams | VR training simulator development company; virtual reality training solutions in India; VR development services for healthcare; VR architectural walkthrough services; hire VR developers in India | 5 |
| `/augment-reality/` | augmented reality development company in India | Augmented Reality Development in India \| Angel Creations | AR development company; AR app development company; augmented reality development services; WebAR development services; augmented reality solutions | WebAR experiences; mobile AR applications; industrial AR; AR retail; AR navigation; AR tourism and travel; AR marketing; AR education and healthcare | retail and consumer brands; industrial and field-service teams; tourism and cultural organisations; educators and healthcare teams; media and entertainment producers | WebAR development company in India; AR app development services for retail; industrial augmented reality solutions; AR product visualisation services; AR navigation app development | 5 |
| `/animation/` | 2D and 3D animation studio in India | 2D & 3D Animation Studio in India \| Angel Creations | animation company in India; animation studio in India; 3D animation company; 2D animation studio; CGI animation services | 2D animation; 3D animation; character animation; motion graphics; visual effects (VFX); animated explainer videos; concept development; pre-visualisation; interactive animation; AR animation | brands and product teams; film and episodic producers; educators and publishers; game and XR teams; agencies and marketing teams | 3D animation services for brands; 2D animated explainer video company; 3D product animation services; character animation studio in India; VFX services for films and commercials | 5 |
| `/brand-advertisement/` | brand film and ad campaign production company in India | Brand Films & Ad Campaigns in India \| Angel Creations | brand advertisement agency; ad film production company; brand campaign agency; brand film production company; commercial video production | brand campaigns; digital campaigns; product launches; brand films; explainer communication; social and digital content; immersive brand activations; virtual product showcases | founders and marketing leaders; consumer and enterprise brands; product launch teams; agencies and media partners; cultural and destination brands | ad film production company in India; brand film production services in Jaipur; product launch film production; digital ad campaign production company; immersive brand activation services | 5 |
| `/media-production/` | film and video production company in Jaipur, India | Film & Video Production Company in Jaipur \| Angel Creations | video production company in Jaipur; film production company in India; corporate video production company; ad film production house; commercial video production company | video production; film production; television production; animation production; photography; live event production; audio production; post-production; scriptwriting and storyboarding; media consulting | brands and institutions; producers and broadcasters; event organisers; agencies and independent creators; corporate communication teams | corporate video production company in Jaipur; film production services in India; commercial video production in Jaipur; live event video production services; post-production studio in India | 5 |

## Capability keyword map

| URL | Primary focus | Page title | Aliases | Services | Long-tail variants | FAQs |
|---|---|---|---|---|---|---:|
| `/capabilities/brand/` | brand strategy, brand films and ad campaign services | Brand Strategy, Films & Campaign Services \| Angel Creations | brand film production; advertising campaign services; product launch films; branded content production; commercial film production | brand strategy; campaign creative; brand films; product showcases; AR marketing; VR brand experiences | brand film production company in India; product launch campaign production; immersive brand activation services; AR and VR marketing experiences | 5 |
| `/capabilities/design/` | spatial experience and immersive design studio | Spatial & Experience Design Studio \| Angel Creations | spatial design services; experience design studio; 3D environment design; virtual world design; immersive interface design | spatial design; visual design; experience design; architecture-led digital experiences; virtual environments; interactive interfaces | spatial experience design company in India; virtual world design services; immersive environment design studio; 3D architectural visualisation services | 5 |
| `/capabilities/content/` | immersive content production company | Immersive Content Production Services \| Angel Creations | VR content production; mixed reality content creation; interactive content production; immersive media production; animated explainer content | VR content; MR content; animation; film; explainer videos; interactive media | VR content development company in India; immersive content production services; interactive explainer video production; mixed reality content creation services | 5 |
| `/capabilities/film/` | film and video production services in India | Film & Video Production in India \| Angel Creations | corporate film production; commercial film production; television production; live event filming; video post-production | film production; video production; television production; photography; live events; audio and post-production | corporate video production services in Jaipur; film production company in India; commercial film production services; video post-production studio in India | 5 |
| `/capabilities/animation-3d/` | 2D, 3D animation, CGI and VFX services in India | 2D, 3D Animation & VFX in India \| Angel Creations | 3D animation services; 2D animation services; CGI animation studio; VFX services; character animation | concept development; pre-visualisation; 2D animation; 3D animation; character animation; motion graphics; VFX | 3D product animation services in India; 2D explainer video production company; character animation studio in India; VFX studio in Jaipur | 5 |
| `/capabilities/digital/` | interactive digital experience development | Interactive Digital Experience Development \| Angel Creations | interactive experience development; virtual platform development; digital world development; virtual marketplace development; virtual learning experiences | virtual worlds; virtual marketplaces; virtual education; virtual workspaces; AR navigation; remote collaboration | interactive digital experience company in India; virtual marketplace development services; virtual workspace development company; immersive learning platform development | 5 |
| `/capabilities/experiences/` | immersive experience and event production company | Immersive Experience & Event Production \| Angel Creations | immersive event production; virtual event production; experiential activation production; interactive installation services; virtual product showcase production | virtual events; virtual worlds; product showcases; live event production; immersive entertainment; spatial activations | immersive event production company in India; virtual event production services; interactive brand activation production; virtual product showcase development | 5 |
| `/capabilities/creative-technology/` | XR development and creative technology company in India | XR Development Company in India \| Angel Creations | XR development company; creative technology studio; spatial computing development; real-time 3D development; Unity and Unreal experience development | metaverse development; VR development; AR development; MR development; real-time 3D; interactive simulations | XR development services in India; AR VR MR development company in Jaipur; real-time 3D experience development; spatial computing solutions for enterprises | 5 |

## Popular-search pathways

These pathways are retained in source data and `llms.txt` for discovery/search matching; they are no longer rendered as a visible shortcut block on `/domains/`. Each points to the single most relevant landing page.

| Search phrase retained in code/discovery data | Target URL |
|---|---|
| Metaverse development company in India | `/metaverse/` |
| VR training simulator development | `/virtual-reality/training-and-simulation/` |
| VR for healthcare & medical training | `/virtual-reality/healthcare/` |
| VR architectural walkthroughs | `/virtual-reality/architectural-visualization/` |
| WebAR & AR app development | `/augment-reality/` |
| AR for retail & product visualisation | `/augment-reality/retail/` |
| Industrial AR solutions | `/augment-reality/industrial-ar/` |
| Mixed reality training | `/mixed-reality/training/` |
| 3D animation & CGI services | `/animation/3d-animation/` |
| Animated explainer video production | `/animation/explainer-videos/` |
| Brand films & ad campaigns | `/brand-advertisement/brand-films/` |
| Video production company in Jaipur | `/media-production/video-production/` |

## All 63 specialist domain pages

Each domain page combines a unique commercial title/description, contextual H1/H2/H3 headings, deliverables, formats, audiences, six FAQs, descriptive image text, internal links and Service schema. “Keyword phrases” below are the page’s generated semantic cluster; the strongest curated aliases are shown where available.

| URL | Primary focus | Title | Keyword phrases | Aliases | Top supporting phrases |
|---|---|---|---:|---:|---|
| `/metaverse/virtual-worlds/` | Virtual Worlds services in India | Metaverse Virtual Worlds Services in India \| Angel Creations | 16 | 4 | custom virtual world development; 3D virtual space development; persistent virtual environment development |
| `/metaverse/virtual-events/` | Virtual Events services in India | Metaverse Virtual Events Services in India \| Angel Creations | 16 | 4 | virtual event platform development; 3D virtual conference platform; metaverse event production |
| `/metaverse/virtual-brand-experiences/` | Virtual Brand Experiences services in India | Virtual Brand Experiences in the Metaverse \| Angel Creations | 16 | 4 | virtual brand activation; metaverse marketing experiences; 3D brand world development |
| `/metaverse/gaming/` | Gaming in the Metaverse services in India | Gaming in the Metaverse Services in India \| Angel Creations | 16 | 1 | Gaming in the Metaverse |
| `/metaverse/virtual-marketplaces/` | Virtual Marketplaces services in India | Virtual Marketplaces in the Metaverse \| Angel Creations | 16 | 1 | Virtual Marketplaces |
| `/metaverse/virtual-economies/` | Virtual Economies services in India | Metaverse Virtual Economies Services in India \| Angel Creations | 16 | 1 | Virtual Economies |
| `/metaverse/virtual-education/` | Virtual Education services in India | Metaverse Virtual Education Services in India \| Angel Creations | 16 | 1 | Virtual Education |
| `/metaverse/virtual-workspaces/` | Virtual Workspaces services in India | Metaverse Virtual Workspaces Services in India \| Angel Creations | 14 | 1 | Virtual Workspaces |
| `/metaverse/virtual-product-showcases/` | Virtual Product Showcases services in India | Virtual Product Showcases in the Metaverse \| Angel Creations | 16 | 4 | 3D product showcase development; virtual showroom development; immersive product demonstration |
| `/mixed-reality/training/` | Mixed Reality Training services in India | Mixed Reality Training Services in India \| Angel Creations | 16 | 5 | MR training simulations; spatial computing training; holographic training solutions |
| `/mixed-reality/education/` | Mixed Reality Education services in India | Mixed Reality Education Services in India \| Angel Creations | 16 | 2 | Mixed Reality Education; MR Education |
| `/mixed-reality/entertainment/` | Mixed Reality Entertainment services in India | Mixed Reality Entertainment Services in India \| Angel Creations | 16 | 2 | Mixed Reality Entertainment; MR Entertainment |
| `/mixed-reality/gaming/` | Mixed Reality Gaming services in India | Mixed Reality Gaming Services in India \| Angel Creations | 16 | 2 | Mixed Reality Gaming; MR Gaming |
| `/mixed-reality/marketing-and-branding/` | Mixed Reality Marketing and Branding services in India | Mixed Reality Marketing & Branding Services \| Angel Creations | 16 | 2 | Mixed Reality Marketing and Branding; MR Marketing and Branding |
| `/mixed-reality/architecture-and-design/` | Architecture and Design in Mixed Reality services in India | Architecture & Design in Mixed Reality Services \| Angel Creations | 16 | 6 | mixed reality architectural visualisation; spatial design review; holographic architecture models |
| `/mixed-reality/remote-collaboration/` | Mixed Reality Remote Collaboration services in India | Mixed Reality Remote Collaboration Services \| Angel Creations | 16 | 5 | spatial remote collaboration; holographic telepresence; MR co-design platform |
| `/mixed-reality/retail/` | Mixed Reality Retail services in India | Mixed Reality Retail Services in India \| Angel Creations | 16 | 2 | Mixed Reality Retail; MR Retail |
| `/mixed-reality/media/` | Mixed Reality Media services in India | Mixed Reality Media Services in India \| Angel Creations | 16 | 2 | Mixed Reality Media; MR Media |
| `/virtual-reality/vr-content/` | VR Content services in India | VR Content Services in India \| Angel Creations | 16 | 2 | VR Content; Virtual Reality Content |
| `/virtual-reality/vr-video-conferencing/` | VR Video Conferencing services in India | VR Video Conferencing Services in India \| Angel Creations | 16 | 2 | VR Video Conferencing; Virtual Reality Video Conferencing |
| `/virtual-reality/vr-gaming/` | VR Gaming services in India | VR Gaming Services in India \| Angel Creations | 16 | 5 | VR game development; virtual reality game studio; immersive VR game development |
| `/virtual-reality/training-and-simulation/` | Training and Simulation in Virtual Reality services in India | Training & Simulation in Virtual Reality \| Angel Creations | 16 | 7 | VR training simulator development; virtual reality safety training; immersive employee training |
| `/virtual-reality/education/` | Education in Virtual Reality services in India | Education in Virtual Reality Services in India \| Angel Creations | 16 | 6 | VR learning solutions; immersive education experiences; virtual reality classroom content |
| `/virtual-reality/marketing-and-branding/` | Marketing and Branding in Virtual Reality services in India | Marketing & Branding in Virtual Reality \| Angel Creations | 16 | 3 | Marketing and Branding in Virtual Reality; Marketing and Branding in VR; VR Marketing and Branding |
| `/virtual-reality/architectural-visualization/` | VR Architectural Visualization services in India | VR Architectural Visualization Services \| Angel Creations | 16 | 6 | VR architectural walkthrough; 3D architectural visualisation; real-estate VR tours |
| `/virtual-reality/healthcare/` | VR for Healthcare services in India | VR for Healthcare Services in India \| Angel Creations | 16 | 6 | VR healthcare training; medical VR simulation; surgical rehearsal VR |
| `/virtual-reality/streaming-and-broadcasting/` | Streaming and Broadcasting in Virtual Reality services in India | Streaming & Broadcasting in Virtual Reality \| Angel Creations | 16 | 3 | Streaming and Broadcasting in Virtual Reality; Streaming and Broadcasting in VR; VR Streaming and Broadcasting |
| `/augment-reality/industrial-ar/` | Industrial AR services in India | Industrial AR Services in India \| Angel Creations | 16 | 6 | industrial AR maintenance; AR remote assistance; augmented reality equipment diagnostics |
| `/augment-reality/tourism-and-travel/` | AR for Tourism and Travel services in India | AR for Tourism & Travel Services in India \| Angel Creations | 16 | 2 | AR for Tourism and Travel; Augmented Reality for Tourism and Travel |
| `/augment-reality/ar-navigation/` | AR Navigation services in India | AR Navigation Services in India \| Angel Creations | 16 | 6 | AR wayfinding; indoor AR navigation; augmented reality directions |
| `/augment-reality/retail/` | AR for Retail services in India | AR for Retail Services in India \| Angel Creations | 16 | 6 | AR product visualisation; augmented reality shopping; virtual try-on experiences |
| `/augment-reality/ar-marketing/` | AR Marketing services in India | AR Marketing Services in India \| Angel Creations | 16 | 5 | AR advertising campaigns; WebAR marketing; interactive AR brand experiences |
| `/augment-reality/ar-gaming/` | AR Gaming services in India | AR Gaming Services in India \| Angel Creations | 16 | 2 | AR Gaming; Augmented Reality Gaming |
| `/augment-reality/ar-education/` | AR Education services in India | AR Education Services in India \| Angel Creations | 16 | 5 | AR learning experiences; augmented reality education apps; interactive AR learning content |
| `/augment-reality/ar-healthcare/` | AR Healthcare services in India | AR Healthcare Services in India \| Angel Creations | 16 | 2 | AR Healthcare; Augmented Reality Healthcare |
| `/augment-reality/ar-entertainment/` | AR Entertainment services in India | AR Entertainment Services in India \| Angel Creations | 16 | 2 | AR Entertainment; Augmented Reality Entertainment |
| `/augment-reality/ar-art-and-creativity/` | AR Art and Creativity services in India | AR Art & Creativity Services in India \| Angel Creations | 16 | 2 | AR Art and Creativity; Augmented Reality Art and Creativity |
| `/animation/concept-development/` | Concept Development services in India | Concept Development Animation Services in India \| Angel Creations | 14 | 1 | Concept Development |
| `/animation/pre-visualization/` | Pre-visualization services in India | Pre-visualization Animation Services in India \| Angel Creations | 15 | 1 | Pre-visualization |
| `/animation/2d-animation/` | 2D Animation services in India | 2D Animation Services in India \| Angel Creations | 16 | 4 | 2D animation company in India; 2D animated video production; hand-drawn and digital 2D animation |
| `/animation/3d-animation/` | 3D Animation services in India | 3D Animation Services in India \| Angel Creations | 16 | 5 | 3D animation company in India; 3D product animation; CGI animation services |
| `/animation/motion-graphics/` | Motion Graphics services in India | Motion Graphics Animation Services in India \| Angel Creations | 16 | 4 | motion graphics company; motion design services; animated brand graphics |
| `/animation/visual-effects/` | Visual Effects services in India | Visual Effects Animation Services in India \| Angel Creations | 16 | 6 | VFX company in India; visual effects studio; VFX services for film and commercials |
| `/animation/character-animation/` | Character Animation services in India | Character Animation Services in India \| Angel Creations | 16 | 4 | 3D character animation; 2D character animation; animated character performance |
| `/animation/interactive-animation/` | Interactive Animation services in India | Interactive Animation Services in India \| Angel Creations | 15 | 1 | Interactive Animation |
| `/animation/explainer-videos/` | Explainer Videos services in India | Explainer Videos Animation Services in India \| Angel Creations | 16 | 5 | animated explainer video company; 2D explainer video production; 3D explainer video services |
| `/animation/ar-animation/` | AR Animation services in India | AR Animation Services in India \| Angel Creations | 15 | 2 | AR Animation; Augmented Reality Animation |
| `/brand-advertisement/brand-campaigns/` | Brand Campaigns services in India | Brand Campaigns Services in India \| Angel Creations | 16 | 4 | advertising campaign production; integrated brand campaigns; brand launch campaigns |
| `/brand-advertisement/digital-campaigns/` | Digital Campaigns services in India | Digital Campaigns Services in India \| Angel Creations | 16 | 4 | digital ad film production; online advertising campaigns; performance creative production |
| `/brand-advertisement/product-launches/` | Product Launches services in India | Product Launches Services in India \| Angel Creations | 16 | 4 | product launch film production; product launch campaign videos; 3D product launch experiences |
| `/brand-advertisement/brand-films/` | Brand Films services in India | Brand Films Services in India \| Angel Creations | 16 | 4 | brand film production company; corporate brand films; cinematic brand storytelling |
| `/brand-advertisement/explainer-communication/` | Brand Explainer Communication services in India | Brand Explainer Communication Services in India \| Angel Creations | 15 | 1 | Brand Explainer Communication |
| `/brand-advertisement/social-and-digital-content/` | Social and Digital Content services in India | Social & Digital Content Services in India \| Angel Creations | 16 | 4 | social media video production; digital brand content; short-form campaign content |
| `/media-production/video-production/` | Video Production services in India | Video Production Services in India \| Angel Creations | 16 | 5 | video production company in Jaipur; corporate video production; commercial video production |
| `/media-production/film-production/` | Film Production services in India | Film Production Services in India \| Angel Creations | 14 | 4 | film production company in India; cinematic film production; narrative film production services |
| `/media-production/television-production/` | Television Production services in India | Television Production Services in India \| Angel Creations | 15 | 4 | TV production services; broadcast content production; multi-camera television production |
| `/media-production/animation-production/` | Animation Production services in India | Animation Production Services in India \| Angel Creations | 12 | 1 | Animation Production |
| `/media-production/photography/` | Photography services in India | Photography Services in India \| Angel Creations | 15 | 1 | Photography |
| `/media-production/live-event-production/` | Live Event Production services in India | Live Event Production Services in India \| Angel Creations | 14 | 4 | live event video production; event filming services; concert and festival production |
| `/media-production/audio-production/` | Audio Production services in India | Audio Production Services in India \| Angel Creations | 11 | 1 | Audio Production |
| `/media-production/post-production/` | Post-Production services in India | Post-Production Services in India \| Angel Creations | 15 | 4 | video post-production services; film editing and colour grading; sound and finishing services |
| `/media-production/scriptwriting-and-storyboarding/` | Scriptwriting and Storyboarding services in India | Scriptwriting & Storyboarding Services in India \| Angel Creations | 16 | 4 | scriptwriting services; storyboard development; film pre-production services |
| `/media-production/media-consulting/` | Media Consulting services in India | Media Consulting Services in India \| Angel Creations | 15 | 1 | Media Consulting |

## How the coverage is implemented

1. **One primary intent per URL** — parents own broad commercial phrases; capabilities own cross-discipline service phrases; domains own specific service/use-case phrases.
2. **Commercial + local modifiers** — India is the broad market modifier, Jaipur is used for studio/local intent, and UK/worldwide wording reflects the existing Braintree client desk and global delivery.
3. **Visible semantic content** — keyword phrases appear in readable titles, headings, service-guide copy, deliverables, audience/use-case lists, FAQs, portfolio copy and descriptive internal anchors—not hidden text.
4. **Structured data** — Organization `knowsAbout`, WebPage `keywords`, Service `serviceType`, `alternateName`, `audience`, `hasOfferCatalog`/`isRelatedTo`, FAQPage, ItemList, BreadcrumbList and VideoObject data reinforce page meaning.
5. **Internal linking** — parent service guides, capability-to-domain routes, domain sibling links, Works links and 12 popular-search shortcuts distribute relevance. The footer retains its original menu text at the owner’s request.
6. **Static parity** — direct/no-JS documents generated by `scripts/generateStaticFallbacks.mjs` mirror the React metadata, FAQs, service schema and content.
7. **Discovery files** — all 85 canonical URLs and one descriptive image per URL are in the sitemap; `llms.txt` summarizes services, aliases, audiences and popular searches for AI/search systems that read it.

## Verification evidence (final build)

| Check | Result |
|---|---|
| Production build (`npm run build`) | Passed; 85 route documents and 93 HTML files verified |
| Static SEO audit | Passed; no duplicate/missing titles or descriptions, canonical, H1, schema, sitemap or alt-text failures |
| End-to-end crawl | 85/85 routes OK; 2,943 static anchor instances; 163 internal targets; 0 broken targets; 304 local assets; 0 missing |
| Targeted keyword/browser checks | 44/44 passed (`.playwright-artifacts/keyword-seo/report.json`) |
| Browser smoke suite | 46/46 desktop/mobile checks passed |
| Boot fallback / degraded boot | Passed |
| FAQ schema | 78 FAQ pages, 453 questions, no JSON-LD parse errors in the generated set |

## Recommended post-publication measurement

1. Submit/refresh `https://angelcreations.in/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
2. Inspect representative URLs for each template (home, one parent, one capability, `/domains/`, 3–5 priority domains, Works and Contact) and confirm the rendered title, canonical, FAQ/Service schema and indexed content.
3. After 2–4 weeks, review Search Console queries by page. Promote real impression-winning variants into headings/FAQs only where they remain truthful and readable.
4. Track rankings separately for Jaipur, India, UK and global intent; do not judge the whole architecture by one head term.
5. Strengthen authority with legitimate case studies, partner/client links, profiles, local citations and new project evidence. On-page coverage alone cannot guarantee first position against established competitors.
6. Keep one primary URL per intent. When adding a service, extend `src/data/seoKeywords.json` and regenerate this map rather than creating overlapping pages.

## Deliberate exclusions

- No meta-keywords tag was added; major search engines do not use it for ranking.
- No hidden keyword lists, doorway pages, fabricated locations, prices, ratings, testimonials, guarantees or response-time claims were introduced.
- No WebSite `SearchAction` was added for the domain directory because its search is client-side and has no stable query URL.
