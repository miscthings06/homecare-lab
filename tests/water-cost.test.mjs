import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, example } from '../src/lib/water-cost.mjs';
test('60 month example separates promotions and maintenance', () => {
  const r = compare(example);
  assert.equal(r.rent, 1704300); assert.equal(r.buy, 1800000); assert.equal(r.buyCare, 600000);
});
test('early end adds only entered exit costs at final month', () => {
  const r = compare({ ...example, months: 24, exitFee: 200000 });
  assert.equal(r.exit, 200000); assert.equal(r.rent, 827900); assert.equal(r.series[22].exit, 0);
});
test('post-contract costs apply only after term', () => {
  const r = compare({ ...example, months: 72, afterRental: 10000, endFee: 50000 });
  assert.equal(r.rent, 1994300); assert.equal(r.series[58].transfer, 0); assert.equal(r.series[59].transfer, 50000);
});
test('card discount capped to bill; annual fee per started year', () => {
  const r = compare({ ...example, card: 99999, cardMonths: 13, cardAnnual: 20000 });
  assert.equal(r.cardDiscount, 299000); assert.equal(r.cardFee, 40000); assert.equal(r.cardRent, r.rent - 259000);
});
test('zero costs and ties supported', () => {
  const zero = Object.fromEntries(Object.keys(example).map(k => [k, 0]));
  const r = compare({ ...zero, months: 12, term: 12 }); assert.equal(r.rent, 0); assert.equal(r.buy, 0);
});
test('invalid and impossible conditions rejected', () => {
  for (const patch of [{ months: 0 }, { term: 121 }, { rental: -1 }, { purchase: NaN }, { months: 2.5 },
    { promoMonths: 61 }, { cardMonths: 61 }, { purchaseBenefit: 2000000 }, { rentalBenefit: 9999999 }])
    assert.throws(() => compare({ ...example, ...patch }));
});
test('maintenance prorates; inactive card has no annual fee', () => {
  const r = compare({ ...example, months: 1, cardAnnual: 30000 });
  assert.equal(r.buyCare, 10000); assert.equal(r.cardFee, 0);
});
