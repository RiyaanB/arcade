import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const docs = new URL('../docs/', import.meta.url).pathname;

test('privacy and terms pages: static, linked from the hub, no external runtime requests', () => {
  const hub = fs.readFileSync(docs + 'index.html', 'utf8');
  for (const p of ['privacy', 'terms']) {
    assert.match(hub, new RegExp(`<footer>[\\s\\S]*href="${p}/"`), `hub footer links ${p}/`);
    const html = fs.readFileSync(docs + p + '/index.html', 'utf8');
    assert.doesNotMatch(html, /<script/i, p + ' needs no JS');
    assert.doesNotMatch(html, /\bsrc="(https?:)?\/\//, p + ' loads nothing external');
    assert.doesNotMatch(html, /<link[^>]*href="(https?:)?\/\//, p + ' loads no external css');
    assert.match(html, /href="\.\.\/style\.css"/);
    assert.match(html, /not legal advice/i);
  }
  const priv = fs.readFileSync(docs + 'privacy/index.html', 'utf8');
  assert.match(priv, /localStorage/);
  assert.match(priv, /PLANNED, NOT YET ACTIVE[\s\S]{0,200}GoatCounter/, 'analytics must be marked planned until it is live');
});
