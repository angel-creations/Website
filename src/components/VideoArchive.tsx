import { useMemo, useState } from 'react';
import rawArchive from '../data/videoArchive.json';

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

const archive = rawArchive as VideoRecord[];
const ARCHIVE_BATCH_SIZE = 12;

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function formatCount(value?: number | string): string | null {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? new Intl.NumberFormat('en').format(numericValue) : String(value);
}

function webpSource(source: string): string {
  return source.replace(/\.jpe?g$/i, '.webp');
}

export function VideoArchive(): JSX.Element {
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(ARCHIVE_BATCH_SIZE);
  const categories = useMemo(() => ['All', ...Array.from(new Set(archive.map((video) => video.category).filter((value): value is string => Boolean(value)))).sort()], []);
  const records = category === 'All' ? archive : archive.filter((video) => video.category === category);
  const visibleRecords = records.slice(0, visibleCount);

  return (
    <section className="angel-archive" aria-labelledby="angel-archive-title">
      <div className="angel-archive__intro">
        <p className="angel-archive__eyebrow">Archive / 47 public source records</p>
        <h2 id="angel-archive-title">Watch the work.</h2>
        <p>Titles, descriptions, links, and available metadata are retained from Angel Creations’ public video archive. Source descriptions are presented as source text, not new claims.</p>
      </div>

      <div className="angel-archive__filter" aria-label="Filter the video archive by source category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={item === category ? 'is-active' : ''}
            aria-pressed={item === category}
            onClick={() => { setCategory(item); setVisibleCount(ARCHIVE_BATCH_SIZE); }}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">Showing {visibleRecords.length} of {records.length} archive {records.length === 1 ? 'record' : 'records'}.</p>
      <ol className="angel-archive__list">
        {visibleRecords.map((video, index) => {
          const date = formatDate(video.publishDate ?? video.uploadDate);
          const views = formatCount(video.views);
          const likes = formatCount(video.likes);
          return (
            <li className="angel-archive__item" key={video.id}>
              <article>
                {video.thumbnail && (
                  <a className="angel-archive__media" href={video.url} target="_blank" rel="noreferrer" aria-label={`Watch ${video.title} on YouTube`}>
                    <picture>
                      <source srcSet={webpSource(video.thumbnail)} type="image/webp" />
                      <img src={video.thumbnail} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
                    </picture>
                  </a>
                )}
                <div className="angel-archive__content">
                  <p className="angel-archive__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
                  <h3><a href={video.url} target="_blank" rel="noreferrer">{video.title}</a></h3>
                  <ul className="angel-archive__meta" aria-label={`Available source metadata for ${video.title}`}>
                    {video.category && <li>{video.category}</li>}
                    {video.duration && <li>{video.duration}</li>}
                    {date && <li>{date}</li>}
                    {views && <li>{views} views</li>}
                    {likes && <li>{likes} likes</li>}
                    {video.status && <li>{video.status}</li>}
                  </ul>
                  {video.description && (
                    <details className="angel-archive__details">
                      <summary>Read source description</summary>
                      <p>{video.description}</p>
                    </details>
                  )}
                  {video.tags && video.tags.length > 0 && (
                    <details className="angel-archive__details angel-archive__tags">
                      <summary>Source tags ({video.tags.length})</summary>
                      <p>{video.tags.join(' · ')}</p>
                    </details>
                  )}
                  <a className="angel-archive__watch" href={video.url} target="_blank" rel="noreferrer">Watch source <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      {visibleRecords.length < records.length && (
        <button className="angel-archive__more" type="button" onClick={() => setVisibleCount((count) => Math.min(count + ARCHIVE_BATCH_SIZE, records.length))}>
          Explore {Math.min(ARCHIVE_BATCH_SIZE, records.length - visibleRecords.length)} more source {records.length - visibleRecords.length === 1 ? 'record' : 'records'} <span aria-hidden="true">↓</span>
        </button>
      )}
    </section>
  );
}
