import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAMES } from '../docs/games.js';
const docs = new URL('../docs/', import.meta.url).pathname;
const html = fs.readFileSync(docs + 'index.html', 'utf8');

test('registry entries are complete and unique', () => {
  assert.equal(GAMES.length, 5);
  const slugs = new Set();
  for (const g of GAMES) {
    assert.match(g.slug, /^[a-z0-9-]+$/, g.slug);
    assert.ok(!slugs.has(g.slug), 'duplicate ' + g.slug); slugs.add(g.slug);
    for (const k of ['name', 'genre', 'hook']) assert.ok(typeof g[k] === 'string' && g[k].length > 2, `${g.slug}.${k}`);
    assert.match(g.color, /^#[0-9a-f]{6}$/i, g.slug);
    assert.ok(['live', 'new'].includes(g.status), g.slug);
    assert.ok(Array.isArray(g.tags) && g.tags.length >= 2 && g.tags.length <= 3, g.slug + ' tags');
    assert.ok(g.hook.length <= 90, g.slug + ' hook too long for a card');
  }
});

test('"new" badge is reserved for a minority of games', () => {
  assert.ok(GAMES.filter(g => g.status === 'new').length <= 2);
});

test('every game has art (and the square variant when flagged)', () => {
  for (const g of GAMES) {
    assert.ok(fs.statSync(docs + `img/${g.slug}.webp`).size > 2000, g.slug);
    if (g.sq) assert.ok(fs.statSync(docs + `img/${g.slug}-sq.webp`).size > 1000, g.slug + '-sq');
    if (g.focus) assert.match(g.focus, /^\d+% \d+%$/);
  }
  assert.ok(fs.statSync(docs + 'og.png').size > 10000, 'og.png referenced by og:image');
});

test('bot honesty: opponent tags say "bot"; no "live"/player-count claims', () => {
  for (const g of GAMES) {
    for (const t of g.tags) if (/\bvs\b|race|oppon/i.test(t)) assert.match(t, /bot/i, `${g.slug}: "${t}"`);
    const copy = [g.name, g.genre, g.hook, ...g.tags].join(' ');
    assert.doesNotMatch(copy, /\blive\b|online players|\d+\s*players/i, g.slug);
  }
  assert.doesNotMatch(html.replace(/<meta[^>]*>/g, ''), /\blive\b|online now|players online/i);
});

test('noscript fallback lists exactly the registry, in order', () => {
  const ns = html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
  const hrefs = [...ns.matchAll(/href="\.\.\/([a-z0-9-]+)\/"/g)].map(m => m[1]);
  assert.deepEqual(hrefs, GAMES.map(g => g.slug));
});

test('no external runtime requests in the page source', () => {
  const src = html.replace(/<meta[^>]*>/g, '').replace(/<a [^>]*href="https:\/\/github\.com[^"]*"/g, '');
  assert.doesNotMatch(src, /(src|href)="(https?:)?\/\//);
  for (const f of ['app.js', 'style.css', 'games.js']) assert.doesNotMatch(fs.readFileSync(docs + f, 'utf8'), /https?:\/\/(?!riyaanb\.github\.io)/, f);
});
