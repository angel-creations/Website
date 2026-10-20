import { chromium } from 'playwright';
import { startStaticServer } from './scripts/static-site-server.mjs';
const s = await startStaticServer({ root: 'dist', port: 4501 });
const b = await chromium.launch({ executablePath: '/tmp/chromium', args: ['--no-sandbox'] });
for (const [route, w, h] of [['/', 1440, 900], ['/about/', 1440, 900], ['/works/', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(s.url + route, { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `/tmp/shot-${route.replace(/\W+/g, '') || 'home'}.png` });
  console.log(route, errs.length ? 'ERR ' + errs[0] : 'ok');
  await ctx.close();
}
await b.close(); await s.close();
