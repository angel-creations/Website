import * as React from 'react';
import { createRoot } from 'react-dom/client';

const panoramaVideo = '/wp-content/uploads/2023/01/Y2meta.app-360°-VR-TERRIFYING-Sea-Creatures-_-Deep-Ocean-Horror-720p60.mp4';
const threeScript = '/legacy-assets/other/wp-content/plugins/panorama/public/assets/js/three.min.js';
const panolensScript = '/legacy-assets/other/wp-content/plugins/panorama/public/assets/js/panolens.min.js';
const panoramaViewScript = '/legacy-assets/other/wp-content/plugins/panorama/build/blocks/video/view.js';

const attributes = {
  videoUrl: panoramaVideo,
  options: {
    autoplay: true,
    loop: true,
    muted: false,
    controlBar: false,
    fullscreen: true,
    setting: true,
    video: true,
    initialView: false,
    initialPosition: { x: 0, y: 0, z: 0 },
  },
  layout: {
    alignSl: { desktop: 'center', tablet: 'center', mobile: 'center' },
    width: { desktop: '1920px', tablet: '1920px', mobile: '1920px' },
    height: { desktop: '1080px', tablet: '1080px', mobile: '1080px' },
  },
};

declare global {
  interface Window {
    React?: typeof React;
    __angelPanoramaRuntime?: Promise<void>;
  }
}

function appendLegacyScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-angel-panorama="${source}"]`);
    if (existing?.dataset.loaded === 'true') {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Could not load ${source}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = source;
    script.async = false;
    script.dataset.angelPanorama = source;
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Could not load ${source}`)), { once: true });
    document.head.appendChild(script);
  });
}

export function PanoramaPage(): JSX.Element {
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    // The captured WordPress view bundle is a React 18 browser bundle and reads these
    // globals. Expose the migration's matching React runtime, then execute the archived
    // Three.js, Panolens and block-view scripts in the source dependency order.
    window.React = React;
    window.ReactDOM = { createRoot } as unknown as typeof window.ReactDOM;
    window.__angelPanoramaRuntime ??= (async () => {
      await appendLegacyScript(threeScript);
      await appendLegacyScript(panolensScript);
      await appendLegacyScript(panoramaViewScript);
      // view.js is a WordPress deferred view bundle: it normally attaches before the
      // document's DOMContentLoaded event. It is loaded after React commits here, so
      // replay that source initialization signal once its listener is present.
      document.dispatchEvent(new Event('DOMContentLoaded'));
    })();
    window.__angelPanoramaRuntime.catch(() => setNotice('The preserved Panorama runtime could not load.'));
  }, []);

  return (
    <main id="main" className="site-main">
      <div className="cursor" data-cursor><div className="inner"><div className="circle"><span className="cursor_text" /></div></div></div>
      <div id="load_overlay" className="load_overlay" />
      <div id="dynamicLoad" className="dynamic_load"><div className="progress"><div className="bar" id="dynamicBar" /></div></div>
      <section className="section 360-video">
        <div className="wp-block-panorama-video" id="bBlocksVideoViewer-1" data-attributes={JSON.stringify(attributes)} />
        {notice ? <p className="panorama-notice">{notice}</p> : null}
      </section>
    </main>
  );
}
