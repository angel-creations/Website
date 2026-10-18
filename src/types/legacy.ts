export type LegacyAttribute = string | boolean | Record<string, string>;

export type LegacyTextNode = {
  type: 'text';
  value: string;
};

export type LegacyElementNode = {
  type: 'element';
  tag: string;
  attrs: Record<string, LegacyAttribute>;
  children: LegacyNode[];
};

export type LegacyNode = LegacyTextNode | LegacyElementNode;

export type SeoData = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  meta: Record<string, string>;
  jsonLd: string[];
};

export type LegacyPage = SeoData & {
  url: string;
  route: string;
  status: number;
  kind: string;
  bodyClasses: string[];
  children: LegacyNode[];
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
