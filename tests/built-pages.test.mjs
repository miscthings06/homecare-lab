import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
// Run after npm run build.
for (const path of ['index.html', 'calculator/water-purifier/index.html']) {
  test(`built page structure and internal links: ${path}`, { skip: !existsSync('dist/index.html') }, () => {
    const html = readFileSync(resolve('dist', path), 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(html.includes('가상 예시'));
    assert.ok(html.includes('id="water-form"'));
    assert.ok(html.includes('id="water-results"'));
    assert.ok(html.includes('id="official-products"'));
    assert.ok(html.includes('id="brand-comparison"'));
    assert.ok(html.includes('id="brand-months"'));
    assert.equal((html.match(/data-summary-product="/g) || []).length, 5);
    assert.ok(html.includes('관리비 미확인')); assert.ok(html.includes('계약을 계속 유지'));
    assert.ok(html.includes('부품가 확인 · 총관리비 미확인'));
    for (const price of ['140,000원', '160,000원', '104,000원', '135,000원']) assert.ok(html.includes(price));
    assert.ok(html.includes('판매 단위')); assert.ok(html.includes('기간을 바꿔도 부품 단가는 그대로'));
    assert.equal((html.match(/data-product="/g) || []).length, 5);
    assert.ok(html.includes('CP-TS011WS(S)')); assert.ok(html.includes('WPUJAC104DWH'));
    assert.ok(html.includes('견적 확인 필요')); assert.ok(html.includes('data-brand-filter="쿠쿠"'));
    assert.ok(html.includes('name="rentalTermDiscount"'));
    assert.ok(html.includes('name="purchaseCareMonths"'));
    assert.ok(html.includes('name="purchaseCareMonthly"'));
    assert.ok(html.includes('2026-10-21'));
    assert.ok(!html.includes('특정 제조사 가격표를 사용하지 않습니다'));
    assert.ok(html.includes('https://www.homecare-lab.co.kr/'));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate HTML IDs');
    for (const [, link] of html.matchAll(/href="(\/[^"]*)"/g)) {
      const clean = link.split(/[?#]/)[0];
      const target = clean.endsWith('/') ? `${clean}index.html` : clean;
      assert.ok(existsSync(resolve('dist', `.${target}`)), `missing internal target ${link}`);
    }
  });
}
test('legacy calculator no longer assumes an affiliate benefit', { skip: !existsSync('dist/index.html') }, () => {
  const html = readFileSync('dist/calculator/index.html', 'utf8');
  assert.ok(!html.includes('평균 20만원')); assert.ok(html.includes('/calculator/water-purifier/'));
  assert.ok(html.includes('id="ipju"')); assert.ok(html.includes('id="jeongi"'));
});
