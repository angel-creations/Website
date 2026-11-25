/**
 * Internship Programme content model.
 *
 * Single authored source for the /internship/ landing page: the programme
 * narrative, the eleven internship disciplines, the three-month journey,
 * programme details, FAQs and the application-form option list.
 *
 * Editorial rules encoded here (they mirror the approved programme terms and
 * must not be softened without the studio's written approval):
 *   - The ₹999 fee is for the structured learning programme only.
 *   - No stipend is offered.
 *   - Certification is conditional on successful completion; never guaranteed.
 *   - No placement, employment, client access or accreditation is promised.
 */

export const INTERNSHIP_ROUTE = '/internship/';

export const PROGRAMME_FACTS = {
  duration: '3 Months',
  fee: '₹999',
  feeNote: 'one-time programme fee',
  stipend: 'No stipend',
  mode: 'Remote / Online',
  certificate: 'Performance-based certificate',
  domains: '11 disciplines · 66 roles',
} as const;

export type InternshipDomainGroup = {
  id: string;
  code: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  imageAlt: string;
  /**
   * How the discipline image fills its frame. `contain` is for artwork that
   * already has its own white margin (UI mockups, product shots) so the card
   * crops air instead of cropping the subject.
   */
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  roles: string[];
};

/**
 * Disciplines exactly as approved — the single source of truth for the
 * discipline grid, the application form's selector and any role lookup. The
 * entry count, ordering and role lists all render from this list.
 */
export const INTERNSHIP_DOMAINS: InternshipDomainGroup[] = [
  {
    id: 'graphic-design-branding',
    code: '01',
    title: 'Graphic Design & Branding',
    eyebrow: 'Identity & visual craft',
    summary:
      'Turn an idea into a system of visuals people can read, feel and remember.',
    image: '/media/library/internship/internship-identity.webp',
    imageAlt: 'Brand identity reference material arranged on a studio table',
    roles: [
      'Graphic Design',
      'Brand Identity & Visual Communication',
      'Social Media Design',
      'Presentation Design',
      'Marketing & Campaign Design',
    ],
  },
  {
    id: 'ui-ux-product',
    code: '02',
    title: 'UI/UX & Product Design',
    eyebrow: 'Interfaces & experience',
    summary:
      'Design interfaces and flows where structure, clarity and usability decide the outcome.',
    image: '/media/library/metaverse/app-09-virtual-product-showcases.webp',
    imageAlt: 'Product interface on a tablet showing a configurable object beside its settings panel',
    imageFit: 'contain',
    roles: [
      'UI/UX Design',
      'Product Design',
      'Interaction Design',
      'Design Systems',
      'Prototyping & User Testing',
      'Experience Design',
    ],
  },
  {
    id: 'animation-motion-vfx',
    code: '03',
    title: 'Animation, Motion Graphics & VFX',
    eyebrow: 'Motion & film craft',
    summary:
      'Learn how frames, rhythm and story become finished animation, film and video.',
    image: '/media/library/animation/app-04-3d-animation.jpg',
    imageAlt: 'Animator refining a 3D scene at a studio modelling workstation',
    roles: [
      '2D Animation',
      '3D Animation',
      'Motion Graphics',
      'Character Animation',
      'Video Editing',
      'Storyboarding',
      'Visual Effects (VFX)',
    ],
  },
  {
    id: '3d-visualisation',
    code: '04',
    title: '3D Visualisation',
    eyebrow: 'Spatial rendering',
    summary:
      'Build environments and product visuals that read as convincingly real.',
    image: '/media/library/animation/app-08-interactive-animation.jpg',
    imageAlt: 'Rendered three-dimensional forms from a studio motion project',
    roles: [
      '3D Modelling',
      '3D Environments',
      'Architectural Visualisation',
      'Product Visualisation',
      'Lighting & Rendering',
      'Texture & Look Development',
    ],
  },
  {
    id: 'ar-vr-xr',
    code: '05',
    title: 'AR, VR & XR',
    eyebrow: 'Immersive technology',
    summary:
      'Work with the studio craft behind augmented, virtual and mixed reality.',
    image: '/media/library/mixed-reality/app-01-training.jpg',
    imageAlt: 'Two colleagues exploring a spatial model together using mixed-reality headsets',
    imageFit: 'cover',
    imagePosition: 'center 38%',
    roles: [
      'Augmented Reality (AR)',
      'Virtual Reality (VR)',
      'Mixed Reality (MR)',
      'Interactive Experiences',
      'Metaverse & Virtual Worlds',
      'Immersive Experience Design',
    ],
  },
  {
    id: 'web-development',
    code: '06',
    title: 'Web Development',
    eyebrow: 'Code & build',
    summary:
      'Build the front-end and application layer that makes creative work run.',
    image: '/media/library/animation/app-05-motion-graphics.jpg',
    imageAlt: 'Developer building a creative project at a studio workstation',
    roles: [
      'Website Development',
      'Frontend Development',
      'Full-Stack Development',
      'HTML, CSS & JavaScript',
      'Application Development',
      'Backend Development',
    ],
  },
  {
    id: 'digital-marketing',
    code: '07',
    title: 'Digital Marketing',
    eyebrow: 'Reach & growth',
    summary:
      'Learn how campaigns are planned, published, measured and improved.',
    image: '/media/library/brand-advertisement/map-06-audience.jpg',
    imageAlt: 'Campaign planning notes and a laptop showing digital strategy work',
    roles: [
      'Social Media Marketing',
      'Digital Campaigns',
      'SEO',
      'Content Marketing',
      'Performance Marketing',
      'Digital Strategy',
      'Marketing Research',
    ],
  },
  {
    id: 'sales-business-development',
    code: '08',
    title: 'Sales & Business Development',
    eyebrow: 'Business growth',
    summary:
      'See how a creative business finds clients, builds pipeline and wins work.',
    image: '/media/library/brand-advertisement/map-02-message.jpg',
    imageAlt: 'Studio team in a working session around a presentation',
    roles: [
      'Business Development',
      'Sales & Client Acquisition',
      'Lead Generation',
      'Market Research',
      'Business Strategy',
      'Partnership Development',
      'Proposal Development',
    ],
  },
  {
    id: 'hr-operations',
    code: '09',
    title: 'HR & Operations',
    eyebrow: 'People & process',
    summary:
      'Experience how a studio hires, coordinates and keeps its teams running.',
    image: '/media/library/animation/story-01-visual-storytelling.jpg',
    imageAlt: 'Creative team collaborating around a table of design and colour materials',
    roles: [
      'Human Resource Management',
      'Talent Acquisition',
      'Recruitment Coordination',
      'HR Operations',
      'Employee Engagement',
      'Business Operations',
    ],
  },
  {
    id: 'content-copywriting',
    code: '10',
    title: 'Content & Copywriting',
    eyebrow: 'Words & narrative',
    summary:
      'Write the words that carry a brand, a story and a campaign.',
    image: '/media/library/media-production/app-09-scriptwriting-storyboarding.jpg',
    imageAlt: 'Typewriter and marked-up script pages on a writer’s desk',
    roles: [
      'Creative Copywriting',
      'Website Content Writing',
      'Advertising Copy',
      'Scriptwriting',
      'Social Media Content',
      'Brand Communication',
    ],
  },
  {
    id: 'pre-sales-client-relations',
    code: '11',
    title: 'Pre-Sales & Client Relations',
    eyebrow: 'Client contact',
    summary:
      'Understand requirement gathering, solution presentation and project coordination.',
    image: '/media/library/media-production/app-01-video-production.jpg',
    imageAlt: 'Producer reviewing annotated creative direction documents with a colleague',
    roles: [
      'Pre-Sales Support',
      'Client Communication',
      'Client Relationship Management',
      'Requirement Analysis',
      'Solution Presentation',
      'Proposal & Pitch Preparation',
      'Project Coordination',
    ],
  },
];

export type JourneyStage = {
  code: string;
  month: string;
  title: string;
  summary: string;
  points: string[];
};

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    code: '01',
    month: 'MONTH 01',
    title: 'Discover & Learn',
    summary:
      'Orientation, fundamentals, tools and guided assignments. You learn how the studio works before you are asked to contribute.',
    points: [
      'Company orientation',
      'Discipline introduction',
      'Tools and workflow familiarisation',
      'Guided practical assignments',
      'Professional expectations',
    ],
  },
  {
    code: '02',
    month: 'MONTH 02',
    title: 'Apply & Collaborate',
    summary:
      'Supervised project activities, teamwork and practical workflows. Assignments move closer to real studio work, with review built in.',
    points: [
      'Supervised project activities',
      'Teamwork and collaboration',
      'Practical workflows',
      'Reviews and feedback',
      'Industry working standards',
    ],
  },
  {
    code: '03',
    month: 'MONTH 03',
    title: 'Deliver & Grow',
    summary:
      'Assigned deliverables, feedback, performance assessment and completion review against the programme requirements.',
    points: [
      'Assigned deliverables',
      'Structured feedback',
      'Performance assessment',
      'Completion review',
      'Certificate eligibility where criteria are met',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Redesigned page content                                                     */
/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: 'Angel Creations / Industry Learning Programme',
  headline: 'Your career doesn’t begin after graduation.',
  headlineEmphasis: 'It begins with experience.',
  support:
    'Step beyond classroom learning. Explore your potential through practical projects, professional mentorship and real-world industry exposure at Angel Creations.',
  primaryCta: 'Apply for Internship',
  secondaryCta: 'Explore the Programme',
  facts: [
    { label: 'Duration', value: '3-Month Programme' },
    { label: 'Disciplines', value: 'Multiple Career Disciplines' },
    { label: 'Focus', value: 'Practical Industry Exposure' },
  ],
  image: '/media/library/internship/internship-hero.webp',
  imageAlt: 'Creative team reviewing a spatial design together using mixed-reality headsets',
  imageWidth: 1800,
  imageHeight: 1012,
  insetImage: '/media/library/media-production/app-10-media-consulting.jpg',
  insetAlt: 'Editor monitoring a multi-screen post-production suite',
  insetWidth: 500,
  insetHeight: 333,
} as const;

/** Editorial "who is this for" line under the hero. */
export const AUDIENCE_NOTE =
  'Open to college students, fresh graduates and aspiring professionals ready to work to professional standards.';

export type ApproachPoint = {
  code: string;
  title: string;
  description: string;
};

export const PROGRAMME_APPROACH: ApproachPoint[] = [
  {
    code: '01',
    title: 'Supervised practical assignments',
    description:
      'Every task is set against professional criteria and reviewed by someone who does the work.',
  },
  {
    code: '02',
    title: 'Professional workflows',
    description:
      'Briefs, versions, handoffs and delivery — the unglamorous parts that decide whether work ships.',
  },
  {
    code: '03',
    title: 'Team collaboration',
    description:
      'Contribute inside a working team, where communication matters as much as craft.',
  },
  {
    code: '04',
    title: 'Constructive feedback',
    description:
      'Structured critique at each stage, so improvement is deliberate rather than accidental.',
  },
];

export type LearningExperience = {
  code: string;
  title: string;
  body: string;
  points: string[];
  image: string;
  imageAlt: string;
  width: number;
  height: number;
};

export const LEARNING_EXPERIENCE: LearningExperience[] = [
  {
    code: '01',
    title: 'Learning by doing, not by listening.',
    body:
      'Studio practice is not a lecture. You are given practical assignments with real constraints, then asked to explain your decisions — the same way work is discussed inside a studio.',
    points: ['Practical assignments', 'Guided tool practice', 'Work reviewed against professional standards'],
    image: '/media/library/internship/internship-set.webp',
    imageAlt: 'Production crew arranging lighting and camera equipment on a studio set',
    width: 1400,
    height: 933,
  },
  {
    code: '02',
    title: 'Mentorship that happens in the work.',
    body:
      'Guidance arrives while a task is in progress: how to read a brief, where a design is unresolved, what a producer expects before sign-off. Feedback is specific and tied to what you produced.',
    points: ['Working professionals as guides', 'Reviews at each stage', 'Feedback you can act on immediately'],
    image: '/media/library/internship/internship-collaboration.webp',
    imageAlt: 'Team member reviewing a spatial layout during a collaborative working session',
    width: 1400,
    height: 788,
  },
  {
    code: '03',
    title: 'Exposure to how a studio actually runs.',
    body:
      'Beyond your own discipline, you see how projects are scoped, resourced, reviewed and delivered — the commercial and operational context creative work sits inside.',
    points: ['Cross-discipline collaboration', 'Project planning and review', 'Professional communication habits'],
    image: '/media/library/internship/internship-studio-stage.webp',
    imageAlt: 'Large film production stage with crew, lighting rigs and camera equipment',
    width: 1400,
    height: 933,
  },
];

/** Programme-at-a-glance rows for the details panel. */
export const PROGRAMME_DETAILS = [
  { label: 'Duration', value: '3 Months' },
  { label: 'Programme fee', value: '₹999', note: 'one-time, after acceptance' },
  { label: 'Stipend', value: 'Not provided' },
  { label: 'Internship domains', value: 'Multiple disciplines' },
  { label: 'Mode', value: 'Remote / Online', note: 'with project collaboration where applicable' },
  { label: 'Certificate', value: 'Subject to successful completion' },
  { label: 'Placement', value: 'Not guaranteed' },
] as const;

export const FEE_INCLUDES: string[] = [
  'Structured programme and supervised learning activities',
  'Practical assignments',
  'Domain-specific exposure',
  'Performance evaluation',
  'Certificate eligibility based on successful completion',
];

export type Faq = {
  question: string;
  answer: string;
};

export const INTERNSHIP_FAQS: Faq[] = [
  {
    question: 'What is the duration of the programme?',
    answer:
      'The programme runs for three months from the agreed start date, structured in three stages: discover and learn, apply and collaborate, and deliver and grow.',
  },
  {
    question: 'What is the programme fee?',
    answer:
      'The programme fee is ₹999, paid once. It covers the structured learning programme, supervised activities, practical assignments, domain exposure and performance evaluation. Payment is requested only after an application is accepted.',
  },
  {
    question: 'Is there any stipend?',
    answer:
      'No. This is a learning programme, not paid employment, and no stipend is offered at any stage.',
  },
  {
    question: 'Will I work on real projects?',
    answer:
      'Participants are given practical assignments and may be involved in supervised project work. Access to live client projects depends on your domain, demonstrated capability, project availability, supervision and confidentiality requirements. Work directly with clients or on confidential material is not guaranteed.',
  },
  {
    question: 'Can I choose my preferred domain?',
    answer:
      'Yes. You choose a preferred discipline while applying, and confirm your specific role during the review conversation. Final placement depends on your application and your suitability for that discipline.',
  },
  {
    question: 'Do I need prior experience?',
    answer:
      'Prior experience is not mandatory for every domain. Selection depends on the requirements of the domain you choose, so some roles expect more existing skill than others.',
  },
  {
    question: 'Is the programme available online?',
    answer:
      'Yes. The programme is delivered online and remotely, with opportunities for project collaboration where an arrangement applies.',
  },
  {
    question: 'Will I receive an internship certificate?',
    answer:
      'A completion certificate may be issued after three months, subject to successful performance evaluation and fulfilment of the programme requirements, including attendance, assignments and conduct.',
  },
  {
    question: 'Is the certificate guaranteed?',
    answer:
      'No. Certification is not automatic on payment or enrolment. A certificate is issued only after the programme requirements have been met and performance has been successfully evaluated.',
  },
  {
    question: 'What happens if I do not meet the performance criteria?',
    answer:
      'You will be informed where the requirements were not met. Completion and certification are recorded only for participants who satisfy the attendance, assignment, conduct and performance requirements of the programme.',
  },
  {
    question: 'Can I apply while studying in college?',
    answer:
      'Yes. Undergraduate and postgraduate students are welcome to apply, provided they can meet the time commitment the programme requires.',
  },
  {
    question: 'Will I get a job opportunity after completion?',
    answer:
      'No placement or employment is promised. The programme is designed to build practical experience and professional readiness; any future opportunity would depend on the studio’s needs and your performance, and is never guaranteed.',
  },
];

/* -------------------------------------------------------------------------- */
/* Certificate of completion                                                   */
/* -------------------------------------------------------------------------- */

/** The studio's issued certificate, shown unaltered as a programme preview. */
export const CERTIFICATE_PREVIEW = {
  image: '/media/library/internship/angel-creations-internship-certificate.webp',
  width: 1536,
  height: 1024,
  alt: 'Angel Creations certificate of completion for a three-month internship programme, showing the studio mark, participant name, duration and Training Head signature.',
  eyebrow: 'Recognition & achievement',
  heading: 'Your journey. Your achievement.',
  description:
    'At Angel Creations, we believe meaningful learning deserves meaningful recognition.',
  body:
    'Participants who successfully complete the three-month internship programme, fulfil their assigned responsibilities and meet the required performance standards will receive an official Certificate of Internship from Angel Creations.',
  disclaimer:
    'Certificate shown for illustrative purposes only. Actual certificates will include the participant’s verified details and will be issued only upon successful completion of the internship programme and required performance evaluation.',
  lightboxLabel: 'Certificate of completion, enlarged preview',
} as const;

/**
 * A single acknowledgement, not five. The route is a shortlisting step, so the
 * form must stay under a minute to complete; the substantive programme facts
 * (duration, ₹999 fee, no stipend, performance-based certification) stay on the
 * page as disclosures and are restated in the studio's reply before enrolment.
 * The label keeps the fee and consent framing on screen so the applicant still
 * affirms them explicitly.
 */
export const DECLARATIONS: Array<{ id: string; label: string }> = [
  {
    id: 'terms',
    label: 'I confirm these details are accurate and agree to be contacted about my application, in line with the',
  },
];

