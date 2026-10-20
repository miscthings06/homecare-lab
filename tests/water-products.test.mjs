import test from 'node:test';
import assert from 'node:assert/strict';
import { products, productQuote, verifiedAt } from '../src/data/water-products.mjs';
import { compare, example } from '../src/lib/water-cost.mjs';

test('official options have unique models, dates and manufacturer sources', () => {
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(verifiedAt, '2026-10-21');
  assert.equal(new Set(products.map(p => p.brand)).size, 2);
  for (const p of products) {
    assert.ok(p.model && p.notes && p.care);
    for (const source of p.sources) assert.ok(['www.coway.com', 'www.lge.co.kr'].includes(new URL(source.url).hostname));
    assert.deepEqual(Object.keys(productQuote(p)).sort(), Object.keys(example).sort());
  }
});
test('each rental schedule matches official total without card or hypothetical benefits', () => {
  for (const p of products) {
    const quote = productQuote(p);
    assert.equal(quote.rentalBenefit, 0); assert.equal(quote.card, 0); assert.equal(quote.afterAnnual, 0);
    assert.equal(compare({ ...quote, purchaseAnnual: quote.purchaseAnnual ?? 0 }).rent, p.rentalTotal);
  }
});
test('unverified purchase upkeep remains missing and cannot yield a total', () => {
  for (const p of products.filter(p => p.brand === '코웨이')) {
    assert.equal(productQuote(p).purchaseAnnual, null);
    assert.throws(() => compare(productQuote(p)));
    const r = compare({ ...productQuote(p), purchaseAnnual: 120000 });
    assert.equal(r.buyCare, 720000);
    assert.equal(r.series[11].buyCare, 0);
    assert.equal(r.series[12].buyCare, 10000);
  }
});
test('LG purchase care changes after month 36 without averaging the initial discount', () => {
  const quote = productQuote(products.find(p => p.id === 'lg-wd520awb'));
  const r = compare(quote);
  assert.equal(r.buyCare, 774000);
  assert.equal(r.buy, 2184000);
  assert.equal(r.series[35].buyCare, 180000);
  assert.equal(r.series[36].buyCare, 196500);
  assert.equal(r.rent, 1906800);
});
test('initial purchase care cannot exceed supported horizon', () => {
  assert.throws(() => compare({ ...example, purchaseCareMonths: 121 }));
});
