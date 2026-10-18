import { useRef, useState, type CSSProperties, type KeyboardEvent, type MutableRefObject } from 'react';

export type ExplorerItem = {
  title: string;
  description?: string;
  statement?: string;
  items?: string[];
  closing?: string;
};

export type ExperienceMapData = {
  mode: 'spatial' | 'layered' | 'immersive' | 'contextual' | 'kinetic' | 'campaign' | 'production';
  title: string;
  intro: string;
  steps: [string, string][];
  work?: { title: string; bridge: string };
};

export type ExplorerVisual = { src: string; caption: string };

type ExplorerVisualProps = {
  fallbackSrc?: string;
  visuals?: ExplorerVisual[];
  active: number;
  topic: string;
  mode: ExperienceMapData['mode'];
  kind: 'map' | 'applications';
};

function ExplorerVisual({ fallbackSrc, visuals, active, topic, mode, kind }: ExplorerVisualProps): JSX.Element | null {
  const selectedVisual = visuals?.[active];
  const src = selectedVisual?.src ?? fallbackSrc;
  if (!src) return null;
  const style = { '--angel-explorer-index': active } as CSSProperties;
  return (
    <figure className={`angel-explorer__visual angel-explorer__visual--${kind} angel-explorer__visual--${mode}`} data-active={active} style={style}>
      <img key={src} src={src} alt="" loading="lazy" decoding="async" />
      <span className="angel-explorer__visual-plane angel-explorer__visual-plane--one" aria-hidden="true" />
      <span className="angel-explorer__visual-plane angel-explorer__visual-plane--two" aria-hidden="true" />
      <span className="angel-explorer__visual-mark" aria-hidden="true">{String(active + 1).padStart(2, '0')}</span>
      <figcaption><span>{topic}</span><small>Photo via Unsplash</small></figcaption>
    </figure>
  );
}

function useExplorerControls(length: number): [number, (event: KeyboardEvent<HTMLButtonElement>, index: number) => void, (index: number) => void, MutableRefObject<Array<HTMLButtonElement | null>>] {
  const [active, setActive] = useState(0);
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
      controls.current[0]?.focus();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setActive(length - 1);
      controls.current[length - 1]?.focus();
      return;
    }
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (index + keys[event.key] + length) % length;
    setActive(next);
    controls.current[next]?.focus();
  };
  return [active, onKeyDown, setActive, controls];
}

export function ExperienceMap({ map, number, visual, visuals }: { map: ExperienceMapData; number?: string; visual?: string; visuals?: ExplorerVisual[] }): JSX.Element {
  const [active, onKeyDown, setActive, controls] = useExplorerControls(map.steps.length);
  return (
    <section className={`angel-explorer angel-explorer--map angel-explorer--${map.mode}`} aria-labelledby="experience-map-title">
      <header><p className="angel-explorer__eyebrow">{number ? `${number} / ` : ''}Experience map / explore</p><h2 id="experience-map-title">{map.title}</h2><p>{map.intro}</p></header>
      <ExplorerVisual fallbackSrc={visual} visuals={visuals} active={active} topic={map.steps[active][0]} mode={map.mode} kind="map" />
      <div className="angel-explorer__rail" role="tablist" aria-label={`${map.title} stages`}>
        {map.steps.map(([label], index) => <button key={label} ref={(element) => { controls.current[index] = element; }} role="tab" type="button" aria-selected={index === active} aria-controls={`experience-map-panel-${index}`} id={`experience-map-tab-${index}`} tabIndex={index === active ? 0 : -1} onKeyDown={(event) => onKeyDown(event, index)} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>)}
      </div>
      {map.steps.map(([panelTitle, panelDescription], index) => <div key={panelTitle} className="angel-explorer__panel" role="tabpanel" id={`experience-map-panel-${index}`} aria-labelledby={`experience-map-tab-${index}`} hidden={index !== active}>
        <p className="angel-explorer__panel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p><h3>{panelTitle}</h3><p>{panelDescription}</p><button className="angel-explorer__advance" type="button" onClick={() => setActive((index + 1) % map.steps.length)}>Continue to {map.steps[(index + 1) % map.steps.length][0]} <span aria-hidden="true">→</span></button>
      </div>)}
    </section>
  );
}

export function ApplicationExplorer({ mode, entries, visual, visuals }: { mode: ExperienceMapData['mode']; entries: ExplorerItem[]; visual?: string; visuals?: ExplorerVisual[] }): JSX.Element {
  const [active, onKeyDown, setActive, controls] = useExplorerControls(entries.length);
  return (
    <section className={`angel-explorer angel-explorer--applications angel-explorer--${mode}`} aria-labelledby="application-explorer-title">
      <header><p className="angel-explorer__eyebrow">Applications / explore</p><h3 id="application-explorer-title">Choose a possibility.</h3><p>Each route uses its approved applications as a discovery path, not a claim of completed client work.</p></header>
      <ExplorerVisual fallbackSrc={visual} visuals={visuals} active={active} topic={entries[active].title} mode={mode} kind="applications" />
      <div className="angel-explorer__rail" role="tablist" aria-label="Application possibilities">
        {entries.map((item, index) => <button key={item.title} ref={(element) => { controls.current[index] = element; }} role="tab" type="button" aria-selected={index === active} aria-controls={`application-panel-${index}`} id={`application-tab-${index}`} tabIndex={index === active ? 0 : -1} onKeyDown={(event) => onKeyDown(event, index)} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}
      </div>
      {entries.map((panelEntry, index) => <article key={panelEntry.title} className="angel-explorer__panel angel-explorer__application" role="tabpanel" id={`application-panel-${index}`} aria-labelledby={`application-tab-${index}`} hidden={index !== active}>
        <p className="angel-explorer__panel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p><h3>{panelEntry.title}</h3>
        {panelEntry.description && <p>{panelEntry.description}</p>}
        {panelEntry.statement && <p className="angel-explorer__statement">{panelEntry.statement}</p>}
        {panelEntry.items && panelEntry.items.length > 0 && <ul>{panelEntry.items.map((item) => <li key={item}>{item}</li>)}</ul>}
        {panelEntry.closing && <p className="angel-explorer__closing">{panelEntry.closing}</p>}
        <button className="angel-explorer__advance" type="button" onClick={() => setActive((index + 1) % entries.length)}>Continue to {entries[(index + 1) % entries.length].title} <span aria-hidden="true">→</span></button>
      </article>)}
    </section>
  );
}
