# Angel Creations — Homepage Slider Inner Pages

**Implemented:** 2026-10-05  
**Scope:** deepen the seven existing homepage-slider routes without replacing Angel’s homepage, sequence, menu, design language, capability model, or URL architecture.

## Implementation architecture

### One source route map, two delivery modes

`src/data/slideExperiences.json` is a deliberately small map of the already-existing seven slider routes. It preserves the exact slide number, label, heading, media path and route, then records only source-qualified lists and capability connections.

- `HomeSlideshow.tsx` reads the map, so the homepage and inner experience cannot drift on names, order, media or route.
- `SliderExperience.tsx` is a route-level lazy-loaded inner-room component. It owns the slide-continuity hero, numbered sequential sections, strict work matching, related capabilities, conversation CTA and journey navigation.
- `MetaverseStory.tsx` and `metaverseContent.json` keep the supplied long-form Metaverse content in its own lazy chunk, so it does not burden the homepage or other six inner routes.
- `ExperienceStory.tsx` and `experienceStories.json` deliver the supplied route-specific Mixed Reality, Virtual Reality, Augmented Reality, Animation, Brand Advertisement and Media Production narratives in one shared deferred implementation—without placing the copy in the homepage entry.
- `scripts/generateStaticFallbacks.mjs` reads the same route data and content sources to emit meaningful no-JavaScript content for all seven direct URLs.
- No new indexable routes were introduced. The existing seven clean slider paths remain the only inner-experience paths.
- The seven slider experiences remain the primary Angel journey. Brand, Design, Content, Film, Animation + 3D, Digital, Experiences and Creative Technology remain a deeper linked taxonomy—not a replacement seven-page navigation system.

### Shared experience grammar, not a repeated template

Each route retains an Angel media doorway, source-qualified long-form sequence, exact-title Work check, relevant capability links, conversation CTA and adjacent-experience movement. The actual rooms are deliberately distinct:

- **Metaverse** — worlds, environments, experience layers, communities and virtual systems.
- **Mixed Reality** — physical/digital interaction, spatial scenarios and four experience questions.
- **Virtual Reality** — immersion, simulation, equipment, events and the Enter → Remember journey.
- **Augmented Reality** — real-world context, discovery and the physical things that could become interactive.
- **Animation** — moving-image disciplines, communication purposes and Idea → Delivery.
- **Brand Advertisement** — message-to-experience, campaigns, brand language and ecosystem thinking.
- **Media Production** — production disciplines, production purposes and Discover → Deliver.

All use rule-separated, numbered Angel sequences—not cards, a generic service grid, or a repeated corporate hero/three-card/CTA template.

## Experience-by-experience record

| Slide / route | Inner experience source material | Connected capabilities | Verified Work integration |
|---|---|---|---|
| **01 — `/metaverse/`** | Supplied Metaverse narrative: virtual worlds, events, brand experiences, gaming, marketplaces, economies, education, workspaces, product showcases, the Space/Story/Interaction/People/Content/Return experience layer, 15 named contexts and the Idea → Story → World → Interaction → Content → Technology → Experience sequence. The captured MetaScore Unity WebGL artifact is preserved behind an explicit load action. | Brand, Design, Content, Animation + 3D, Digital, Experiences, Creative Technology | No archive record is shown: no title match is asserted. Full Works archive remains linked. |
| **02 — `/mixed-reality/`** | Supplied MR narrative: physical + digital interaction, 9 use-case groups, the Space/Object/Interaction/Purpose test and named environments. | Design, Animation + 3D, Digital, Experiences, Creative Technology, Content | No archive record is shown: no title match is asserted. |
| **03 — `/virtual-reality/`** | Supplied VR narrative: immersion, simulation, 9 use-case groups, events, equipment/setup, Enter → Remember journey and named contexts. | Animation + 3D, Content, Film, Digital, Experiences, Creative Technology, Design | `Virtual Reality | Augmented Reality | 3D illusion` only. |
| **04 — `/augment-reality/`** | Supplied AR narrative: real-world context, 10 application groups, AR discovery flow, delivery surfaces and physical-world opportunity prompts. | Brand, Design, Animation + 3D, Digital, Experiences, Creative Technology, Content | `Virtual Reality | Augmented Reality | 3D illusion` only. The unrelated captured legacy work-list shell is not reused. |
| **05 — `/animation/`** | Supplied Animation narrative: 10 creation disciplines, business and experience uses, and Idea → Delivery process. | Brand, Design, Content, Film, Digital, Experiences, Creative Technology | First three exact published-title matches: `Happy Independence Day | 15 August | Animation | Angel's Creations`; `Universal Animation | Black Hole | The High Energy Universe | Side By Side | Angel's Creations`; `World Tour | Over The Edge | Advertisement | 3D Animation | Angel's Creations`. |
| **06 — `/brand-advertisement/`** | Supplied Brand Advertisement narrative: message-to-experience, six campaign forms, brand experience, technology, language, ecosystem and named contexts. | Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, Creative Technology | First three exact published-title matches: `World Tour | Over The Edge | Advertisement | 3D Animation | Angel's Creations`; `Indian Cultural Map Tour | Motion Graphics | Advertisement | Animation | Angel's Creations`; `Advance Travel International | Advertisement | Animated | Angel's Creations`. |
| **07 — `/media-production/`** | Supplied Media Production narrative: 10 production disciplines, purpose, ecosystem, project-fit teams, Discover → Deliver and delivery surfaces. | Brand, Design, Content, Film, Animation + 3D, Digital, Experiences, Creative Technology | `Digital Marketing | Broadcasting & Media Production | Event Organizers | Angel's Creations`; `Circle of Life | A 2D Classical Animation | Short Film | Angel's Creations`. |

All displayed work links use original title, description when available, local source thumbnail derivative and exact YouTube URL. Matching is intentionally constrained to the published **title**; descriptions/tags are not used to stretch relevance.

## Continuity and navigation

- The existing vertical Header/Menu remains the global navigation.
- Each inner page continues the slide’s number, label, exact caption, media tone, thin-rule rhythm, warm accent, dark environment and restrained movement.
- Inner journey navigation uses Angel’s existing `Prev` / `Next` vocabulary and carries users to the adjacent item in the existing seven-slide sequence.
- The Home control returns to the corresponding slide number.
- On a slider-caption click, the current homepage history entry is marked with the active slide index before navigation. Browser Back restores that slide when the route history supports it.
- Direct URL loading does not rely on visiting the homepage first.

## Media and performance decisions

- Six local experience films retain their original slide media with a same-source poster and `preload="metadata"` on the direct inner experience.
- The remote Media Production QuickTime film remains held behind an explicit **Activate film** action. It is not requested on direct entry and retains `preload="none"` when rendered.
- The original homepage guard remains: inactive remote slide media uses `preload="none"`.
- `SliderExperience` is route-level lazy loaded; detailed Metaverse prose is isolated in its own lazy `MetaverseStory` chunk and the remaining six supplied narratives in a shared lazy `ExperienceStory` chunk. The 47-record archive lives in the existing deferred archive data chunk, not the homepage entry chunk.
- No YouTube iframes were introduced. Archive links open original YouTube URLs.
- The optional Unity MetaScore runtime is lazy loaded only after its source-artifact action is selected.

## Direct URL and no-JavaScript delivery

Each seven-slide route now emits a static fallback with:

- unique title and source-qualified description
- canonical URL
- OG title/description/URL, plus same-source local poster image where available
- one H1 and ordered H2 sections
- WebPage and BreadcrumbList JSON-LD
- primary navigation, relevant work links where evidence exists, related capability links, adjacent-experience links and contact CTA
- Vite module/CSS entry assets for JavaScript-capable visitors

The no-JavaScript fallback never exposes an empty legacy shell.
