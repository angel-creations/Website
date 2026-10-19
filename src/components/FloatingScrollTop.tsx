import { useEffect, useState } from 'react';

interface FloatingScrollTopProps {
  pathname: string;
}

export function FloatingScrollTop({ pathname }: FloatingScrollTopProps): JSX.Element | null {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = pathname === '/' || pathname === '';

  useEffect(() => {
    if (isHomePage) return;

    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 140);
    };

    const checkMenuState = (): void => {
      setIsMenuOpen(document.body.classList.contains('menu-open'));
    };

    handleScroll();
    checkMenuState();

    window.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new MutationObserver(checkMenuState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [isHomePage]);

  if (isHomePage || isMenuOpen) {
    return null;
  }

  const handleScrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`ac-floating-top${isScrolled ? ' is-scrolled' : ''}`}
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <svg
        viewBox="0 0 24 24"
        className="ac-floating-top__icon"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
