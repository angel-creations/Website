import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { slideExperiences } from '../data/slideExperiences';
import { navigate } from '../utils/routes';
const TRANSITION_MS = 1500;
const VIDEO_START_MS = 500;
const VIDEO_PAUSE_MS = 700;
const RELEASE_WAIT_MS = 180;
const PARALLAX = 0.1;
const TRANSITION_OPACITY = 0.1;
const SWIPE_THRESHOLD = 48;

type Slide = {
  number: string;
  label: string;
  heading: string;
  href?: string;
  video: string;
  poster?: string;
  mediaType?: string;
  remote?: boolean;
  h1?: boolean;
};

const slides: Slide[] = slideExperiences.map((slide, index) => ({
  ...slide,
  label: `/ ${slide.label}`,
  href: slide.route,
  h1: index === 0,
}));

function expoInOut(progress: number): number {
  if (progress === 0 || progress === 1) return progress;
  return progress < 0.5
    ? Math.pow(2, 20 * progress - 10) / 2
    : (2 - Math.pow(2, -20 * progress + 10)) / 2;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
}

function playVideo(video: HTMLVideoElement | null): void {
  if (!video || document.hidden) return;
  void video.play().catch(() => {
    // Muted video playback is best effort. The authentic poster remains meaningful if it is blocked.
  });
}

function restoredSlideIndex(): number {
  const candidate = window.history.state?.angelSlide;
  return Number.isInteger(candidate) && candidate >= 0 && candidate < slides.length ? candidate : 0;
}

function retainHomeSlide(index: number): void {
  window.history.replaceState({ ...(window.history.state ?? {}), angelSlide: index }, '', window.location.href);
}

export function HomeSlideshow(): JSX.Element {
  const [active, setActive] = useState(restoredSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [status, setStatus] = useState(() => `Slide ${restoredSlideIndex() + 1} of ${slides.length}: ${slides[restoredSlideIndex()].label.replace('/', '').trim()}`);
  const slideshowRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotionRef = useRef(false);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRef = useRef(active);
  const isWaitingRef = useRef(false);
  const queuedOffsetRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const pointerStartXRef = useRef<number | null>(null);

  const rememberTimer = (callback: () => void, delay: number): void => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  const describeSlide = (index: number): string => `Slide ${index + 1} of ${slides.length}: ${slides[index].label.replace('/', '').trim()}`;

  const pauseAllExcept = (index: number): void => {
    slideRefs.current.forEach((slide, slideIndex) => {
      if (slideIndex !== index) slide?.querySelector<HTMLVideoElement>('video')?.pause();
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (): void => {
      prefersReducedMotionRef.current = mediaQuery.matches;
      setPrefersReducedMotion(mediaQuery.matches);
    };
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    // The authentic poster is immediately visible, then the active muted film is invited to
    // play once the stage is composed. A Back navigation can restore a later slide.
    slideRefs.current.forEach((slide) => slide?.classList.add('is-loaded'));
    rememberTimer(() => {
      if (!prefersReducedMotionRef.current) playVideo(slideRefs.current[activeRef.current]?.querySelector('video') ?? null);
    }, VIDEO_START_MS);

    const onVisibilityChange = (): void => {
      const currentVideo = slideRefs.current[activeRef.current]?.querySelector<HTMLVideoElement>('video') ?? null;
      if (document.hidden) currentVideo?.pause();
      else if (!prefersReducedMotionRef.current) playVideo(currentVideo);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const changeSlide = (offset: number): void => {
    const outgoingIndex = activeRef.current;
    const incomingIndex = (outgoingIndex + offset + slides.length) % slides.length;
    const slideshow = slideshowRef.current;
    const outgoing = slideRefs.current[outgoingIndex];
    const incoming = slideRefs.current[incomingIndex];

    // A second intent is retained rather than ignored. It is played after the current
    // cinematic movement settles, so controls never leave the stage in an in-between state.
    if (isWaitingRef.current) {
      queuedOffsetRef.current = offset;
      return;
    }
    if (!slideshow || !outgoing || !incoming || outgoing === incoming) return;

    const incomingVideo = incoming.querySelector<HTMLVideoElement>('video');
    const outgoingVideo = outgoing.querySelector<HTMLVideoElement>('video');
    incomingVideo?.setAttribute('preload', 'auto');

    const settle = (): void => {
      incoming.classList.add('q_current');
      incoming.classList.remove('is-new');
      outgoing.classList.remove('q_current');
      incoming.removeAttribute('style');
      incoming.querySelector<HTMLElement>('.image-container')?.removeAttribute('style');
      incoming.querySelector<HTMLElement>('.slide-content')?.removeAttribute('style');
      outgoing.querySelector<HTMLElement>('.image-container')?.removeAttribute('style');

      activeRef.current = incomingIndex;
      retainHomeSlide(incomingIndex);
      setActive(incomingIndex);
      setStatus(describeSlide(incomingIndex));
      setIsTransitioning(false);
      isWaitingRef.current = false;
      slideshow.setAttribute('wait', 'false');
      pauseAllExcept(incomingIndex);

      const queuedOffset = queuedOffsetRef.current;
      queuedOffsetRef.current = null;
      if (queuedOffset !== null) window.requestAnimationFrame(() => changeSlide(queuedOffset));
    };

    // The motion-reduced experience preserves the exact slide sequence and media hierarchy
    // without parallax, word staggering, or a long wait state.
    if (prefersReducedMotion) {
      incoming.style.display = 'block';
      incoming.classList.add('is-new');
      settle();
      outgoingVideo?.pause();
      return;
    }

    incomingVideo?.load();
    const incomingImage = incoming.querySelector<HTMLElement>('.image-container');
    const outgoingImage = outgoing.querySelector<HTMLElement>('.image-container');
    const incomingContent = incoming.querySelector<HTMLElement>('.slide-content');
    if (!incomingImage || !outgoingImage) return;

    isWaitingRef.current = true;
    setIsTransitioning(true);
    slideshow.setAttribute('wait', 'true');

    const width = slideshow.clientWidth;
    const movingForward = offset > 0;
    const incomingStartX = movingForward ? -width * (1 - PARALLAX) : -width * PARALLAX;
    const outgoingEndX = movingForward ? -width * PARALLAX : width * PARALLAX;

    // Source-faithful directional width reveal: a zero-width incoming layer opens while
    // the outgoing/incoming media travel in opposite directions. Only the existing stage
    // vocabulary is used; no replacement hero or new visual effect is introduced.
    incoming.classList.add('is-new');
    incoming.style.display = 'block';
    incoming.style.width = '0px';
    incoming.style.right = movingForward ? '0px' : 'auto';
    incoming.style.left = movingForward ? 'auto' : '0px';
    incoming.style.zIndex = '2';
    incomingImage.style.width = `${width}px`;
    incomingImage.style.transform = `translate3d(${incomingStartX}px, 0, 0)`;
    incomingImage.style.opacity = String(TRANSITION_OPACITY);
    outgoingImage.style.transform = 'translate3d(0, 0, 0)';
    outgoingImage.style.opacity = '1';
    if (incomingContent) {
      incomingContent.style.width = `${width}px`;
      incomingContent.style.right = movingForward ? 'auto' : '0px';
      incomingContent.style.left = movingForward ? '0px' : 'auto';
    }

    const outgoingWords = Array.from(outgoing.querySelectorAll<HTMLElement>('.q_split_wrap'));
    const incomingWords = Array.from(incoming.querySelectorAll<HTMLElement>('.q_split_wrap'));
    const outgoingWordX = movingForward ? -50 : 50;
    const incomingWordX = movingForward ? 50 : -50;
    const startedAt = performance.now();

    const animate = (now: number): void => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / TRANSITION_MS);
      const eased = expoInOut(progress);

      incoming.style.width = `${width * eased}px`;
      incomingImage.style.transform = `translate3d(${incomingStartX * (1 - eased)}px, 0, 0)`;
      incomingImage.style.opacity = String(TRANSITION_OPACITY + (1 - TRANSITION_OPACITY) * eased);
      outgoingImage.style.transform = `translate3d(${outgoingEndX * eased}px, 0, 0)`;
      outgoingImage.style.opacity = String(1 - (1 - TRANSITION_OPACITY) * eased);

      outgoingWords.forEach((word, index) => {
        const wordProgress = Math.min(1, Math.max(0, (elapsed - index * 50) / 600));
        const wordEase = 1 - Math.pow(1 - wordProgress, 5);
        word.style.opacity = String(1 - wordEase);
        word.style.transform = `translate3d(${outgoingWordX * wordEase}px, 0, 0)`;
      });
      incomingWords.forEach((word, index) => {
        const wordProgress = Math.min(1, Math.max(0, (elapsed - 800 - index * 100) / TRANSITION_MS));
        const wordEase = 1 - Math.pow(1 - wordProgress, 5);
        word.style.opacity = String(wordEase);
        word.style.transform = `translate3d(${incomingWordX * (1 - wordEase)}px, 0, 0)`;
      });

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }
      animationFrameRef.current = null;
      settle();
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    rememberTimer(() => playVideo(incomingVideo), VIDEO_START_MS);
    rememberTimer(() => outgoingVideo?.pause(), VIDEO_PAUSE_MS);
  };

  const onStageKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.defaultPrevented || isEditableTarget(event.target)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    pointerStartXRef.current = event.pointerType === 'mouse' ? null : event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>): void => {
    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;
    if (startX === null || event.pointerType === 'mouse') return;
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    changeSlide(deltaX < 0 ? 1 : -1);
  };

  return (
    <main id="main" className="site-main">
      <div className="cursor" data-cursor><div className="inner"><div className="circle"><span className="cursor_text" /></div></div></div>
      <div id="load_overlay" className="load_overlay" />
      <div id="dynamicLoad" className="dynamic_load"><div className="progress"><div className="bar" id="dynamicBar" /></div></div>
      <div id="barba-wrapper"><div className="barba-container"><div data-scroll-container>
        <main id="main">
          <div data-scroll-section>
            <section
              ref={slideshowRef}
              id="slideshow"
              className="slideshow"
              data-scroll-sticky
              aria-roledescription="carousel"
              aria-label="Angel capabilities presentation"
              aria-describedby="slideshow-instructions slideshow-status"
              tabIndex={0}
              onKeyDown={onStageKeyDown}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { pointerStartXRef.current = null; }}
            >
              <p id="slideshow-instructions" className="sr-only">Use the previous and next buttons, left and right arrow keys, or a horizontal swipe to explore Angel capabilities.</p>
              <p id="slideshow-status" className="sr-only" aria-live="polite" aria-atomic="true">{status}</p>
              <div className="slideshow-inner header_animate">
                <div className="slides">
                  {slides.map((slide, index) => {
                    const Heading = slide.h1 ? 'h1' : 'h2';
                    const className = `slide${index === active ? ' q_current' : ''} is-loaded${index === 0 ? ' scrollanim_fade_container' : ''}`;
                    const captionContents = <>
                      <div className="num q_split_wrap q_splitText">{slide.number}</div>
                      <p className="q_split_wrap q_splitText"><span className="q_split font_caps"><span className="q_split_wrap"> {slide.label} </span></span></p>
                      <Heading className="q_split_wrap q_splitText"><span className="q_split_wrap q_splitText"> {slide.heading}</span><span className="q_split_wrap q_splitText"> </span></Heading>
                    </>;
                    return (
                      <div
                        className={className}
                        key={slide.number}
                        ref={(element) => { slideRefs.current[index] = element; }}
                        aria-hidden={index !== active}
                        aria-roledescription="slide"
                        aria-label={describeSlide(index)}
                      >
                        <div className="slide-content mix">
                          <div className="caption menu_fade" style={{ color: index === 0 ? '#ccc' : '#FFD5C2' }}>
                            {slide.href ? (
                              <a
                                href={slide.href}
                                data-hover={slide.label.replace('/', '').trim()}
                                style={{ color: '#ddc89d' }}
                                data-col="#ddc89d"
                                onClick={(event) => {
                                  event.preventDefault();
                                  retainHomeSlide(index);
                                  navigate(slide.href!, { angelSlide: index, angelJourney: 'slider' });
                                }}
                              >
                                {captionContents}
                              </a>
                            ) : captionContents}
                          </div>
                        </div>
                        <div className="image-container">
                          <div className="image-wrapper scrollanim_fade">
                            <div data-scroll data-scroll-speed="-7">
                              {slide.poster && <img className="slide-poster" src={slide.poster} alt="" aria-hidden="true" decoding="async" />}
                              <video
                                autoPlay={index === active && !prefersReducedMotion}
                                loop
                                muted
                                playsInline
                                preload={prefersReducedMotion || (slide.remote && index !== active) ? 'none' : (index === active ? 'auto' : (Math.abs(index - active) === 1 || Math.abs(index - active) === slides.length - 1 ? 'metadata' : 'none'))}
                                poster={slide.poster}
                                width="100%"
                                height="974"
                                aria-hidden="true"
                                tabIndex={-1}
                                onCanPlay={(event) => { if (index === active && !prefersReducedMotion) playVideo(event.currentTarget); }}
                                onError={(event) => event.currentTarget.closest('.slide')?.classList.add('media-unavailable')}
                              >
                                <source src={slide.video} type={slide.mediaType ?? 'video/mp4'} />
                              </video>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="arrows menu_fade" data-scroll data-scroll-speed="-9" aria-label="Presentation controls" aria-busy={isTransitioning}>
                  <button className="arrow prev font_caps magnet" type="button" onClick={() => changeSlide(-1)} aria-label="Previous capability" aria-keyshortcuts="ArrowLeft">
                    <span className="magnet_circle_fast" /><span aria-hidden="true">Prev</span>
                  </button>
                  <div className="arrow_line reveal_fade" aria-hidden="true">/</div>
                  <button className="arrow next font_caps magnet" type="button" onClick={() => changeSlide(1)} aria-label="Next capability" aria-keyshortcuts="ArrowRight">
                    <span className="magnet_circle_fast" /><span aria-hidden="true">Next</span>
                  </button>
                  <div className="scroll" aria-hidden="true">Scroll Down</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div></div></div>
    </main>
  );
}
