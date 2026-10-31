import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import {
  APPLE_SPRINGS,
  PointerVelocityTracker,
  InterruptibleSpring,
  clampWithRubberBand,
  projectMomentum,
} from '../utils/appleSpring';
import { imageSize } from '../utils/imageDimensions';

export type ExplorerItem = {
  title: string;
  description?: string;
  statement?: string;
  items?: string[];
  closing?: string;
  href?: string;
};

export type ExperienceMapData = {
  mode: 'spatial' | 'layered' | 'immersive' | 'contextual' | 'kinetic' | 'campaign' | 'production';
  title: string;
  intro: string;
  steps: [string, string][];
  work?: { title: string; bridge: string };
};

export type ExplorerVisual = {
  src: string;
  caption: string;
  subtitle?: string;
};

const STEP_GLYPHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

/**
 * InteractiveVisualStage
 * Implements Apple's WWDC18 "Designing Fluid Interfaces" 1:1 pointer tracking,
 * rubber-band boundary resistance, momentum projection, interruptible spring settling,
 * with keyboard navigation and a segmented progress rail.
 */
interface InteractiveVisualStageProps {
  items: ExplorerVisual[];
  fallbackSrc?: string;
  activeIndex: number;
  totalCount: number;
  onSelectIndex: (nextIndex: number) => void;
  stageLabel: string;
  activeTitle: string;
}

const InteractiveVisualStage: React.FC<InteractiveVisualStageProps> = ({
  items,
  fallbackSrc,
  activeIndex,
  totalCount,
  onSelectIndex,
  stageLabel,
  activeTitle,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackerRef = useRef(new PointerVelocityTracker());
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const springRef = useRef<InterruptibleSpring | null>(null);
  if (!springRef.current) {
    springRef.current = new InterruptibleSpring(
      0,
      (val) => setDragOffsetPx(val),
      APPLE_SPRINGS.snappy,
      () => setDragOffsetPx(0)
    );
  }

  const pointerStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    lockedAxis: 'x' | 'y' | null;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    lockedAxis: null,
  });

  useEffect(() => {
    const spring = springRef.current;
    return () => {
      spring?.stop();
    };
  }, []);

  useEffect(() => {
    [activeIndex - 1, activeIndex + 1].forEach((idx) => {
      const src = items[idx]?.src;
      if (!src) return;
      const preload = new Image();
      preload.src = src;
    });
  }, [activeIndex, items]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    const spring = springRef.current;
    spring?.stop();
    const currentOffset = spring ? spring.getValue() : 0;

    pointerStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX - currentOffset,
      startY: event.clientY,
      lockedAxis: null,
    };

    trackerRef.current.reset();
    trackerRef.current.record(event.clientX);
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = pointerStateRef.current;
      if (state.pointerId !== event.pointerId) return;

      const rawDx = event.clientX - state.startX;
      const rawDy = event.clientY - state.startY;

      if (!state.lockedAxis) {
        if (Math.abs(rawDx) < 6 && Math.abs(rawDy) < 6) return;
        state.lockedAxis = Math.abs(rawDx) >= Math.abs(rawDy) ? 'x' : 'y';
      }

      if (state.lockedAxis !== 'x') return;

      trackerRef.current.record(event.clientX);

      const width = stageRef.current?.clientWidth || 480;
      const minDrag = activeIndex >= totalCount - 1 ? 0 : -width;
      const maxDrag = activeIndex <= 0 ? 0 : width;

      const dampedDx = clampWithRubberBand(rawDx, minDrag, maxDrag, width * 0.65);
      springRef.current?.setImmediate(dampedDx);
    },
    [activeIndex, totalCount]
  );

  const finishPointerGesture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = pointerStateRef.current;
      if (state.pointerId !== event.pointerId) return;
      pointerStateRef.current.pointerId = null;
      setIsDragging(false);

      const width = stageRef.current?.clientWidth || 480;
      const currentDx = springRef.current ? springRef.current.getValue() : 0;
      const vx = trackerRef.current.getVelocity();
      const projectedDx = currentDx + projectMomentum(vx, 0.992);

      const threshold = width * 0.22;
      let targetIndex = activeIndex;

      if (projectedDx < -threshold && activeIndex < totalCount - 1) {
        targetIndex = activeIndex + 1;
      } else if (projectedDx > threshold && activeIndex > 0) {
        targetIndex = activeIndex - 1;
      }

      if (targetIndex !== activeIndex) {
        onSelectIndex(targetIndex);
      }

      springRef.current?.animateTo(0, {
        velocity: vx * 0.15,
        config: APPLE_SPRINGS.snappy,
      });
    },
    [activeIndex, onSelectIndex, totalCount]
  );

  const handleStageKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (activeIndex + 1) % totalCount;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (activeIndex - 1 + totalCount) % totalCount;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = totalCount - 1;
      }
      if (nextIndex === null || totalCount < 2) return;
      event.preventDefault();
      onSelectIndex(nextIndex);
    },
    [activeIndex, onSelectIndex, totalCount]
  );

  const currentItem = items[activeIndex] || items[0] || (fallbackSrc ? { src: fallbackSrc, caption: activeTitle } : null);
  if (!currentItem) return null;

  return (
    <div
      ref={stageRef}
      className={`apple-visual-stage${isDragging ? ' is-dragging' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerGesture}
      onPointerCancel={finishPointerGesture}
      onKeyDown={handleStageKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${stageLabel} interactive visual stage. ${activeTitle}, frame ${activeIndex + 1} of ${totalCount}. Use the arrow keys or drag horizontally to switch items.`}
    >
      <div
        className="apple-visual-stage__canvas"
        style={{
          transform: `translate3d(${dragOffsetPx.toFixed(2)}px, 0, 0) scale(${
            isDragging ? 0.988 : 1
          })`,
        }}
      >
        <img
          key={currentItem.src}
          src={currentItem.src}
          {...imageSize(currentItem.src)}
          alt={`${activeTitle} — ${currentItem.subtitle || currentItem.caption}`}
          className="apple-visual-stage__img"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="apple-visual-stage__scrim" aria-hidden="true" />
      </div>

      {/* Bottom caption and segmented progress rail */}
      <div className="apple-visual-stage__hud-bottom">
        <div className="apple-visual-stage__caption-wrap">
          <div className="apple-visual-stage__caption-group">
            {currentItem.subtitle && (
              <p className="apple-visual-stage__subcaption">{currentItem.subtitle}</p>
            )}
          </div>
          <span className="apple-visual-stage__gesture-hint" aria-hidden="true">
            Drag to switch frame ↔
          </span>
        </div>
        {totalCount > 1 && (
          <div className="apple-visual-stage__progress" aria-hidden="true">
            {Array.from({ length: totalCount }, (_, idx) => (
              <span
                key={idx}
                className={
                  idx === activeIndex
                    ? 'is-active'
                    : idx < activeIndex
                      ? 'is-complete'
                      : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Interactive Experience Map:
 * Segmented flow workbench with keyboard arrow navigation, 1:1 pointer-tracked
 * visual canvas, and synchronized stage inspection.
 */
export function ExperienceMap({
  map,
  number,
  visual,
  visuals = [],
}: {
  map: ExperienceMapData;
  number?: string;
  visual?: string;
  visuals?: ExplorerVisual[];
}): JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const steps = map.steps;
  const total = steps.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [map.title]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsAutoPlaying(false);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !isInView || total <= 1) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActiveIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isInView, total]);

  const handleSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
    setIsAutoPlaying(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % total;
        setActiveIndex(next);
        setIsAutoPlaying(false);
        document.getElementById(`${baseId}-node-tab-${next}`)?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + total) % total;
        setActiveIndex(prev);
        setIsAutoPlaying(false);
        document.getElementById(`${baseId}-node-tab-${prev}`)?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
        setIsAutoPlaying(false);
        document.getElementById(`${baseId}-node-tab-0`)?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(total - 1);
        setIsAutoPlaying(false);
        document.getElementById(`${baseId}-node-tab-${total - 1}`)?.focus();
      }
    },
    [baseId, total]
  );

  const activeStep = steps[activeIndex] || steps[0];
  if (!activeStep) return null;

  const [activeLabel, activeDescription] = activeStep;
  const activeVisual = visuals[activeIndex] || visuals[0];

  return (
    <section
      ref={sectionRef}
      className={`apple-explorer-section apple-explorer-section--map apple-explorer-mode--${map.mode}`}
      aria-labelledby={`${baseId}-map-title`}
    >
      <div className="apple-explorer-container">
        {/* Header Bar */}
        <div className="apple-explorer-header">
          <div className="apple-explorer-header__titles">
            <div className="apple-section-eyebrow">
              <span className="apple-section-eyebrow__dot" aria-hidden="true" />
              <span>{number ? `${number} · ` : ''}Interactive Experience Map</span>
            </div>
            <h2 id={`${baseId}-map-title`} className="apple-explorer-title">
              {map.title}
            </h2>
            <p className="apple-explorer-lead">{map.intro}</p>
          </div>

          <div className="apple-explorer-controls">
            <button
              type="button"
              className={`apple-pill-control${isAutoPlaying ? ' is-active' : ''}`}
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-pressed={isAutoPlaying}
            >
              <span className="apple-pill-control__dot" aria-hidden="true" />
              <span>{isAutoPlaying ? 'Auto-Advancing' : 'Manual Inspection'}</span>
            </button>
          </div>
        </div>

        {/* Segmented Step Track (Apple HIG Minimum 44px Hit Target) */}
        <div
          className="apple-segmented-track"
          role="tablist"
          aria-label={`${map.title} stages`}
          style={{ '--segment-count': total } as React.CSSProperties}
        >
          {steps.map(([label], idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;
            return (
              <button
                key={label}
                id={`${baseId}-node-tab-${idx}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${baseId}-node-panel`}
                tabIndex={isActive ? 0 : -1}
                className={`apple-segment-btn${isActive ? ' is-active' : ''}${
                  isCompleted ? ' is-completed' : ''
                }`}
                onClick={() => handleSelect(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <span className="apple-segment-btn__num">
                  {STEP_GLYPHS[idx] || String(idx + 1).padStart(2, '0')}
                </span>
                <span className="apple-segment-btn__label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Workbench */}
        <div
          id={`${baseId}-node-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-node-tab-${activeIndex}`}
          className="apple-workbench-card"
        >
          <div className="apple-workbench-card__copy">
            <div className="apple-workbench-card__meta">
              <span className="apple-workbench-card__step-badge">
                Stage {String(activeIndex + 1).padStart(2, '0')} of{' '}
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <h3 key={activeLabel} className="apple-workbench-card__title" aria-live="polite">
              {activeLabel}
            </h3>
            <p key={activeDescription} className="apple-workbench-card__desc">
              {activeDescription}
            </p>

            <div className="apple-workbench-card__nav">
              <button
                type="button"
                className="apple-tactile-btn"
                onClick={() => handleSelect((activeIndex - 1 + total) % total)}
                aria-label="Previous stage"
              >
                ← Previous Stage
              </button>
              <button
                type="button"
                className="apple-tactile-btn apple-tactile-btn--primary"
                onClick={() => handleSelect((activeIndex + 1) % total)}
                aria-label="Next stage"
              >
                Continue to {steps[(activeIndex + 1) % total][0]} →
              </button>
            </div>
          </div>

          <InteractiveVisualStage
            items={visuals}
            fallbackSrc={visual}
            activeIndex={activeIndex}
            totalCount={total}
            onSelectIndex={handleSelect}
            stageLabel="Experience Map"
            activeTitle={activeLabel}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Interactive Application Explorer:
 * Category filter dock + 2-column fluid inspection workbench +
 * Full-visual Apple Bento Sector Gallery where every card features its own
 * unique category-specific image.
 */
export function ApplicationExplorer({
  mode,
  entries,
  visual,
  visuals = [],
  heading = 'Applications & Industry Domains',
  kicker = 'Interactive Domain Explorer',
  lead = 'Inspect how this capability scales across specialized industry verticals, interactive formats, and production workflows.',
}: {
  mode: ExperienceMapData['mode'];
  entries: ExplorerItem[];
  visual?: string;
  visuals?: ExplorerVisual[];
  heading?: string;
  kicker?: string;
  lead?: string;
}): JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const sectorGridRef = useRef<HTMLDivElement | null>(null);
  const sectorCardRefs = useRef<Array<HTMLElement | null>>([]);
  const total = entries.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [entries]);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 680px)').matches) return;
    const grid = sectorGridRef.current;
    const card = sectorCardRefs.current[activeIndex];
    if (!grid || !card) return;
    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const target =
      cardRect.left - gridRect.left + grid.scrollLeft - (grid.clientWidth - cardRect.width) / 2;
    grid.scrollTo({
      left: Math.max(target, 0),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [activeIndex]);

  const handleCardInspect = useCallback((idx: number) => {
    setActiveIndex(idx);
    if (workbenchRef.current) {
      const rect = workbenchRef.current.getBoundingClientRect();
      if (rect.top < -80) {
        workbenchRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, []);

  const activeItem = entries[activeIndex] || entries[0];
  if (!activeItem) return null;

  const activeVisual = visuals[activeIndex] || visuals[0];
  const activePoints = activeItem.items || [];

  return (
    <div
      className={`apple-explorer-section apple-explorer-section--apps apple-explorer-mode--${mode}`}
      aria-label={heading}
    >
      <div className="apple-explorer-container">
        {/* Header */}
        <div className="apple-explorer-header">
          <div className="apple-explorer-header__titles">
            <div className="apple-section-eyebrow">
              <span className="apple-section-eyebrow__dot" aria-hidden="true" />
              <span>{kicker}</span>
            </div>
            <h2 className="apple-explorer-title">{heading}</h2>
            <p className="apple-explorer-lead">{lead}</p>
          </div>
        </div>

        {/* Featured Application Workbench */}
        <div
          ref={workbenchRef}
          id={`${baseId}-app-panel`}
          className="apple-workbench-card apple-workbench-card--app"
        >
          <div className="apple-workbench-card__copy">
            <div className="apple-workbench-card__meta">
              <span className="apple-workbench-card__step-badge">
                Domain {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <h3 key={activeItem.title} className="apple-workbench-card__title" aria-live="polite">
              {activeItem.title}
            </h3>
            {activeItem.description && (
              <p key={`desc-${activeItem.title}`} className="apple-workbench-card__desc">
                {activeItem.description}
              </p>
            )}
            {activeItem.statement && (
              <p key={`statement-${activeItem.title}`} className="apple-workbench-card__desc">
                {activeItem.statement}
              </p>
            )}

            {activePoints.length > 0 && (
              <div key={`caps-${activeIndex}`} className="apple-capabilities-box">
                <span className="apple-capabilities-box__label">
                  Key Capabilities &amp; Deliverables
                </span>
                <ul className="apple-capabilities-list">
                  {activePoints.map((pt) => (
                    <li key={pt} className="apple-capabilities-list__item">
                      <span className="apple-capabilities-list__check" aria-hidden="true">
                        ✓
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeItem.closing && (
              <p className="apple-workbench-card__desc">{activeItem.closing}</p>
            )}


            <div className="apple-workbench-card__nav">
              <button
                type="button"
                className="apple-tactile-btn"
                onClick={() => setActiveIndex((activeIndex - 1 + total) % total)}
                aria-label="Previous application"
              >
                ← Previous
              </button>
              <button
                type="button"
                className="apple-tactile-btn apple-tactile-btn--primary"
                onClick={() => setActiveIndex((activeIndex + 1) % total)}
                aria-label="Next application"
              >
                Explore {entries[(activeIndex + 1) % total].title} →
              </button>
            </div>
          </div>

          <InteractiveVisualStage
            items={visuals}
            fallbackSrc={visual}
            activeIndex={activeIndex}
            totalCount={total}
            onSelectIndex={setActiveIndex}
            stageLabel={kicker}
            activeTitle={activeItem.title}
          />
        </div>

        {/* Full-Visual Sector Bento Grid (Every Card Has Its Own Category-Specific Image) */}
        <div className="apple-sector-grid-header">
          <div>
            <span className="apple-card-kicker">Complete Domain Directory</span>
            <h3 className="apple-sector-grid-header__title">
              All {total} Specialized Categories
            </h3>
          </div>
          <span className="apple-sector-grid-header__hint">
            Select any domain card to open its dedicated inner page
          </span>
        </div>

        <div
          ref={sectorGridRef}
          className="apple-sector-grid apple-sector-grid--visual"
          role="region"
          aria-label="All application domains"
        >
          {entries.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const itemVisual = visuals[idx];
            const mediaStatus = item.href
              ? isSelected
                ? '● Open page'
                : 'Open page ↗'
              : isSelected
                ? '● Active Stage'
                : 'Inspect ↗';
            const fallbackStatus = item.href ? 'Open' : isSelected ? 'Active' : 'Inspect';
            const cardContent = (
              <>
                {itemVisual && (
                  <div className="apple-sector-card__media">
                    <img
                      src={itemVisual.src}
                      {...imageSize(itemVisual.src)}
                      alt={`${item.title} — ${itemVisual.subtitle || itemVisual.caption}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="apple-sector-card__media-scrim" aria-hidden="true" />
                    <span className="apple-sector-card__index">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="apple-sector-card__status">{mediaStatus}</span>
                    {itemVisual.subtitle && (
                      <span className="apple-sector-card__media-caption">
                        {itemVisual.subtitle}
                      </span>
                    )}
                  </div>
                )}

                <div className="apple-sector-card__body">
                  {!itemVisual && (
                    <div className="apple-sector-card__top">
                      <span className="apple-sector-card__index">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="apple-sector-card__status">{fallbackStatus}</span>
                    </div>
                  )}
                  <h4 className="apple-sector-card__title">{item.title}</h4>
                </div>
              </>
            );

            return (
              <article
                key={item.title}
                ref={(node) => {
                  sectorCardRefs.current[idx] = node;
                }}
                className={`apple-sector-card apple-sector-card--visual${
                  isSelected ? ' is-selected' : ''
                }`}
              >
                {item.href ? (
                  <a className="apple-sector-card__control" href={item.href}>
                    {cardContent}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="apple-sector-card__control"
                    aria-pressed={isSelected}
                    onClick={() => handleCardInspect(idx)}
                  >
                    {cardContent}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
