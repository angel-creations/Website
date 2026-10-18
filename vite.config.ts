import { defineConfig, type Plugin, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

// The archived site does not contain the very large Unity .data/.wasm and 360° video
// binaries. Preserve their source URL shapes and use a read-only local-preview bridge,
// keeping browser requests same-origin without changing the production source paths.
const sourceRuntimeProxy: Record<string, string | ProxyOptions> = {
  '/wp-content/uploads/2023/01': { target: 'https://angelcreations.in', changeOrigin: true, secure: true },
  '/metaverse/Build': {
    target: 'https://angelcreations.in', changeOrigin: true, secure: true,
    configure(proxy) {
      proxy.on('proxyRes', (proxyResponse, request, response) => {
        if (request.url?.endsWith('.wasm')) proxyResponse.headers['content-type'] = 'application/wasm';
        proxyResponse.headers['cache-control'] = 'no-store';
        response.setHeader('cache-control', 'no-store');
        if (request.url?.endsWith('.wasm')) response.setHeader('content-type', 'application/wasm');
      });
    },
  },
};

// Exact raw captures from docs/live-html are retained as files under
// public/legacy-assets/other/feeds/ and returned with their original RSS media type.
const preservedFeedBodies = new Map<string, string>([
  ['/feed/', "<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"\n\txmlns:content=\"http://purl.org/rss/1.0/modules/content/\"\n\txmlns:wfw=\"http://wellformedweb.org/CommentAPI/\"\n\txmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n\txmlns:atom=\"http://www.w3.org/2005/Atom\"\n\txmlns:sy=\"http://purl.org/rss/1.0/modules/syndication/\"\n\txmlns:slash=\"http://purl.org/rss/1.0/modules/slash/\"\n\t xmlns:media=\"http://search.yahoo.com/mrss/\" >\n\n<channel>\n\t<title>Angel Creations &#8211; A Creative Powerhouse</title>\n\t<atom:link href=\"https://angelcreations.in/feed/\" rel=\"self\" type=\"application/rss+xml\" />\n\t<link>https://angelcreations.in/</link>\n\t<description>The Art of Storytelling. The Power of Design.</description>\n\t<lastBuildDate>Wed, 14 Dec 2022 12:59:06 +0000</lastBuildDate>\n\t<language>en-US</language>\n\t<sy:updatePeriod>\n\thourly\t</sy:updatePeriod>\n\t<sy:updateFrequency>\n\t1\t</sy:updateFrequency>\n\t\n\n<image>\n\t<url>https://angelcreations.in/wp-content/uploads/2023/01/logo.webp</url>\n\t<title>Angel Creations &#8211; A Creative Powerhouse</title>\n\t<link>https://angelcreations.in/</link>\n\t<width>32</width>\n\t<height>32</height>\n</image> \n\t<item>\n\t\t<title>Hello world!</title>\n\t\t<link>https://angelcreations.in/hello-world/</link>\n\t\t\t\t\t<comments>https://angelcreations.in/hello-world/#comments</comments>\n\t\t\n\t\t<dc:creator><![CDATA[Angel Creations]]></dc:creator>\n\t\t<pubDate>Wed, 14 Dec 2022 12:59:06 +0000</pubDate>\n\t\t\t\t<category><![CDATA[Uncategorized]]></category>\n\t\t<guid isPermaLink=\"false\">http://localhost/fleava/?p=1</guid>\n\n\t\t\t\t\t<description><![CDATA[<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p>\n<p>The post <a href=\"https://angelcreations.in/hello-world/\">Hello world!</a> appeared first on <a href=\"https://angelcreations.in\">Angel Creations - A Creative Powerhouse</a>.</p>\n]]></description>\n\t\t\t\t\t\t\t\t\t\t<content:encoded><![CDATA[\n<p class=\"wp-block-paragraph\">Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p>\n<p>The post <a href=\"https://angelcreations.in/hello-world/\">Hello world!</a> appeared first on <a href=\"https://angelcreations.in\">Angel Creations - A Creative Powerhouse</a>.</p>\n]]></content:encoded>\n\t\t\t\t\t\n\t\t\t\t\t<wfw:commentRss>https://angelcreations.in/hello-world/feed/</wfw:commentRss>\n\t\t\t<slash:comments>1</slash:comments>\n\t\t\n\t\t\n\t\t\n\t</item>\n\t</channel>\n</rss>\n"],
  ['/comments/feed/', "<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"\n\txmlns:content=\"http://purl.org/rss/1.0/modules/content/\"\n\txmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n\txmlns:atom=\"http://www.w3.org/2005/Atom\"\n\txmlns:sy=\"http://purl.org/rss/1.0/modules/syndication/\"\n\t xmlns:media=\"http://search.yahoo.com/mrss/\" \n\t>\n<channel>\n\t<title>\n\tComments for Angel Creations &#8211; A Creative Powerhouse\t</title>\n\t<atom:link href=\"https://angelcreations.in/comments/feed/\" rel=\"self\" type=\"application/rss+xml\" />\n\t<link>https://angelcreations.in/</link>\n\t<description>The Art of Storytelling. The Power of Design.</description>\n\t<lastBuildDate>Wed, 14 Dec 2022 12:59:06 +0000</lastBuildDate>\n\t<sy:updatePeriod>\n\thourly\t</sy:updatePeriod>\n\t<sy:updateFrequency>\n\t1\t</sy:updateFrequency>\n\t\n\t<item>\n\t\t<title>\n\t\tComment on Hello world! by A WordPress Commenter\t\t</title>\n\t\t<link>https://angelcreations.in/hello-world/#comment-1</link>\n\n\t\t<dc:creator><![CDATA[A WordPress Commenter]]></dc:creator>\n\t\t<pubDate>Wed, 14 Dec 2022 12:59:06 +0000</pubDate>\n\t\t<guid isPermaLink=\"false\">http://localhost/fleava/?p=1#comment-1</guid>\n\n\t\t\t\t\t<description><![CDATA[Hi, this is a comment.\nTo get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.\nCommenter avatars come from &lt;a href=&quot;https://en.gravatar.com/&quot;&gt;Gravatar&lt;/a&gt;.]]></description>\n\t\t\t<content:encoded><![CDATA[<p>Hi, this is a comment.<br />\nTo get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.<br />\nCommenter avatars come from <a href=\"https://en.gravatar.com/\">Gravatar</a>.</p>\n]]></content:encoded>\n\t\t\n\t\t\t</item>\n\t</channel>\n</rss>\n"],
]);
const captured404Routes = new Set([
  '/this-route-does-not-exist-for-forensics-2026/',
  '/animation/about.html', '/animation/awards.html',
  '/works/lustica', '/works/karma', '/works/raia', '/works/vold', '/works/arc', '/works/prodotti',
  '/works/clorova', '/works/samsara', '/works/bodyshop', '/works/jannata', '/works/apprentice-search', '/works/relationshift',
  '/brand-advertisement/about.html', '/brand-advertisement/awards.html',
  '/media-production/about.html', '/media-production/awards.html',
  '/mixed-reality/about.html', '/mixed-reality/awards.html',
  '/virtual-reality/about.html', '/virtual-reality/awards.html',
]);

// WordPress canonically redirects the no-slash About address before loading the page.
// Keep that observable route behaviour rather than rendering the generic fallback at /about.
function canonicalAboutRedirect(): Plugin {
  const redirect = (request: any, response: any, next: any): void => {
    const requested = request.url ?? '/';
    const [pathname, query = ''] = requested.split('?', 2);
    if (pathname !== '/about') { next(); return; }
    response.statusCode = 301;
    response.setHeader('Location', `/about/${query ? `?${query}` : ''}`);
    response.end();
  };
  return {
    name: 'canonical-about-redirect',
    configureServer(server) { server.middlewares.use(redirect); },
    configurePreviewServer(server) { server.middlewares.use(redirect); },
  };
}

function captured404Status(): Plugin {
  const mark = (request: any, response: any, next: any): void => {
    if (captured404Routes.has((request.url ?? '/').split('?')[0])) {
      // Vite's HTML fallback resets statusCode to 200 immediately before ending the
      // response. Preserve the captured WordPress status while still letting Vite
      // supply index.html for the React 404 representation.
      const writeHead = response.writeHead.bind(response);
      response.writeHead = (_status: number, ...args: any[]) => writeHead(404, ...args);
      const end = response.end.bind(response);
      response.end = (...args: any[]) => {
        if (!response.headersSent) response.statusCode = 404;
        return end(...args);
      };
    }
    next();
  };
  return {
    name: 'captured-wordpress-404-statuses',
    configureServer(server) { server.middlewares.use(mark); },
    configurePreviewServer(server) { server.middlewares.use(mark); },
  };
}

function preservedFeeds(): Plugin {
  const serve = (request: any, response: any, next: any): void => {
    const feed = preservedFeedBodies.get((request.url ?? '/').split('?')[0]);
    if (feed === undefined) { next(); return; }
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(feed);
  };
  return {
    name: 'preserved-rss-feeds',
    configureServer(server) { server.middlewares.use(serve); },
    configurePreviewServer(server) { server.middlewares.use(serve); },
  };
}
export default defineConfig({
  plugins: [react(), canonicalAboutRedirect(), captured404Status(), preservedFeeds()],
  server: { host: '0.0.0.0', allowedHosts: true, proxy: sourceRuntimeProxy },
  preview: { host: '0.0.0.0', allowedHosts: true, proxy: sourceRuntimeProxy },
});
