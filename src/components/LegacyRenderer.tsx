import { createElement, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import type { LegacyAttribute, LegacyNode } from '../types/legacy';

const allowedTags = new Set([
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'blockquote', 'br', 'button', 'canvas',
  'caption', 'code', 'col', 'colgroup', 'dd', 'details', 'div', 'dl', 'dt', 'em', 'figure',
  'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
  'img', 'input', 'label', 'li', 'main', 'mark', 'nav', 'ol', 'option', 'p', 'picture', 'pre',
  'section', 'select', 'small', 'source', 'span', 'strong', 'sub', 'summary', 'sup', 'table',
  'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'video', 'audio',
  'track', 'iframe', 'svg', 'path', 'circle', 'g', 'use', 'style'
]);

/* React rejects children on HTML void elements. The source extractor retains whitespace text
   children for tags such as <br> and <source>, so pass only their props through to React. */
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

const propNameMap: Record<string, string> = {
  autoplay: 'autoPlay',
  allowfullscreen: 'allowFullScreen',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  crossorigin: 'crossOrigin',
  frameborder: 'frameBorder',
  maxlength: 'maxLength',
  minlength: 'minLength',
  playsinline: 'playsInline',
  readonly: 'readOnly',
  rowspan: 'rowSpan',
  colspan: 'colSpan',
  tabindex: 'tabIndex',
  viewbox: 'viewBox',
};

function propsFor(attrs: Record<string, LegacyAttribute>, tag: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  Object.entries(attrs).forEach(([rawName, rawValue]) => {
    const name = propNameMap[rawName] ?? rawName;
    if (name === 'style' && typeof rawValue === 'object' && rawValue !== null) {
      props.style = rawValue as CSSProperties;
      return;
    }
    props[name] = rawValue;
  });

  if (tag === 'form') {
    props.onSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();
  }

  return props;
}

export function LegacyRenderer({ nodes }: { nodes: LegacyNode[] }): ReactNode {
  // Captured WordPress markup contains decorative and body imagery that is almost always below
  // the fold. Decoding asynchronously and deferring every image after the first two keeps the
  // original composition while removing those bytes from first paint.
  let imagesSeen = 0;

  const renderNode = (node: LegacyNode, index: number): ReactNode => {
    if (node.type === 'text') {
      return node.value;
    }

    if (!allowedTags.has(node.tag)) {
      return null;
    }

    const props = propsFor(node.attrs, node.tag);
    props.key = `${node.tag}-${index}`;

    if (node.tag === 'img') {
      imagesSeen += 1;
      props.decoding = 'async';
      if (imagesSeen > 2 && props.loading === undefined) props.loading = 'lazy';
    }
    if (voidTags.has(node.tag)) {
      return createElement(node.tag, props);
    }
    return createElement(node.tag, props, node.children.map(renderNode));
  };

  return <>{nodes.map(renderNode)}</>;
}
