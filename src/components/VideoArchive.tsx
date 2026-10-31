import React, { useMemo, useState, useCallback, useRef } from 'react';
import rawArchive from '../data/videoArchive.json';
import { buildContactHref, trackLeadEvent } from '../utils/leads';
import { navigate } from '../utils/routes';
import { cleanArchiveTitle } from '../utils/archiveCopy';
import { imageSize } from '../utils/imageDimensions';

type VideoRecord = {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  tags?: string[];
  uploadDate?: string;
  publishDate?: string;
  duration?: string;
  durationSeconds?: number;
  views?: number;
  likes?: string | number;
  status?: string;
  thumbnail?: string;
};

type WorkDiscipline =
  | 'All Works'
  | 'VFX & Sci-Fi'
  | '2D & 3D Animation'
  | 'Brand & Commercials'
  | 'Architecture & XR'
  | 'Live Events & Stage';

type SortOption = 'featured' | 'views' | 'duration' | 'newest';

const archive = rawArchive as VideoRecord[];
const ARCHIVE_BATCH_SIZE = 15;

// Curated flagship spotlight IDs representing Angel Creations' best cross-discipline work
const SPOTLIGHT_IDS = [
  'gmnLd5YKZ6Y', // SONY BBC Earth VFX BREAKDOWN (13,481 views)
  '1tO39Xqzh9c', // Happy Independence Day | Animation (19,921 views)
  'n8OVCgNDb0c', // B Praak | Live Performance | ULF 2018 (3,647 views)
  'GkxPabDVf6o', // Indian Cultural Map Tour | Motion Graphics (2,266 views)
  '50O6nC07BvQ', // Circle of Life | A 2D Classical Animation Short Film (1,246 views)
  'X8qqEUgUArI', // 3D Architectural Walk-through (Parksyde Homes)
  'LwU4A0ED6aM', // Virtual Reality | Augmented Reality | 3D illusion
  'wz1Iea_HUlA', // Angel's Creations's Show-reel
];

function classifyDiscipline(video: VideoRecord): Exclude<WorkDiscipline, 'All Works'> {
  const t = video.title.toLowerCase();
  if (
    t.includes('architectural') ||
    t.includes('virtual reality') ||
    t.includes('augmented reality') ||
    t.includes('black hole') ||
    t.includes('side by side')
  ) {
    return 'Architecture & XR';
  }
  if (
    t.includes('vfx') ||
    t.includes('weapon') ||
    t.includes('iron man') ||
    t.includes('suicide squad') ||
    t.includes('star trek') ||
    t.includes('sword combat') ||
    t.includes('asphalt')
  ) {
    return 'VFX & Sci-Fi';
  }
  if (
    video.category === 'Travel & Events' ||
    t.includes('live performance') ||
    t.includes('wedding') ||
    t.includes('sangeet') ||
    t.includes('sufi night') ||
    t.includes('asteria club') ||
    t.includes('inauguration') ||
    t.includes('light show')
  ) {
    return 'Live Events & Stage';
  }
  if (
    t.includes('show-reel') ||
    t.includes('creative studio') ||
    t.includes('advertisement') ||
    t.includes('explainer') ||
    t.includes('promotional') ||
    t.includes('mortgage') ||
    t.includes('bank') ||
    t.includes('loans') ||
    t.includes('digital marketing') ||
    t.includes('map tour') ||
    t.includes('industrial safety') ||
    t.includes('tours and travels')
  ) {
    return 'Brand & Commercials';
  }
  return '2D & 3D Animation';
}

const ARCHIVE_EXCERPT_FALLBACK = 'A selected production from the Angel Creations archive.';
const ARCHIVE_BOILERPLATE = [
  /digital marketing/i,
  /broadcasting\s*&\s*media production/i,
  /\bit solutions\b/i,
  /event organi[sz]ers/i,
  /one\s*['’]?stop['’]?\s+solution/i,
  /stop['’]?\s+solution/i,
  /business\s+['’]?growth/i,
  /designing and media production/i,
  /web designing/i,
  /contact us/i,
  /order your own/i,
  /subscribe/i,
  /notification bell/i,
  /collaborate\s*&\s*create/i,
  /more than\s+\d+\s+(customers|videos)/i,
  /mind-boggling/i,
  /quick turnaround/i,
  /^by\s+2020\b/i,
  /we Angel Creations are a studio/i,
  /group of onlookers/i,
  /excellent track record/i,
  /best customer satisfaction/i,
];

function cleanDescriptionExcerpt(raw?: string): string {
  if (!raw) return ARCHIVE_EXCERPT_FALLBACK;

  const candidates: string[] = [];
  const paragraphs = raw.replace(/\r\n?/g, '\n').split(/\n+/);

  for (const paragraph of paragraphs) {
    const cleanedParagraph = paragraph
      .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
      .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, ' ')
      .replace(/\+?\d[\d\s-]{7,}\d/g, ' ')
      .replace(/#\S+/g, ' ')
      .replace(/Angel['’]s Creations/g, 'Angel Creations')
      .replace(/Angels creations/gi, 'Angel Creations')
      .replace(/\bwas done for\b/gi, 'was created for')
      .replace(/,\.(?=\s|$)/g, '.')
      .replace(/\bone of (his|her|their) most popular track\b/gi, 'one of $1 most popular tracks')
      .replace(/\bone of most popular track\b/gi, 'one of the most popular tracks')
      .replace(/\bin purpose of inauguration of\b/gi, 'for the inauguration of')
      .replace(/\bGiant huge\b/gi, 'Giant')
      .replace(/([A-Za-z])(\()/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = cleanedParagraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
    for (const sentence of sentences) {
      const cleanSentence = sentence
        .replace(/^[\s\-–—•|]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanSentence.length < 24 || /^\d+\)/.test(cleanSentence)) continue;
      if (/^(mail|call|website|instagram|facebook|google\+|get in touch)\b/i.test(cleanSentence)) {
        continue;
      }
      if (ARCHIVE_BOILERPLATE.some((pattern) => pattern.test(cleanSentence))) continue;
      candidates.push(cleanSentence);
    }
  }

  if (!candidates.length) return ARCHIVE_EXCERPT_FALLBACK;

  let excerpt = candidates[0];
  let candidateIndex = 1;
  while (
    candidates[candidateIndex] &&
    (excerpt.length < 86 || /,$/.test(excerpt)) &&
    `${excerpt} ${candidates[candidateIndex]}`.length <= 190
  ) {
    const prefix = /,$/.test(excerpt)
      ? excerpt
      : /[.!?…]$/.test(excerpt)
        ? excerpt
        : `${excerpt}.`;
    excerpt = `${prefix} ${candidates[candidateIndex]}`;
    candidateIndex += 1;
  }
  excerpt = excerpt.replace(/,\s*$/, '.').replace(/,\.(?=\s|$)/g, '.');

  excerpt = excerpt.replace(/^([^A-Za-z]*)([a-z])/, (_match, prefix: string, letter: string) =>
    `${prefix}${letter.toUpperCase()}`
  );

  if (excerpt.length > 194) {
    const shortened = excerpt.slice(0, 191);
    const lastSpace = shortened.lastIndexOf(' ');
    excerpt = `${shortened.slice(0, lastSpace > 120 ? lastSpace : 191).trim()}…`;
  } else if (!/[.!?…]$/.test(excerpt)) {
    excerpt = `${excerpt}.`;
  }

  return excerpt;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatCount(value?: number | string): string | null {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat('en').format(numericValue)
    : String(value);
}

function webpSource(source: string): string {
  return source.replace(/\.jpe?g$/i, '.webp');
}

function contactDisciplineForWork(discipline: WorkDiscipline): string {
  switch (discipline) {
    case 'VFX & Sci-Fi':
    case '2D & 3D Animation':
      return '3D Animation & VFX';
    case 'Brand & Commercials':
      return 'Brand Advertisement';
    case 'Live Events & Stage':
      return 'Media Production';
    case 'Architecture & XR':
    default:
      return 'Custom Multi-Discipline Commission';
  }
}

const DISCIPLINES: WorkDiscipline[] = [
  'All Works',
  'VFX & Sci-Fi',
  '2D & 3D Animation',
  'Brand & Commercials',
  'Architecture & XR',
  'Live Events & Stage',
];

export function VideoArchive(): JSX.Element {
  const [selectedDiscipline, setSelectedDiscipline] = useState<WorkDiscipline>('All Works');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState(ARCHIVE_BATCH_SIZE);
  const [activeVideoId, setActiveVideoId] = useState<string>(SPOTLIGHT_IDS[0]);
  const [isPlayingInline, setIsPlayingInline] = useState<boolean>(false);
  const theaterRef = useRef<HTMLDivElement | null>(null);

  const enrichedArchive = useMemo(
    () =>
      archive.map((video, originalIndex) => ({
        ...video,
        title: cleanArchiveTitle(video.title),
        originalIndex,
        discipline: classifyDiscipline(video),
        cleanExcerpt: cleanDescriptionExcerpt(video.description),
        spotlightRank: SPOTLIGHT_IDS.indexOf(video.id),
      })),
    []
  );

  const spotlightVideos = useMemo(
    () =>
      SPOTLIGHT_IDS.map((id) => enrichedArchive.find((v) => v.id === id)).filter(
        (v): v is NonNullable<typeof v> => Boolean(v)
      ),
    [enrichedArchive]
  );

  const activeVideo = useMemo(
    () =>
      enrichedArchive.find((v) => v.id === activeVideoId) ||
      spotlightVideos[0] ||
      enrichedArchive[0],
    [activeVideoId, enrichedArchive, spotlightVideos]
  );

  const totalArchiveViews = useMemo(
    () => enrichedArchive.reduce((total, video) => total + (video.views || 0), 0),
    [enrichedArchive]
  );
  const formattedTotalViews = formatCount(totalArchiveViews);
  const activeLeadHref = buildContactHref({
    discipline: contactDisciplineForWork(activeVideo.discipline),
    intent: 'scope-estimate',
    sourceRoute: '/works/',
    topic: `A production like “${activeVideo.title}”`,
    goal: `${activeVideo.discipline} reference from the Works archive`,
  });

  const disciplineCounts = useMemo(() => {
    const counts: Record<WorkDiscipline, number> = {
      'All Works': enrichedArchive.length,
      'VFX & Sci-Fi': 0,
      '2D & 3D Animation': 0,
      'Brand & Commercials': 0,
      'Architecture & XR': 0,
      'Live Events & Stage': 0,
    };
    for (const v of enrichedArchive) {
      counts[v.discipline] += 1;
    }
    return counts;
  }, [enrichedArchive]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = enrichedArchive.filter((video) => {
      if (selectedDiscipline !== 'All Works' && video.discipline !== selectedDiscipline) {
        return false;
      }
      if (!q) return true;
      const inTitle = video.title.toLowerCase().includes(q);
      const inDiscipline = video.discipline.toLowerCase().includes(q);
      const inTags = (video.tags || []).some((t) => t.toLowerCase().includes(q));
      return inTitle || inDiscipline || inTags;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === 'duration') {
        return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      }
      if (sortBy === 'newest') {
        const da = new Date(a.publishDate || a.uploadDate || 0).getTime();
        const db = new Date(b.publishDate || b.uploadDate || 0).getTime();
        return db - da;
      }
      // 'featured': spotlight works first, then by views
      const aSpot = a.spotlightRank >= 0 ? a.spotlightRank : 999;
      const bSpot = b.spotlightRank >= 0 ? b.spotlightRank : 999;
      if (aSpot !== bSpot) return aSpot - bSpot;
      return (b.views || 0) - (a.views || 0);
    });
  }, [enrichedArchive, searchQuery, selectedDiscipline, sortBy]);

  const visibleRecords = filteredRecords.slice(0, visibleCount);

  const handleInspectVideo = useCallback((id: string, autoPlay = false) => {
    setActiveVideoId(id);
    setIsPlayingInline(autoPlay);
    if (theaterRef.current) {
      const rect = theaterRef.current.getBoundingClientRect();
      if (rect.top < -60 || rect.top > 240) {
        theaterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const handleStepSpotlight = useCallback(
    (delta: number) => {
      const pool = filteredRecords.length > 0 ? filteredRecords : enrichedArchive;
      const idx = pool.findIndex((v) => v.id === activeVideo.id);
      const nextIdx = (idx + delta + pool.length) % pool.length;
      setActiveVideoId(pool[nextIdx].id);
      setIsPlayingInline(false);
    },
    [activeVideo.id, enrichedArchive, filteredRecords]
  );

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(path);
  }, []);

  const activeDate = formatDate(activeVideo.publishDate ?? activeVideo.uploadDate);
  const activeViews = formatCount(activeVideo.views);

  return (
    <div
      className="apple-inner-page apple-works-page"
      style={
        {
          '--route-accent': '#00D2FF',
          '--route-accent-secondary': '#7B3FF2',
          '--route-accent-rgb': '0, 210, 255',
        } as React.CSSProperties
      }
    >
      {/* 1. SPATIAL SHOWREEL HERO & INTERACTIVE CINEMA THEATER */}
      <section className="apple-hero-stage" id="works-hero" aria-labelledby="works-page-title">
        <div className="apple-hero-stage__ambient" aria-hidden="true" />

        <div className="apple-hero-container">
          {/* Top Bar */}
          <div className="apple-hero-topbar">
            <a
              href="/"
              className="apple-back-pill"
              onClick={(e) => handleLinkClick(e, '/')}
              aria-label="Back to Home"
            >
              <span className="apple-back-pill__arrow" aria-hidden="true">
                ←
              </span>
              <span>Back to Home</span>
            </a>

            <nav className="apple-section-jump-nav" aria-label="Works page sections">
              <a href="#works-hero" className="apple-section-jump-nav__link">
                Cinema Stage
              </a>
              <a href="#works-archive-explorer" className="apple-section-jump-nav__link">
                Archive ({enrichedArchive.length})
              </a>
              <a href="#works-collaborate" className="apple-section-jump-nav__link">
                Start a Project
              </a>
            </nav>
          </div>

          {/* Editorial Title Block */}
          <header className="apple-works-hero-head">
            <div className="apple-hero-badge">
              <span className="apple-hero-badge__index">Studio Vault</span>
              <span className="apple-hero-badge__sep" aria-hidden="true">
                ·
              </span>
              <span className="apple-hero-badge__cat">
                XR, Animation, VFX &amp; Film Portfolio · {enrichedArchive.length} Productions
              </span>
            </div>

            <h1 id="works-page-title" className="apple-hero-title">
              We Craft Extraordinary Worlds, Films &amp; Experiences.
            </h1>

            <p className="apple-hero-lead">
              Explore the portfolio of an India-based XR, animation, VFX and film studio—featuring
              films, VFX breakdowns, 2D and 3D animation, architectural visualisation, brand
              commercials and live-event productions.
            </p>
          </header>

          {/* Interactive Cinema Theater Workbench */}
          <div
            ref={theaterRef}
            className="apple-workbench-card apple-works-theater"
            aria-label="Featured production screening stage"
          >
            <div className="apple-workbench-card__copy">
              <div className="apple-workbench-card__meta">
                <span className="apple-workbench-card__step-badge">
                  ● Now Screening
                </span>
                <span className="apple-workbench-card__category-pill">
                  {activeVideo.discipline}
                </span>
                {activeVideo.duration && (
                  <span className="apple-workbench-card__category-pill">
                    Runtime {activeVideo.duration}
                  </span>
                )}
              </div>

              <h2 className="apple-workbench-card__title">{activeVideo.title}</h2>
              <p className="apple-workbench-card__desc">{activeVideo.cleanExcerpt}</p>

              {/* Metadata Pills */}
              <div className="apple-stage-flow-pills">
                {activeDate && (
                  <span className="apple-stage-flow-pill">Published {activeDate}</span>
                )}
                {activeViews && (
                  <span className="apple-stage-flow-pill">{activeViews} views</span>
                )}
                {activeVideo.category && (
                  <span className="apple-stage-flow-pill">{activeVideo.category}</span>
                )}
              </div>

              {/* Theater Actions */}
              <div className="apple-workbench-card__nav">
                <button
                  type="button"
                  className="apple-cta-primary"
                  onClick={() => setIsPlayingInline((prev) => !prev)}
                >
                  <span>{isPlayingInline ? '■ Close Player' : '▶ Play in Cinema'}</span>
                </button>
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-cta-secondary"
                >
                  <span>Watch on YouTube</span>
                  <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={activeLeadHref}
                  className="apple-cta-secondary"
                  data-lead-event="lead_cta_click"
                  data-lead-intent="scope-estimate"
                  data-lead-topic={activeVideo.title}
                  onClick={(event) => {
                    trackLeadEvent('lead_cta_click', {
                      intent: 'scope-estimate',
                      topic: activeVideo.title,
                      sourceRoute: '/works/',
                      cta: 'Create something like this',
                    });
                    handleLinkClick(event, activeLeadHref);
                  }}
                >
                  <span>Create Something Like This</span>
                  <span aria-hidden="true">→</span>
                </a>
                <button
                  type="button"
                  className="apple-tactile-btn"
                  onClick={() => handleStepSpotlight(-1)}
                  aria-label="Previous production"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="apple-tactile-btn"
                  onClick={() => handleStepSpotlight(1)}
                  aria-label="Next production"
                >
                  →
                </button>
              </div>
            </div>

            {/* Right Column: 16:9 Cinema Viewport or Live YouTube Embed */}
            <div className="apple-visual-stage apple-works-cinema-stage">
              {isPlayingInline ? (
                <div className="apple-works-iframe-wrap">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="apple-works-iframe"
                  />
                  <button
                    type="button"
                    className="apple-works-iframe-close"
                    onClick={() => setIsPlayingInline(false)}
                  >
                    ✕ Exit Inline Player
                  </button>
                </div>
              ) : (
                <>
                  <div className="apple-visual-stage__canvas">
                    {activeVideo.thumbnail && (
                      <picture>
                        <source srcSet={webpSource(activeVideo.thumbnail)} type="image/webp" />
                        <img
                          key={activeVideo.id}
                          src={activeVideo.thumbnail}
                          {...imageSize(activeVideo.thumbnail)}
                          alt={activeVideo.title}
                          className="apple-visual-stage__img"
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      </picture>
                    )}
                    <div className="apple-visual-stage__scrim" aria-hidden="true" />
                  </div>

                  {/* Center Glass Play Button */}
                  <button
                    type="button"
                    className="apple-works-play-trigger"
                    onClick={() => setIsPlayingInline(true)}
                    aria-label={`Play Film — ${activeVideo.title} in the Cinema Stage`}
                  >
                    <span className="apple-works-play-trigger__icon" aria-hidden="true">
                      ▶
                    </span>
                    <span className="apple-works-play-trigger__label">Play Film</span>
                  </button>

                  {/* Top HUD */}
                  <div className="apple-visual-stage__hud-top">
                    <span className="apple-visual-stage__badge">
                      <span className="apple-visual-stage__badge-dot" aria-hidden="true" />
                      <span>{activeVideo.discipline}</span>
                    </span>
                    {activeVideo.duration && (
                      <span className="apple-visual-stage__counter">
                        {activeVideo.duration}
                      </span>
                    )}
                  </div>

                  {/* Bottom Spotlight Filmstrip */}
                  <div className="apple-visual-stage__hud-bottom">
                    <div className="apple-visual-stage__caption-wrap">
                      <div className="apple-visual-stage__caption-group">
                        <p className="apple-visual-stage__caption">{activeVideo.title}</p>
                        <p className="apple-visual-stage__subcaption">
                          Spotlight Reel · Choose a frame below
                        </p>
                      </div>
                    </div>

                    <div
                      className="apple-visual-stage__filmstrip"
                      role="group"
                      aria-label="Flagship spotlight productions"
                    >
                      {spotlightVideos.map((vid, idx) => {
                        const isSelected = vid.id === activeVideo.id;
                        return (
                          <button
                            key={vid.id}
                            type="button"
                            className={`apple-filmstrip-thumb${isSelected ? ' is-active' : ''}`}
                            onClick={() => {
                              setActiveVideoId(vid.id);
                              setIsPlayingInline(false);
                            }}
                            aria-label={`Show ${String(idx + 1).padStart(2, '0')} — ${vid.title} in the spotlight`}
                            aria-pressed={isSelected}
                          >
                            {vid.thumbnail && (
                              <img
                                src={webpSource(vid.thumbnail)}
                                {...imageSize(webpSource(vid.thumbnail))}
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <span className="apple-filmstrip-thumb__index">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4-Tile Archive Telemetry Bar */}
          <div className="apple-telemetry-strip" role="list" aria-label="Archive statistics">
            <div className="apple-telemetry-tile" role="listitem">
              <span className="apple-telemetry-tile__label">Production Vault</span>
              <strong className="apple-telemetry-tile__value">{enrichedArchive.length} Productions</strong>
              <span className="apple-telemetry-tile__detail">
                Films, breakdowns and live productions
              </span>
            </div>
            <div className="apple-telemetry-tile" role="listitem">
              <span className="apple-telemetry-tile__label">Creative Domains</span>
              <strong className="apple-telemetry-tile__value">5 Core Disciplines</strong>
              <span className="apple-telemetry-tile__detail">
                VFX, 2D/3D Animation, Brand, XR &amp; Live Stage
              </span>
            </div>
            <div className="apple-telemetry-tile" role="listitem">
              <span className="apple-telemetry-tile__label">Audience Reach</span>
              <strong className="apple-telemetry-tile__value">{formattedTotalViews} Views</strong>
              <span className="apple-telemetry-tile__detail">
                Recorded across the public archive
              </span>
            </div>
            <div className="apple-telemetry-tile" role="listitem">
              <span className="apple-telemetry-tile__label">Screening Mode</span>
              <strong className="apple-telemetry-tile__value">Watch Your Way</strong>
              <span className="apple-telemetry-tile__detail">
                Play here or continue on YouTube
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPLETE INTERACTIVE ARCHIVE EXPLORER */}
      <section
        className="apple-explorer-section apple-explorer-section--apps"
        id="works-archive-explorer"
        aria-labelledby="angel-archive-title"
      >
        <div className="apple-explorer-container">
          <div className="apple-explorer-header">
            <div className="apple-explorer-header__titles">
              <div className="apple-section-eyebrow">
                <span className="apple-section-eyebrow__dot" aria-hidden="true" />
                <span>Archive / {enrichedArchive.length} Productions</span>
              </div>
              <h2 id="angel-archive-title" className="apple-explorer-title">
                Watch XR, Animation, VFX & Film Work.
              </h2>
              <p className="apple-explorer-lead">
                Filter 3D animation and VFX, brand films, architectural visualisation, XR and live
                productions by discipline, title, tag, reach or runtime. Choose any frame to bring
                it to the Cinema Stage.
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="apple-works-toolbar">
              <div className="apple-works-search">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(ARCHIVE_BATCH_SIZE);
                  }}
                  placeholder={`Search ${enrichedArchive.length} titles, VFX, 3D, events…`}
                  aria-label="Search the video archive"
                  className="apple-works-search__input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="apple-works-search__clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="apple-works-sort" role="group" aria-label="Sort archive">
                {(
                  [
                    ['featured', 'Featured'],
                    ['views', 'Most Viewed'],
                    ['duration', 'Longest'],
                    ['newest', 'Newest'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`apple-pill-control${sortBy === key ? ' is-active' : ''}`}
                    onClick={() => setSortBy(key)}
                    aria-pressed={sortBy === key}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Discipline Filter Dock */}
          <div
            className="apple-filter-dock"
            role="tablist"
            aria-label="Filter the video archive by creative discipline"
          >
            {DISCIPLINES.map((disc) => {
              const isActive = disc === selectedDiscipline;
              return (
                <button
                  key={disc}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`apple-filter-pill${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedDiscipline(disc);
                    setVisibleCount(ARCHIVE_BATCH_SIZE);
                  }}
                >
                  <span className="apple-filter-pill__title">{disc}</span>
                  <span className="apple-filter-pill__num">({disciplineCounts[disc]})</span>
                </button>
              );
            })}
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {visibleRecords.length} of {filteredRecords.length} archive{' '}
            {filteredRecords.length === 1 ? 'record' : 'records'}.
          </p>

          {/* Bento Grid of Works */}
          {visibleRecords.length === 0 ? (
            <div className="apple-glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <h3>No productions match “{searchQuery}”</h3>
              <p style={{ margin: '0.5rem auto 1.5rem', maxWidth: '46ch' }}>
                Try a broader search, or return to All Works to browse all {enrichedArchive.length}
                productions.
              </p>
              <button
                type="button"
                className="apple-tactile-btn apple-tactile-btn--primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDiscipline('All Works');
                }}
              >
                Reset Archive Filters
              </button>
            </div>
          ) : (
            <div className="apple-sector-grid apple-sector-grid--visual apple-works-grid">
              {visibleRecords.map((video, idx) => {
                const isSelected = video.id === activeVideo.id;
                const date = formatDate(video.publishDate ?? video.uploadDate);
                const views = formatCount(video.views);
                const likes = formatCount(video.likes);
                return (
                  <article
                    key={video.id}
                    className={`apple-sector-card apple-sector-card--visual apple-work-card${
                      isSelected ? ' is-selected' : ''
                    }`}
                  >
                    {video.thumbnail && (
                      <div
                        className="apple-sector-card__media"
                        onClick={() => handleInspectVideo(video.id, true)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${video.title} in the Cinema Stage`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleInspectVideo(video.id, true);
                          }
                        }}
                      >
                        <picture>
                          <source srcSet={webpSource(video.thumbnail)} type="image/webp" />
                          <img
                            src={video.thumbnail}
                            {...imageSize(video.thumbnail)}
                            alt={video.title}
                            loading={idx < 2 ? 'eager' : 'lazy'}
                            decoding="async"
                          />
                        </picture>
                        <div className="apple-sector-card__media-scrim" aria-hidden="true" />
                        <span className="apple-sector-card__index">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="apple-sector-card__status">
                          {isSelected ? '● Now Screening' : '▶ Screen Film'}
                        </span>
                        <span className="apple-sector-card__media-caption">
                          {video.discipline}
                          {video.duration ? ` · ${video.duration}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="apple-sector-card__body">
                      <h3 className="apple-sector-card__title">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {video.title}
                        </a>
                      </h3>

                      <p className="apple-sector-card__summary">{video.cleanExcerpt}</p>

                      <div className="apple-work-card__meta-pills">
                        {date && <span className="apple-work-card__pill">{date}</span>}
                        {views && <span className="apple-work-card__pill">{views} views</span>}
                        {likes && <span className="apple-work-card__pill">{likes} likes</span>}
                      </div>

                      {video.tags && video.tags.length > 0 && (
                        <div className="apple-work-card__tags" aria-label="Production tags">
                          {video.tags.slice(0, 4).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              className="apple-work-card__tag-chip"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(tag);
                                setSelectedDiscipline('All Works');
                              }}
                              title={`Filter by #${tag}`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="apple-work-card__actions">
                        <button
                          type="button"
                          className="apple-tactile-btn apple-tactile-btn--primary"
                          onClick={() => handleInspectVideo(video.id, true)}
                        >
                          ▶ Screen in Stage
                        </button>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="apple-tactile-btn"
                        >
                          YouTube ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {visibleRecords.length < filteredRecords.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.75rem' }}>
              <button
                type="button"
                className="apple-cta-secondary"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + ARCHIVE_BATCH_SIZE, filteredRecords.length)
                  )
                }
              >
                <span>
                  Load{' '}
                  {Math.min(ARCHIVE_BATCH_SIZE, filteredRecords.length - visibleRecords.length)}{' '}
                  More Productions ({visibleRecords.length} of {filteredRecords.length} Shown)
                </span>
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. COLLABORATION CTA FOOTER */}
      <footer className="apple-inner-footer" id="works-collaborate">
        <div className="apple-inner-footer__container">
          <div className="apple-Finale-card">
            <div className="apple-Finale-card__copy">
              <div className="apple-section-eyebrow">
                <span className="apple-section-eyebrow__dot" aria-hidden="true" />
                <span>Start a Production With Angel Creations</span>
              </div>
              <h2 className="apple-Finale-card__title">
                Have a Film, Spatial World, or Campaign Ready for Production?
              </h2>
              <p className="apple-Finale-card__desc">
                Hire our Jaipur, India-based directors, 3D artists, VFX supervisors and XR engineers
                for animation, brand films, immersive experiences and media production delivered
                across India and worldwide.
              </p>
            </div>

            <div className="apple-Finale-card__actions">
              <a
                href={activeLeadHref}
                className="apple-cta-primary"
                data-lead-event="lead_cta_click"
                data-lead-intent="scope-estimate"
                data-lead-topic={activeVideo.title}
                onClick={(e) => {
                  trackLeadEvent('lead_cta_click', {
                    intent: 'scope-estimate',
                    topic: activeVideo.title,
                    sourceRoute: '/works/',
                    cta: 'Works finale enquiry',
                  });
                  handleLinkClick(e, activeLeadHref);
                }}
              >
                <span>Get a Production Roadmap</span>
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="/about/"
                className="apple-cta-secondary"
                onClick={(e) => handleLinkClick(e, '/about/')}
              >
                <span>Explore Studio Capabilities</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
