import test from 'node:test';
import assert from 'node:assert/strict';
import { products, productQuote, verifiedAt } from '../src/data/water-products.mjs';
import { compare, example } from '../src/lib/water-cost.mjs';

test('official options have unique models, dates and manufacturer sources', () => {
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(verifiedAt, '2026-10-21');
  assert.equal(new Set(products.map(p => p.brand)).size, 4);
  for (const p of products) {
    assert.ok(p.model && p.notes && p.care);
    for (const source of p.sources) assert.ok(['www.coway.com', 'www.lge.co.kr', 'www.cuckoo.co.kr', 'www.skmagic.com'].includes(new URL(source.url).hostname));
    assert.deepEqual(Object.keys(productQuote(p)).sort(), Object.keys(example).sort());
  }
});
test('each rental schedule matches official total without card or hypothetical benefits', () => {
  for (const p of products) {
    const quote = productQuote(p);
    assert.equal(quote.rentalBenefit, 0); assert.equal(quote.card, 0); assert.equal(quote.afterAnnual, 0);
    // Test-only placeholder for unknown purchase inputs; production must leave them blank.
    assert.equal(compare({ ...quote, purchase: quote.purchase ?? 0, purchaseAnnual: quote.purchaseAnnual ?? 0 }).rent, p.rentalTotal);
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
test('Cuckoo five-month waiver is a full-term total, not a made-up initial promotion', () => {
  const quote = productQuote(products.find(p => p.id === 'cuckoo-ts011ws'));
  assert.equal(quote.purchase, 1900000); assert.equal(quote.promoMonths, 0);
  assert.equal(quote.purchaseAnnual, null); assert.equal(quote.rentalTermDiscount, 94500);
  const completed = { ...quote, purchaseAnnual: 120000 };
  const r = compare(completed);
  assert.equal(r.rentPayments, 1360800); assert.equal(r.rent, 1266300);
  assert.equal(r.series.length, 1); assert.equal(r.series[0].month, 72);
  for (const patch of [{ months: 36 }, { months: 84 }, { card: 1000 }, { rentalTermDiscount: 2000000 }])
    assert.throws(() => compare({ ...completed, ...patch }));
});
test('SK Magic missing purchase price is never represented as zero or rental total', () => {
  const quote = productQuote(products.find(p => p.id === 'skmagic-jac104'));
  assert.equal(quote.purchase, null); assert.equal(quote.purchaseAnnual, null);
  assert.throws(() => compare(quote));
  assert.throws(() => compare({ ...quote, purchaseAnnual: 120000 }));
  const r = compare({ ...quote, purchase: 1500000, purchaseAnnual: 120000 });
  assert.equal(r.rent, 2215200);
  assert.equal(r.series[11].rentPayments, 170400);
  assert.equal(r.series[12].rentPayments, 198800);
});
