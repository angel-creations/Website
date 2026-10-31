import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { socialLinks } from '../data/socialLinks';
import type { NavigationItem } from '../types/content';
import { getNetworkInformation, shouldAutoplayAmbientMedia } from '../utils/mediaPreferences';
import { navigate, navigateHomeFromStart } from '../utils/routes';
import { imageSize } from '../utils/imageDimensions';

const logo = '/media/logos/logo-rectangle-1.png';
const menuVideo = '/media/videos/Main-Background-with-sound.mp4';
const menuPoster = '/media/images/generated-home-posters/menu-background.webp';

const primaryItems: NavigationItem[] = [
  { label: 'About Us', href: '/about/', number: '01' },
  { label: 'Works', href: '/works/', number: '02' },
  { label: 'Contact', href: '/contact/', number: '03' },
];

type ProductItem = {
  number: string;
  title: string;
  subtitle: string;
  href: string;
};

const productItems: ProductItem[] = [
  {
    number: '01',
    title: 'The Virtual Life',
    subtitle: 'Immersive virtual worlds & interactive digital ecosystems',
    href: 'https://thevirtuallife.in/',
  },
  {
    number: '02',
    title: 'Immersive Wedding Invite',
    subtitle: 'Bespoke 3D spatial & interactive wedding invitations',
    href: 'https://thevirtuallife.in/weddinginvite/',
  },
];

function shouldUseClientNavigation(event: ReactMouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;
}

function notifyMenuState(open: boolean): void {
  document.dispatchEvent(new CustomEvent('angel:menu-state', { detail: { open } }));
}

function setMenuBackgroundInert(inert: boolean): void {
  const background = document.querySelectorAll<HTMLElement>(
    '#page > header .header-wrap, #page > main, #page > #content, #page > .site-content, #page > footer',
  );
  background.forEach((element) => {
    if (inert && !element.hasAttribute('inert')) {
      element.dataset.angelMenuInert = 'true';
      element.setAttribute('inert', '');
    } else if (!inert && element.dataset.angelMenuInert === 'true') {
      element.removeAttribute('inert');
      delete element.dataset.angelMenuInert;
    }
  });
}

function Link({ item, close }: { item: NavigationItem; close?: () => void }): JSX.Element {
  return (
    <a
      href={item.href}
      className="inner_link"
      onClick={(event) => {
        if (!shouldUseClientNavigation(event)) return;
        event.preventDefault();
        close?.();
        navigate(item.href);
      }}
    >
      <span className="ac-menu-primary__title">{item.label}</span>
      {item.number ? <span className="right_postion">{item.number}</span> : null}
    </a>
  );
}

function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute('inert') && item.getClientRects().length > 0);
}

export function Header(): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuVideoRef = useRef<HTMLVideoElement>(null);
  const hadOpenMenuRef = useRef(false);
  const focusRestoreFrameRef = useRef<number | null>(null);

  const closeMenu = (): void => setOpen(false);

  // The trigger keeps `visibility: hidden` for the opening frames of the menu
  // close transition, and focus() on a hidden element is silently dropped — it
  // reports as focused for a moment and then falls back to <body>. So retry on
  // animation frames until the trigger is genuinely visible. Focusing is also
  // skipped whenever something else has already taken focus, so a restore can
  // never pull focus away from where the visitor moved it.
  const restoreTriggerFocus = (): void => {
    if (focusRestoreFrameRef.current !== null) cancelAnimationFrame(focusRestoreFrameRef.current);
    const startedAt = performance.now();
    const step = (): void => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const active = document.activeElement;
      const focusIsElsewhere = active !== null && active !== document.body && !menuRef.current?.contains(active);
      if (focusIsElsewhere) { focusRestoreFrameRef.current = null; return; }
      if (getComputedStyle(trigger).visibility !== 'hidden') {
        trigger.focus();
        focusRestoreFrameRef.current = null;
        return;
      }
      if (performance.now() - startedAt > 600) { focusRestoreFrameRef.current = null; return; }
      focusRestoreFrameRef.current = requestAnimationFrame(step);
    };
    focusRestoreFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;

    if (!open) {
      menu.setAttribute('inert', '');
      document.body.classList.remove('menu-open');
      setMenuBackgroundInert(false);
      notifyMenuState(false);
      menuVideoRef.current?.pause();
      if (hadOpenMenuRef.current) restoreTriggerFocus();
      return undefined;
    }

    hadOpenMenuRef.current = true;
    menu.removeAttribute('inert');
    document.body.classList.add('menu-open');
    setMenuBackgroundInert(true);
    notifyMenuState(true);

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const network = getNetworkInformation();
    const updateMenuVideo = (): void => {
      const video = menuVideoRef.current;
      if (!video) return;
      if (document.hidden || !shouldAutoplayAmbientMedia()) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };
    updateMenuVideo();
    const onVisibilityChange = (): void => updateMenuVideo();
    motionPreference.addEventListener('change', onVisibilityChange);
    network?.addEventListener('change', onVisibilityChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const focusInitialElement = window.requestAnimationFrame(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      } else {
        getFocusableElements(menu)[0]?.focus();
      }
    });
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(menu);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusInitialElement);
      document.removeEventListener('keydown', onKeyDown);
      motionPreference.removeEventListener('change', onVisibilityChange);
      network?.removeEventListener('change', onVisibilityChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.body.classList.remove('menu-open');
      setMenuBackgroundInert(false);
    };
  }, [open]);

  return (
    <>
      <header>
        <div className={`header-wrap${open ? ' menu_show' : ''}`}>
          <div className="logo-bar">
            <a
              href="/"
              className="logo"
              id="main-logo"
              title="Angel Creations — Homepage from Metaverse"
              aria-label="Angel Creations — go to the homepage and restart from Metaverse"
              onClick={(event) => {
                if (!shouldUseClientNavigation(event)) return;
                event.preventDefault();
                closeMenu();
                navigateHomeFromStart();
              }}
            >
              <img src={logo}
              {...imageSize(logo)} alt="Angel Creations" />
              <span>Digital</span>
            </a>
          </div>
        </div>
        <button
          ref={triggerRef}
          className={`nav-menu${open ? ' close is-menu-open' : ''}`}
          id="nav"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="menuNav"
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          type="button"
          onClick={() => setOpen(true)}
        >
          <span className="line" />
          <span className="line" />
          <span className="text">Menu</span>
        </button>
      </header>
      <div className={`menu-cover${open ? ' active' : ''}`} id="menu-cover" aria-hidden="true" onClick={closeMenu} />
      <div className={`menu__bg${open ? ' active' : ''}`} aria-hidden="true">
        <video ref={menuVideoRef} muted loop playsInline preload="none" poster={menuPoster} tabIndex={-1}>
          <source src={menuVideo} type="video/mp4" />
        </video>
      </div>
      <nav
        id="menuNav"
        ref={menuRef}
        className={`menu ac-menu-screen${open ? ' active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="ac-menu-close-btn"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          <span className="ac-menu-close-btn__label">Close</span>
          <span className="ac-menu-close-btn__icon" aria-hidden="true">
            <span className="ac-menu-close-btn__line" />
            <span className="ac-menu-close-btn__line" />
          </span>
        </button>

        <div className="menu_content ac-menu-stage">
          <div className="ac-menu-grid">
            <div className="ac-menu-col ac-menu-col--nav">
              <p className="ac-menu-eyebrow">Navigation</p>
              <ol className="ac-menu-primary-list">
                {primaryItems.map((item) => (
                  <li className="mobile_link first ac-menu-primary-item" key={item.href}>
                    <Link item={item} close={closeMenu} />
                  </li>
                ))}
              </ol>
            </div>

            <div className="ac-menu-col ac-menu-col--products" aria-label="Products">
              <p className="ac-menu-eyebrow">Products</p>
              <ul className="ac-menu-products-list">
                {productItems.map((product) => (
                  <li key={product.number} className="ac-menu-product-item">
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ac-menu-product-link"
                      onClick={closeMenu}
                    >
                      <div className="ac-menu-product-link__top">
                        <span className="ac-menu-product-link__num">{product.number}</span>
                        <span className="ac-menu-product-link__title">{product.title}</span>
                        <span className="ac-menu-product-link__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                      <p className="ac-menu-product-link__sub">{product.subtitle}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="nav_bottom ac-menu-footer">
          <div className="col">
            <div className="copyright hidescroll">
              <p>© 2026 Angel Creations. All rights reserved.</p>
            </div>
          </div>
          <div className="col">
            <div className="terms-link">
              <ul>
                <li><a href="mailto:business@angelcreations.in">business@angelcreations.in</a></li>
                <li><a href="mailto:support@angelcreations.in">support@angelcreations.in</a></li>
                <li><a href="tel:+918058465733">+91-8058465733</a></li>
              </ul>
            </div>
          </div>
          <div className="col">
            <div className="terms-link">
              <ul>
                <li>
                  <a
                    href="/terms-of-service/"
                    onClick={(event) => {
                      if (!shouldUseClientNavigation(event)) return;
                      event.preventDefault();
                      closeMenu();
                      navigate('/terms-of-service/');
                    }}
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy-policy/"
                    onClick={(event) => {
                      if (!shouldUseClientNavigation(event)) return;
                      event.preventDefault();
                      closeMenu();
                      navigate('/privacy-policy/');
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Secondary position: the primary navigation above stays dominant and
              the five official profiles sit in the bottom studio bar. */}
          <div className="col col--social">
            <ul className="ac-menu-social" aria-label="Angel Creations on social media">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    title={social.label}
                    onClick={closeMenu}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
                      <path d={social.path} fill="currentColor" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
