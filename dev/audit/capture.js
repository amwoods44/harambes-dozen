// Visual-audit harness: serves the repo, intercepts all blocked external
// APIs with generated fixtures, and screenshots every tab.
//   NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//     node dev/audit/capture.js [--mode=offseason|midseason] [--viewports=desktop,mobile]
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { buildFixtures } = require('./fixtures');

const ROOT = path.resolve(__dirname, '../..');
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const MODE = arg('mode', 'offseason');
const VIEWPORTS = arg('viewports', 'desktop,mobile').split(',');
// --tabs=power,stats limits capture to those panel ids (lean per-change verification);
// omit to capture every panel. Accepts panel ids or section ids (mapped via the app).
const ONLY = arg('tabs', '').split(',').map(s => s.trim()).filter(Boolean);
const OUT = path.join(__dirname, 'screens', MODE);
const PORT = 8131;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      fs.readFile(p === ROOT + '/' || p === ROOT ? path.join(ROOT, 'index.html') : p, (err, buf) => {
        if (err) { rsp.writeHead(404); rsp.end(); return; }
        rsp.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
        rsp.end(buf);
      });
    }).listen(PORT, () => res(srv));
  });
}

// deterministic colored placeholder for sleepercdn images
function svgFor(url) {
  let h = 0; for (const c of url) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const isPlayer = url.includes('/players/');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="${isPlayer ? 70 : 96}">` +
    `<rect width="100%" height="100%" fill="hsl(${hue},45%,28%)"/>` +
    (isPlayer ? `<circle cx="48" cy="30" r="14" fill="hsl(${hue},35%,55%)"/><ellipse cx="48" cy="62" rx="24" ry="16" fill="hsl(${hue},35%,55%)"/>` :
      `<circle cx="48" cy="48" r="26" fill="hsl(${hue},50%,50%)"/>`) + `</svg>`;
}

(async () => {
  const fx = buildFixtures(MODE);
  const srv = await serve();
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {});
  const errors = [];

  for (const vp of VIEWPORTS) {
    const viewport = vp === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
    const ctx = await browser.newContext({ viewport, serviceWorkers: 'block', deviceScaleFactor: 1, ignoreHTTPSErrors: true });
    await ctx.route('**/*', async r => {
      const url = r.request().url();
      const host = new URL(url).hostname;
      if (host === 'localhost' || host.endsWith('googleapis.com') || host.endsWith('gstatic.com')) return r.continue();
      const resp = fx.route(url);
      if (resp) return r.fulfill({ status: resp.status, contentType: resp.contentType, body: resp.body });
      // any other external resource: stub images and scripts so layouts stay intact
      if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(url) || r.request().resourceType() === 'image')
        return r.fulfill({ status: 200, contentType: 'image/svg+xml', body: svgFor(url) });
      if (/\.js(\?|$)/.test(url)) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/*stub*/' });
      return r.fulfill({ status: 404, body: '' });
    });

    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`[${vp}] pageerror: ${e.message}`));
    page.on('console', m => {
      if (m.type() !== 'error' && m.type() !== 'warning') return;
      const t = m.text();
      if (/Service Worker registration blocked|SW failed/.test(t)) return; // SW intentionally blocked
      errors.push(`[${vp}] console.${m.type()}: ${t}`);
    });
    page.on('response', r => { if (r.status() >= 400) errors.push(`[${vp}] HTTP ${r.status()}: ${r.url()}`); });
    page.on('requestfailed', r => errors.push(`[${vp}] reqfail: ${r.url()} ${r.failure() && r.failure().errorText}`));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ls.fade-out', { timeout: 45000 });
    // wait for the background history merge to finish
    const want = fx.completedSeasons;
    // NB: index.html declares `let D` — a global lexical binding, NOT window.D
    await page.waitForFunction(n => typeof D !== 'undefined' && D.champions && D.champions.length >= n, want, { timeout: 45000 })
      .catch(() => errors.push(`[${vp}] history merge incomplete (champions < ${want})`));
    await page.waitForTimeout(1200);
    console.log('[diag]', await page.evaluate(() => JSON.stringify({
      champs: (D.champions || []).map(c => c.year + ':' + c.champion),
      franchise: D.franchise && D.franchise.length, trades: D.unified_trades && D.unified_trades.length,
      rivalries: D.rivalries && D.rivalries.length, draftYears: Object.keys(D.draft_picks || {}),
      contracts: Object.keys(D.contracts || {}).length, moves: D.moves && D.moves.length
    })));

    let tabs = await page.$$eval('main section.panel', els => els.map(e => e.id.replace('tab-', '')));
    if (ONLY.length) {
      // resolve any section ids to their panels, then keep only requested panels
      const wanted = await page.evaluate(ids => ids.flatMap(id => {
        const sec = (typeof SECTIONS !== 'undefined') && SECTIONS.find(s => s.id === id);
        return sec ? sec.panels.map(p => p[0]) : [id];
      }), ONLY);
      tabs = tabs.filter(t => wanted.includes(t));
    }
    await page.screenshot({ path: path.join(OUT, `_home--${vp}.png`), fullPage: true });
    for (const t of tabs) {
      await page.evaluate(id => window._showTab(id), t);
      await page.waitForTimeout(650);
      await page.screenshot({ path: path.join(OUT, `${t}--${vp}.png`), fullPage: true });
      // INVARIANT GATE: a rendered NaN / undefined / Infinity is a broken number — fail the run.
      const bad = await page.evaluate(id => {
        const el = document.getElementById('tab-' + id);
        const txt = (el && el.innerText) || '';
        return [/\bNaN\b/, /\bundefined\b/, /\bInfinity\b/].filter(re => re.test(txt)).map(re => re.source);
      }, t);
      if (bad.length) errors.push(`INVARIANT ${MODE}/${t}--${vp}: rendered ${bad.join(' , ')}`);
      process.stdout.write(`shot ${MODE}/${t}--${vp}\n`);
    }
    await ctx.close();
  }
  await browser.close();
  srv.close();
  if (errors.length) { console.log('\nERRORS (' + errors.length + '):'); [...new Set(errors)].slice(0, 30).forEach(e => console.log('  ' + e)); process.exit(1); }
  console.log('\nclean run — screenshots in ' + OUT);
})();
