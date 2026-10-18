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
  industryContexts?: string[];
  workTerms: string[];
};

// Every item below is constrained to language or capability labels present in the captured
// Angel About/capability source. Category labels make the information findable; they do not
// add client, outcome, sector, or process claims beyond that source.
const approach = 'Angel Creations’ current public About source describes work rooted in usability, creativity, aesthetics and craft, built through collaboration, joint ambition and mutual respect.';

export const capabilities: Capability[] = [
  {
    slug: 'brand', title: 'Brand', route: '/capabilities/brand/', eyebrow: 'Capability / source-qualified index',
    overview: 'The current Angel source references Marketing & Branding across its immersive capability material and presents Brand Advertisement as a homepage capability.',
    creates: ['Marketing & Branding', 'Brand Advertisement', 'AR Marketing', 'VR for Marketing & Branding', 'MR Marketing & Branding'],
    applications: ['Virtual product showcase', 'Virtual Marketplaces', 'AR Retail', 'MR Retail'],
    approach, related: ['Design', 'Content', 'Digital', 'Creative Technology'], relatedRoutes: ['/capabilities/design/', '/capabilities/content/', '/capabilities/digital/', '/capabilities/creative-technology/'],
    workTerms: ['brand', 'branding', 'advertisement', 'marketing'],
  },
  {
    slug: 'design', title: 'Design', route: '/capabilities/design/', eyebrow: 'Capability / source-qualified index',
    overview: 'Angel’s current About source identifies design and development as part of its studio mission and names graphic designers within its project-based talent range.',
    creates: ['Design and development', 'MR Architecture & Design', 'MR Design & Architecture', 'AR Art & Creativity'],
    applications: ['AR Navigation', 'AR Retail', 'VR Architectural Visualization', 'Virtual product showcase'],
    approach, related: ['Brand', 'Content', 'Digital', 'Creative Technology'], relatedRoutes: ['/capabilities/brand/', '/capabilities/content/', '/capabilities/digital/', '/capabilities/creative-technology/'],
    workTerms: ['design', 'architecture', 'visual', 'art'],
  },
  {
    slug: 'content', title: 'Content', route: '/capabilities/content/', eyebrow: 'Capability / source-qualified index',
    overview: 'The current Angel source explicitly lists VR Content Development and MR Content Creation, alongside media-production, animation, and immersive formats.',
    creates: ['VR Content Development', 'MR Content Creation', 'Animated Explainer Videos', 'AR Animation'],
    applications: ['VR Streaming & Broadcasting', 'VR Video conferencing', 'MR Media', 'Virtual events platforms'],
    approach, related: ['Film', 'Animation + 3D', 'Digital', 'Experiences'], relatedRoutes: ['/capabilities/film/', '/capabilities/animation-3d/', '/capabilities/digital/', '/capabilities/experiences/'],
    workTerms: ['content', 'video', 'visual', 'media'],
  },
  {
    slug: 'film', title: 'Film', route: '/capabilities/film/', eyebrow: 'Capability / source-qualified index',
    overview: 'Film is supported by the current Media Production capability list in Angel’s public source.',
    creates: ['Film Production', 'Video Production', 'Television Production', 'Photography Services', 'Scriptwriting and Storyboarding'],
    applications: ['Live Event Production', 'Post-Production Services', 'Audio Production', 'Media Consulting'],
    approach, related: ['Content', 'Animation + 3D', 'Experiences', 'Brand'], relatedRoutes: ['/capabilities/content/', '/capabilities/animation-3d/', '/capabilities/experiences/', '/capabilities/brand/'],
    workTerms: ['film', 'video', 'production', 'cinematic'],
  },
  {
    slug: 'animation-3d', title: 'Animation + 3D', route: '/capabilities/animation-3d/', eyebrow: 'Capability / source-qualified index',
    overview: 'Animation is an existing Angel homepage capability. The public About source lists 2D Animation and 3D Animation among its animation disciplines.',
    creates: ['Concept Development', 'Pre-visualization', '2D Animation', '3D Animation', 'Motion Graphics', 'Visual Effects (VFX)', 'Character Animation'],
    applications: ['Interactive Animations', 'Animated Explainer Videos', 'AR Animation'],
    approach, related: ['Film', 'Content', 'Creative Technology', 'Brand'], relatedRoutes: ['/capabilities/film/', '/capabilities/content/', '/capabilities/creative-technology/', '/capabilities/brand/'],
    workTerms: ['animation', '3d', 'vfx', 'motion'],
  },
  {
    slug: 'digital', title: 'Digital', route: '/capabilities/digital/', eyebrow: 'Capability / source-qualified index',
    overview: 'The current Angel source describes a creative studio building value through design and development, with immersive digital formats included in its public capability material.',
    creates: ['Design and development', 'Virtual Marketplaces', 'Virtual Economy', 'Virtual Workspaces', 'Virtual Education'],
    applications: ['VR Streaming & Broadcasting', 'AR Navigation', 'MR Remote Collaboration', 'VR Video conferencing'],
    approach, related: ['Design', 'Content', 'Creative Technology', 'Experiences'], relatedRoutes: ['/capabilities/design/', '/capabilities/content/', '/capabilities/creative-technology/', '/capabilities/experiences/'],
    workTerms: ['digital', 'virtual', 'interactive', 'technology'],
  },
  {
    slug: 'experiences', title: 'Experiences', route: '/capabilities/experiences/', eyebrow: 'Capability / source-qualified index',
    overview: 'Experiences are supported by the public source’s virtual events, immersive worlds, product showcase, entertainment, and live event production references.',
    creates: ['Virtual events platforms', 'Virtual Worlds', 'Virtual product showcase', 'Live Event Production', 'Entertainment'],
    applications: ['VR Training & Simulation', 'AR Tourism & Travel', 'MR Entertainment', 'VR Gaming'],
    approach, related: ['Creative Technology', 'Film', 'Content', 'Brand'], relatedRoutes: ['/capabilities/creative-technology/', '/capabilities/film/', '/capabilities/content/', '/capabilities/brand/'],
    industryContexts: ['AR Tourism & Travel', 'AR Retail', 'VR Education', 'AR Healthcare Applications'],
    workTerms: ['event', 'experience', 'virtual', 'immersive'],
  },
  {
    slug: 'creative-technology', title: 'Creative Technology', route: '/capabilities/creative-technology/', eyebrow: 'Capability / source-qualified index',
    overview: 'Creative Technology is represented by Angel’s existing Metaverse, Virtual Reality, Augment Reality, and Mixed Reality homepage and public capability material.',
    creates: ['Metaverse', 'Virtual Reality', 'Augment Reality', 'Mixed Reality', 'Virtual Worlds', 'VR Gaming', 'AR Industrial Applications', 'MR Content Creation'],
    applications: ['VR Training & Simulation', 'AR Navigation', 'MR Remote Collaboration', 'Virtual Workspaces', 'VR Architectural Visualization'],
    approach, related: ['Experiences', 'Digital', 'Animation + 3D', 'Design'], relatedRoutes: ['/capabilities/experiences/', '/capabilities/digital/', '/capabilities/animation-3d/', '/capabilities/design/'],
    industryContexts: ['AR Industrial Applications', 'AR Retail', 'AR Healthcare Applications', 'VR Education'],
    workTerms: ['vr', 'ar', 'mr', 'metaverse', 'virtual', 'immersive'],
  },
];

export function capabilityForRoute(route: string): Capability | undefined {
  return capabilities.find((capability) => capability.route === route);
}
