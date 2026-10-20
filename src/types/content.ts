export type ContentAttribute = string | boolean | Record<string, string>;

export type ContentTextNode = {
  type: 'text';
  value: string;
};

export type ContentElementNode = {
  type: 'element';
  tag: string;
  attrs: Record<string, ContentAttribute>;
  children: ContentNode[];
};

export type ContentNode = ContentTextNode | ContentElementNode;

export type SeoData = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  meta: Record<string, string>;
  jsonLd: string[];
};

export type PageDocument = SeoData & {
  url: string;
  route: string;
  status: number;
  kind: string;
  bodyClasses: string[];
  children: ContentNode[];
};

export type NavigationItem = {
  label: string;
  href: string;
  number?: string;
};

export type MediaAsset = {
  source: string;
  localSource?: string;
  alt?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
};

export type FormField = {
  label: string;
  name: string;
  autoComplete?: string;
};
