export type Capability = {
  slug: string;
  title: string;
  route: string;
  eyebrow: string;
  overview: string;
  creates: string[];
  applications: string[];
  approach: string;
  related: string[];
  relatedRoutes: string[];
  domainRoutes?: string[];
  industryContexts?: string[];
  workTerms: string[];
};

// Public capability index for Angel Creations. The language is intentionally
// outcome-aware without inventing clients, metrics or case-study claims.
const approach = 'Every commission is shaped around the audience, the story and the experience it must create—balancing usability, aesthetics, technical precision and craft through close collaboration.';

export const capabilities: Capability[] = [
  {
    slug: 'brand', title: 'Brand', route: '/capabilities/brand/', eyebrow: 'Angel Creations · Capability',
    overview: 'Campaigns and brand experiences that connect strategy, story and immersive media—across film, digital content, product showcases and spatial activations.',
    creates: ['Marketing & Branding', 'Brand Advertisement', 'AR Marketing', 'VR for Marketing & Branding', 'MR Marketing & Branding'],
    applications: ['Virtual Product Showcases', 'Virtual Marketplaces', 'AR Retail', 'MR Retail'],
    approach, related: ['Design', 'Content', 'Digital', 'Creative Technology'], relatedRoutes: ['/capabilities/design/', '/capabilities/content/', '/capabilities/digital/', '/capabilities/creative-technology/'],
    domainRoutes: ['/brand-advertisement/brand-campaigns/', '/brand-advertisement/digital-campaigns/', '/brand-advertisement/product-launches/', '/metaverse/virtual-brand-experiences/', '/augment-reality/ar-marketing/', '/virtual-reality/marketing-and-branding/'],
    workTerms: ['brand', 'branding', 'advertisement', 'marketing'],
  },
  {
    slug: 'design', title: 'Design', route: '/capabilities/design/', eyebrow: 'Angel Creations · Capability',
    overview: 'Visual and spatial design that gives complex ideas a clear, memorable form—from interfaces and environments to architecture-led digital experiences.',
    creates: ['Design and development', 'MR Architecture & Design', 'MR Design & Architecture', 'AR Art & Creativity'],
    applications: ['AR Navigation', 'AR Retail', 'VR Architectural Visualization', 'Virtual Product Showcases'],
    approach, related: ['Brand', 'Content', 'Digital', 'Creative Technology'], relatedRoutes: ['/capabilities/brand/', '/capabilities/content/', '/capabilities/digital/', '/capabilities/creative-technology/'],
    domainRoutes: ['/mixed-reality/architecture-and-design/', '/virtual-reality/architectural-visualization/', '/augment-reality/ar-art-and-creativity/', '/metaverse/virtual-product-showcases/', '/animation/concept-development/', '/augment-reality/retail/'],
    workTerms: ['design', 'architecture', 'visual', 'art'],
  },
  {
    slug: 'content', title: 'Content', route: '/capabilities/content/', eyebrow: 'Angel Creations · Capability',
    overview: 'Stories and media made for immersive spaces, screens and live audiences—from VR and MR content to animation, film and interactive explainers.',
    creates: ['VR Content Development', 'MR Content Creation', 'Animated Explainer Videos', 'AR Animation'],
    applications: ['VR Streaming & Broadcasting', 'VR Video Conferencing', 'MR Media', 'Virtual Events Platforms'],
    approach, related: ['Film', 'Animation + 3D', 'Digital', 'Experiences'], relatedRoutes: ['/capabilities/film/', '/capabilities/animation-3d/', '/capabilities/digital/', '/capabilities/experiences/'],
    domainRoutes: ['/virtual-reality/vr-content/', '/mixed-reality/media/', '/animation/explainer-videos/', '/media-production/video-production/', '/virtual-reality/streaming-and-broadcasting/', '/brand-advertisement/social-and-digital-content/'],
    workTerms: ['content', 'video', 'visual', 'media'],
  },
  {
    slug: 'film', title: 'Film', route: '/capabilities/film/', eyebrow: 'Angel Creations · Capability',
    overview: 'Cinematic production from script and storyboard to shoot, post-production and final master—crafted for brands, broadcast, events and digital platforms.',
    creates: ['Film Production', 'Video Production', 'Television Production', 'Photography Services', 'Scriptwriting and Storyboarding'],
    applications: ['Live Event Production', 'Post-Production Services', 'Audio Production', 'Media Consulting'],
    approach, related: ['Content', 'Animation + 3D', 'Experiences', 'Brand'], relatedRoutes: ['/capabilities/content/', '/capabilities/animation-3d/', '/capabilities/experiences/', '/capabilities/brand/'],
    domainRoutes: ['/media-production/film-production/', '/media-production/video-production/', '/media-production/television-production/', '/media-production/photography/', '/media-production/live-event-production/', '/media-production/scriptwriting-and-storyboarding/'],
    workTerms: ['film', 'video', 'production', 'cinematic'],
  },
  {
    slug: 'animation-3d', title: 'Animation + 3D', route: '/capabilities/animation-3d/', eyebrow: 'Angel Creations · Capability',
    overview: '2D, 3D, character and motion design that make the invisible visible—and the complex effortless to understand.',
    creates: ['Concept Development', 'Pre-visualization', '2D Animation', '3D Animation', 'Motion Graphics', 'Visual Effects (VFX)', 'Character Animation'],
    applications: ['Interactive Animations', 'Animated Explainer Videos', 'AR Animation'],
    approach, related: ['Film', 'Content', 'Creative Technology', 'Brand'], relatedRoutes: ['/capabilities/film/', '/capabilities/content/', '/capabilities/creative-technology/', '/capabilities/brand/'],
    domainRoutes: ['/animation/2d-animation/', '/animation/3d-animation/', '/animation/character-animation/', '/animation/motion-graphics/', '/animation/visual-effects/', '/animation/explainer-videos/'],
    workTerms: ['animation', '3d', 'vfx', 'motion'],
  },
  {
    slug: 'digital', title: 'Digital', route: '/capabilities/digital/', eyebrow: 'Angel Creations · Capability',
    overview: 'Interactive digital worlds and platforms for work, learning, commerce, navigation and collaboration—designed around real human journeys.',
    creates: ['Design and development', 'Virtual Marketplaces', 'Virtual Economy', 'Virtual Workspaces', 'Virtual Education'],
    applications: ['VR Streaming & Broadcasting', 'AR Navigation', 'MR Remote Collaboration', 'VR Video Conferencing'],
    approach, related: ['Design', 'Content', 'Creative Technology', 'Experiences'], relatedRoutes: ['/capabilities/design/', '/capabilities/content/', '/capabilities/creative-technology/', '/capabilities/experiences/'],
    domainRoutes: ['/metaverse/virtual-marketplaces/', '/metaverse/virtual-economies/', '/metaverse/virtual-workspaces/', '/metaverse/virtual-education/', '/augment-reality/ar-navigation/', '/mixed-reality/remote-collaboration/'],
    workTerms: ['digital', 'virtual', 'interactive', 'technology'],
  },
  {
    slug: 'experiences', title: 'Experiences', route: '/capabilities/experiences/', eyebrow: 'Angel Creations · Capability',
    overview: 'Physical and virtual moments people can enter, explore and share—from virtual events and product showcases to live spatial activations.',
    creates: ['Virtual Events Platforms', 'Virtual Worlds', 'Virtual Product Showcases', 'Live Event Production', 'Entertainment'],
    applications: ['VR Training & Simulation', 'AR Tourism & Travel', 'MR Entertainment', 'VR Gaming'],
    approach, related: ['Creative Technology', 'Film', 'Content', 'Brand'], relatedRoutes: ['/capabilities/creative-technology/', '/capabilities/film/', '/capabilities/content/', '/capabilities/brand/'],
    domainRoutes: ['/metaverse/virtual-events/', '/metaverse/virtual-worlds/', '/metaverse/virtual-product-showcases/', '/media-production/live-event-production/', '/mixed-reality/entertainment/', '/virtual-reality/vr-gaming/'],
    industryContexts: ['AR Tourism & Travel', 'AR Retail', 'VR Education', 'AR Healthcare Applications'],
    workTerms: ['event', 'experience', 'virtual', 'immersive'],
  },
  {
    slug: 'creative-technology', title: 'Creative Technology', route: '/capabilities/creative-technology/', eyebrow: 'Angel Creations · Capability',
    overview: 'XR systems that blend design, engineering and storytelling across metaverse, virtual reality, augmented reality and mixed-reality environments.',
    creates: ['Metaverse', 'Virtual Reality', 'Augmented Reality', 'Mixed Reality', 'Virtual Worlds', 'VR Gaming', 'AR Industrial Applications', 'MR Content Creation'],
    applications: ['VR Training & Simulation', 'AR Navigation', 'MR Remote Collaboration', 'Virtual Workspaces', 'VR Architectural Visualization'],
    approach, related: ['Experiences', 'Digital', 'Animation + 3D', 'Design'], relatedRoutes: ['/capabilities/experiences/', '/capabilities/digital/', '/capabilities/animation-3d/', '/capabilities/design/'],
    domainRoutes: ['/metaverse/virtual-worlds/', '/virtual-reality/training-and-simulation/', '/augment-reality/industrial-ar/', '/mixed-reality/remote-collaboration/', '/virtual-reality/vr-gaming/', '/augment-reality/ar-navigation/'],
    industryContexts: ['AR Industrial Applications', 'AR Retail', 'AR Healthcare Applications', 'VR Education'],
    workTerms: ['vr', 'ar', 'mr', 'metaverse', 'virtual', 'immersive'],
  },
];

export function capabilityForRoute(route: string): Capability | undefined {
  return capabilities.find((capability) => capability.route === route);
}
