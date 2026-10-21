import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const audit = JSON.parse(readFileSync('docs/content-audit-2026-10-21.json', 'utf8'));
const built = { skip: !existsSync('dist/index.html') };
test('home is an introduction, while calculator retains both comparison tables', built, () => {
  const home = readFileSync('dist/index.html', 'utf8');
  for (const id of ['water-form', 'brand-comparison', 'self-care-comparison']) assert.ok(!home.includes(`id="${id}"`));
  assert.ok(home.includes('href="/calculator/water-purifier/"'));
  assert.ok(home.includes('href="/guides/"'));
  assert.equal((home.match(/<h1[\s>]/g) || []).length, 1);
  const tool = readFileSync('dist/calculator/water-purifier/index.html', 'utf8');
  for (const id of ['water-form', 'brand-comparison', 'self-care-comparison']) assert.ok(tool.includes(`id="${id}"`));
});
test('new hub and navigation have valid links and three primary choices', built, () => {
  for (const path of ['index.html', 'guides/index.html', 'about/index.html', 'calculator/water-purifier/index.html', ...audit.articles.map(a=>`${a.url.slice(1)}index.html`)]) {
    const html = readFileSync(resolve('dist', path), 'utf8');
    const nav = html.match(/<nav class="cat-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.equal((nav.match(/<a\s/g) || []).length, 3, path);
    for (const target of ['/calculator/water-purifier/', '/guides/', '/about/']) assert.ok(nav.includes(`href="${target}"`));
  }
  for (const path of ['index.html', 'guides/index.html', 'about/index.html']) {
    const html = readFileSync(resolve('dist', path), 'utf8');
    for (const [, link] of html.matchAll(/href="(\/[^"]*)"/g)) {
      const [pathPart, anchor] = link.split('#');
      const clean = pathPart.split('?')[0];
      const target = resolve('dist', `.${clean.endsWith('/') ? `${clean}index.html` : clean}`);
      assert.ok(existsSync(target), `missing internal target ${link}`);
      if (anchor) assert.ok(readFileSync(target, 'utf8').includes(`id="${anchor}"`), `missing anchor ${link}`);
    }
  }
  const hub = readFileSync('dist/guides/index.html', 'utf8');
  for (const category of ['cheongso', 'rental', 'isa-junbi', 'jeolryak']) assert.ok(hub.includes(`href="/${category}/"`));
});
test('all 62 existing article bodies and indexing choices remain unchanged', built, () => {
  assert.equal(audit.articles.length, 62);
  for (const article of audit.articles) {
    const source = readFileSync(article.path, 'utf8');
    assert.equal(createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex'), article.sourceSha256, article.path);
    const output = resolve('dist', `.${article.url}index.html`);
    assert.ok(existsSync(output), article.url);
    const html = readFileSync(output, 'utf8');
    assert.equal(html.includes('content="noindex, follow"'), article.existingNoindex, article.url);
    const hubPage = readFileSync('dist/guides/index.html', 'utf8');
    assert.ok(hubPage.includes(`href="${article.url}"`), `article missing from guide hub: ${article.url}`);
  }
});
