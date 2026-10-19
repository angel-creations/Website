import { useEffect, useRef, useState } from 'react';
import type { NavigationItem } from '../types/legacy';
import { navigate } from '../utils/routes';

const archive = '/legacy-assets';
const logo = `${archive}/logos/wp-content/uploads/2023/01/logo-rectangle-1.png`;
const menuVideo = `${archive}/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4`;
const menuPoster = `${archive}/images/generated-home-posters/menu-background.jpg`;

const primaryItems: NavigationItem[] = [
  { label: 'About Us', href: '/about/', number: '01' },
  { label: 'Works', href: '/works/', number: '02' },
  { label: 'Contact', href: '/contact/', number: '03' },
];

function Link({ item, close }: { item: NavigationItem; close?: () => void }): JSX.Element {
  return (
    <a
      href={item.href}
      className="inner_link"
      onClick={(event) => {
        event.preventDefault();
        close?.();
        navigate(item.href);
      }}
    >
      {item.label} {item.number ? <span className="right_postion">{item.number}</span> : null}
    </a>
  );
}

function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((item) => !item.hasAttribute('inert') && item.getClientRects().length > 0);
}

export function Header(): JSX.Element {
  const [open, setOpen] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuVideoRef = useRef<HTMLVideoElement>(null);
  const hadOpenMenuRef = useRef(false);

  const closeMenu = (): void => setOpen(false);

  useEffect(() => {
    // The original cursor treatment is decorative. Keep it on a fine-pointer desktop only.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!finePointer.matches) return undefined;
    const moveCursor = (event: MouseEvent): void => {
      if (!cursor.current) return;
      cursor.current.style.left = `${event.pageX - 22}px`;
      cursor.current.style.top = `${event.pageY - 22}px`;
    };
    document.addEventListener('mousemove', moveCursor, { passive: true });
    return () => document.removeEventListener('mousemove', moveCursor);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return undefined;

    if (!open) {
      menu.setAttribute('inert', '');
      document.body.classList.remove('menu-open');
      menuVideoRef.current?.pause();
      if (hadOpenMenuRef.current) triggerRef.current?.focus();
      return undefined;
    }

    hadOpenMenuRef.current = true;
    menu.removeAttribute('inert');
    document.body.classList.add('menu-open');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) void menuVideoRef.current?.play().catch(() => undefined);

    const focusFirstMenuLink = window.requestAnimationFrame(() => getFocusableElements(menu)[0]?.focus());
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
      window.cancelAnimationFrame(focusFirstMenuLink);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('menu-open');
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
              title="Angel — Digital Agency"
              onClick={(event) => {
                event.preventDefault();
                closeMenu();
                navigate('/');
              }}
            >
              <img src={logo} alt="Angel Creations" />
              <span>Digital</span>
            </a>
            <div className="link_flex">
              <ul>
                <li><a href="/metaverse/" onClick={(event) => { event.preventDefault(); closeMenu(); navigate('/metaverse/'); }}>metaverse</a></li>
                <li><a href="/360-video/" onClick={(event) => { event.preventDefault(); closeMenu(); navigate('/360-video/'); }}>360 video</a></li>
              </ul>
            </div>
          </div>
        </div>
        <button
          ref={triggerRef}
          className={`nav-menu${open ? ' close' : ''}`}
          id="nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="menuNav"
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="line" />
          <span className="line" />
          <span className="text">Menu</span>
        </button>
      </header>
      <div className={`menu-cover${open ? ' active' : ''}`} id="menu-cover" aria-hidden="true" onClick={closeMenu} />
      <div className={`menu__bg${open ? ' active' : ''}`} aria-hidden="true">
        <video ref={menuVideoRef} muted loop playsInline preload="metadata" poster={menuPoster} tabIndex={-1}>
          <source src={menuVideo} type="video/mp4" />
        </video>
      </div>
      <nav
        id="menuNav"
        ref={menuRef}
        className={`menu${open ? ' active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
      >
        <div className="menu_content menu__hover">
          <ol>
            {primaryItems.map((item) => (
              <li style={{ width: '40vw' }} className="mobile_link first" key={item.href}>
                <Link item={item} close={closeMenu} />
              </li>
            ))}
          </ol>
          <div className="cursor-link" ref={cursor} aria-hidden="true" />
        </div>
        <div className="nav_bottom">
          <div className="col"><div className="copyright hidescroll"><p>© 2023 Angelcreations. All rights reserved.</p></div></div>
          <div className="col"><div className="terms-link"><ul><li><a href="mailto:business@angelcreations.in">business@angelcreations.in</a></li><li><a href="mailto:support@angelcreations.in">support@angelcreations.in</a></li></ul></div></div>
          <div className="col"><div className="copyright hidescroll" /></div>
          <div className="col"><div className="terms-link"><ul><li><a href="/terms-of-service" onClick={(event) => { event.preventDefault(); closeMenu(); navigate('/terms-of-service'); }}>Terms of Service</a></li><li><a href="/privacy-policy" onClick={(event) => { event.preventDefault(); closeMenu(); navigate('/privacy-policy'); }}>Privacy Policy</a></li></ul></div></div>
        </div>
      </nav>
    </>
  );
}
