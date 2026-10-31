import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { navigate } from '../utils/routes';
import { SiteFooter } from './SiteFooter';

export type LegalDocKind = 'privacy' | 'terms';

interface LegalSubClause {
  code: string;
  title: string;
  body: string;
}

interface LegalSection {
  id: string;
  number: string;
  title: string;
  lead: string;
  subClauses?: LegalSubClause[];
  bullets?: Array<{ code: string; text: string }>;
}

interface LegalHighlight {
  code: string;
  title: string;
  description: string;
}

interface LegalDocumentData {
  kind: LegalDocKind;
  route: '/privacy-policy/' | '/terms-of-service/';
  docCode: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  effectiveDate: string;
  jurisdiction: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  acknowledgment: string;
}

const PRIVACY_DOCUMENT: LegalDocumentData = {
  kind: 'privacy',
  route: '/privacy-policy/',
  docCode: 'AC-GOV-01 · Privacy & Data Protection',
  eyebrow: 'Legal & Governance · Document 01 / 02',
  title: 'Privacy Policy',
  subtitle:
    'This Privacy Policy describes how Angel Creations – A Creative Studio (“we,” “our,” or “us”) collects, uses, and safeguards personal information when you visit our website, explore our spatial experiences, or commission our studio services.',
  lastUpdated: 'October 2026 (Rev. 2.4)',
  effectiveDate: '03 July 2023',
  jurisdiction: 'India & United Kingdom',
  highlights: [
    {
      code: '01 · Data Minimization',
      title: 'Purpose-Bound Collection',
      description:
        'We only collect personal details you voluntarily share in project briefs or essential technical telemetry required to stream our 3D, XR, and video experiences.',
    },
    {
      code: '02 · Confidentiality',
      title: 'Zero Data Selling',
      description:
        'Angel Creations never sells, rents, or trades your personal contact information or proprietary project briefs to third-party data brokers or advertisers.',
    },
    {
      code: '03 · Subject Control',
      title: 'Full Access & Erasure Rights',
      description:
        'You retain the right to access, export, update, restrict, or permanently delete your personal information at any time via our dedicated privacy desk.',
    },
  ],
  sections: [
    {
      id: 'information-we-collect',
      number: '01',
      title: 'Information We Collect',
      lead: 'We collect information to deliver responsive creative consultations, optimize high-bandwidth spatial media playback, and maintain platform security.',
      subClauses: [
        {
          code: '1.1',
          title: 'Personal Information',
          body: 'We may collect personal information that you voluntarily provide to us when you interact with our website, submit a project inquiry, register for an account, or use our services. This may include your name, email address, phone number, company or organization name, project brief details, and any other information you choose to provide.',
        },
        {
          code: '1.2',
          title: 'Usage & Telemetry Information',
          body: 'We automatically collect certain technical information about your usage of our website and spatial services. This may include your IP address, device capabilities, browser type, operating system, WebGL/XR compatibility metrics, referring URLs, pages visited, and the dates and times of your interactions.',
        },
        {
          code: '1.3',
          title: 'Cookies & Tracking Technologies',
          body: 'We may use cookies and similar tracking technologies to collect information about your browsing activities. These technologies help us analyze traffic trends, remember interface preferences, and improve our digital platforms. You can choose to disable cookies through your browser settings, although this may affect certain interactive functionalities of our website.',
        },
      ],
    },
    {
      id: 'how-we-use-information',
      number: '02',
      title: 'How We Use Your Information',
      lead: 'Every piece of information collected is used strictly to elevate studio service delivery, communication clarity, and platform performance.',
      subClauses: [
        {
          code: '2.1',
          title: 'Provide & Improve Our Services',
          body: 'We use your personal information to deliver our creative and spatial engineering services, respond to project commissions, process transactions, and fulfill your requests. This includes managing client accounts, communicating with your team, providing technical support, and developing new interactive features.',
        },
        {
          code: '2.2',
          title: 'Studio Communication',
          body: 'We may use your contact information to send you project updates, studio announcements, capability monographs, and relevant service communications. You can opt out of receiving promotional communications at any time by following the unsubscribe instructions or contacting us directly.',
        },
        {
          code: '2.3',
          title: 'Analytics & Experience Research',
          body: 'We analyze aggregated usage patterns to better understand audience preferences, device performance, and interaction flows. This analysis helps us refine our 3D worlds, video streaming quality, and interface ergonomics while keeping your personal information strictly confidential.',
        },
        {
          code: '2.4',
          title: 'Legal Compliance & Protection',
          body: 'We may use your information to comply with applicable laws, regulations, or legal processes, and to protect the intellectual property, rights, property, or safety of Angel Creations, our clients, or the public as required or permitted by law.',
        },
      ],
    },
    {
      id: 'information-sharing',
      number: '03',
      title: 'Information Sharing & Disclosure',
      lead: 'We restrict data access to authorized studio personnel and vetted infrastructure partners bound by strict confidentiality obligations.',
      subClauses: [
        {
          code: '3.1',
          title: 'Trusted Third-Party Service Providers',
          body: 'We may engage vetted third-party service providers to assist us in hosting our digital platforms, delivering streaming media, analyzing performance data, or processing payments. These providers are contractually obligated to maintain the confidentiality and security of your personal information and are prohibited from using it for any other purpose.',
        },
        {
          code: '3.2',
          title: 'Business Transfers',
          body: 'In the event of a corporate restructuring, merger, acquisition, or transfer of studio assets, your personal information may be transferred as part of the transaction. We will notify you of any such change and outline your choices regarding your information.',
        },
        {
          code: '3.3',
          title: 'Legal Requirements',
          body: 'We may disclose your personal information if required to do so by law or in response to valid, legally binding requests by public authorities (such as a court or regulatory agency).',
        },
      ],
    },
    {
      id: 'data-security',
      number: '04',
      title: 'Data Security',
      lead: 'We implement technical, administrative, and physical safeguards designed to protect the confidentiality, integrity, and availability of your personal information against unauthorized access, alteration, or disclosure. While we employ industry-standard encryption and access controls, no method of transmission over the internet or electronic storage is absolute, and we continuously audit our infrastructure to mitigate emerging risks.',
    },
    {
      id: 'childrens-privacy',
      number: '05',
      title: 'Children’s Privacy',
      lead: 'Our website and studio services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children without verifiable parental consent. If you believe we may have inadvertently collected personal information from a child without parental consent, please contact us immediately at support@angelcreations.in and we will promptly purge the information from our records.',
    },
    {
      id: 'international-transfers',
      number: '06',
      title: 'International Data Transfers',
      lead: 'Angel Creations operates with studio hubs in Jaipur, India and Braintree, United Kingdom. If you access our website or services from outside India or the United Kingdom, please be aware that your personal information may be transferred to, stored, and processed in India, the United Kingdom, or other jurisdictions where our cloud infrastructure operates. By using our services, you consent to the transfer and processing of your information in accordance with this Privacy Policy and applicable cross-border data protection safeguards.',
    },
    {
      id: 'your-rights-and-choices',
      number: '07',
      title: 'Your Rights & Choices',
      lead: 'You have the right to access, update, correct, and request the deletion of your personal information. Depending on your jurisdiction, you may also have the right to restrict or object to the processing of your data, withdraw prior consent, and receive a portable copy of your information in a structured, machine-readable format. To exercise any of these rights, please contact our privacy desk at support@angelcreations.in.',
    },
    {
      id: 'policy-changes',
      number: '08',
      title: 'Changes to This Privacy Policy',
      lead: 'We may update this Privacy Policy periodically to reflect evolutions in our spatial platforms, studio practices, or regulatory obligations. We will notify visitors of material updates by posting the revised Privacy Policy on this page and updating the revision date at the top of the document. We encourage you to review this page periodically.',
    },
    {
      id: 'contact-privacy-desk',
      number: '09',
      title: 'Contact Our Privacy Desk',
      lead: 'If you have any questions, concerns, or formal requests regarding this Privacy Policy or our data governance practices, please contact Angel Creations directly at support@angelcreations.in or call +91-8058465733.',
    },
  ],
  acknowledgment:
    'By using our website, spatial platforms, and studio services, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your personal information as described herein.',
};

const TERMS_DOCUMENT: LegalDocumentData = {
  kind: 'terms',
  route: '/terms-of-service/',
  docCode: 'AC-GOV-02 · Terms of Service & Use',
  eyebrow: 'Legal & Governance · Document 02 / 02',
  title: 'Terms of Service',
  subtitle:
    'Welcome to Angel Creations – A Creative Studio. These Terms of Service govern your access to and use of our website, interactive 3D showcases, and digital platforms. By accessing or using our website, you agree to be bound by these terms.',
  lastUpdated: 'October 2026 (Rev. 2.4)',
  effectiveDate: '03 July 2023',
  jurisdiction: 'India & United Kingdom',
  highlights: [
    {
      code: '01 · Creative Ownership',
      title: 'Protected Studio IP',
      description:
        'All films, 3D assets, spatial environments, animations, trademarks, and source code displayed on this site are protected works of Angel Creations and its licensors.',
    },
    {
      code: '02 · Platform Integrity',
      title: 'Acceptable Conduct',
      description:
        'Visitors agree to explore our interactive experiences lawfully and refrain from unauthorized scraping, reverse-engineering, or service disruption.',
    },
    {
      code: '03 · Clear Governance',
      title: 'Transparent Terms',
      description:
        'Defines clear liability boundaries, third-party platform disclaimers, and governing jurisdiction for visitors and prospective studio partners.',
    },
  ],
  sections: [
    {
      id: 'acceptance-of-terms',
      number: '01',
      title: 'Acceptance of Terms',
      lead: 'By accessing or using the Angel Creations website (“the Site”) or any interactive experiences hosted thereon, you agree to comply with and be bound by these Terms of Service, our Privacy Policy, and any additional terms applicable to specific products or commissions. If you do not agree to these terms, you must discontinue use of the Site immediately.',
    },
    {
      id: 'intellectual-property',
      number: '02',
      title: 'Intellectual Property Rights',
      lead: 'All content featured on the Site—including but not limited to motion pictures, 3D models, WebGL/XR environments, character designs, visual effects reels, text, graphics, logos, audio clips, digital downloads, and software architecture—is the exclusive property of Angel Creations or its respective client licensors and is protected by international copyright, trademark, and intellectual property laws. You may not copy, modify, reproduce, republish, distribute, frame, or create derivative works based on any material found on the Site without prior written consent from Angel Creations.',
    },
    {
      id: 'user-accounts',
      number: '03',
      title: 'User Accounts & Client Portals',
      lead: 'To access certain interactive platforms, product environments (such as The Virtual Life or Immersive Wedding Invite), or client review portals, you may be required to register an account or use studio-issued credentials. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information and to notify Angel Creations immediately of any unauthorized use or security breach.',
    },
    {
      id: 'user-conduct',
      number: '04',
      title: 'User Conduct & Prohibited Actions',
      lead: 'When accessing the Site, interactive 3D stages, or any services provided by Angel Creations, you agree to abide by the following rules of conduct:',
      bullets: [
        {
          code: '4.a',
          text: 'Do not violate any applicable local, national, or international laws or regulations.',
        },
        {
          code: '4.b',
          text: 'Do not infringe upon the copyright, trademark, trade secret, or intellectual property rights of Angel Creations, our clients, or any third party.',
        },
        {
          code: '4.c',
          text: 'Do not engage in any activity that may harm, overload, disrupt, or interfere with the Site, our streaming servers, or our spatial computing infrastructure.',
        },
        {
          code: '4.d',
          text: 'Do not attempt to gain unauthorized access to any portion of the Site, client staging environments, source repositories, or connected networks.',
        },
        {
          code: '4.e',
          text: 'Do not use the Site, its media archives, or its inquiry systems for any unlawful, fraudulent, or unauthorized commercial purpose.',
        },
        {
          code: '4.f',
          text: 'Do not transmit malicious code or engage in any conduct that is abusive, harassing, defamatory, or otherwise objectionable.',
        },
      ],
    },
    {
      id: 'third-party-websites',
      number: '05',
      title: 'Third-Party Websites & Services',
      lead: 'The Site may contain links or embedded integrations pointing to third-party websites, platforms, or services (including external video hosts, social networks, or partner platforms) that are not owned or controlled by Angel Creations. We do not endorse or assume any responsibility for the content, availability, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Angel Creations shall not be liable for any damages or losses caused by your use of or reliance on such third-party resources.',
    },
    {
      id: 'limitation-of-liability',
      number: '06',
      title: 'Limitation of Liability',
      lead: 'The Site and its interactive showcases are provided on an “as is” and “as available” basis. To the maximum extent permitted by applicable law, Angel Creations and its directors, officers, employees, artists, engineers, agents, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages—including loss of profits, goodwill, data, or business interruption—arising out of or in connection with your access to or use of the Site or any services provided by Angel Creations, even if advised of the possibility of such damages.',
    },
    {
      id: 'modification-and-termination',
      number: '07',
      title: 'Modification & Termination',
      lead: 'Angel Creations reserves the right to modify, update, suspend, or discontinue the Site, any showcase archive, or any digital service at any time without prior notice. We also reserve the right to revise these Terms of Service from time to time. Continued use of the Site following the posting of revised terms constitutes your acceptance of such changes.',
    },
    {
      id: 'governing-law',
      number: '08',
      title: 'Governing Law & Jurisdiction',
      lead: 'These Terms of Service and any dispute arising out of or related to your use of the Site shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction vested in the courts of Jaipur, Rajasthan, without regard to conflict of law principles.',
    },
    {
      id: 'contact-information',
      number: '09',
      title: 'Contact Information',
      lead: 'If you have any questions, legal notices, or concerns regarding these Terms of Service or the practices of Angel Creations, please contact our legal and support desk at support@angelcreations.in or business@angelcreations.in.',
    },
  ],
  acknowledgment:
    'By accessing or using the Angel Creations website and digital platforms, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.',
};

export function LegalPage({ kind }: { kind: LegalDocKind }): JSX.Element {
  const doc = kind === 'privacy' ? PRIVACY_DOCUMENT : TERMS_DOCUMENT;
  const companionDoc = kind === 'privacy' ? TERMS_DOCUMENT : PRIVACY_DOCUMENT;

  const [activeSectionId, setActiveSectionId] = useState<string>(doc.sections[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveSectionId(doc.sections[0]?.id ?? '');
    setSearchQuery('');
  }, [doc]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return doc.sections;
    return doc.sections.filter((sec) => {
      if (sec.title.toLowerCase().includes(q) || sec.lead.toLowerCase().includes(q)) {
        return true;
      }
      if (
        sec.subClauses?.some(
          (sub) => sub.title.toLowerCase().includes(q) || sub.body.toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      if (sec.bullets?.some((b) => b.text.toLowerCase().includes(q))) {
        return true;
      }
      return false;
    });
  }, [doc.sections, searchQuery]);

  useEffect(() => {
    const elements = filteredSections
      .map((sec) => document.getElementById(sec.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-18% 0px -68% 0px',
        threshold: [0, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredSections]);

  const handleRouteSwitch = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    targetRoute: string
  ): void => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(targetRoute);
  };

  const scrollToSection = (id: string): void => {
    setActiveSectionId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="content" className="site-content ac-legal-v2">
      <div id="primary" className="content-area">
        <main id="main" className="site-main">
          {/* 01. SPATIAL LEGAL HERO STAGE */}
          <section className="ac-legal-v2-hero" aria-labelledby="legal-hero-title">
            <div className="ac-legal-v2-hero__ambient" aria-hidden="true" />
            <div className="ac-legal-v2-container ac-legal-v2-hero__inner">
              {/* Top Bar: Document Code + Switcher Pill */}
              <div className="ac-legal-v2-topbar">
                <span className="ac-legal-v2-doc-pill">
                  <span className="ac-legal-v2-doc-pill__dot" aria-hidden="true" />
                  {doc.docCode}
                </span>

                <nav className="ac-legal-v2-switcher" aria-label="Legal documents">
                  <a
                    href="/privacy-policy/"
                    className={`ac-legal-v2-switcher__tab${kind === 'privacy' ? ' is-active' : ''}`}
                    aria-current={kind === 'privacy' ? 'page' : undefined}
                    onClick={(event) => handleRouteSwitch(event, '/privacy-policy/')}
                  >
                    <span>01</span> Privacy Policy
                  </a>
                  <a
                    href="/terms-of-service/"
                    className={`ac-legal-v2-switcher__tab${kind === 'terms' ? ' is-active' : ''}`}
                    aria-current={kind === 'terms' ? 'page' : undefined}
                    onClick={(event) => handleRouteSwitch(event, '/terms-of-service/')}
                  >
                    <span>02</span> Terms of Service
                  </a>
                </nav>
              </div>

              {/* Hero Title & Subtitle */}
              <div className="ac-legal-v2-hero__main">
                <p className="ac-legal-v2-eyebrow">{doc.eyebrow}</p>
                <h1 id="legal-hero-title" className="ac-legal-v2-hero__title">
                  {doc.title}
                </h1>
                <p className="ac-legal-v2-hero__lead">{doc.subtitle}</p>
              </div>

              {/* Metadata Strip */}
              <dl className="ac-legal-v2-meta" aria-label="Document metadata">
                <div className="ac-legal-v2-meta__item">
                  <dt>Last Updated</dt>
                  <dd>{doc.lastUpdated}</dd>
                </div>
                <div className="ac-legal-v2-meta__item">
                  <dt>Original Effective Date</dt>
                  <dd>{doc.effectiveDate}</dd>
                </div>
                <div className="ac-legal-v2-meta__item">
                  <dt>Studio Jurisdiction</dt>
                  <dd>{doc.jurisdiction}</dd>
                </div>
                <div className="ac-legal-v2-meta__item">
                  <dt>Legal &amp; Privacy Desk</dt>
                  <dd>
                    <a href="mailto:support@angelcreations.in">support@angelcreations.in</a>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 02. EXECUTIVE PLAIN-LANGUAGE HIGHLIGHTS (3-CARD BENTO) */}
          <section className="ac-legal-v2-summary" aria-label="Key governance commitments">
            <div className="ac-legal-v2-container">
              <div className="ac-legal-v2-highlights">
                {doc.highlights.map((item) => (
                  <article className="ac-legal-v2-highlight-card" key={item.code}>
                    <span className="ac-legal-v2-highlight-card__code">{item.code}</span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 03. ARCHITECTURAL TWO-COLUMN READING STAGE */}
          <section className="ac-legal-v2-body" aria-label={`${doc.title} articles`}>
            <div className="ac-legal-v2-container ac-legal-v2-layout">
              {/* Left Sticky Navigation & Filter Rail */}
              <aside className="ac-legal-v2-sidebar" aria-label="Document navigation">
                <div className="ac-legal-v2-sidebar__sticky">
                  <div className="ac-legal-v2-search">
                    <label htmlFor="legal-clause-search" className="ac-legal-v2-sidebar__label">
                      Filter Clauses ({filteredSections.length} / {doc.sections.length})
                    </label>
                    <div className="ac-legal-v2-search__field">
                      <input
                        id="legal-clause-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search keywords (e.g. cookies, IP)..."
                        aria-label="Filter clauses by keyword"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="ac-legal-v2-search__clear"
                          onClick={() => setSearchQuery('')}
                          aria-label="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="ac-legal-v2-toc">
                    <p className="ac-legal-v2-sidebar__label">Table of Contents</p>
                    <ol className="ac-legal-v2-toc__list">
                      {doc.sections.map((sec) => {
                        const isActive = activeSectionId === sec.id;
                        const isVisible = filteredSections.some((item) => item.id === sec.id);
                        return (
                          <li key={sec.id}>
                            <button
                              type="button"
                              disabled={!isVisible}
                              className={`ac-legal-v2-toc__btn${isActive ? ' is-active' : ''}${
                                !isVisible ? ' is-muted' : ''
                              }`}
                              onClick={() => scrollToSection(sec.id)}
                            >
                              <span className="ac-legal-v2-toc__num">{sec.number}</span>
                              <span className="ac-legal-v2-toc__text">{sec.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div className="ac-legal-v2-desk-card">
                    <span className="ac-legal-v2-desk-card__eyebrow">Direct Legal Desk</span>
                    <strong>Need a custom NDA or enterprise MSA?</strong>
                    <p>
                      Our production counsel and client desk provide bespoke confidentiality and licensing agreements for commissioned projects.
                    </p>
                    <div className="ac-legal-v2-desk-card__actions">
                      <a href="mailto:support@angelcreations.in" className="ac-legal-v2-desk-link">
                        support@angelcreations.in ↗
                      </a>
                      <button
                        type="button"
                        className="ac-legal-v2-print-btn"
                        onClick={() => window.print()}
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Articles Stream */}
              <div className="ac-legal-v2-articles">
                {filteredSections.length === 0 ? (
                  <div className="ac-legal-v2-empty">
                    <p>No clauses matched &ldquo;{searchQuery}&rdquo;.</p>
                    <button
                      type="button"
                      className="ac-legal-v2-reset-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  filteredSections.map((section) => (
                    <article
                      key={section.id}
                      id={section.id}
                      className="ac-legal-v2-article"
                      aria-labelledby={`heading-${section.id}`}
                    >
                      <div className="ac-legal-v2-article__head">
                        <span className="ac-legal-v2-article__num">Article {section.number}</span>
                        <h2 id={`heading-${section.id}`} className="ac-legal-v2-article__title">
                          {section.title}
                        </h2>
                      </div>

                      <p className="ac-legal-v2-article__lead">{section.lead}</p>

                      {section.subClauses && section.subClauses.length > 0 && (
                        <div className="ac-legal-v2-subclauses">
                          {section.subClauses.map((sub) => (
                            <div className="ac-legal-v2-subclause" key={sub.code}>
                              <div className="ac-legal-v2-subclause__header">
                                <span className="ac-legal-v2-subclause__code">{sub.code}</span>
                                <h3>{sub.title}</h3>
                              </div>
                              <p>{sub.body}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="ac-legal-v2-bullets">
                          {section.bullets.map((bullet) => (
                            <li key={bullet.code} className="ac-legal-v2-bullet">
                              <span className="ac-legal-v2-bullet__code">{bullet.code}</span>
                              <p>{bullet.text}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))
                )}

                {/* Formal Acknowledgment & Companion Document Card */}
                <div className="ac-legal-v2-ack">
                  <div className="ac-legal-v2-ack__copy">
                    <span className="ac-legal-v2-eyebrow">Formal Acknowledgment</span>
                    <p>{doc.acknowledgment}</p>
                  </div>

                  <div className="ac-legal-v2-ack__footer">
                    <a
                      href={companionDoc.route}
                      className="ac-legal-v2-companion-link"
                      onClick={(event) => handleRouteSwitch(event, companionDoc.route)}
                    >
                      <span>Read Companion Document</span>
                      <strong>
                        {companionDoc.title} <i>→</i>
                      </strong>
                    </a>

                    <a
                      href="/contact/"
                      className="ac-legal-v2-companion-link"
                      onClick={(event) => handleRouteSwitch(event, '/contact/')}
                    >
                      <span>Commission Enquiries</span>
                      <strong>
                        Contact Studio Desk <i>↗</i>
                      </strong>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Kept outside <main> so the contentinfo landmark stays top level. */}
        <SiteFooter />
      </div>
    </div>
  );
}
