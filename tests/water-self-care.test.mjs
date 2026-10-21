import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/water-products.mjs';
import { summarizeSelfCare } from '../src/lib/water-self-care.mjs';
import { summarizeProduct } from '../src/lib/water-brand-summary.mjs';
const p = id => products.find(product => product.id === id);

test('six-year self care budgets are explicitly estimates separate from official totals', () => {
  const results = products.map(product => summarizeSelfCare(product, 72));
  assert.deepEqual(results.map(r => r.care), [1500000, 1040000, 774000, 1215000, null]);
  assert.deepEqual(results.map(r => r.total), [2810000, 2300000, 2184000, 3115000, null]);
  assert.deepEqual(results.map(r => r.estimated), [true, true, false, true, false]);
  for (const id of ['coway-icon3', 'coway-icon2', 'cuckoo-ts011ws']) {
    assert.match(summarizeSelfCare(p(id), 72).status, /예상 비용/);
    assert.equal(summarizeProduct(p(id), 72).purchaseTotal, null);
  }
});
test('first free year is an explicit switch affecting Coway only', () => {
  assert.equal(summarizeSelfCare(p('coway-icon3'), 12).care, 0);
  assert.equal(summarizeSelfCare(p('coway-icon3'), 12, false).care, 300000);
  assert.equal(summarizeSelfCare(p('coway-icon2'), 12, false).care, 208000);
  assert.equal(summarizeSelfCare(p('coway-icon3'), 72, false).total, 3110000);
  assert.equal(summarizeSelfCare(p('coway-icon2'), 72, false).total, 2508000);
  for (const id of ['lg-wd520awb', 'cuckoo-ts011ws', 'skmagic-jac104']) {
    assert.deepEqual(summarizeSelfCare(p(id), 72, true), summarizeSelfCare(p(id), 72, false));
  }
});
test('prepaid bundle budget rounds up, without inventing monthly prorated payments', () => {
  assert.equal(summarizeSelfCare(p('coway-icon3'), 13).care, 300000);
  assert.equal(summarizeSelfCare(p('coway-icon3'), 24).care, 300000);
  assert.equal(summarizeSelfCare(p('coway-icon3'), 25).care, 600000);
  assert.equal(summarizeSelfCare(p('coway-icon2'), 18).care, 104000);
  assert.equal(summarizeSelfCare(p('coway-icon2'), 19).care, 208000);
  for (const [months, cost] of [[8, 135000], [9, 270000], [12, 270000], [36, 675000], [60, 1080000], [72, 1215000]]) {
    assert.equal(summarizeSelfCare(p('cuckoo-ts011ws'), months).care, cost);
  }
});
test('official rental limitations and LG care cutoff remain intact', () => {
  assert.equal(summarizeSelfCare(p('cuckoo-ts011ws'), 60).rental, null);
  assert.equal(summarizeSelfCare(p('coway-icon3'), 120).rental, null);
  assert.equal(summarizeSelfCare(p('lg-wd520awb'), 84).total, 2382000);
  assert.equal(summarizeSelfCare(p('lg-wd520awb'), 85).total, null);
  assert.equal(summarizeSelfCare(p('skmagic-jac104'), 72).total, null);
  assert.match(summarizeSelfCare(p('coway-icon2'), 72).assumption, /미확인 가정/);
  assert.match(summarizeSelfCare(p('cuckoo-ts011ws'), 72).assumption, /호환된다고 가정/);
});
test('invalid periods fail and official product records remain unchanged', () => {
  const before = JSON.stringify(products);
  for (const months of [0, NaN, 121, '72', 1.5]) assert.throws(() => summarizeSelfCare(p('coway-icon3'), months));
  for (const product of products) summarizeSelfCare(product, 72, false);
  assert.equal(JSON.stringify(products), before);
});
