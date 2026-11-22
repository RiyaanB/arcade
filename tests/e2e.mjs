// Hub e2e (headless Chrome via ../studio/pages-sim.mjs, which mimics the shared Pages host).
// Desktop 1280x800 + phone 390x844 (touch): every card renders with its art, every card link is
// followed by a real click/tap and must land on a 200 page with the game's own <title>, the played
// badge survives a reload, and there are no console errors, external requests or horizontal overflow.
// Also: corrupt/throwing localStorage and JS disabled must still offer all six games.
import { chromium } from '/home/box/swarm/side-gig/games/triangulate/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const port = +(process.env.PORT || 8870), base = `http://127.0.0.1:${port}`;
const out = process.env.SHOTS || '/workspace/arcade-shots/arcade/';
fs.mkdirSync(out, { recursive: true });
const srv = spawn('node', [new URL('../../studio/pages-sim.mjs', import.meta.url).pathname, String(port)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const { GAMES } = await import('../docs/games.js');
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const results = [];

for (const [tag, opts, minVisible] of [
  ['desk', { viewport: { width: 1280, height: 800 } }, 3],
  ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 4],
]) {
  const ctx = await browser.newContext(opts); await ctx.route(/gc\.zgo\.at|goatcounter\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' })); const page = await ctx.newPage(); const errs = [], ext = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  page.on('request', r => { if (!r.url().startsWith(base) && !/gc\.zgo\.at|goatcounter\.com/.test(r.url())) ext.push(r.url()); });
  await page.goto(base + '/arcade/', { waitUntil: 'networkidle' });
  const s = await page.evaluate(() => ({
    cards: document.querySelectorAll('.card').length,
    overflow: document.documentElement.scrollWidth > innerWidth,
    imgsOk: [...document.querySelectorAll('.art img')].every(i => i.complete && i.naturalWidth > 0),
    visible: [...document.querySelectorAll('.card a')].filter(a => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).length,
    botTags: [...document.querySelectorAll('.tags li.bot')].map(l => l.textContent),
  }));
  await page.screenshot({ path: out + `${tag}-hub.png`, fullPage: true });
  check(s.cards === GAMES.length, `${tag}: ${s.cards} cards`);
  check(!s.overflow, `${tag}: horizontal overflow`);
  check(s.imgsOk, `${tag}: a card image failed to load`);
  check(s.visible >= minVisible, `${tag}: only ${s.visible} cards fully on the first screen`);
  check(s.botTags.every(t => /bot/i.test(t)), `${tag}: bot tag without "bot"`);
  const links = {};
  for (let i = 0; i < GAMES.length; i++) {
    const g = GAMES[i], a = page.locator('.card a').nth(i);
    await a.scrollIntoViewIfNeeded();
    const nav = page.waitForNavigation({ waitUntil: 'load' });
    if (opts.hasTouch) await a.tap(); else await a.click();
    const r = await nav.catch(() => null);
    const title = await page.title();
    links[g.slug] = r ? r.status() : 'fail';
    check(r && r.status() === 200, `${tag}: ${g.slug} -> ${links[g.slug]}`);
    check(new URL(page.url()).pathname === `/${g.slug}/`, `${tag}: ${g.slug} landed on ${page.url()}`);
    check(title.toLowerCase().includes(g.name.toLowerCase().split(' ')[0]), `${tag}: ${g.slug} title "${title}"`);
    await page.goBack({ waitUntil: 'load' });
  }
  await page.reload({ waitUntil: 'networkidle' });
  const played = await page.$$eval('.badge.played', b => b.length);
  check(played === GAMES.length, `${tag}: ${played} played badges after visiting all`);
  const hubErrs = errs.filter(e => !GAMES.some(g => e.includes(`/${g.slug}/`)));
  check(hubErrs.length === 0, `${tag}: console errors ${hubErrs.join(' | ')}`);
  check(ext.length === 0, `${tag}: external requests ${ext.join(' ')}`);
  results.push({ tag, ...s, links, played });
  await ctx.close();
}

for (const [name, init, ctxOpts] of [
  ['corrupt-storage', () => localStorage.setItem('arcade.played', '{bad'), {}],
  ['throwing-storage', () => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } }), {}],
  ['nojs', null, { javaScriptEnabled: false }],
]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...ctxOpts }); await ctx.route(/gc\.zgo\.at|goatcounter\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' })); const page = await ctx.newPage();
  await ctx.route(/gc\.zgo\.at|goatcounter\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' })); // analytics stubbed in tests
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  if (init) await page.addInitScript(init);
  await page.goto(base + '/arcade/', { waitUntil: 'networkidle' });
  const hrefs = await page.$$eval('a[href^="../"]', as => [...new Set(as.map(a => a.getAttribute('href')))]);
  await page.screenshot({ path: out + `${name}.png`, fullPage: true });
  check(hrefs.length === GAMES.length, `${name}: ${hrefs.length} game links`);
  check(errs.length === 0, `${name}: ${errs.join(' | ')}`);
  results.push({ tag: name, links: hrefs.length, errs: errs.length });
  await ctx.close();
}

{ const ctx = await browser.newContext(); await ctx.route(/gc\.zgo\.at|goatcounter\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' })); const p = await ctx.newPage();
  const r = await p.goto(base + '/arcade/og.png'); check(r.status() === 200, 'og.png ' + r.status()); await ctx.close(); }

await browser.close(); srv.kill();
console.log(JSON.stringify(results, null, 1));
if (fails.length) { console.error('FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('e2e OK');
