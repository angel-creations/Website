# Angel Creations — Homepage Slider Map

**Forensic source record — 2026-10-05**  
This map records the current implementation before the inner-experience work. Slide names, captions, routes and media are taken from `src/components/HomeSlideshow.tsx`; route content was checked against the captured `legacyPages.json` and the source-qualified capability dataset. No slide names have been invented or renamed.

## Shared current slider behaviour

- **Structure:** seven full-stage video-led slides, numbered `01`–`07`, in the order below.
- **Doorway action:** the complete visible caption is currently a link. Its handler calls the existing SPA `navigate()` to the listed route.
- **Movement:** Prev/Next controls, Left/Right arrow keys while the stage is focused, and horizontal touch swipe (48px threshold). A queued input runs after the current 1500ms directional width reveal settles.
- **Transition:** incoming media opens from zero width; outgoing/incoming media move in opposing directions with opacity/parallax treatment and staggered caption movement. Reduced motion retains sequence/control state but skips the long transition/parallax/word stagger and hides video in favor of the poster.
- **Media:** local slides use same-source poster imagery; adjacent local films use metadata preload. The remote Media Production film is `preload="none"` while inactive and only changes to `auto` when selected.
- **Current direct routes:** all seven route paths exist as captured core routes and are emitted as static documents. Their previous route bodies vary in usefulness, detailed below.

---

## Slide 01

**Number:** `01`  
**Existing title/caption:** `/ Metaverse` — “Dive into new world, live the world you want.”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/08/Metaverse.mp4`; poster `/legacy-assets/images/generated-home-posters/metaverse.jpg`.  
**Existing route:** `/metaverse/`  
**Existing CTA/link behavior:** entire caption navigates to `/metaverse/`.  
**Existing animation/transition:** shared directional slider transition; numbered word/caption reveal; muted looping active video.  
**Current route body:** `MetaversePage` preserves the captured Unity WebGL MetaScore runtime. The captured route title is `Unity WebGL Player | MetaScore`; the captured route contains no usable editorial body text.  
**Verified related source material:** public Angel source/capability data names Metaverse, Virtual Worlds, Virtual Events Platforms, Virtual Product Showcase, Virtual Workspaces, Virtual Marketplaces, Virtual Economy, Virtual Education, VR Gaming, VR Training & Simulation and VR Architectural Visualization.  
**Existing related capabilities:** Creative Technology; Experiences; Digital; Animation + 3D where relevant.  
**Target inner route:** retain `/metaverse/`.  
**Available source content:** existing Unity experience, the source-qualified labels above, and the subsequently supplied Metaverse narrative covering virtual worlds, events, brand experiences, gaming, marketplaces, economies, education, workspaces, product showcases, experience layers, contexts and progression.  
**Missing source content:** no verified named Metaverse case study, client, outcome, award, or project-specific result.

---

## Slide 02

**Number:** `02`  
**Existing title/caption:** `/ Mixed Reality` — “Tech immersion: Real & digital objects interact.”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/08/Mixed-Reality.mp4`; poster `/legacy-assets/images/generated-home-posters/mixed-reality.jpg`.  
**Existing route:** `/mixed-reality/`  
**Existing CTA/link behavior:** entire caption navigates to `/mixed-reality/`.  
**Existing animation/transition:** shared directional slider transition; muted looping active video.  
**Current route body:** captured legacy page is a sparse Featured Stories shell with no meaningful Mixed Reality editorial copy.  
**Verified related source material:** MR Content Creation, MR Training & Education, MR Entertainment, MR Retail, MR Remote Collaboration, MR Architecture & Design, MR Design & Architecture, MR Media and MR Marketing & Branding.  
**Existing related capabilities:** Creative Technology; Experiences; Content; Design.  
**Target inner route:** retain `/mixed-reality/`.  
**Available source content:** the verified public labels above and exact matching public archive records only.  
**Missing source content:** no verified project narrative, client, result, award, or MR-specific case-study evidence.

---

## Slide 03

**Number:** `03`  
**Existing title/caption:** `/ Virtual Reality` — “You’re not imagining it, you’re experiencing it!”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/08/Virtual-Reality.mp4`; poster `/legacy-assets/images/generated-home-posters/virtual-reality.jpg`.  
**Existing route:** `/virtual-reality/`  
**Existing CTA/link behavior:** entire caption navigates to `/virtual-reality/`.  
**Existing animation/transition:** shared directional slider transition; muted looping active video.  
**Current route body:** captured legacy page is a sparse Featured Stories shell with no meaningful VR editorial copy.  
**Verified related source material:** VR Content Development, VR Training & Simulation, VR Streaming & Broadcasting, VR Video Conferencing, VR Architectural Visualization, VR Education, VR Gaming and VR for Marketing & Branding.  
**Existing related capabilities:** Creative Technology; Experiences; Content; Digital.  
**Target inner route:** retain `/virtual-reality/`.  
**Available source content:** the verified public labels above and exact matching public archive records only.  
**Missing source content:** no verified individual VR project/account/outcome narrative.

---

## Slide 04

**Number:** `04`  
**Existing title/caption:** `/ Augment Reality` — “Blending real & virtual worlds, Immersive experience!”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/05/Augmented-Reality-Showroom.mp4`; poster `/legacy-assets/images/generated-home-posters/augmented-reality.jpg`.  
**Existing route:** `/augment-reality/`  
**Existing CTA/link behavior:** entire caption navigates to `/augment-reality/`.  
**Existing animation/transition:** shared directional slider transition; muted looping active video.  
**Current route body:** captured legacy route currently renders an unrelated legacy work-list shell (including old source links such as Luštica Bay, Karma Group and others). It is not an accurate Augment Reality inner experience and must not be treated as verified AR work attribution.  
**Verified related source material:** AR Applications, AR Animation, AR Marketing, AR Navigation, AR Retail, AR Art & Creativity, AR Tourism & Travel, AR Healthcare Applications and AR Industrial Applications.  
**Existing related capabilities:** Creative Technology; Design; Brand; Experiences.  
**Target inner route:** retain `/augment-reality/`.  
**Available source content:** the verified public labels above and exact matching public archive records only.  
**Missing source content:** no reliable AR-specific client/case-study evidence in the captured route body; old legacy work-list claims will not be reused as AR proof.

---

## Slide 05

**Number:** `05`  
**Existing title/caption:** `/ Animation` — “We give you amazing animation in both 2D & 3D.”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/05/Singing-girl.mp4`; poster `/legacy-assets/images/generated-home-posters/animation.jpg`.  
**Existing route:** `/animation/`  
**Existing CTA/link behavior:** entire caption navigates to `/animation/`.  
**Existing animation/transition:** shared directional slider transition; muted looping active video.  
**Current route body:** captured legacy page is a sparse Featured Stories shell with no meaningful Animation editorial copy.  
**Verified related source material:** Concept Development, Pre-visualization, 2D Animation, 3D Animation, Motion Graphics, Visual Effects (VFX), Character Animation, Interactive Animations, Animated Explainer Videos and AR Animation.  
**Existing related capabilities:** Animation + 3D; Film; Content; Creative Technology.  
**Target inner route:** retain `/animation/`.  
**Available source content:** the verified animation labels and exact matching public archive records only.  
**Missing source content:** no invented animation project stories, results, clients, or awards.

---

## Slide 06

**Number:** `06`  
**Existing title/caption:** `/ Brand Advertisement` — “Elevating Brands through Digital Innovation.”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** local `/legacy-assets/videos/wp-content/uploads/2023/05/Brand-Advertisement.mp4`; poster `/legacy-assets/images/generated-home-posters/brand-advertisement.jpg`.  
**Existing route:** `/brand-advertisement/`  
**Existing CTA/link behavior:** entire caption navigates to `/brand-advertisement/`.  
**Existing animation/transition:** shared directional slider transition; muted looping active video.  
**Current route body:** captured legacy page is a sparse Featured Stories shell with no meaningful Brand Advertisement editorial copy.  
**Verified related source material:** Marketing & Branding, Brand Advertisement, AR Marketing, VR for Marketing & Branding, MR Marketing & Branding, Virtual Product Showcase, Virtual Marketplaces and AR Retail.  
**Existing related capabilities:** Brand; Design; Content; Digital.  
**Target inner route:** retain `/brand-advertisement/`.  
**Available source content:** the verified public labels and exact matching public archive records only.  
**Missing source content:** no verified named brand campaign/case-study account or outcome.

---

## Slide 07

**Number:** `07`  
**Existing title/caption:** `/ Media Production` — “Think with us, act with us, create with us!”  
**Source:** `HomeSlideshow.tsx`, current captured homepage slide.  
**Visual/media:** remote source `https://angelcreations.in/wp-content/uploads/2023/05/an-experienced-video-production-engineer-works-on-2022-08-10-17-32-35-utc.mov`, type `video/quicktime`; no local poster in the current implementation.  
**Existing route:** `/media-production/`  
**Existing CTA/link behavior:** entire caption navigates to `/media-production/`.  
**Existing animation/transition:** shared directional slider transition; remote inactive media is held at `preload="none"`.  
**Current route body:** captured legacy page is a sparse Featured Stories shell with no meaningful Media Production editorial copy.  
**Verified related source material:** Film Production, Video Production, Television Production, Photography Services, Scriptwriting and Storyboarding, Live Event Production, Post-Production Services, Audio Production and Media Consulting.  
**Existing related capabilities:** Film; Content; Experiences; Brand.  
**Target inner route:** retain `/media-production/`.  
**Available source content:** the verified public labels and exact matching public archive records only.  
**Missing source content:** no verified production credits, clients, outcomes, or named case studies.

## Mapping decision

The seven existing clean routes are the correct destinations. They are real slider targets, not new SEO doorway URLs. The inner-page phase should replace only their thin/misaligned route bodies with one shared, slide-aware Angel experience, while retaining Metaverse’s verified Unity runtime as an optional source artifact rather than asserting unsupported narrative around it.

## Post-map content update

After this forensic map, approved long-form source copy was supplied for all seven slider destinations. It now drives the detailed Metaverse, Mixed Reality, Virtual Reality, Augmented Reality, Animation, Brand Advertisement and Media Production sequences. This does not alter the source baseline above: it fills the documented narrative gaps without creating new routes, client claims, case-study outcomes or unsupported Work attribution.
