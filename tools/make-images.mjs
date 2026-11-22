// Regenerates generated images in docs/ (dev-only; needs Playwright + Chrome like tests/e2e.mjs):
//   docs/img/triangulate.webp, docs/img/triangulate-sq.webp  (captured from Triangulate's own title screen;
//     the other five thumbnails are downscaled copies of each game's own og image)
//   docs/og.png  (1200x630 share card built from docs/img/*.webp)
// Usage: node tools/make-images.mjs   (serves sibling games via ../studio/pages-sim.mjs)
import { chromium } from '/home/box/swarm/side-gig/games/triangulate/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { GAMES } from '../docs/games.js';

const root = new URL('../docs/', import.meta.url).pathname;
const port = 8877, base = `http://127.0.0.1:${port}`;
const srv = spawn('node', [new URL('../../studio/pages-sim.mjs', import.meta.url).pathname, String(port)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });

async function toWebp(png, w, h, q = 0.86) {
  const p = await browser.newPage();
  const url = await p.evaluate(async ({ src, w, h, q }) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/webp', q);
  }, { src: 'data:image/png;base64,' + png.toString('base64'), w, h, q });
  await p.close();
  return Buffer.from(url.split(',')[1], 'base64');
}

// Triangulate has no og image, so shoot its title screen (logo, tagline, clue chips) at 1200x630.
{
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 3 });
  await p.goto(base + '/triangulate/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  // Wide card: logo + tagline + chips + edge of the globe; stops above the STYLE switcher.
  const wide = await p.screenshot({ clip: { x: 24, y: 66, width: 682, height: 358 } });
  fs.writeFileSync(root + 'img/triangulate.webp', await toWebp(wide, 720, 378));
  // Portrait crop for the compact phone/landscape rows: just the triangle emblem, no cut-off word.
  const sq = await p.screenshot({ clip: { x: 40, y: 102, width: 118, height: 165 } });
  fs.writeFileSync(root + 'img/triangulate-sq.webp', await toWebp(sq, 300, 420));
  await p.close();
}

// Share card.
{
  const data = s => 'data:image/webp;base64,' + fs.readFileSync(root + `img/${s}.webp`).toString('base64');
  const logo = fs.readFileSync(root + 'favicon.svg', 'utf8');
  const tiles = GAMES.map(g => `<figure style="--c:${g.color}"><img src="${data(g.slug)}" alt=""></figure>`).join('');
  const html = `<!doctype html><meta charset=utf-8><style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:system-ui,sans-serif;color:#f2f2ff;
      background:radial-gradient(900px 500px at 10% -20%,#2a1f5c 0,transparent 60%),radial-gradient(800px 500px at 110% 10%,#123c4a 0,transparent 55%),#0f1020}
    header{display:flex;align-items:center;gap:22px;padding:44px 56px 0}header svg{width:86px;height:86px;flex:none}
    h1{margin:0;font-size:58px;letter-spacing:.3px;line-height:1}p{margin:8px 0 0;font-size:25px;color:#b9bad6}
    .g{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:34px 56px 0}
    figure{margin:0;position:relative;border-radius:16px;overflow:hidden;box-shadow:0 0 0 2px color-mix(in srgb,var(--c) 60%,transparent),0 10px 30px #0008}
    img{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover}
  </style><header>${logo}<div><h1>Loopwork Games</h1><p>Six small free browser games · a fresh Daily in each · bots always labelled</p></div></header><div class=g>${tiles}</div>`;
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html, { waitUntil: 'load' });
  fs.writeFileSync(root + 'og.png', await p.screenshot({ type: 'png' }));
  await p.close();
}
await browser.close(); srv.kill();
console.log('wrote docs/img/triangulate.webp, docs/img/triangulate-sq.webp, docs/og.png');
