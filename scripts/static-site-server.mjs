// Minimal static file server used to rehearse exactly what a static host serves.
//
// Vite's dev and preview servers both fall back to the SPA entry document, which
// hides defects in the generated per-route HTML. Serving `dist/` the way Hostinger
// does (directory index, 404 document, no SPA fallback) reproduces production.

import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
};

async function fileAt(rootDirectory, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const resolved = path.resolve(rootDirectory, relative);
  if (resolved !== rootDirectory && !resolved.startsWith(`${rootDirectory}${path.sep}`)) return null;

  const stats = await stat(resolved).catch(() => null);
  if (stats?.isFile()) return resolved;
  if (stats?.isDirectory()) {
    const index = path.join(resolved, 'index.html');
    return (await stat(index).catch(() => null))?.isFile() ? index : null;
  }
  return null;
}

export async function startStaticServer({ root, port = 4173, host = '0.0.0.0' }) {
  const rootDirectory = path.resolve(root);
  const notFoundDocument = path.join(rootDirectory, '404.html');

  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const file = await fileAt(rootDirectory, pathname);

    if (!file) {
      const document = await readFile(notFoundDocument).catch(() => null);
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(document ?? 'Not found');
      return;
    }

    const extension = path.extname(file).toLowerCase();
    response.writeHead(200, {
      'content-type': mimeTypes[extension] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  const address = server.address();
  const boundPort = typeof address === 'object' && address ? address.port : port;

  return {
    url: `http://127.0.0.1:${boundPort}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
