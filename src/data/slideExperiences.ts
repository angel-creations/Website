import rawSlideExperiences from './slideExperiences.json';

export type SlideExperience = {
  number: string;
  label: string;
  heading: string;
  route: string;
  video: string;
  poster?: string;
  mediaType?: string;
  remote?: boolean;
  summary: string;
  creates: string[];
  applications: string[];
  capabilityRoutes: string[];
  workTitleTerms: string[];
  hasUnityArtifact?: boolean;
  hasExpandedStory?: boolean;
  storySectionCount?: number;
  ctaLead?: string;
  ctaAction?: string;
};

// This is a route map for the already-existing seven homepage slides, not a new service taxonomy.
export const slideExperiences = rawSlideExperiences as SlideExperience[];

export function slideExperienceForRoute(route: string): SlideExperience | undefined {
  return slideExperiences.find((slide) => slide.route === route);
}
