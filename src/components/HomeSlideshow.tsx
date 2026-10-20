import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { slideExperiences } from '../data/slideExperiences';
import { PointerVelocityTracker, projectMomentum } from '../utils/appleSpring';
import { getNetworkInformation, prefersReducedData as getReducedDataPreference, prefersReducedMotion as getReducedMotionPreference } from '../utils/mediaPreferences';
import { navigate } from '../utils/routes';

const TRANSITION_MS = 1120;
const DRAG_SETTLE_MIN_MS = 300;
const DRAG_SETTLE_MAX_MS = 740;
const VIDEO_START_MS = 220;
const PARALLAX = 0.14;
const TRANSITION_OPACITY = 0.16;
const DRAG_LOCK_PX = 10;
const WHEEL_COOLDOWN_MS = 680;
const FALLBACK_LOCAL_VIDEO = '/media/videos/Main-Background-with-sound.mp4';

type Slide = {
  number: string;
  label: string;
  cleanLabel: string;
  heading: string;
  words: string[];
  href?: string;
  video: string;
  poster?: string;
  mediaType?: string;
  remote?: boolean;
  h1?: boolean;
};

const slides: Slide[] = slideExperiences.map((slide, index) => ({
  ...slide,
  cleanLabel: slide.label,
  label: `/ ${slide.label}`,
  words: slide.heading.trim().split(/\s+/),
  href: slide.route,
  h1: index === 0,
}));

function appleExpoInOut(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return progress < 0.5
    ? Math.pow(2, 18 * progress - 9) / 2
    : (2 - Math.pow(2, -18 * progress + 9)) / 2;
}

function appleEaseOutQuint(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return 1 - Math.pow(1 - clamped, 5);
}

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
}

function playVideo(video: HTMLVideoElement | null): void {
  if (!video || document.hidden || document.body.classList.contains('menu-open')) return;
  void video.play().catch(() => {
    // Muted video playback is best effort. The authentic poster remains meaningful if blocked.
  });
}

function restoredSlideIndex(): number {
  const candidate = window.history.state?.angelSlide;
  return Number.isInteger(candidate) && candidate >= 0 && candidate < slides.length ? candidate : 0;
}

function retainHomeSlide(index: number): void {
  window.history.replaceState({ ...(window.history.state ?? {}), angelSlide: index }, '', window.location.href);
}

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  isDragging: boolean;
  movingForward: boolean | null;
  outgoingIndex: number;
  incomingIndex: number | null;
  progress: number;
};

export function HomeSlideshow(): JSX.Element {
  const [active, setActive] = useState(restoredSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getReducedMotionPreference);
  const [prefersReducedData, setPrefersReducedData] = useState(getReducedDataPreference);
  const [status, setStatus] = useState(
    () => `Slide ${restoredSlideIndex() + 1} of ${slides.length}: ${slides[restoredSlideIndex()].cleanLabel}`,
  );

  const slideshowRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  const prefersReducedDataRef = useRef(prefersReducedData);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRef = useRef(active);
  const inFlightSettleRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const wheelCooldownUntilRef = useRef(0);
  const velocityTrackerRef = useRef(new PointerVelocityTracker());
  const dragSessionRef = useRef<DragSession | null>(null);
  const suppressClickUntilRef = useRef(0);

  const canAutoplayVideos = (): boolean =>
    !prefersReducedMotionRef.current && !prefersReducedDataRef.current;

  const activatePendingFallback = (video: HTMLVideoElement | null): boolean => {
    if (!video || video.dataset.fallbackPending !== 'true' || !canAutoplayVideos() || document.hidden) return false;
    delete video.dataset.fallbackPending;
    video.dataset.fallbackApplied = 'true';
    video.preload = 'metadata';
    video.src = FALLBACK_LOCAL_VIDEO;
    video.load();
    playVideo(video);
    return true;
  };

  const clearTimers = (): void => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const rememberTimer = (callback: () => void, delay: number): void => {
    let timer = 0;
    timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((pending) => pending !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  };

  const describeSlide = (index: number): string =>
    `Slide ${index + 1} of ${slides.length}: ${slides[index].cleanLabel}`;

  const videosInSlides = (): HTMLVideoElement[] =>
    slideRefs.current
      .map((slide) => slide?.querySelector<HTMLVideoElement>('video') ?? null)
      .filter((video): video is HTMLVideoElement => video !== null);

  const playAllVideos = (): void => {
    if (!canAutoplayVideos() || document.hidden) return;
    videosInSlides().forEach((video) => {
      if (video.dataset.fallbackPending === 'true') {
        if (activatePendingFallback(video)) return;
        return;
      }
      playVideo(video);
    });
  };

  const pauseAllVideos = (): void => {
    videosInSlides().forEach((video) => video.pause());
  };

  const clearSlideInlineStyles = (slide: HTMLDivElement | null): void => {
    if (!slide) return;
    slide.classList.remove('is-new');
    slide.removeAttribute('style');
    slide.querySelector<HTMLElement>('.image-container')?.removeAttribute('style');
    slide.querySelector<HTMLElement>('.slide-content')?.removeAttribute('style');
    slide.querySelectorAll<HTMLElement>('.q_split_wrap').forEach((word) => {
      word.style.opacity = '';
      word.style.transform = '';
    });
  };

  const applyTransitionFrame = (
    outgoing: HTMLDivElement,
    incoming: HTMLDivElement,
    movingForward: boolean,
    rawProgress: number,
    useEaseCurve: boolean,
  ): void => {
    const slideshow = slideshowRef.current;
    if (!slideshow) return;
    const width = slideshow.clientWidth || window.innerWidth;
    const clamped = Math.min(1, Math.max(0, rawProgress));
    const eased = useEaseCurve ? appleExpoInOut(clamped) : clamped;

    const incomingImage = incoming.querySelector<HTMLElement>('.image-container');
    const outgoingImage = outgoing.querySelector<HTMLElement>('.image-container');
    const incomingContent = incoming.querySelector<HTMLElement>('.slide-content');
    if (!incomingImage || !outgoingImage) return;

    const incomingStartX = movingForward ? -width * (1 - PARALLAX) : -width * PARALLAX;
    const outgoingEndX = movingForward ? -width * PARALLAX : width * PARALLAX;

    incoming.style.width = `${width * eased}px`;
    incomingImage.style.width = `${width}px`;
    incomingImage.style.transform = `translate3d(${incomingStartX * (1 - eased)}px, 0, 0)`;
    incomingImage.style.opacity = String(TRANSITION_OPACITY + (1 - TRANSITION_OPACITY) * eased);
    outgoingImage.style.transform = `translate3d(${outgoingEndX * eased}px, 0, 0)`;
    outgoingImage.style.opacity = String(1 - (1 - TRANSITION_OPACITY) * eased);

    if (incomingContent) {
      incomingContent.style.width = `${width}px`;
      incomingContent.style.right = movingForward ? '0px' : 'auto';
      incomingContent.style.left = movingForward ? 'auto' : '0px';
    }

    const outgoingWords = Array.from(outgoing.querySelectorAll<HTMLElement>('.q_split_wrap'));
    const incomingWords = Array.from(incoming.querySelectorAll<HTMLElement>('.q_split_wrap'));
    const outgoingWordX = movingForward ? -36 : 36;
    const incomingWordX = movingForward ? 36 : -36;

    const outTotal = Math.max(1, outgoingWords.length);
    outgoingWords.forEach((word, index) => {
      const staggerStart = (index / outTotal) * 0.25;
      const wordProgress = Math.min(1, Math.max(0, (clamped - staggerStart) / 0.46));
      const wordEase = appleEaseOutQuint(wordProgress);
      word.style.opacity = String(1 - wordEase);
      word.style.transform = `translate3d(${outgoingWordX * wordEase}px, 0, 0)`;
    });

    const inTotal = Math.max(1, incomingWords.length);
    incomingWords.forEach((word, index) => {
      const staggerStart = 0.28 + (index / inTotal) * 0.34;
      const wordProgress = Math.min(1, Math.max(0, (clamped - staggerStart) / (1 - staggerStart)));
      const wordEase = appleEaseOutQuint(wordProgress);
      word.style.opacity = String(wordEase);
      word.style.transform = `translate3d(${incomingWordX * (1 - wordEase)}px, 0, 0)`;
    });
  };

  const prepareIncomingLayer = (incoming: HTMLDivElement, outgoing: HTMLDivElement, movingForward: boolean): void => {
    const slideshow = slideshowRef.current;
    if (!slideshow) return;
    const width = slideshow.clientWidth || window.innerWidth;
    const incomingImage = incoming.querySelector<HTMLElement>('.image-container');
    const outgoingImage = outgoing.querySelector<HTMLElement>('.image-container');
    const incomingContent = incoming.querySelector<HTMLElement>('.slide-content');

    incoming.classList.add('is-new');
    incoming.style.display = 'block';
    incoming.style.width = '0px';
    incoming.style.right = movingForward ? '0px' : 'auto';
    incoming.style.left = movingForward ? 'auto' : '0px';
    incoming.style.zIndex = '2';

    if (incomingImage) {
      const incomingStartX = movingForward ? -width * (1 - PARALLAX) : -width * PARALLAX;
      incomingImage.style.width = `${width}px`;
      incomingImage.style.transform = `translate3d(${incomingStartX}px, 0, 0)`;
      incomingImage.style.opacity = String(TRANSITION_OPACITY);
    }
    if (outgoingImage) {
      outgoingImage.style.transform = 'translate3d(0, 0, 0)';
      outgoingImage.style.opacity = '1';
    }
    if (incomingContent) {
      incomingContent.style.width = `${width}px`;
      incomingContent.style.right = movingForward ? '0px' : 'auto';
      incomingContent.style.left = movingForward ? 'auto' : '0px';
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const network = getNetworkInformation();
    const updateMotionPreference = (): void => {
      const wasReduced = prefersReducedMotionRef.current;
      prefersReducedMotionRef.current = mediaQuery.matches;
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        pauseAllVideos();
      } else if (wasReduced && canAutoplayVideos() && !document.hidden) {
        const activeVideo = slideRefs.current[activeRef.current]?.querySelector('video') ?? null;
        if (!activatePendingFallback(activeVideo)) playVideo(activeVideo);
      }
    };
    const updateDataPreference = (): void => {
      const wasReduced = prefersReducedDataRef.current;
      const reducedData = getReducedDataPreference();
      prefersReducedDataRef.current = reducedData;
      setPrefersReducedData(reducedData);
      if (reducedData) {
        pauseAllVideos();
      } else if (wasReduced && canAutoplayVideos() && !document.hidden) {
        const activeVideo = slideRefs.current[activeRef.current]?.querySelector('video') ?? null;
        if (!activatePendingFallback(activeVideo)) playVideo(activeVideo);
      }
    };
    updateMotionPreference();
    updateDataPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    network?.addEventListener('change', updateDataPreference);

    slideRefs.current.forEach((slide) => slide?.classList.add('is-loaded'));
    // All seven capability films run from the first paint. They are muted background
    // footage, so this is allowed to start without a gesture, and it removes the
    // buffering pause that used to appear on the first swipe.
    playAllVideos();

    const onVisibilityChange = (): void => {
      const currentVideo = slideRefs.current[activeRef.current]?.querySelector<HTMLVideoElement>('video') ?? null;
      if (document.hidden || !canAutoplayVideos()) pauseAllVideos();
      else playAllVideos();
    };
    const onMenuStateChange = (event: Event): void => {
      const isOpen = (event as CustomEvent<{ open?: boolean }>).detail?.open;
      if (isOpen) {
        clearTimers();
        if (inFlightSettleRef.current) {
          if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          inFlightSettleRef.current();
        }
        pauseAllVideos();
      } else {
        playAllVideos();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('angel:menu-state', onMenuStateChange);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
      network?.removeEventListener('change', updateDataPreference);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('angel:menu-state', onMenuStateChange);
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      clearTimers();
    };
  }, []);

  const transitionToIndex = (
    targetIndex: number,
    explicitDirection?: boolean,
    startFromProgress = 0,
    customDurationMs?: number,
  ): void => {
    clearTimers();
    if (inFlightSettleRef.current) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      inFlightSettleRef.current();
    }

    const outgoingIndex = activeRef.current;
    const incomingIndex = ((targetIndex % slides.length) + slides.length) % slides.length;
    const slideshow = slideshowRef.current;
    const outgoing = slideRefs.current[outgoingIndex];
    const incoming = slideRefs.current[incomingIndex];
    if (!slideshow || !outgoing || !incoming || outgoing === incoming) return;

    const incomingVideo = incoming.querySelector<HTMLVideoElement>('video');
    const outgoingVideo = outgoing.querySelector<HTMLVideoElement>('video');

    const settle = (): void => {
      inFlightSettleRef.current = null;
      incoming.classList.add('q_current');
      outgoing.classList.remove('q_current');
      clearSlideInlineStyles(incoming);
      clearSlideInlineStyles(outgoing);

      activeRef.current = incomingIndex;
      retainHomeSlide(incomingIndex);
      setActive(incomingIndex);
      setStatus(describeSlide(incomingIndex));
      setIsTransitioning(false);
      slideshow.setAttribute('wait', 'false');
            if (canAutoplayVideos() && !document.hidden && !activatePendingFallback(incomingVideo ?? null)) {
        playVideo(incomingVideo ?? null);
      }
    };

    if (prefersReducedMotionRef.current) {
      incoming.style.display = 'block';
      incoming.classList.add('is-new');
      settle();
      outgoingVideo?.pause();
      return;
    }

    if (incomingVideo && canAutoplayVideos() && !activatePendingFallback(incomingVideo) && incomingVideo.readyState === 0) {
      incomingVideo.load();
    }

    const movingForward = explicitDirection ?? incomingIndex > outgoingIndex;
    inFlightSettleRef.current = settle;
    setIsTransitioning(true);
    slideshow.setAttribute('wait', 'true');

    if (startFromProgress <= 0) {
      prepareIncomingLayer(incoming, outgoing, movingForward);
    }

    const duration = customDurationMs ?? TRANSITION_MS;
    const startedAt = performance.now();

    const animate = (now: number): void => {
      const elapsed = now - startedAt;
      const t = Math.min(1, elapsed / duration);
      const interpolatedProgress = startFromProgress > 0
        ? startFromProgress + (1 - startFromProgress) * appleEaseOutQuint(t)
        : t;

      applyTransitionFrame(
        outgoing,
        incoming,
        movingForward,
        interpolatedProgress,
        startFromProgress <= 0,
      );

      if (t < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }
      animationFrameRef.current = null;
      settle();
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    rememberTimer(() => {
      if (canAutoplayVideos() && !document.hidden && !activatePendingFallback(incomingVideo ?? null)) {
        playVideo(incomingVideo ?? null);
      }
    }, VIDEO_START_MS);
  };

  const changeSlide = (offset: number, startFromProgress = 0, customDurationMs?: number): void => {
    const outgoingIndex = activeRef.current;
    const incomingIndex = (outgoingIndex + offset + slides.length) % slides.length;
    transitionToIndex(incomingIndex, offset > 0, startFromProgress, customDurationMs);
  };

  const cancelDragAndRevert = (
    outgoing: HTMLDivElement,
    incoming: HTMLDivElement,
    movingForward: boolean,
    fromProgress: number,
  ): void => {
    const slideshow = slideshowRef.current;
    if (!slideshow) return;
    const duration = Math.max(240, Math.round(fromProgress * 520));
    const startedAt = performance.now();

    const revertComplete = (): void => {
      inFlightSettleRef.current = null;
      clearSlideInlineStyles(incoming);
      clearSlideInlineStyles(outgoing);
      setIsTransitioning(false);
      slideshow.setAttribute('wait', 'false');
      playAllVideos();
    };

    inFlightSettleRef.current = revertComplete;
    setIsTransitioning(true);

    const animateRevert = (now: number): void => {
      const elapsed = now - startedAt;
      const t = Math.min(1, elapsed / duration);
      const currentProgress = fromProgress * (1 - appleEaseOutQuint(t));
      applyTransitionFrame(outgoing, incoming, movingForward, currentProgress, false);

      if (t < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateRevert);
        return;
      }
      animationFrameRef.current = null;
      revertComplete();
    };

    animationFrameRef.current = window.requestAnimationFrame(animateRevert);
  };

  const onStageKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.defaultPrevented || isEditableTarget(event.target)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(1);
    }
  };

  const onStageWheel = (event: ReactWheelEvent<HTMLElement>): void => {
    const now = performance.now();
    if (now < wheelCooldownUntilRef.current) return;
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 28) return;
    wheelCooldownUntilRef.current = now + WHEEL_COOLDOWN_MS;
    changeSlide(dominantDelta > 0 ? 1 : -1);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.arrows')) return;

    if (inFlightSettleRef.current) {
      clearTimers();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      inFlightSettleRef.current();
    }

    velocityTrackerRef.current.reset();
    velocityTrackerRef.current.record(event.clientX);
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      isDragging: false,
      movingForward: null,
      outgoingIndex: activeRef.current,
      incomingIndex: null,
      progress: 0,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>): void => {
    const session = dragSessionRef.current;
    const slideshow = slideshowRef.current;
    if (!session || session.pointerId !== event.pointerId || !slideshow) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;

    if (!session.isDragging) {
      if (Math.abs(deltaX) < DRAG_LOCK_PX) return;
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
        dragSessionRef.current = null;
        return;
      }
      session.isDragging = true;
      setIsDraggingStage(true);
      suppressClickUntilRef.current = performance.now() + 450;
      try {
        slideshow.setPointerCapture(event.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable
      }
    }

    if (prefersReducedMotionRef.current) return;

    velocityTrackerRef.current.record(event.clientX);
    const wantForward = deltaX < 0;
    const outgoing = slideRefs.current[session.outgoingIndex];
    if (!outgoing) return;

    if (session.movingForward !== wantForward || session.incomingIndex === null) {
      if (session.incomingIndex !== null) {
        clearSlideInlineStyles(slideRefs.current[session.incomingIndex]);
      }
      session.movingForward = wantForward;
      session.incomingIndex = (session.outgoingIndex + (wantForward ? 1 : -1) + slides.length) % slides.length;
      const incoming = slideRefs.current[session.incomingIndex];
      if (incoming) {
        const incomingVideo = incoming.querySelector<HTMLVideoElement>('video');
        if (incomingVideo && canAutoplayVideos() && !activatePendingFallback(incomingVideo)) {
          incomingVideo.preload = 'metadata';
          if (incomingVideo.readyState === 0) incomingVideo.load();
          playVideo(incomingVideo);
        }
        prepareIncomingLayer(incoming, outgoing, wantForward);
      }
    }

    const incoming = session.incomingIndex !== null ? slideRefs.current[session.incomingIndex] : null;
    if (!incoming || session.movingForward === null) return;

    const width = Math.max(320, slideshow.clientWidth || window.innerWidth);
    const dragProgress = Math.min(0.94, Math.abs(deltaX) / (width * 0.72));
    session.progress = dragProgress;
    applyTransitionFrame(outgoing, incoming, session.movingForward, dragProgress, false);
  };

  const finishPointerSession = (event: ReactPointerEvent<HTMLElement>, cancelled: boolean): void => {
    const session = dragSessionRef.current;
    dragSessionRef.current = null;
    setIsDraggingStage(false);
    const slideshow = slideshowRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (slideshow) {
      try {
        if (slideshow.hasPointerCapture(event.pointerId)) {
          slideshow.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore
      }
    }

    if (!session.isDragging) return;
    suppressClickUntilRef.current = performance.now() + 360;

    const deltaX = event.clientX - session.startX;
    if (prefersReducedMotionRef.current) {
      if (!cancelled && Math.abs(deltaX) >= 42) {
        changeSlide(deltaX < 0 ? 1 : -1);
      }
      return;
    }

    const outgoing = slideRefs.current[session.outgoingIndex];
    const incoming = session.incomingIndex !== null ? slideRefs.current[session.incomingIndex] : null;
    if (!outgoing || !incoming || session.movingForward === null) return;

    const velocityX = velocityTrackerRef.current.getVelocity();
    const projectedX = deltaX + projectMomentum(velocityX, 0.995);
    const width = Math.max(320, slideshow?.clientWidth || window.innerWidth);
    const alignedProjection = session.movingForward ? -projectedX : projectedX;
    const shouldCommit =
      !cancelled &&
      (session.progress > 0.16 || alignedProjection > width * 0.16 || Math.abs(velocityX) > 280);

    if (shouldCommit) {
      const remainingFraction = Math.max(0.15, 1 - session.progress);
      const settleMs = Math.min(
        DRAG_SETTLE_MAX_MS,
        Math.max(DRAG_SETTLE_MIN_MS, Math.round(remainingFraction * 680)),
      );
      changeSlide(session.movingForward ? 1 : -1, session.progress, settleMs);
    } else {
      cancelDragAndRevert(outgoing, incoming, session.movingForward, session.progress);
    }
  };

  const onArrowMagnetMove = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    if (prefersReducedMotionRef.current) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const relX = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
    const relY = (event.clientY - (rect.top + rect.height / 2)) * 0.22;
    button.style.transform = `translate3d(${relX.toFixed(1)}px, ${relY.toFixed(1)}px, 0)`;
  };

  const onArrowMagnetLeave = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    event.currentTarget.style.transform = '';
  };

  const activeSlide = slides[active];
  const stageStyle = {
    '--ac-horizon-progress': `${(((active + 1) / slides.length) * 100).toFixed(1)}%`,
  } as CSSProperties;

  return (
    <main id="main" className="site-main">
      <div className="cursor" data-cursor><div className="inner"><div className="circle"><span className="cursor_text" /></div></div></div>
      <div id="load_overlay" className="load_overlay" />
      <div id="dynamicLoad" className="dynamic_load"><div className="progress"><div className="bar" id="dynamicBar" /></div></div>
      <div id="barba-wrapper"><div className="barba-container"><div data-scroll-container>
        <div className="ac-home-content">
          <div data-scroll-section>
            <section
              ref={slideshowRef}
              id="slideshow"
              className={`slideshow ac-home-cinema${isDraggingStage ? ' is-dragging' : ''}`}
              style={stageStyle}
              data-scroll-sticky
              aria-roledescription="carousel"
              aria-label="Angel capabilities presentation"
              aria-describedby="slideshow-instructions slideshow-status"
              tabIndex={0}
              onKeyDown={onStageKeyDown}
              onWheel={onStageWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => finishPointerSession(event, false)}
              onPointerCancel={(event) => finishPointerSession(event, true)}
            >
              <p id="slideshow-instructions" className="sr-only">
                Use the previous and next buttons, left and right arrow keys, or drag horizontally to explore Angel capabilities.
              </p>
              <p id="slideshow-status" className="sr-only" aria-live="polite" aria-atomic="true">{status}</p>
              <div className="slideshow-inner header_animate">
                <div className="slides">
                  {slides.map((slide, index) => {
                    const Heading = slide.h1 ? 'h1' : 'h2';
                    const className = `slide${index === active ? ' q_current' : ''} is-loaded${index === 0 ? ' scrollanim_fade_container' : ''}`;
                    const captionContents = (
                      <>
                        <div className="ac-home-caption__eyebrow">
                          <div className="num q_split_wrap q_splitText">{slide.number}</div>
                          <p className="q_split_wrap q_splitText">
                            <span className="q_split font_caps">
                              <span className="q_split_wrap"> {slide.label} </span>
                            </span>
                          </p>
                        </div>
                        <Heading className="q_splitText ac-home-caption__headline">
                          {slide.words.map((word, wordIndex) => (
                            <Fragment key={`${slide.number}-word-${wordIndex}`}>
                              <span className="q_split">
                                <span className="q_split_wrap q_splitText">{word}</span>
                              </span>
                              {wordIndex < slide.words.length - 1 ? ' ' : ''}
                            </Fragment>
                          ))}
                        </Heading>
                      </>
                    );
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
                          <div className="caption menu_fade">
                            {slide.href ? (
                              <a
                                href={slide.href}
                                className="ac-home-caption__link"
                                data-hover={slide.cleanLabel}
                                data-col="#ddc89d"
                                onClick={(event) => {
                                  if (
                                    event.button !== 0 ||
                                    event.metaKey ||
                                    event.ctrlKey ||
                                    event.shiftKey ||
                                    event.altKey
                                  ) return;
                                  if (performance.now() < suppressClickUntilRef.current) {
                                    event.preventDefault();
                                    return;
                                  }
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
                              {slide.poster && (
                                <img
                                  className="slide-poster"
                                  src={slide.poster}
                                  alt=""
                                  aria-hidden="true"
                                  loading={index === active ? 'eager' : 'lazy'}
                                  fetchPriority={index === active ? 'high' : 'auto'}
                                  decoding="async"
                                />
                              )}
                              <video
                                loop
                                muted
                                playsInline
                                preload={prefersReducedMotion || prefersReducedData ? 'none' : 'auto'}
                                poster={slide.poster}
                                width={1920}
                                height={1080}
                                aria-hidden="true"
                                tabIndex={-1}
                                onCanPlay={(event) => {
                                  if (canAutoplayVideos() && !document.hidden) playVideo(event.currentTarget);
                                }}
                                onError={(event) => {
                                  const videoEl = event.currentTarget;
                                  if (slide.remote && videoEl.dataset.fallbackApplied !== 'true') {
                                    videoEl.dataset.fallbackPending = 'true';
                                    if (index === active) activatePendingFallback(videoEl);
                                    return;
                                  }
                                  videoEl.closest('.slide')?.classList.add('media-unavailable');
                                }}
                              >
                                <source src={slide.video} type={slide.mediaType ?? 'video/mp4'} />
                              </video>
                              <div className="video-overlay" aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="ac-home-horizon" aria-hidden="true">
                  <span className="ac-home-horizon__beam" />
                </div>
                <div
                  className="arrows menu_fade ac-home-controls"
                  data-scroll
                  data-scroll-speed="-9"
                  aria-label="Presentation controls"
                  aria-busy={isTransitioning}
                >
                  <div className="ac-home-counter" aria-hidden="true">
                    <strong>{activeSlide.number}</strong>
                    <span className="ac-home-counter__line" />
                    <span>0{slides.length}</span>
                  </div>
                  <div className="ac-home-nav-minimal">
                    <button
                      className="arrow prev font_caps magnet"
                      type="button"
                      onClick={() => changeSlide(-1)}
                      onMouseMove={onArrowMagnetMove}
                      onMouseLeave={onArrowMagnetLeave}
                      aria-label="Previous capability"
                      aria-keyshortcuts="ArrowLeft"
                    >
                      <span className="magnet_circle_fast" />
                      <span aria-hidden="true">Prev</span>
                    </button>
                    <div className="arrow_line reveal_fade" aria-hidden="true">/</div>
                    <button
                      className="arrow next font_caps magnet"
                      type="button"
                      onClick={() => changeSlide(1)}
                      onMouseMove={onArrowMagnetMove}
                      onMouseLeave={onArrowMagnetLeave}
                      aria-label="Next capability"
                      aria-keyshortcuts="ArrowRight"
                    >
                      <span className="magnet_circle_fast" />
                      <span aria-hidden="true">Next</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div></div></div>
    </main>
  );
}
