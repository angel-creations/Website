# Angel Creations — Inner-Page Content Map

**Scope:** the seven original homepage-slider destinations only.  
**Purpose:** keep every deeper-room experience useful, skimmable and source-qualified without flattening it into a generic service page.

## Three reading depths

| Depth | Visitor need | Runtime treatment | Static/no-JS equivalent |
|---|---|---|---|
| **Immediate** | What is this? Why does it matter? | Homepage-continuous media entry, route label, H1, supplied heading and summary. | H1, supplied heading/summary and numbered route label. |
| **Explore** | What can it become? | Route-specific map and progressive application explorer. | Map stages plus every approved application title, description, list and closing statement. |
| **Deep dive** | How does Angel think about it? What proves it? | Approved narrative, medium-specific sequence, exact-title Work and selective capability relationships. | The complete approved narrative, Work/source links, capability and journey links. |

## Shared content sequence

The order remains readable before interaction and intentionally varies in visual form by route:

```text
ENTRY → CORE IDEA / WHY → EXPERIENCE MAP → POSSIBILITIES → HOW IT CAN WORK
      → CONTEXT → WORK → DISCIPLINES → PROJECT PROMPT → NEXT EXPERIENCE
```

`ExperienceMap` is an explanation of the medium rather than a claims diagram. `ApplicationExplorer` turns approved application contexts into a selected reading path. Neither is evidence of past Angel client work.

## Route map

| Route | Immediate orientation | Map / process language | Exploration source | Work bridge | Capability relationship |
|---|---|---|---|---|---|
| Metaverse | “Dive into a new world.” | World → Story → Interaction → People → Content → Return | `metaverseContent.experienceTypes` | **Worlds made real** | Brand, Design, Content, Animation + 3D, Digital, Experiences, Creative Technology |
| Mixed Reality | “Real + digital. One experience.” | Real World → Digital Layer → Interaction → Purpose | MR approved entries | **When digital meets the real world** | Design, Animation + 3D, Digital, Experiences, Creative Technology, Content |
| Virtual Reality | “You’re not imagining it. You’re experiencing it.” | Enter → Discover → Interact → Understand → Remember | VR approved entries | **Inside the idea** | Animation + 3D, Content, Film, Digital, Experiences, Creative Technology, Design |
| Augmented Reality | “The real world. With more to discover.” | See → Point → Discover → Interact → Continue | AR approved entries | **A layer worth discovering** | Brand, Design, Animation + 3D, Digital, Experiences, Creative Technology, Content |
| Animation | “Bring ideas to life.” | Idea → Design → Motion → Frame → Story | Animation approved entries | **Frame by frame** | Design, Content, Film, Animation + 3D, Digital, Experiences |
| Brand Advertisement | approved route heading | Idea → Message → Identity → Content → Experience → Audience | Brand Advertisement approved entries | **Ideas in public** | selected source-defined subset only |
| Media Production | approved route heading | Idea → Script → Pre-production → Production → Post → Delivery | Media Production approved entries | **From idea to final frame** | selected source-defined subset only |

The last two route labels/headings and their precise capability subsets remain governed by `experienceStories.json` and `slideExperiences.json`; this table deliberately does not create new claims or overwrite source copy.

## Work relationship rules

1. Runtime Work uses only exact published-title matching against the verified public archive.
2. The bridge is editorial framing, not a project claim or result claim.
3. If no defensible archive match exists, the route says so and links to the complete verified Works archive rather than inventing a relationship.
4. Archive titles, descriptions, thumbnail references and YouTube URLs are passed through unchanged.
5. Media Production remote film remains held until explicit activation and keeps `preload="none"`.

## Interaction content contract

- A map stage always has a visible label before it is selected.
- Selection changes the supporting explanation **and the image**. Each map/application index has a specifically mapped online-library photo selected for that topic; image paths do not repeat within an individual route’s map or application index. The visible “Photo via Unsplash” label prevents it from being misread as a claimed case study.
- All seven inner routes use different hero photography. Inner route entries and explorer fields use downloaded online-library imagery only. Homepage slide video/poster media is homepage-only and is not used as an inner-page fallback.
- Every active panel offers a native “Continue” control in addition to direct selection; maps and applications are keyboard-operable with Arrow, Home and End keys.
- Every application panel is rendered as semantic tab-panel content at runtime and all approved source content is serialized in the static fallback.
- No application title, work title, client, metric, industry outcome or case study has been invented.

## Semantic hierarchy

- One route H1 in the entry field.
- H2 landmarks for approved narrative stages, map, Work, capabilities and CTA context.
- H3 for application panel titles and Work record titles.
- Native links for navigation/media source destinations; native buttons for explorer selection and optional remote-media activation.
- Breadcrumb and WebPage schema remain supplied in every generated route document.

## Content source of truth

| Need | Source |
|---|---|
| Seven route identity, entry media, slides, summary, CTA and selective capabilities | `src/data/slideExperiences.json` |
| Metaverse detail and possible-use language | `src/data/metaverseContent.json` |
| MR/VR/AR/Animation/Brand/Media detail and possible-use language | `src/data/experienceStories.json` |
| Experience map/process and non-claim work bridge | `src/data/experienceMaps.json` |
| Topic-to-image references (online-library image map) | `src/data/explorerVisuals.json` |
| Inner-page hero visual map (online-library photos only) | `src/data/innerHeroVisuals.json` |
| Downloaded online-library image files | `public/inner-library/*.webp` — 12 local WebP files; only the active selection loads |
| Library URLs and verification note | `docs/INNER-PAGE-IMAGE-SOURCES.json` |
| Verified Work | `src/data/videoArchive.json` |
| Static equivalent | `scripts/generateStaticFallbacks.mjs` |

## Known browser validation limitation

The Chromium dependency `libnspr4.so` is unavailable. Runtime visual hierarchy, actual selected-state announcement, touch behavior, media playback, transition continuity and CSS composition at target viewports remain **BLOCKED**, not passed. Static/build/source checks are documented separately in `INNER-PAGE-RED-TEAM.md`.
