import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion, shouldAutoplayAmbientMedia } from '../utils/mediaPreferences';
import type { SlideExperience } from '../data/slideExperiences';
import { imageSize } from '../utils/imageDimensions';

type ProcessPhase = {
  title: string;
  description: string;
  expertise: string;
  outputs: string[];
};

type RouteProcess = {
  heading: string;
  intro: string;
  phases: ProcessPhase[];
};

const phase = (
  title: string,
  description: string,
  expertise: string,
  outputs: string[]
): ProcessPhase => ({ title, description, expertise, outputs });

const ROUTE_PROCESS: Record<string, RouteProcess> = {
  '/metaverse/': {
    heading: 'From first idea to a world people return to',
    intro:
      'A metaverse cannot be produced like a web page. It has to be planned as a place: with a purpose, inhabitants, rules, content, technology and a reason to come back after the first visit.',
    phases: [
      phase(
        'Discover the reason to enter',
        'We define the audience, business or cultural purpose, desired behaviours and measures of success before choosing a platform. This prevents technology from becoming the idea.',
        'Experience strategy · audience research · creative direction',
        ['Opportunity brief', 'Audience journeys', 'Success measures']
      ),
      phase(
        'Define the world blueprint',
        'The world is mapped as connected zones, stories, social systems, identity, content and possible commerce. Technical architecture is selected around the experience—not the other way around.',
        'World design · UX architecture · technical strategy',
        ['World blueprint', 'Feature scope', 'Platform plan']
      ),
      phase(
        'Prototype the core loop',
        'A playable grey-box version tests arrival, navigation, interaction and the central repeatable activity. We learn whether the world is understandable and worth returning to before full production begins.',
        'Game design · interaction design · real-time prototyping',
        ['Playable prototype', 'Navigation model', 'Performance benchmarks']
      ),
      phase(
        'Build the living world',
        'Environments, avatars, objects, animation, audio, multiplayer services and content tools are produced as one coordinated system, with optimisation and moderation designed in from the start.',
        '3D art · real-time engineering · backend and content systems',
        ['Production build', 'World asset library', 'Content controls']
      ),
      phase(
        'Test with real people and real devices',
        'We validate onboarding, social behaviour, frame rate, network behaviour, safety, accessibility and browser or headset performance. Friction points are refined before launch.',
        'QA · accessibility · performance and community safety',
        ['Usability findings', 'Optimised release build', 'Launch checklist']
      ),
      phase(
        'Launch, learn and evolve',
        'Release is treated as the beginning. Events, content drops, analytics and community feedback guide new zones, stories and features so the world continues to feel alive.',
        'Live operations · analytics · community and content planning',
        ['Launch kit', 'Insight dashboard', 'Evolution roadmap']
      ),
    ],
  },
  '/mixed-reality/': {
    heading: 'From physical insight to an intelligent spatial layer',
    intro:
      'Mixed Reality succeeds when digital information understands the room, the task and the person. Our process starts in the real environment and keeps returning to it at every decision gate.',
    phases: [
      phase(
        'Understand the real environment',
        'We study the physical space, workflow, lighting, movement, safety constraints and the people who will use the experience. The environment becomes part of the design brief.',
        'Spatial research · service design · creative technology',
        ['Site and task audit', 'User scenarios', 'Experience brief']
      ),
      phase(
        'Define the spatial use case',
        'We identify what must be anchored, revealed, measured or manipulated, then select the device, tracking, interaction and data strategy that can support it reliably.',
        'Experience architecture · device strategy · data design',
        ['Spatial interaction map', 'Hardware plan', 'Technical scope']
      ),
      phase(
        'Prototype in context',
        'Scene understanding, anchors, occlusion, hand or eye interaction and digital object behaviour are tested where the experience will actually happen—not only on a desk.',
        'Spatial UX · computer vision · real-time prototyping',
        ['In-situ prototype', 'Interaction rules', 'Tracking benchmarks']
      ),
      phase(
        'Build and integrate',
        'Real-time 3D content, interfaces, sensors and live information are integrated into a stable application, with fallbacks for changing light, space and network conditions.',
        'Real-time 3D · software engineering · systems integration',
        ['Production application', 'Content pipeline', 'Integration build']
      ),
      phase(
        'Validate comfort, safety and accuracy',
        'Tracking stability, latency, ergonomics, readability, accessibility and physical safety are tested with representative users and tasks before deployment.',
        'QA · human factors · accessibility and performance',
        ['Field-test report', 'Refined interactions', 'Deployment checklist']
      ),
      phase(
        'Deploy, train and scale',
        'Devices, facilitators and support materials are prepared for launch. Usage insight then guides content updates and expansion to new spaces or teams.',
        'Deployment · training · analytics and support',
        ['Rollout kit', 'Operator guidance', 'Scale roadmap']
      ),
    ],
  },
  '/virtual-reality/': {
    heading: 'From immersion strategy to safe, memorable presence',
    intro:
      'A powerful VR experience is not created by placing a screen in front of the eyes. It is choreographed around presence, comfort, interaction and the feeling that stays after the headset comes off.',
    phases: [
      phase(
        'Define the purpose of presence',
        'We clarify what the audience should learn, feel, practise or decide, together with session length, facilitation needs and the physical setting in which VR will be used.',
        'Experience strategy · learning and behavioural design',
        ['Experience brief', 'Audience journey', 'Session plan']
      ),
      phase(
        'Blueprint the world and interaction',
        'Story, navigation, locomotion, controllers or hand tracking, spatial audio and comfort rules are designed as a single system before detailed production.',
        'VR UX · narrative design · technical direction',
        ['World blueprint', 'Interaction model', 'Comfort guidelines']
      ),
      phase(
        'Prototype the defining moments',
        'Grey-box environments and interaction tests prove scale, movement, readability and emotional impact early, while changes are still fast and economical.',
        'Real-time prototyping · spatial design · user testing',
        ['Playable prototype', 'Locomotion tests', 'Technical benchmarks']
      ),
      phase(
        'Produce the immersive world',
        'Environments, characters, animation, interface, spatial sound and interactive systems are built and continuously optimised for the target headset and frame-rate budget.',
        '3D production · real-time engineering · spatial audio',
        ['Production build', 'Optimised assets', 'Facilitator interface']
      ),
      phase(
        'Test comfort and comprehension',
        'We test motion comfort, onboarding, task completion, accessibility alternatives, hygiene and facilitated operation with people who match the intended audience.',
        'QA · accessibility · comfort and usability research',
        ['Comfort report', 'Refined onboarding', 'Release candidate']
      ),
      phase(
        'Deploy, facilitate and measure',
        'Headsets, stations, casting, staff guidance and data capture are prepared for events, training or permanent installations, then improved from real session insight.',
        'Deployment · event operations · analytics',
        ['Deployment kit', 'Facilitator guide', 'Impact dashboard']
      ),
    ],
  },
  '/augment-reality/': {
    heading: 'From a real-world trigger to a useful augmented moment',
    intro:
      'The best AR feels effortless: a person sees something familiar, points a device and discovers another layer. Our process removes friction between the physical trigger and the digital reward.',
    phases: [
      phase(
        'Find the augmented opportunity',
        'We identify the product, package, place, print or object that can become interactive, and define what the user should understand or do within seconds.',
        'Experience strategy · audience and context research',
        ['Opportunity brief', 'Trigger shortlist', 'User journey']
      ),
      phase(
        'Choose the platform and tracking method',
        'WebAR, an app or a social camera route is selected alongside image, object, surface or location tracking, based on reach, reliability and the campaign or service goal.',
        'Technical strategy · UX architecture · content planning',
        ['Platform decision', 'Tracking plan', 'Technical scope']
      ),
      phase(
        'Prototype the reveal',
        'The scan, first recognition, reveal animation and primary interaction are tested early. If the first five seconds are not clear, the experience is redesigned.',
        'Interaction design · creative technology · motion design',
        ['Working AR prototype', 'Onboarding flow', 'Tracking tests']
      ),
      phase(
        'Create lightweight, believable content',
        '3D models, animation, interface and sound are produced within strict size and performance budgets so the experience loads quickly and remains stable on everyday devices.',
        '3D and motion production · engineering · optimisation',
        ['Optimised AR assets', 'Interactive build', 'Content variants']
      ),
      phase(
        'Test in the wild',
        'Lighting, print quality, reflective surfaces, distance, networks and different phones are tested in realistic conditions—not only under studio light.',
        'Device QA · accessibility · field testing',
        ['Device test matrix', 'Tracking refinements', 'Launch build']
      ),
      phase(
        'Launch and amplify',
        'QR codes, packaging prompts, deep links and campaign media make the experience easy to find. Scan and interaction analytics guide new content and seasonal updates.',
        'Campaign activation · analytics · content operations',
        ['Launch assets', 'Measurement dashboard', 'Update roadmap']
      ),
    ],
  },
  '/animation/': {
    heading: 'From frame one to the final cut',
    intro:
      'Animation gives form to ideas that cannot simply be filmed. Our process protects the idea through script, design, timing, production and finishing—so every frame has a reason to move.',
    phases: [
      phase(
        'Clarify the message',
        'We define the audience, communication problem, desired response and places where the animation will live. A clear brief prevents beautiful motion from saying the wrong thing.',
        'Creative strategy · story development · production planning',
        ['Creative brief', 'Audience definition', 'Format plan']
      ),
      phase(
        'Write, board and design the world',
        'Script, storyboard, character and environment design, colour, typography and styleframes establish the story and visual language before full animation begins.',
        'Writing · visual development · art direction',
        ['Script', 'Storyboard', 'Styleframes']
      ),
      phase(
        'Prove timing with an animatic',
        'Board timing, temporary voice, music and sound reveal pacing, clarity and emotional rhythm. The sequence is locked before expensive production work multiplies.',
        'Direction · editing · sound design',
        ['Animatic', 'Timing lock', 'Voice and music direction']
      ),
      phase(
        'Animate and build every frame',
        '2D, 3D, character, product or motion-graphics production proceeds shot by shot, with reviews that keep performance, design and story aligned.',
        '2D and 3D animation · modelling · motion design',
        ['Animation passes', 'Shot reviews', 'Production renders']
      ),
      phase(
        'Composite, sound and polish',
        'Lighting, compositing, effects, colour, voice, music, sound design, captions and accessible versions bring separate elements together as one finished film.',
        'Compositing · sound · colour and accessibility',
        ['Finished picture', 'Final mix', 'Captioned versions']
      ),
      phase(
        'Master and adapt',
        'The work is delivered for cinema, broadcast, social, web, events or immersive screens, with aspect-ratio, language and cutdown versions prepared from the same approved master.',
        'Finishing · versioning · delivery and archive',
        ['Platform masters', 'Cutdowns', 'Project archive']
      ),
    ],
  },
  '/brand-advertisement/': {
    heading: 'From brand truth to a campaign ecosystem',
    intro:
      'A campaign becomes powerful when strategy, identity, film, animation, digital media and physical experience all speak the same language. This process keeps one idea coherent across every touchpoint.',
    phases: [
      phase(
        'Discover the brand and market',
        'We study the organisation, audience, category, culture and competitors to find the truth the brand can credibly own and the behaviour the work needs to influence.',
        'Brand strategy · research · audience insight',
        ['Brand audit', 'Audience insight', 'Opportunity brief']
      ),
      phase(
        'Build the strategy and big idea',
        'Positioning, message hierarchy and creative territories are developed into a campaign idea flexible enough to become film, content, interaction and experience.',
        'Strategy · creative direction · messaging',
        ['Campaign strategy', 'Creative territories', 'Message system']
      ),
      phase(
        'Design the campaign system',
        'Visual identity, typography, motion, sound, content formats and channel roles are designed together, so every asset feels connected without becoming repetitive.',
        'Brand design · motion identity · content architecture',
        ['Campaign toolkit', 'Channel plan', 'Design system']
      ),
      phase(
        'Produce the hero assets',
        'Film, photography, animation, digital content and experiential pieces are produced under one creative direction, with adaptations planned during—not after—the shoot or build.',
        'Film and photography · animation · digital production',
        ['Hero campaign assets', 'Social content', 'Experience assets']
      ),
      phase(
        'Test, localise and prepare launch',
        'Brand consistency, readability, accessibility, language, media specifications and legal or platform requirements are checked across the complete asset set.',
        'Brand QA · localisation · media production',
        ['Approved master assets', 'Localised versions', 'Launch pack']
      ),
      phase(
        'Activate, measure and optimise',
        'Performance and audience response guide which stories, formats and channels to extend. The campaign evolves from a launch moment into a living content ecosystem.',
        'Activation · analytics · content optimisation',
        ['Performance learnings', 'Optimisation plan', 'Next-phase roadmap']
      ),
    ],
  },
  '/media-production/': {
    heading: 'From first brief to final frame',
    intro:
      'Exceptional media is planned long before the camera rolls or the first frame is rendered. Our production process connects story, craft, logistics and delivery formats from the beginning.',
    phases: [
      phase(
        'Discover the story and production brief',
        'We define the objective, audience, story, channels, formats and measures of success, then identify the creative and technical approach the idea genuinely requires.',
        'Creative strategy · direction · production leadership',
        ['Production brief', 'Audience definition', 'Format strategy']
      ),
      phase(
        'Develop and pre-produce',
        'Treatment, script, casting, locations, schedule, crew, equipment, permissions and contingency planning turn the idea into a production that can be executed with confidence.',
        'Writing · producing · production management',
        ['Treatment and script', 'Shooting plan', 'Call sheets']
      ),
      phase(
        'Design the look and sound',
        'Cinematography, production design, wardrobe, lighting, graphics, animation and sound are aligned in references, boards and tests before principal production.',
        'Cinematography · production design · sound direction',
        ['Lookbook', 'Camera and lighting plan', 'Graphics direction']
      ),
      phase(
        'Shoot and create',
        'Direction, camera, performance, sound, photography and production management work as one team, while media is checked and protected throughout the production day.',
        'Direction · cinematography · photography and sound',
        ['Principal photography', 'Production stills', 'Verified media archive']
      ),
      phase(
        'Edit and finish',
        'Editorial structure, animation, visual effects, colour grade, music, sound design, mix, captions and accessibility versions transform captured material into the final work.',
        'Editing · VFX and animation · grade and sound',
        ['Picture lock', 'Finished mix', 'Accessible versions']
      ),
      phase(
        'Master, deliver and repurpose',
        'Final masters are prepared for television, cinema, digital, social, events and immersive environments, with cutdowns and reusable assets planned from the original production.',
        'Finishing · versioning · delivery and archive',
        ['Platform masters', 'Cutdown library', 'Secure project archive']
      ),
    ],
  },
};

const PROCESS_GUARDRAILS = [
  {
    title: 'Decision gates',
    text: 'Each phase ends with a visible review, agreed priorities and a clear next step.',
  },
  {
    title: 'Constraints designed in',
    text: 'Devices, platforms, production realities and performance budgets shape the work early.',
  },
  {
    title: 'Accessibility by default',
    text: 'Readable interfaces, captions, comfort choices and meaningful alternatives are planned—not bolted on.',
  },
  {
    title: 'Evidence after launch',
    text: 'Measurement and audience feedback turn the first release into a stronger next version.',
  },
] as const;

type ProcessVisual = {
  src: string;
  caption?: string;
  subtitle?: string;
};

type ExperienceProcessProps = {
  experience: SlideExperience;
  enquiryHref: string;
  onEnquiryClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  visualSrc?: string;
  visuals?: ProcessVisual[];
};

const PROCESS_CYCLE_MS = 5600;

export function ExperienceProcess({
  experience,
  enquiryHref,
  onEnquiryClick,
  visualSrc,
  visuals,
}: ExperienceProcessProps): JSX.Element | null {
  const process = ROUTE_PROCESS[experience.route];
  const phases = process?.phases ?? [];
  const sectionRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const swipeRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(() => shouldAutoplayAmbientMedia());
  const [isInView, setIsInView] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  const stageVisuals = useMemo<ProcessVisual[]>(() => {
    const supplied = (visuals ?? [])
      .filter((visual) => Boolean(visual.src))
      .map((visual) => ({
        src: visual.src,
        caption: visual.caption || visual.subtitle || experience.label,
      }));
    if (supplied.length > 0) return supplied;
    return visualSrc ? [{ src: visualSrc, caption: experience.label }] : [];
  }, [experience.label, visualSrc, visuals]);

  useEffect(() => {
    setActivePhase(0);
    setIsAutoPlaying(shouldAutoplayAmbientMedia());
    setIsInteractionPaused(false);
    setCycleKey((current) => current + 1);
    tabRefs.current = [];
  }, [experience.route]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.18),
      { threshold: [0, 0.18, 0.42] }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [experience.route]);

  const selectPhase = useCallback(
    (
      index: number,
      options: { pauseAutoplay?: boolean; focusTab?: boolean } = {}
    ): void => {
      if (phases.length === 0) return;
      const nextIndex = ((index % phases.length) + phases.length) % phases.length;
      setActivePhase(nextIndex);
      setCycleKey((current) => current + 1);
      if (options.pauseAutoplay ?? true) setIsAutoPlaying(false);
      if (options.focusTab) {
        window.requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
      }
    },
    [phases.length]
  );

  useEffect(() => {
    const selector = selectorRef.current;
    const activeTab = tabRefs.current[activePhase];
    if (!selector || !activeTab || selector.scrollWidth <= selector.clientWidth + 1) return;

    selector.scrollTo({
      left: activeTab.offsetLeft - (selector.clientWidth - activeTab.clientWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activePhase]);

  useEffect(() => {
    if (!isAutoPlaying || !isInView || isInteractionPaused || phases.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActivePhase((current) => (current + 1) % phases.length);
      setCycleKey((current) => current + 1);
    }, PROCESS_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isInView, isInteractionPaused, phases.length]);

  if (!process || phases.length === 0) return null;

  const active = phases[activePhase] ?? phases[0];
  const previous = phases[(activePhase - 1 + phases.length) % phases.length];
  const next = phases[(activePhase + 1) % phases.length];
  const activeVisualIndex = stageVisuals.length > 0 ? activePhase % stageVisuals.length : 0;
  const activeVisual = stageVisuals[activeVisualIndex];
  const routeSlug = experience.route.replace(/\//g, '') || 'experience';
  const panelId = `process-panel-${routeSlug}`;
  const isGuidedLive = isAutoPlaying && isInView && !isInteractionPaused;
  const sectionStyle = {
    '--process-progress': `${((activePhase + 1) / phases.length) * 100}%`,
  } as CSSProperties;

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number): void => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = index + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = index - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = phases.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    selectPhase(nextIndex, { focusTab: true });
  };

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const section = sectionRef.current;
    if (!section || event.pointerType === 'touch' || prefersReducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    section.style.setProperty('--process-pointer-x', `${(x * 100).toFixed(1)}%`);
    section.style.setProperty('--process-pointer-y', `${(y * 100).toFixed(1)}%`);
    section.style.setProperty('--process-tilt-x', `${((0.5 - y) * 3.2).toFixed(2)}deg`);
    section.style.setProperty('--process-tilt-y', `${((x - 0.5) * 3.6).toFixed(2)}deg`);
  };

  const resetStagePointer = (): void => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty('--process-pointer-x', '72%');
    section.style.setProperty('--process-pointer-y', '18%');
    section.style.setProperty('--process-tilt-x', '0deg');
    section.style.setProperty('--process-tilt-y', '0deg');
  };

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    swipeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const handleStagePointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
    selectPhase(activePhase + (deltaX < 0 ? 1 : -1));
  };

  return (
    <section
      ref={sectionRef}
      id="inner-process"
      className={`apple-process-section${isGuidedLive ? ' is-guided-live' : ''}`}
      style={sectionStyle}
      aria-labelledby="experience-process-title"
      data-active-phase={activePhase}
    >
      <div className="apple-process-section__ambient" aria-hidden="true" />
      <div className="apple-process-container">
        <div className="apple-process-layout">
          <header className="apple-process-intro">
            <div className="apple-section-eyebrow apple-process-eyebrow">
              <span className="apple-section-eyebrow__dot" aria-hidden="true" />
              <span>The Process</span>
            </div>
            <p className="apple-process-kicker">A clear path from idea to launch</p>
            <h2 id="experience-process-title" className="apple-process-title">
              {process.heading}
            </h2>
            <p className="apple-process-lead">{process.intro}</p>
            <p className="apple-process-expert-note">
              Strategists, designers, engineers, producers, accessibility specialists and QA
              experts review the work at every gate—so the creative idea survives contact with
              real devices, real places and real audiences.
            </p>
            <a href={enquiryHref} className="apple-process-cta" onClick={onEnquiryClick}>
              <span>Start with Discovery</span>
              <span aria-hidden="true">→</span>
            </a>
            <p className="apple-process-live-status" aria-hidden="true">
              <span className="apple-process-live-status__dot" />
              <span>
                Now exploring <strong>{active.title}</strong>
              </span>
            </p>
          </header>

          <div
            className="apple-process-explorer"
            onMouseEnter={() => setIsInteractionPaused(true)}
            onMouseLeave={() => setIsInteractionPaused(false)}
            onFocusCapture={() => setIsInteractionPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsInteractionPaused(false);
              }
            }}
          >
            <div
              className="apple-process-stage"
              onPointerMove={handleStagePointerMove}
              onPointerLeave={resetStagePointer}
              onPointerDown={handleStagePointerDown}
              onPointerUp={handleStagePointerEnd}
              onPointerCancel={() => {
                swipeRef.current = null;
              }}
            >
              <div className="apple-process-stage__visual" aria-hidden="true">
                {stageVisuals.map((visual, index) => (
                  <img
                    key={`${visual.src}-${index}`}
                    src={visual.src}
                    {...imageSize(visual.src)}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    className={index === activeVisualIndex ? 'is-active' : undefined}
                  />
                ))}
                <div className="apple-process-stage__shade" />
                <div className="apple-process-stage__rings">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="apple-process-stage__ghost">{experience.label}</span>
                {activeVisual?.caption && (
                  <span key={activeVisual.caption} className="apple-process-stage__caption">
                    {activeVisual.caption}
                  </span>
                )}
              </div>

              <div className="apple-process-stage__topline">
                <span>{isGuidedLive ? 'Guided journey in motion' : 'Interactive process journey'}</span>
                <span>{experience.label}</span>
              </div>

              <div
                key={active.title}
                id={panelId}
                className="apple-process-stage__panel"
                role="tabpanel"
                aria-labelledby={`process-tab-${routeSlug}-${activePhase}`}
              >
                <span className="apple-process-stage__index" aria-hidden="true">
                  {String(activePhase + 1).padStart(2, '0')}
                </span>
                <div className="apple-process-stage__meta">
                  <span>Phase {String(activePhase + 1).padStart(2, '0')}</span>
                  <span>{active.expertise}</span>
                </div>
                <h3>{active.title}</h3>
                <p>{active.description}</p>
                <div className="apple-process-step__outputs">
                  <span className="apple-process-step__outputs-label">You receive</span>
                  <ul>
                    {active.outputs.map((output) => (
                      <li key={output}>{output}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="apple-process-stage__controls">
                <button
                  type="button"
                  className="apple-process-control"
                  onClick={() => selectPhase(activePhase - 1)}
                  aria-label={`Previous phase: ${previous.title}`}
                >
                  <span aria-hidden="true">←</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="apple-process-control apple-process-control--play"
                  onClick={() => {
                    setCycleKey((current) => current + 1);
                    setIsAutoPlaying((current) => !current);
                  }}
                  aria-pressed={isAutoPlaying}
                  aria-label={isAutoPlaying ? 'Pause journey — guided process' : 'Play journey — guided process'}
                >
                  <span
                    className={`apple-process-control__glyph${isAutoPlaying ? ' is-pause' : ' is-play'}`}
                    aria-hidden="true"
                  />
                  <span>{isAutoPlaying ? 'Pause journey' : 'Play journey'}</span>
                </button>
                <button
                  type="button"
                  className="apple-process-control"
                  onClick={() => selectPhase(activePhase + 1)}
                  aria-label={`Next phase: ${next.title}`}
                >
                  <span>Next</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="apple-process-stage__segments" aria-hidden="true">
                {phases.map((step, index) => (
                  <span
                    key={step.title}
                    className={`apple-process-stage__segment${
                      index < activePhase ? ' is-complete' : ''
                    }${index === activePhase ? ' is-active' : ''}`}
                  >
                    {index === activePhase && (
                      <span
                        key={`${activePhase}-${cycleKey}-${String(isGuidedLive)}`}
                        className="apple-process-stage__segment-fill"
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={selectorRef}
              className="apple-process-selector"
              role="tablist"
              aria-label={`${experience.label} process phases`}
            >
              {phases.map((step, index) => {
                const isActive = index === activePhase;
                const isComplete = index < activePhase;
                return (
                  <button
                    key={step.title}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    id={`process-tab-${routeSlug}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    className={`apple-process-selector__item${isActive ? ' is-active' : ''}${
                      isComplete ? ' is-complete' : ''
                    }`}
                    onClick={() => selectPhase(index)}
                    onMouseEnter={() => selectPhase(index, { pauseAutoplay: false })}
                    onFocus={() => selectPhase(index, { pauseAutoplay: false })}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                  >
                    <span className="apple-process-selector__marker" aria-hidden="true">
                      {isComplete ? '✓' : String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="apple-process-selector__body">
                      <strong>{step.title}</strong>
                      <small>{step.expertise}</small>
                    </span>
                    <span className="apple-process-selector__arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="apple-process-explorer__hint">
              Hover, tap, swipe or use arrow keys to move through the journey.
            </p>
          </div>
        </div>

        <div className="apple-process-guardrails" aria-label="Process principles">
          {PROCESS_GUARDRAILS.map((principle, index) => (
            <article
              key={principle.title}
              className="apple-process-guardrail"
              style={{ '--process-guardrail-index': index } as CSSProperties}
            >
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
