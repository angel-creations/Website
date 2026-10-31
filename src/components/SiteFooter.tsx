import type { MouseEvent as ReactMouseEvent } from 'react';
import { socialLinks } from '../data/socialLinks';
import { buildContactHref, trackLeadEvent } from '../utils/leads';
import { navigate, navigateHomeFromStart } from '../utils/routes';
import { imageSize } from '../utils/imageDimensions';

const logo = '/media/logos/logo-rectangle-1.png';
const footerLeadHref = buildContactHref({
  discipline: 'Custom Multi-Discipline Commission',
  intent: 'project-roadmap',
  sourceRoute: 'site-footer',
  topic: 'New immersive project',
  goal: 'Build what doesn’t exist yet',
});

const primaryLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Works', href: '/works/' },
  { label: 'All Domains', href: '/domains/' },
  { label: 'Contact', href: footerLeadHref },
];

const capabilityLinks = [
  { label: 'Metaverse', href: '/metaverse/' },
  { label: 'Mixed Reality', href: '/mixed-reality/' },
  { label: 'Virtual Reality', href: '/virtual-reality/' },
  { label: 'Augmented Reality', href: '/augment-reality/' },
  { label: 'Animation & VFX', href: '/animation/' },
  { label: 'Brand Advertisement', href: '/brand-advertisement/' },
  { label: 'Media Production', href: '/media-production/' },
];

const productLinks = [
  {
    label: 'The Virtual Life',
    meta: 'Virtual Worlds Platform',
    href: 'https://thevirtuallife.in/',
  },
  {
    label: 'Immersive Wedding Invite',
    meta: '3D Spatial Invitations',
    href: 'https://thevirtuallife.in/weddinginvite/',
  },
];

// Official profile URLs, glyphs and ordering live in one place so the footer and
// the contact page can never drift apart.

export function SiteFooter(): JSX.Element {
  const handleInternalNav = (event: ReactMouseEvent<HTMLAnchorElement>, href: string): void => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (href === '/') navigateHomeFromStart();
    else navigate(href);
  };

  return (
    <footer className="ac-footer-v2" role="contentinfo" data-scroll-section>
      <div className="ac-footer-v2__shell">
        {/* 1. Architectural Masthead: Statement CTA + Direct Studio Desks */}
        <div className="ac-footer-v2__masthead">
          <div className="ac-footer-v2__intro">
            <p className="ac-footer-v2__eyebrow">Angel Creations · Spatial &amp; Creative Studio</p>
            <a
              href={footerLeadHref}
              className="ac-footer-v2__headline-link"
              data-lead-event="lead_cta_click"
              data-lead-intent="project-roadmap"
              data-lead-topic="New immersive project"
              onClick={(event) => {
                trackLeadEvent('lead_cta_click', {
                  intent: 'project-roadmap',
                  topic: 'New immersive project',
                  sourceRoute: 'site-footer',
                  cta: 'Footer headline',
                });
                handleInternalNav(event, footerLeadHref);
              }}
            >
              <span className="ac-footer-v2__headline-text">
                Let’s build something extraordinary together.
              </span>
              <span className="ac-footer-v2__headline-orb" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>

          <div className="ac-footer-v2__desks" aria-label="Direct contact channels">
            <div className="ac-footer-v2__desk">
              <span>New Commissions</span>
              <a href="mailto:business@angelcreations.in">business@angelcreations.in</a>
            </div>
            <div className="ac-footer-v2__desk">
              <span>Client Support</span>
              <a href="mailto:support@angelcreations.in">support@angelcreations.in</a>
            </div>
            <div className="ac-footer-v2__desk">
              <span>Direct Mobile</span>
              <a href="tel:+918058465733">+91-8058465733</a>
            </div>
          </div>
        </div>

        {/* 2. Hairline-Divided 4-Column Architectural Index */}
        <div className="ac-footer-v2__columns">
          {/* Column 01: Navigation */}
          <nav className="ac-footer-v2__col" aria-label="Primary navigation">
            <p className="ac-footer-v2__col-title">
              <span>01</span> Navigation
            </p>
            <ul className="ac-footer-v2__links">
              {primaryLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={(event) => handleInternalNav(event, item.href)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 02: Capabilities */}
          <nav className="ac-footer-v2__col" aria-label="Capabilities">
            <p className="ac-footer-v2__col-title">
              <span>02</span> Capabilities
            </p>
            <ul className="ac-footer-v2__links">
              {capabilityLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={(event) => handleInternalNav(event, item.href)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 03: Products */}
          <div className="ac-footer-v2__col" aria-label="Studio products">
            <p className="ac-footer-v2__col-title">
              <span>03</span> Products
            </p>
            <ul className="ac-footer-v2__links ac-footer-v2__links--products">
              {productLinks.map((product) => (
                <li key={product.label}>
                  <a href={product.href} target="_blank" rel="noopener noreferrer">
                    <span className="ac-footer-v2__product-name">
                      {product.label}
                      <i aria-hidden="true">↗</i>
                    </span>
                    <small>{product.meta}</small>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 04: Global Studios */}
          <div className="ac-footer-v2__col" aria-label="Global studios">
            <p className="ac-footer-v2__col-title">
              <span>04</span> Studios
            </p>
            <div className="ac-footer-v2__locations">
              <div className="ac-footer-v2__location">
                <strong>Jaipur, India</strong>
                <span>Creative &amp; Spatial Engineering HQ</span>
              </div>
              <div className="ac-footer-v2__location">
                <strong>Braintree, United Kingdom</strong>
                <span>International Client Desk</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Minimalist Bottom Bar: Brand Mark, Legal & Socials */}
        <div className="ac-footer-v2__bottom">
          <div className="ac-footer-v2__brand-row">
            <a
              href="/"
              className="ac-footer-v2__logo"
              onClick={(event) => handleInternalNav(event, '/')}
              aria-label="Angel Creations — go to the homepage and restart from Metaverse"
            >
              <img src={logo}
              {...imageSize(logo)} alt="Angel Creations" />
            </a>
            <span className="ac-footer-v2__divider" aria-hidden="true" />
            <p className="ac-footer-v2__copy">
              © {new Date().getFullYear()} Angel Creations. All rights reserved.
            </p>
          </div>

          <div className="ac-footer-v2__meta-row">
            <ul className="ac-footer-v2__inline-list" aria-label="Legal">
              <li>
                <a
                  href="/privacy-policy/"
                  onClick={(event) => handleInternalNav(event, '/privacy-policy/')}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-service/"
                  onClick={(event) => handleInternalNav(event, '/terms-of-service/')}
                >
                  Terms of Service
                </a>
              </li>
            </ul>

            <span className="ac-footer-v2__divider" aria-hidden="true" />

            <ul className="ac-footer-v2__inline-list ac-footer-v2__social" aria-label="Angel Creations on social media">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    title={social.label}
                  >
                    <span className="ac-footer-v2__social-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
                        <path d={social.path} fill="currentColor" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
