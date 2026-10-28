export type LeadFaq = {
  question: string;
  answer: string;
};

export function capabilityFaqs(capability: {
  route?: string;
  title: string;
  creates: string[];
  applications: string[];
  approach: string;
}): LeadFaq[] {
  return [
    {
      question: `What ${capability.title} services can Angel Creations create?`,
      answer: `Depending on the brief, the work can include ${capability.creates.join(', ').toLowerCase()}.`,
    },
    {
      question: `Where can ${capability.title} create value?`,
      answer: `Relevant settings and formats include ${capability.applications.join(', ').toLowerCase()}, chosen around the audience, story and launch context.`,
    },
    {
      question: `Who hires ${capability.title} services in India and worldwide?`,
      answer: 'It is usually commissioned by teams planning a launch, campaign, learning experience, presentation or public-facing moment. Angel Creations works from Jaipur, India with organisations across India and internationally.',
    },
    {
      question: `How much does a ${capability.title} project cost?`,
      answer: 'Cost depends on creative scope, production scale, interactivity, timeline and delivery formats. A prototype or pilot can be scoped first so the value and production route are visible before committing to the full build.',
    },
    {
      question: `How does a ${capability.title} project start?`,
      answer: `${capability.approach} Share the goal, audience, timeline and available budget through the project brief, and the first roadmap can be shaped from there.`,
    },
  ];
}
