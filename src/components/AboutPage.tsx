import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { getNetworkInformation, prefersReducedData, prefersReducedMotion } from '../utils/mediaPreferences';
import { LegacyFooter } from './LegacyFooter';

const showreelVideo = '/legacy-assets/videos/wp-content/uploads/2023/08/Main-Background-with-sound.mp4';
const showreelPoster = '/legacy-assets/images/generated-home-posters/menu-background.jpg';

type DisciplineRecord = {
  number: string;
  slug: string;
  title: string;
  route: string;
  tagline: string;
  summary: string;
  image: string;
  capabilities: string[];
  deliverables: string;
};

const disciplines: DisciplineRecord[] = [
  {
    number: '01',
    slug: 'metaverse',
    title: 'Metaverse',
    route: '/metaverse/',
    tagline: 'Persistent virtual worlds, digital twins & spatial ecosystems.',
    summary:
      'We architect interactive virtual worlds where communities gather, brands launch flagship destinations, and commerce unfolds in real-time 3D space.',
    image: '/inner-library/metaverse/hero-metaverse.webp',
    deliverables: 'Multi-user 3D worlds · Avatar systems · Spatial commerce',
    capabilities: [
      'Virtual Worlds',
      'Marketing & Branding',
      'Gaming',
      'Entertainment',
      'Virtual Marketplaces',
      'Virtual Economy',
      'Virtual Education',
      'Virtual Workspaces',
      'Virtual Events Platforms',
      'Virtual Product Showcase',
    ],
  },
  {
    number: '02',
    slug: 'mixed-reality',
    title: 'Mixed Reality',
    route: '/mixed-reality/',
    tagline: 'Physical and digital worlds fused with spatial precision.',
    summary:
      'We design spatial computing applications where digital objects anchor naturally to physical rooms, enabling hands-on training, architectural walk-throughs, and collaborative design.',
    image: '/inner-library/mixed-reality/hero-mixed-reality.png',
    deliverables: 'Spatial computing apps · Digital twins · Remote collaboration',
    capabilities: [
      'MR Content Creation',
      'MR Training & Education',
      'MR Entertainment',
      'MR Gaming',
      'MR Marketing & Branding',
      'MR Architecture & Design',
      'MR Remote Collaboration',
      'MR Spatial Prototyping',
      'MR Retail',
      'MR Media',
    ],
  },
  {
    number: '03',
    slug: 'virtual-reality',
    title: 'Virtual Reality',
    route: '/virtual-reality/',
    tagline: 'Total sensory immersion for simulation, learning & storytelling.',
    summary:
      'From high-stakes industrial training and medical simulations to architectural visualization and interactive entertainment, our VR systems put users inside the experience.',
    image: '/inner-library/virtual-reality/hero-virtual-reality.webp',
    deliverables: '6DoF headset experiences · Training sims · 360° VR cinema',
    capabilities: [
      'VR Video Conferencing',
      'VR Content Development',
      'VR Gaming',
      'VR Training & Simulation',
      'VR Education',
      'VR for Marketing & Branding',
      'VR Architectural Visualization',
      'VR Healthcare Applications',
      'VR Streaming & Broadcasting',
      'VR Equipment Rental & Sales',
    ],
  },
  {
    number: '04',
    slug: 'augment-reality',
    title: 'Augmented Reality',
    route: '/augment-reality/',
    tagline: 'Interactive camera-first layers that bring products and spaces alive.',
    summary:
      'We build WebAR, mobile AR, and on-site spatial activations that let audiences try products at scale, navigate complex venues, and interact with stories in their own environment.',
    image: '/inner-library/augment-reality/hero-augment-reality.webp',
    deliverables: 'WebAR & mobile AR · Retail try-ons · Spatial wayfinding',
    capabilities: [
      'AR Industrial Applications',
      'AR Tourism & Travel',
      'AR Navigation',
      'AR Retail',
      'AR Marketing',
      'AR Gaming',
      'AR Education',
      'AR Healthcare',
      'AR Entertainment',
      'AR Art & Creativity',
    ],
  },
  {
    number: '05',
    slug: 'animation',
    title: 'Animation & VFX',
    route: '/animation/',
    tagline: 'Frame-by-frame craft across 2D, 3D, motion design & visual effects.',
    summary:
      'Our directors, character animators, and VFX artists turn complex ideas into kinetic visual narratives—from stylized explainers and broadcast packages to photorealistic 3D worlds.',
    image: '/inner-library/animation/hero-animation.jpg',
    deliverables: '3D & 2D animation · Character rigging · Motion graphics & VFX',
    capabilities: [
      'Concept Development',
      'Pre-visualization',
      '2D Animation',
      '3D Animation',
      'Motion Graphics',
      'Visual Effects (VFX)',
      'Character Animation',
      'Interactive Animations',
      'Animated Explainer Videos',
      'AR Animation',
    ],
  },
  {
    number: '06',
    slug: 'brand-advertisement',
    title: 'Brand Advertisement',
    route: '/brand-advertisement/',
    tagline: 'Campaigns engineered to capture attention and build lasting cultural equity.',
    summary:
      'We combine strategic brand positioning with high-impact visual storytelling, interactive launches, and multi-channel campaign assets that turn audiences into advocates.',
    image: '/inner-library/brand-advertisement/hero-brand-advertisement.jpg',
    deliverables: 'Campaign films · Interactive launches · Brand identity systems',
    capabilities: [
      'Campaign Strategy & Direction',
      'Commercial Spot Production',
      'Experiential Brand Launches',
      'Interactive Product Showcases',
      'Social & Digital Video Assets',
      '3D Anamorphic Billboards',
      'Luxury & Retail Storytelling',
      'Motion Identity Systems',
      'Immersive Event Installations',
      'Cross-Platform Brand Worlds',
    ],
  },
  {
    number: '07',
    slug: 'media-production',
    title: 'Media Production',
    route: '/media-production/',
    tagline: 'End-to-end cinema, broadcast, live event & post-production craft.',
    summary:
      'From scriptwriting and principal photography to spatial audio, color grading, and final master delivery, our production unit handles commissions of any scale.',
    image: '/inner-library/media-production/hero-media-production.jpg',
    deliverables: 'Commercial cinema · Documentary & broadcast · Full post-production',
    capabilities: [
      'Video Production',
      'Film Production',
      'Television Production',
      'Animation Production',
      'Photography Services',
      'Live Event Production',
      'Audio Production',
      'Post-Production Services',
      'Scriptwriting and Storyboarding',
      'Media Consulting',
    ],
  },
];

type StudioProduct = {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  href: string;
  image: string;
};

const studioProducts: StudioProduct[] = [
  {
    number: '01',
    badge: 'Flagship Platform',
    title: 'The Virtual Life',
    subtitle: 'Immersive Virtual Worlds & Interactive Digital Ecosystems',
    description:
      'Our dedicated spatial platform designed to bring brands, communities, and cultural experiences into persistent, accessible 3D environments across web, mobile, and VR headsets.',
    highlights: ['Persistent 3D Spaces', 'Cross-Device Spatial Access', 'Interactive Brand Pavilions'],
    href: 'https://thevirtuallife.in/',
    image: '/inner-library/metaverse/story-01-spatial-presence.jpg',
  },
  {
    number: '02',
    badge: 'Bespoke Experience Product',
    title: 'Immersive Wedding Invite',
    subtitle: '3D Spatial & Interactive Destination Wedding Invitations',
    description:
      'A new standard in personal celebration—transforming traditional invitations into cinematic, interactive 3D worlds that guests can explore from anywhere in the world.',
    highlights: ['Custom 3D Venue Worlds', 'Interactive Story & RSVP Flow', 'Instant Mobile & Web Playback'],
    href: 'https://thevirtuallife.in/weddinginvite/',
    image: '/inner-library/virtual-reality/story-03-spatial-storytelling.jpg',
  },
];

const pipelinePhases = [
  {
    step: '01',
    phase: 'Discovery & Spatial Architecture',
    title: 'Defining the lens',
    description:
      'Every commission begins by interrogating the core objective—whether the story belongs in a real-time 3D world, a 6DoF headset simulation, or a theatrical brand film.',
  },
  {
    step: '02',
    phase: 'Worldbuilding & Look-Development',
    title: 'Designing the atmosphere',
    description:
      'Our art directors, concept artists, and storyboard teams establish optical lighting, spatial ergonomics, character silhouettes, and narrative pacing before production begins.',
  },
  {
    step: '03',
    phase: 'Real-Time Engineering & Principal Craft',
    title: 'Building with precision',
    description:
      'Bespoke teams of Unity/Unreal engineers, 3D animators, directors, and sound designers assemble around the brief to execute with zero compromise on frame rate or fidelity.',
  },
  {
    step: '04',
    phase: 'Deployment & Enduring Impact',
    title: 'Shipping across every surface',
    description:
      'From VisionOS, Meta Quest, and WebGL browsers to broadcast television and global exhibition screens, we optimize and master every deliverable for its target medium.',
  },
];

type PartnerLogoId =
  | 'sony-bbc-earth'
  | 'nickelodeon'
  | 'tanishq'
  | 'grand-hyatt'
  | 'nbc'
  | 'illuminarium'
  | 'jk-lakshmi'
  | 'iguatemi-365'
  | 'jk-aya'
  | 'grupo-leceres'
  | 'sdmh'
  | 'roots-to-go'
  | 'metafoods'
  | 'fiduc'
  | 'iihmr'
  | 'flora'
  | 'solitec'
  | 'area-g'
  | 'hottank'
  | 'inovnation';

const clients: Array<{ id: PartnerLogoId; name: string; sector: string }> = [
  { id: 'sony-bbc-earth', name: 'Sony BBC Earth', sector: 'Broadcast & Media' },
  { id: 'nickelodeon', name: 'Nickelodeon', sector: 'Entertainment & Animation' },
  { id: 'tanishq', name: 'Tanishq Jewellers', sector: 'Luxury & Retail' },
  { id: 'grand-hyatt', name: 'Grand Hyatt', sector: 'Luxury Hospitality' },
  { id: 'nbc', name: 'NBC', sector: 'Global Broadcasting' },
  { id: 'illuminarium', name: 'Illuminarium', sector: 'Immersive Entertainment' },
  { id: 'jk-lakshmi', name: 'Jk Lakshmi Cements', sector: 'Manufacturing & Infrastructure' },
  { id: 'iguatemi-365', name: 'Iguatemi 365', sector: 'Luxury Retail & Fashion' },
  { id: 'jk-aya', name: 'JK AYA Corporation', sector: 'Enterprise & Industry' },
  { id: 'grupo-leceres', name: 'Grupo Leceres', sector: 'International Commerce' },
  { id: 'sdmh', name: 'SDMH', sector: 'Healthcare & Medical' },
  { id: 'roots-to-go', name: 'Roots To Go', sector: 'Food & Hospitality' },
  { id: 'metafoods', name: 'MetaFoods', sector: 'Consumer & Web3' },
  { id: 'fiduc', name: 'Fiduc', sector: 'Banking & Fintech' },
  { id: 'iihmr', name: 'IIHMR', sector: 'Education & Research' },
  { id: 'flora', name: 'Flora', sector: 'Consumer Goods' },
  { id: 'solitec', name: 'Solitec', sector: 'Industrial Engineering' },
  { id: 'area-g', name: 'Area.G', sector: 'Design & Architecture' },
  { id: 'hottank', name: 'Hottank', sector: 'Creative & Digital' },
  { id: 'inovnation', name: 'Inovnation', sector: 'Technology & Innovation' },
];

function renderPartnerLogo(id: PartnerLogoId): JSX.Element {
  switch (id) {
    case 'sony-bbc-earth':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <text
            x="40"
            y="27"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="15"
            fontWeight="700"
            letterSpacing="2.5"
            fill="currentColor"
          >
            SONY
          </text>
          <g transform="translate(106, 13)">
            <rect x="0" y="0" width="18" height="17" rx="1.5" fill="currentColor" />
            <rect x="21" y="0" width="18" height="17" rx="1.5" fill="currentColor" />
            <rect x="42" y="0" width="18" height="17" rx="1.5" fill="currentColor" />
            <text
              x="9"
              y="13"
              textAnchor="middle"
              fontFamily="'Graphik', sans-serif"
              fontSize="11.5"
              fontWeight="700"
              fill="#07080c"
            >
              B
            </text>
            <text
              x="30"
              y="13"
              textAnchor="middle"
              fontFamily="'Graphik', sans-serif"
              fontSize="11.5"
              fontWeight="700"
              fill="#07080c"
            >
              B
            </text>
            <text
              x="51"
              y="13"
              textAnchor="middle"
              fontFamily="'Graphik', sans-serif"
              fontSize="11.5"
              fontWeight="700"
              fill="#07080c"
            >
              C
            </text>
          </g>
          <circle cx="52" cy="48" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="52" cy="48" rx="3.8" ry="8" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <line x1="44" y1="48" x2="60" y2="48" stroke="currentColor" strokeWidth="1.1" />
          <text
            x="68"
            y="53.5"
            fontFamily="'Graphik', sans-serif"
            fontSize="16"
            fontWeight="600"
            letterSpacing="6.5"
            fill="currentColor"
          >
            EARTH
          </text>
        </svg>
      );

    case 'nickelodeon':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <path
            d="M28 34c0-11 9-17 19-14 6 2 11-5 19-5s12 6 19 4c8-2 16 3 19 9 3 7 12 4 19 2 9-3 19 2 22 10 2 8-5 15-14 14-8-1-14 5-22 5-9 0-14-6-22-5-8 1-14 6-24 5-9-1-14-7-21-6-8 1-14-8-14-19z"
            fill="currentColor"
            opacity="0.14"
          />
          <text
            x="110"
            y="41"
            textAnchor="middle"
            fontFamily="'Graphik', 'Arial Rounded MT Bold', sans-serif"
            fontSize="24"
            fontWeight="800"
            letterSpacing="-0.5"
            fill="currentColor"
          >
            nickelodeon
          </text>
        </svg>
      );

    case 'tanishq':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(110, 18)" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M-16 0 C-9 -10, 9 -10, 16 0 C9 10, -9 10, -16 0 Z" />
            <circle cx="0" cy="0" r="3.5" fill="currentColor" />
            <path d="M0 -9 L0 9 M-8 -5 L8 5 M-8 5 L8 -5" strokeWidth="1.1" />
          </g>
          <text
            x="110"
            y="49"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="19"
            fontWeight="400"
            letterSpacing="6"
            fill="currentColor"
          >
            TANISHQ
          </text>
        </svg>
      );

    case 'grand-hyatt':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <path
            d="M78 22 A32 16 0 0 1 142 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="68" y1="22" x2="152" y2="22" stroke="currentColor" strokeWidth="1.2" />
          <text
            x="110"
            y="43"
            textAnchor="middle"
            fontFamily="'Graphik', sans-serif"
            fontSize="15.5"
            fontWeight="500"
            letterSpacing="4.5"
            fill="currentColor"
          >
            GRAND HYATT
          </text>
        </svg>
      );

    case 'nbc':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(74, 35)" fill="currentColor">
            <ellipse cx="-16" cy="-4" rx="4" ry="11" transform="rotate(-62 -16 -4)" opacity="0.75" />
            <ellipse cx="-10" cy="-12" rx="4" ry="11" transform="rotate(-36 -10 -12)" opacity="0.85" />
            <ellipse cx="-3" cy="-16" rx="4" ry="11" transform="rotate(-12 -3 -16)" />
            <ellipse cx="5" cy="-16" rx="4" ry="11" transform="rotate(12 5 -16)" />
            <ellipse cx="12" cy="-12" rx="4" ry="11" transform="rotate(36 12 -12)" opacity="0.85" />
            <ellipse cx="18" cy="-4" rx="4" ry="11" transform="rotate(62 18 -4)" opacity="0.75" />
            <polygon points="-2,4 4,4 1,-7" fill="#07080c" />
          </g>
          <text
            x="136"
            y="43"
            textAnchor="middle"
            fontFamily="'Graphik', sans-serif"
            fontSize="24"
            fontWeight="800"
            letterSpacing="2.5"
            fill="currentColor"
          >
            NBC
          </text>
        </svg>
      );

    case 'illuminarium':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(110, 19)" stroke="currentColor" strokeWidth="1.4">
            <circle cx="0" cy="0" r="3.5" fill="currentColor" />
            <circle cx="0" cy="0" r="9.5" fill="none" strokeDasharray="2.5 2.5" />
            <line x1="-14" y1="0" x2="-6" y2="0" />
            <line x1="6" y1="0" x2="14" y2="0" />
            <line x1="0" y1="-12" x2="0" y2="-6" />
          </g>
          <text
            x="110"
            y="49"
            textAnchor="middle"
            fontFamily="'Graphik', sans-serif"
            fontSize="14.5"
            fontWeight="500"
            letterSpacing="4.2"
            fill="currentColor"
          >
            ILLUMINARIUM
          </text>
        </svg>
      );

    case 'jk-lakshmi':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(26, 18)">
            <polygon
              points="16,0 32,8 32,24 16,32 0,24 0,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <text
              x="16"
              y="20.5"
              textAnchor="middle"
              fontFamily="'Graphik', sans-serif"
              fontSize="12"
              fontWeight="800"
              fill="currentColor"
            >
              JK
            </text>
          </g>
          <text
            x="68"
            y="34"
            fontFamily="'Graphik', sans-serif"
            fontSize="15"
            fontWeight="700"
            letterSpacing="1.8"
            fill="currentColor"
          >
            JK LAKSHMI
          </text>
          <text
            x="69"
            y="48"
            fontFamily="'Graphik', sans-serif"
            fontSize="9"
            fontWeight="500"
            letterSpacing="4.5"
            fill="currentColor"
            opacity="0.72"
          >
            CEMENT LTD.
          </text>
        </svg>
      );

    case 'iguatemi-365':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <text
            x="92"
            y="40"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="18"
            fontWeight="400"
            letterSpacing="3.5"
            fill="currentColor"
          >
            IGUATEMI
          </text>
          <rect
            x="158"
            y="23"
            width="36"
            height="22"
            rx="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <text
            x="176"
            y="38"
            textAnchor="middle"
            fontFamily="'Graphik', sans-serif"
            fontSize="11.5"
            fontWeight="600"
            letterSpacing="0.8"
            fill="currentColor"
          >
            365
          </text>
        </svg>
      );

    case 'jk-aya':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(36, 19)" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="0" y="4" width="22" height="22" transform="rotate(-12 11 15)" />
            <rect x="8" y="4" width="22" height="22" transform="rotate(12 19 15)" />
          </g>
          <text
            x="78"
            y="37"
            fontFamily="'Graphik', sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="3"
            fill="currentColor"
          >
            JK AYA
          </text>
          <text
            x="79"
            y="50"
            fontFamily="'Graphik', sans-serif"
            fontSize="8.5"
            fontWeight="500"
            letterSpacing="3.8"
            fill="currentColor"
            opacity="0.7"
          >
            CORPORATION
          </text>
        </svg>
      );

    case 'grupo-leceres':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <circle
            cx="44"
            cy="34"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="44"
            y="39"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="13.5"
            fontWeight="700"
            letterSpacing="1"
            fill="currentColor"
          >
            GL
          </text>
          <text
            x="69"
            y="33"
            fontFamily="'Graphik', sans-serif"
            fontSize="10.5"
            fontWeight="500"
            letterSpacing="3.8"
            fill="currentColor"
            opacity="0.72"
          >
            GRUPO
          </text>
          <text
            x="68"
            y="48"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="16.5"
            fontWeight="600"
            letterSpacing="2.5"
            fill="currentColor"
          >
            LECERES
          </text>
        </svg>
      );

    case 'sdmh':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(52, 18)">
            <path
              d="M16 0 L32 6 V18 C32 27 25 33 16 36 C7 33 0 27 0 18 V6 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M16 10 V24 M9 17 H23" stroke="currentColor" strokeWidth="2.4" />
          </g>
          <text
            x="98"
            y="42"
            fontFamily="'Graphik', sans-serif"
            fontSize="23"
            fontWeight="700"
            letterSpacing="4.5"
            fill="currentColor"
          >
            SDMH
          </text>
        </svg>
      );

    case 'roots-to-go':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(36, 20)" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 26 C14 14, 2 10, 2 2 C12 2, 16 10, 14 26 Z" />
            <path d="M14 26 C14 14, 26 10, 26 2 C16 2, 12 10, 14 26 Z" />
            <line x1="8" y1="26" x2="20" y2="26" />
          </g>
          <text
            x="72"
            y="36"
            fontFamily="'Graphik', sans-serif"
            fontSize="16"
            fontWeight="700"
            letterSpacing="2.2"
            fill="currentColor"
          >
            ROOTS
          </text>
          <text
            x="145"
            y="36"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontSize="15"
            fill="currentColor"
            opacity="0.85"
          >
            to go
          </text>
        </svg>
      );

    case 'metafoods':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(30, 19)" fill="none" stroke="currentColor" strokeWidth="1.6">
            <polygon points="15,0 30,8.5 30,25.5 15,34 0,25.5 0,8.5" />
            <polyline points="0,8.5 15,17 30,8.5" />
            <line x1="15" y1="17" x2="15" y2="34" />
          </g>
          <text
            x="70"
            y="41"
            fontFamily="'Graphik', sans-serif"
            fontSize="16.5"
            fontWeight="700"
            letterSpacing="2.5"
            fill="currentColor"
          >
            METAFOODS
          </text>
        </svg>
      );

    case 'fiduc':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(46, 20)" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="0" y="0" width="20" height="28" rx="2" />
            <line x1="6" y1="0" x2="6" y2="28" />
            <line x1="14" y1="0" x2="14" y2="28" />
          </g>
          <text
            x="78"
            y="42"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="22"
            fontWeight="600"
            letterSpacing="5.5"
            fill="currentColor"
          >
            FIDUC
          </text>
        </svg>
      );

    case 'iihmr':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(44, 18)" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="16" cy="16" r="14" />
            <path d="M10 21 L16 9 L22 21 Z" />
            <line x1="8" y1="24" x2="24" y2="24" />
          </g>
          <text
            x="84"
            y="38"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="21"
            fontWeight="700"
            letterSpacing="4"
            fill="currentColor"
          >
            IIHMR
          </text>
          <text
            x="85"
            y="50"
            fontFamily="'Graphik', sans-serif"
            fontSize="8"
            fontWeight="500"
            letterSpacing="3.4"
            fill="currentColor"
            opacity="0.7"
          >
            UNIVERSITY
          </text>
        </svg>
      );

    case 'flora':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(56, 34)" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="0" cy="-7" r="5" />
            <circle cx="6.5" cy="-2" r="5" />
            <circle cx="4" cy="5.5" r="5" />
            <circle cx="-4" cy="5.5" r="5" />
            <circle cx="-6.5" cy="-2" r="5" />
          </g>
          <text
            x="78"
            y="42"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontSize="24"
            fontWeight="600"
            letterSpacing="3"
            fill="currentColor"
          >
            Flora
          </text>
        </svg>
      );

    case 'solitec':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(46, 34)" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="0" cy="0" r="11" strokeDasharray="5 3" />
            <circle cx="0" cy="0" r="5" />
          </g>
          <text
            x="68"
            y="41"
            fontFamily="'Graphik', sans-serif"
            fontSize="19"
            fontWeight="700"
            letterSpacing="4"
            fill="currentColor"
          >
            SOLITEC
          </text>
        </svg>
      );

    case 'area-g':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <path
            d="M42 20 H34 V48 H42 M178 20 H186 V48 H178"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <text
            x="110"
            y="41"
            textAnchor="middle"
            fontFamily="'Graphik', sans-serif"
            fontSize="19"
            fontWeight="600"
            letterSpacing="5"
            fill="currentColor"
          >
            AREA·G
          </text>
        </svg>
      );

    case 'hottank':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(36, 20)" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="0" y="2" width="24" height="24" rx="4" />
            <path d="M6 14 H18 M12 8 V20" />
          </g>
          <text
            x="70"
            y="41"
            fontFamily="'Graphik', sans-serif"
            fontSize="19"
            fontWeight="800"
            letterSpacing="3.2"
            fill="currentColor"
          >
            HOTTANK
          </text>
        </svg>
      );

    case 'inovnation':
      return (
        <svg viewBox="0 0 220 68" className="ac-about-v2-client-logo" aria-hidden="true">
          <g transform="translate(34, 34)" fill="none" stroke="currentColor" strokeWidth="1.4">
            <ellipse cx="0" cy="0" rx="13" ry="5.5" transform="rotate(-28)" />
            <ellipse cx="0" cy="0" rx="13" ry="5.5" transform="rotate(28)" />
            <circle cx="0" cy="0" r="2.5" fill="currentColor" />
          </g>
          <text
            x="56"
            y="40"
            fontFamily="'Graphik', sans-serif"
            fontSize="15.5"
            fontWeight="600"
            letterSpacing="3.2"
            fill="currentColor"
          >
            INOVNATION
          </text>
        </svg>
      );
  }
}

type SectorCategory = 'all' | 'consumer' | 'enterprise' | 'industrial';

const sectors: Array<{ name: string; category: Exclude<SectorCategory, 'all'> }> = [
  { name: 'Arts & Culture', category: 'consumer' },
  { name: 'Apparel & Sportswear', category: 'consumer' },
  { name: 'Entertainment', category: 'consumer' },
  { name: 'Fashion & Beauty', category: 'consumer' },
  { name: 'Food & Drink', category: 'consumer' },
  { name: 'Furniture', category: 'consumer' },
  { name: 'Gaming', category: 'consumer' },
  { name: 'Hospitality', category: 'consumer' },
  { name: 'Marketing & Media', category: 'consumer' },
  { name: 'Publishing', category: 'consumer' },
  { name: 'Retail & Luxury', category: 'consumer' },
  { name: 'Banking & Finance', category: 'enterprise' },
  { name: 'Design & Architecture', category: 'enterprise' },
  { name: 'Education', category: 'enterprise' },
  { name: 'Fintech', category: 'enterprise' },
  { name: 'Real Estate', category: 'enterprise' },
  { name: 'Technology', category: 'enterprise' },
  { name: 'Telecommunications', category: 'enterprise' },
  { name: 'Agriculture', category: 'industrial' },
  { name: 'Aviation', category: 'industrial' },
  { name: 'Chemical Industries', category: 'industrial' },
  { name: 'Defence', category: 'industrial' },
  { name: 'Energy and Utilities', category: 'industrial' },
  { name: 'Manufacturing & Industries', category: 'industrial' },
  { name: 'Oil & Gas', category: 'industrial' },
];

function formatHubTime(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(new Date());
  } catch {
    return '';
  }
}

export function AboutPage(): JSX.Element {
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState(0);
  const [activeSectorFilter, setActiveSectorFilter] = useState<SectorCategory>('all');
  const [isReelPlaying, setIsReelPlaying] = useState(false);
  const [isReelMuted, setIsReelMuted] = useState(true);
  const [jaipurTime, setJaipurTime] = useState(() => formatHubTime('Asia/Kolkata'));
  const [ukTime, setUkTime] = useState(() => formatHubTime('Europe/London'));

  const heroRef = useRef<HTMLElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const reelVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setJaipurTime(formatHubTime('Asia/Kolkata'));
      setUkTime(formatHubTime('Europe/London'));
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    const section = heroRef.current;
    if (!video || !section) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const network = getNetworkInformation();
    let isVisible = false;
    const updatePlayback = (): void => {
      if (
        document.hidden ||
        document.body.classList.contains('menu-open') ||
        !isVisible ||
        prefersReducedMotion() ||
        prefersReducedData()
      ) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
          updatePlayback();
        }, { threshold: 0.12 })
      : null;

    if (observer) observer.observe(section);
    else {
      isVisible = true;
      updatePlayback();
    }

    const onMenuStateChange = (event: Event): void => {
      const isOpen = (event as CustomEvent<{ open?: boolean }>).detail?.open;
      if (isOpen) {
        video.pause();
        reelVideoRef.current?.pause();
        setIsReelPlaying(false);
      } else {
        updatePlayback();
      }
    };

    motionPreference.addEventListener('change', updatePlayback);
    network?.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    document.addEventListener('angel:menu-state', onMenuStateChange);
    return () => {
      observer?.disconnect();
      motionPreference.removeEventListener('change', updatePlayback);
      network?.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      document.removeEventListener('angel:menu-state', onMenuStateChange);
      video.pause();
    };
  }, []);

  const handleHeroPointerMove = (event: ReactMouseEvent<HTMLElement>): void => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    el.style.setProperty('--ac-spot-x', `${x.toFixed(1)}%`);
    el.style.setProperty('--ac-spot-y', `${y.toFixed(1)}%`);
  };

  const toggleReelPlay = (): void => {
    const video = reelVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play()
        .then(() => setIsReelPlaying(true))
        .catch(() => setIsReelPlaying(false));
    } else {
      video.pause();
      setIsReelPlaying(false);
    }
  };

  const toggleReelMute = (): void => {
    const video = reelVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsReelMuted(video.muted);
  };

  const activeDiscipline = disciplines[activeDisciplineIndex] ?? disciplines[0];
  const filteredSectors =
    activeSectorFilter === 'all'
      ? sectors
      : sectors.filter((sector) => sector.category === activeSectorFilter);

  return (
    <div id="content" className="site-content ac-about-v2">
      <div id="primary" className="content-area">
        <main id="main" className="site-main">
          {/* 01. SPATIAL CINEMA HERO STAGE */}
          <section
            ref={heroRef}
            className="ac-about-v2-hero"
            onMouseMove={handleHeroPointerMove}
            aria-labelledby="about-hero-heading"
          >
            <div className="ac-about-v2-hero__media" aria-hidden="true">
              <video
                ref={heroVideoRef}
                muted
                loop
                playsInline
                preload="none"
                poster={showreelPoster}
              >
                <source src={showreelVideo} type="video/mp4" />
              </video>
              <div className="ac-about-v2-hero__backdrop" />
            </div>

            <div className="ac-about-v2-container ac-about-v2-hero__inner">
              <div className="ac-about-v2-hero__top-bar">
                <span className="ac-about-v2-pill">
                  <span className="ac-about-v2-pill__dot" aria-hidden="true" />
                  Angel Creations · Studio Monograph
                </span>
                <div className="ac-about-v2-hero__clocks" aria-label="Studio Locations">
                  <span>Jaipur, IN {jaipurTime ? `· ${jaipurTime}` : ''}</span>
                  <span className="ac-about-v2-hero__clock-sep" aria-hidden="true">
                    /
                  </span>
                  <span>Braintree, UK {ukTime ? `· ${ukTime}` : ''}</span>
                </div>
              </div>

              <div className="ac-about-v2-hero__main">
                <p className="ac-about-v2-eyebrow">01 / Who We Are</p>
                <h1 id="about-hero-heading" className="ac-about-v2-hero__title">
                  <span>We are a creative powerhouse</span>
                  <span className="ac-about-v2-hero__title-accent">
                    thinking design forward.
                  </span>
                </h1>
                <p className="ac-about-v2-hero__lead">
                  Angel Creations is an India-based Creative &amp; Spatial Computing Studio partnering with ambitious organizations worldwide. We see design as a lens for looking onwards—uniting real-time 3D worlds, immersive XR simulations, animation, and cinema under one roof.
                </p>

                <div className="ac-about-v2-hero__actions">
                  <a
                    href="/works/"
                    className="ac-about-v2-btn ac-about-v2-btn--primary"
                  >
                    <span>Explore 47+ Works</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href="/contact/"
                    className="ac-about-v2-btn ac-about-v2-btn--glass"
                  >
                    <span>Start a Project Brief</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              <dl className="ac-about-v2-metrics" aria-label="Studio at a glance">
                <div className="ac-about-v2-metric">
                  <dt>Core Practice Pillars</dt>
                  <dd>07</dd>
                  <span>Spatial XR, Animation &amp; Film</span>
                </div>
                <div className="ac-about-v2-metric">
                  <dt>Public Archive</dt>
                  <dd>47+</dd>
                  <span>Verified Film &amp; XR Productions</span>
                </div>
                <div className="ac-about-v2-metric">
                  <dt>Global Partners</dt>
                  <dd>20+</dd>
                  <span>Broadcast, Luxury &amp; Enterprise</span>
                </div>
                <div className="ac-about-v2-metric">
                  <dt>Industry Verticals</dt>
                  <dd>25</dd>
                  <span>Sectors Transformed Globally</span>
                </div>
              </dl>
            </div>
          </section>

          {/* 02. STUDIO THESIS & ARCHITECTURAL BENTO GRID */}
          <section className="ac-about-v2-section" aria-labelledby="about-philosophy-heading">
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">02 / Studio Philosophy</p>
                  <h2 id="about-philosophy-heading" className="ac-about-v2-h2">
                    We see design as a lens to help looking onwards.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  Rooted in usability, creativity, aesthetics, and craft—we build enduring value for emerging ventures and global enterprises alike.
                </p>
              </div>

              <div className="ac-about-v2-bento">
                <article className="ac-about-v2-bento-card ac-about-v2-bento-card--wide">
                  <span className="ac-about-v2-card-index">Manifesto / 01</span>
                  <h3>One-stop creative &amp; spatial engineering for enduring business growth.</h3>
                  <p>
                    Angel Creations was founded with a singular mission: building measurable value through design and development. Although rooted in India, our studio operates without borders—delivering flagship commissions across the United Kingdom, Europe, the Americas, and Asia.
                  </p>
                  <p>
                    We believe the most resonant work emerges from collaboration, joint ambition, and mutual respect—combining artistic direction with engineering rigor so every frame and interaction feels inevitable.
                  </p>
                </article>

                <figure className="ac-about-v2-bento-card ac-about-v2-bento-card--visual">
                  <img
                    src="/inner-library/metaverse/hero-metaverse.webp"
                    alt="Spatial worldbuilding at Angel Creations"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="ac-about-v2-bento-card__overlay">
                    <span>Spatial Worldbuilding</span>
                    <strong>Where Storytelling Meets Real-Time 3D Craft</strong>
                  </figcaption>
                </figure>

                <article className="ac-about-v2-bento-card">
                  <span className="ac-about-v2-card-index">Principle / 01</span>
                  <h3>Usability, Aesthetics &amp; Craft</h3>
                  <p>
                    Technology alone never moves an audience. We anchor every virtual world, headset simulation, and commercial film in human ergonomics, visual clarity, and tactile polish.
                  </p>
                </article>

                <article className="ac-about-v2-bento-card">
                  <span className="ac-about-v2-card-index">Principle / 02</span>
                  <h3>Teams Built Around the Brief</h3>
                  <p>
                    We build our teams around the project—never the other way around. A deeply personal passion piece demands a different specialist chemistry than a vast-scale multi-camera or spatial production.
                  </p>
                </article>

                <article className="ac-about-v2-bento-card">
                  <span className="ac-about-v2-card-index">Principle / 03</span>
                  <h3>Progressive, Enduring Impact</h3>
                  <p>
                    We use design to create a positive, lasting impact for our partners and our surroundings—generating outcomes that remain progressive, relevant, and deeply engaging over time.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* 03. INTERACTIVE 7-DISCIPLINE SPATIAL CAPABILITY STAGE */}
          <section
            className="ac-about-v2-section ac-about-v2-section--alt"
            aria-labelledby="about-capabilities-heading"
          >
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">03 / Capabilities &amp; Disciplines</p>
                  <h2 id="about-capabilities-heading" className="ac-about-v2-h2">
                    Seven interconnected disciplines. One unified studio.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  Select any discipline below to inspect our 60+ specialized capabilities and enter its dedicated experience stage.
                </p>
              </div>

              <div className="ac-about-v2-explorer">
                <div className="ac-about-v2-explorer__nav" role="tablist" aria-label="Studio disciplines">
                  {disciplines.map((item, index) => {
                    const isSelected = index === activeDisciplineIndex;
                    return (
                      <button
                        key={item.slug}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`about-discipline-panel-${item.slug}`}
                        id={`about-discipline-tab-${item.slug}`}
                        className={`ac-about-v2-explorer__tab${isSelected ? ' is-active' : ''}`}
                        onClick={() => setActiveDisciplineIndex(index)}
                        onMouseEnter={() => setActiveDisciplineIndex(index)}
                      >
                        <span className="ac-about-v2-explorer__tab-num">{item.number}</span>
                        <div className="ac-about-v2-explorer__tab-body">
                          <strong>{item.title}</strong>
                          <span>{item.deliverables}</span>
                        </div>
                        <span className="ac-about-v2-explorer__tab-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  id={`about-discipline-panel-${activeDiscipline.slug}`}
                  role="tabpanel"
                  aria-labelledby={`about-discipline-tab-${activeDiscipline.slug}`}
                  className="ac-about-v2-explorer__stage"
                >
                  <div className="ac-about-v2-explorer__visual">
                    <img
                      key={activeDiscipline.image}
                      src={activeDiscipline.image}
                      alt={activeDiscipline.title}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="ac-about-v2-explorer__visual-shade" aria-hidden="true" />
                    <div className="ac-about-v2-explorer__visual-badge">
                      <span>Discipline {activeDiscipline.number} / 07</span>
                      <strong>{activeDiscipline.title}</strong>
                    </div>
                  </div>

                  <div className="ac-about-v2-explorer__content">
                    <div className="ac-about-v2-explorer__header">
                      <div>
                        <p className="ac-about-v2-explorer__tagline">{activeDiscipline.tagline}</p>
                        <h3>{activeDiscipline.title}</h3>
                      </div>
                      <a
                        href={activeDiscipline.route}
                        className="ac-about-v2-btn ac-about-v2-btn--primary"
                      >
                        <span>Explore {activeDiscipline.title}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>

                    <p className="ac-about-v2-explorer__summary">{activeDiscipline.summary}</p>

                    <div className="ac-about-v2-explorer__caps-wrap">
                      <p className="ac-about-v2-explorer__caps-label">
                        Specialized Deliverables &amp; Applications ({activeDiscipline.capabilities.length})
                      </p>
                      <ul className="ac-about-v2-explorer__caps">
                        {activeDiscipline.capabilities.map((cap, idx) => (
                          <li key={cap}>
                            <span>{String(idx + 1).padStart(2, '0')}</span>
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 04. FLAGSHIP STUDIO PRODUCTS SPOTLIGHT */}
          <section className="ac-about-v2-section" aria-labelledby="about-products-heading">
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">04 / Proprietary Platforms &amp; Products</p>
                  <h2 id="about-products-heading" className="ac-about-v2-h2">
                    Products engineered by Angel Creations.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  Alongside bespoke client commissions, we build standalone spatial platforms and interactive digital products.
                </p>
              </div>

              <div className="ac-about-v2-products-grid">
                {studioProducts.map((product) => (
                  <a
                    key={product.number}
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ac-about-v2-product-card"
                  >
                    <div className="ac-about-v2-product-card__media">
                      <img src={product.image} alt={product.title} loading="lazy" decoding="async" />
                      <div className="ac-about-v2-product-card__media-shade" aria-hidden="true" />
                      <span className="ac-about-v2-product-card__badge">
                        {product.number} · {product.badge}
                      </span>
                    </div>
                    <div className="ac-about-v2-product-card__body">
                      <div className="ac-about-v2-product-card__title-row">
                        <h3>{product.title}</h3>
                        <span className="ac-about-v2-product-card__launch" aria-hidden="true">
                          Launch Product ↗
                        </span>
                      </div>
                      <p className="ac-about-v2-product-card__sub">{product.subtitle}</p>
                      <p className="ac-about-v2-product-card__desc">{product.description}</p>
                      <ul className="ac-about-v2-product-card__tags">
                        {product.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* 05. CINEMA SHOWREEL STAGE & 4-PHASE PRODUCTION ARCHITECTURE */}
          <section
            className="ac-about-v2-section ac-about-v2-section--alt"
            aria-labelledby="about-reel-heading"
          >
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">05 / Craft in Motion &amp; Process</p>
                  <h2 id="about-reel-heading" className="ac-about-v2-h2">
                    How an idea becomes an inhabitable world.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  From first sketch to multi-platform release, our pipeline unites directors, spatial engineers, animators, and sound specialists.
                </p>
              </div>

              <div className="ac-about-v2-theater">
                <video
                  ref={reelVideoRef}
                  muted={isReelMuted}
                  loop
                  playsInline
                  preload="none"
                  poster={showreelPoster}
                  onPlay={() => setIsReelPlaying(true)}
                  onPause={() => setIsReelPlaying(false)}
                >
                  <source src={showreelVideo} type="video/mp4" />
                </video>
                <div className="ac-about-v2-theater__overlay" aria-hidden="true" />
                <div className="ac-about-v2-theater__hud">
                  <div className="ac-about-v2-theater__info">
                    <span className="ac-about-v2-theater__kicker">Angel Creations · Motion &amp; Spatial Reel</span>
                    <strong>Real-Time 3D, XR Simulation, Animation &amp; Commercial Film</strong>
                  </div>
                  <div className="ac-about-v2-theater__controls">
                    <button
                      type="button"
                      className="ac-about-v2-theater__btn"
                      onClick={toggleReelPlay}
                      aria-label={isReelPlaying ? 'Pause showreel' : 'Play showreel'}
                    >
                      {isReelPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      type="button"
                      className="ac-about-v2-theater__btn"
                      onClick={toggleReelMute}
                      aria-label={isReelMuted ? 'Unmute showreel' : 'Mute showreel'}
                    >
                      {isReelMuted ? 'Unmute Audio' : 'Mute Audio'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ac-about-v2-pipeline">
                {pipelinePhases.map((phase) => (
                  <article className="ac-about-v2-pipeline-card" key={phase.step}>
                    <div className="ac-about-v2-pipeline-card__top">
                      <span className="ac-about-v2-pipeline-card__step">{phase.step}</span>
                      <span className="ac-about-v2-pipeline-card__phase">{phase.phase}</span>
                    </div>
                    <h3>{phase.title}</h3>
                    <p>{phase.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 06. GLOBAL COMMUTERS & DUAL STUDIO HUBS (JAIPUR, IN & BRAINTREE, UK) */}
          <section className="ac-about-v2-section" aria-labelledby="about-global-heading">
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">06 / We&apos;re All Around — Global Culture</p>
                  <h2 id="about-global-heading" className="ac-about-v2-h2">
                    Even in these times, our culture strongly stands for true global commuters.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  Different cultures, languages, and landscapes trigger our work. We pack light, move fast, and cherry-pick specialist teams for every commission.
                </p>
              </div>

              <div className="ac-about-v2-hubs-grid">
                <article className="ac-about-v2-hub">
                  <div className="ac-about-v2-hub__header">
                    <span className="ac-about-v2-hub__badge">IN · Studio Headquarters</span>
                    {jaipurTime ? <span className="ac-about-v2-hub__clock">{jaipurTime} IST</span> : null}
                  </div>
                  <h3>Jaipur, India</h3>
                  <p className="ac-about-v2-hub__role">
                    Spatial Engineering, 3D Animation, VFX, Look-Development &amp; Post-Production Center
                  </p>
                  <p className="ac-about-v2-hub__desc">
                    Home to our directors, real-time Unity &amp; Unreal engineers, character animators, graphic designers, sound engineers, and editors—collaborating under one roof to craft flagship productions.
                  </p>
                  <div className="ac-about-v2-hub__meta">
                    <span>26.9124° N, 75.7873° E</span>
                    <span>UTC +05:30</span>
                  </div>
                </article>

                <article className="ac-about-v2-hub">
                  <div className="ac-about-v2-hub__header">
                    <span className="ac-about-v2-hub__badge">UK · International Desk</span>
                    {ukTime ? <span className="ac-about-v2-hub__clock">{ukTime} UK</span> : null}
                  </div>
                  <h3>Braintree, United Kingdom</h3>
                  <p className="ac-about-v2-hub__role">
                    Global Client Partnerships, Creative Strategy &amp; International Production Hub
                  </p>
                  <p className="ac-about-v2-hub__desc">
                    Connecting our studio directly with brands, broadcasters, and agencies across the UK, Europe, and North America—ensuring seamless communication and on-the-ground alignment.
                  </p>
                  <div className="ac-about-v2-hub__meta">
                    <span>51.8787° N, 0.5529° E</span>
                    <span>GMT / BST</span>
                  </div>
                </article>
              </div>

              <div className="ac-about-v2-commuter-strip">
                <div className="ac-about-v2-commuter-col">
                  <span>01 / Borderless Perspective</span>
                  <p>
                    That’s why we love airports—a hub with lines going to far different points, not in one single direction, but many. Being global isn’t the future of work for us; it’s our everyday reality.
                  </p>
                </div>
                <div className="ac-about-v2-commuter-col">
                  <span>02 / Bespoke Team Chemistry</span>
                  <p>
                    The makeup of the team is the difference between good and great. We cherry-pick directors, sound designers, animators, and event technologists purely around the needs of each client brief.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 07. SELECTED PARTNERS (LOGOS ONLY) & 25 INDUSTRY VERTICALS */}
          <section
            className="ac-about-v2-section ac-about-v2-section--alt"
            aria-labelledby="about-clients-heading"
          >
            <div className="ac-about-v2-container">
              <div className="ac-about-v2-section__head">
                <div>
                  <p className="ac-about-v2-eyebrow">07 / Selected Partners &amp; Verticals</p>
                  <h2 id="about-clients-heading" className="ac-about-v2-h2">
                    Trusted by global broadcasters, luxury houses, and industry leaders.
                  </h2>
                </div>
                <p className="ac-about-v2-section__sub">
                  20+ flagship client organizations across 25 industry sectors worldwide.
                </p>
              </div>

              <ul className="ac-about-v2-clients" aria-label="Selected client partners">
                {clients.map((client) => (
                  <li
                    className="ac-about-v2-client-card"
                    key={client.id}
                    aria-label={client.name}
                    title={`${client.name} — ${client.sector}`}
                  >
                    {renderPartnerLogo(client.id)}
                  </li>
                ))}
              </ul>

              <div className="ac-about-v2-sectors-block" aria-labelledby="about-sectors-heading">
                <div className="ac-about-v2-sectors-head">
                  <div>
                    <p className="ac-about-v2-eyebrow">Industry Footprint</p>
                    <h3 id="about-sectors-heading">25 Sectors We Serve</h3>
                  </div>
                  <div className="ac-about-v2-sector-filters" role="group" aria-label="Filter sectors by cluster">
                    <button
                      type="button"
                      className={`ac-about-v2-filter-btn${activeSectorFilter === 'all' ? ' is-active' : ''}`}
                      onClick={() => setActiveSectorFilter('all')}
                    >
                      All Verticals (25)
                    </button>
                    <button
                      type="button"
                      className={`ac-about-v2-filter-btn${activeSectorFilter === 'consumer' ? ' is-active' : ''}`}
                      onClick={() => setActiveSectorFilter('consumer')}
                    >
                      Media, Luxury &amp; Consumer
                    </button>
                    <button
                      type="button"
                      className={`ac-about-v2-filter-btn${activeSectorFilter === 'enterprise' ? ' is-active' : ''}`}
                      onClick={() => setActiveSectorFilter('enterprise')}
                    >
                      Technology, Finance &amp; Design
                    </button>
                    <button
                      type="button"
                      className={`ac-about-v2-filter-btn${activeSectorFilter === 'industrial' ? ' is-active' : ''}`}
                      onClick={() => setActiveSectorFilter('industrial')}
                    >
                      Industrial, Aviation &amp; Energy
                    </button>
                  </div>
                </div>

                <ul className="ac-about-v2-sector-pills">
                  {filteredSectors.map((sector) => (
                    <li key={sector.name} className="ac-about-v2-sector-pill">
                      <span className="ac-about-v2-sector-pill__dot" aria-hidden="true" />
                      {sector.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <LegacyFooter />
        </main>
      </div>
    </div>
  );
}
