import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      configuration: Record<string, unknown>,
      progress: (value: number) => void,
    ) => Promise<{ SetFullscreen: (enabled: number) => void }>;
  }
}

// The live page serves its Unity build from this same-origin path. During local Vite
// preview that path is transparently read-only proxied to the live build (vite.config.ts),
// avoiding the CORS failure caused by addressing the production host directly.
const remoteBuild = '/metaverse/Build';

export function MetaverseRuntime(): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const unity = useRef<{ SetFullscreen: (enabled: number) => void } | null>(null);

  useEffect(() => {
    if (!canvas.current) return;

    // Preserve the captured Unity template's mobile branch: it fills the browser,
    // shows the source warning, and still starts the Unity loader.
    if (isMobile) {
      if (!document.querySelector('meta[data-angel-unity-mobile-viewport]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
        meta.dataset.angelUnityMobileViewport = 'true';
        document.head.appendChild(meta);
      }
      canvas.current.style.width = `${window.innerWidth}px`;
      canvas.current.style.height = `${window.innerHeight}px`;
      setMessage('WebGL builds are not supported on mobile devices.');
    }

    const script = document.createElement('script');
    script.src = `${remoteBuild}/Metaverse05_Browser_Jan31.loader.js`;
    script.async = true;
    script.onload = () => {
      if (!canvas.current || !window.createUnityInstance) {
        setMessage('Unity loader could not initialize.');
        return;
      }
      window.createUnityInstance(canvas.current, {
        dataUrl: `${remoteBuild}/Metaverse05_Browser_Jan31.data`,
        frameworkUrl: `${remoteBuild}/Metaverse05_Browser_Jan31.framework.js`,
        codeUrl: `${remoteBuild}/Metaverse05_Browser_Jan31.wasm`,
        streamingAssetsUrl: 'StreamingAssets',
        companyName: 'King',
        productName: 'MetaScore',
        productVersion: '0.1',
      }, setProgress).then((instance) => {
        unity.current = instance;
      }).catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Unity build could not load.');
      });
    };
    script.onerror = () => setMessage('Unity loader could not load.');
    document.body.appendChild(script);
    return () => {
      script.remove();
      // Do not let the Unity template's user-scalable=no viewport outlive
      // the artifact — pinch zoom must keep working on the rest of the site.
      document.querySelector('meta[data-angel-unity-mobile-viewport]')?.remove();
    };
  }, [isMobile]);

  const ready = progress >= 1 && unity.current !== null;
  return (
    <div className="unity-page">
      <div id="unity-container" ref={container} className={isMobile ? 'unity-mobile' : 'unity-desktop'}>
        <canvas id="unity-canvas" ref={canvas} width="960" height="600" />
        <div id="unity-loading-bar" style={{ display: ready ? 'none' : 'block' }}>
          <div id="unity-logo" />
          <div id="unity-progress-bar-empty"><div id="unity-progress-bar-full" style={{ width: `${progress * 100}%` }} /></div>
        </div>
        <div id="unity-warning">{message}</div>
        <div id="unity-footer">
          <div id="unity-webgl-logo" />
          <button id="unity-fullscreen-button" type="button" aria-label="Fullscreen" onClick={() => unity.current?.SetFullscreen(1)} />
          <div id="unity-build-title">MetaScore</div>
        </div>
      </div>
    </div>
  );
}

export function MetaversePage(): JSX.Element {
  return <main className="unity-page"><MetaverseRuntime /></main>;
}
