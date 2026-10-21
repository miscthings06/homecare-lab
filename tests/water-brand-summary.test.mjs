import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/water-products.mjs';
import { summarizeProduct, summaryMoney } from '../src/lib/water-brand-summary.mjs';
const product = id => products.find(p => p.id === id);
test('72 months means the same horizon for every model, with remaining obligations visible', () => {
  const rows = products.map(p => summarizeProduct(p, 72));
  assert.deepEqual(rows.map(r => r.rental), [1854000, 1794000, 1906800, 1266300, 1874400]);
  assert.deepEqual(rows.map(r => r.remaining), [12, 12, 0, 0, 12]);
  assert.deepEqual(rows.map(r => r.purchaseTotal), [null, null, 2184000, null, null]);
  assert.equal(rows.filter(r => r.care === null).length, 4);
  assert.match(rows[0].rentalNote, /이후 12개월 납부 별도/);
});
test('purchase care free period is known but unknown later care is never zero-filled', () => {
  const p = product('coway-icon3');
  assert.equal(summarizeProduct(p, 12).care, 0);
  assert.equal(summarizeProduct(p, 12).purchaseTotal, 1310000);
  assert.equal(summarizeProduct(p, 13).care, null);
  assert.equal(summarizeProduct(p, 13).purchaseTotal, null);
  assert.equal(summaryMoney(null), '산출 불가');
});
test('LG care tiers stop at the documented 84-month limit', () => {
  const p = product('lg-wd520awb');
  assert.equal(summarizeProduct(p, 36).care, 180000);
  assert.equal(summarizeProduct(p, 37).care, 196500);
  assert.equal(summarizeProduct(p, 84).purchaseTotal, 2382000);
  assert.equal(summarizeProduct(p, 85).care, null);
});
test('Cuckoo waiver is not invented for partial horizons or extended beyond term', () => {
  const p = product('cuckoo-ts011ws');
  for (const m of [12, 36, 60, 71, 73, 84, 120]) assert.equal(summarizeProduct(p, m).rental, null);
  assert.equal(summarizeProduct(p, 72).rental, p.rentalTotal);
});
test('post-contract rental costs and missing purchase prices remain unknown', () => {
  for (const p of products) {
    assert.equal(summarizeProduct(p, p.term).rental, p.rentalTotal);
    assert.equal(summarizeProduct(p, p.term + 1).rental, null);
  }
  for (const m of [12, 36, 60, 72, 84, 120]) assert.equal(summarizeProduct(product('skmagic-jac104'), m).purchaseTotal, null);
});
test('invalid horizons are rejected and summaries never mutate official data', () => {
  const p = product('lg-wd520awb'), before = JSON.stringify(p);
  for (const m of [0, 121, NaN, 1.5, '72']) assert.throws(() => summarizeProduct(p, m));
  summarizeProduct(p, 72); assert.equal(JSON.stringify(p), before);
});
