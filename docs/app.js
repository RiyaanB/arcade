import { GAMES } from './games.js';

// localStorage can throw (sandboxed iframes, blocked cookies) or hold junk; never let that blank the hub.
const KEY = 'arcade.played';
function loadPlayed() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  catch { return {}; }
}
function savePlayed(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable: fine */ } }

// Must match the compact-row media queries in style.css.
const COMPACT = '(max-width:560px), (max-height:500px)';
const grid = document.getElementById('grid');
document.getElementById('today').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) + ' · ';
const played = loadPlayed();

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

for (const g of GAMES) {
  const li = el('li', 'card'); li.style.setProperty('--c', g.color);
  const a = el('a'); a.href = `../${g.slug}/?ref=arcade`;
  a.setAttribute('aria-label', `Play ${g.name}: ${g.genre}. ${g.tags.join(', ').replace(/🤖\s*/g, '')}`);

  const art = el('div', 'art');
  const img = el('img'); img.src = `img/${g.slug}.webp`; img.alt = ''; img.width = 720; img.height = 378;
  img.decoding = 'async'; img.style.setProperty('--focus', g.focus || '50% 50%');
  if (g.sq) {
    const pic = el('picture'); const src = el('source');
    src.media = COMPACT; src.srcset = `img/${g.slug}-sq.webp`;
    pic.append(src, img); art.append(pic);
  } else art.append(img);

  const body = el('div', 'body');
  const row = el('div', 'row'); const name = el('div', 'name'); name.append(el('h2', null, g.name)); row.append(name);
  const badge = played[g.slug] ? el('span', 'badge played', '✓ played') : g.status === 'new' ? el('span', 'badge', 'new') : null;
  if (badge) name.append(badge);
  row.append(el('span', 'cta', 'Play ▸'));
  const tags = el('ul', 'tags');
  for (const t of g.tags) tags.append(el('li', /bot/i.test(t) ? 'bot' : null, t));
  body.append(row, el('p', 'genre', g.genre), el('p', 'hook', g.hook), tags);

  a.append(art, body);
  a.addEventListener('click', () => { played[g.slug] = Date.now(); savePlayed(played); });
  li.append(a); grid.append(li);
}
document.documentElement.classList.add('js');
