// Nominal KRW cash outlay. No resale value, interest or assumed market prices.
export const example = {
  months: 60, term: 60, rental: 29900, promo: 14950, promoMonths: 6,
  rentalSetup: 0, rentalAnnual: 0, rentalBenefit: 0, rentalTermDiscount: 0, endFee: 0,
  afterRental: 0, afterAnnual: 120000, exitFee: 0,
  purchase: 1200000, purchaseSetup: 0, purchaseAnnual: 120000, purchaseBenefit: 0,
  purchaseCareMonths: 0, purchaseCareMonthly: 0,
  card: 0, cardMonths: 0, cardAnnual: 0,
};
function payments(v, m) {
  const promo = Math.min(m, v.promoMonths);
  return promo * v.promo + (m - promo) * v.rental;
}
export function validate(v) {
  for (const key of Object.keys(example)) {
    if (!Number.isSafeInteger(v[key]) || v[key] < 0) throw new Error('모든 금액과 개월 수는 0 이상의 정수로 입력해주세요.');
    if (v[key] > 100000000) throw new Error('입력 금액은 1억 원 이하로 입력해주세요.');
  }
  if (v.months < 1 || v.months > 120 || v.term < 1 || v.term > 120) throw new Error('비교 기간과 렌탈료 납부 기간은 1~120개월로 입력해주세요.');
  if (v.promoMonths > v.term) throw new Error('초기 할인 기간은 렌탈료 납부 기간 이하여야 합니다.');
  if (v.purchaseCareMonths > 120) throw new Error('구매 초기 관리비 적용 기간은 120개월 이하여야 합니다.');
  if (v.cardMonths > v.months) throw new Error('카드 할인 적용 기간은 비교 기간 이하여야 합니다.');
  if (v.purchaseBenefit > v.purchase + v.purchaseSetup) throw new Error('구매 확정 할인은 제품 가격과 설치비의 합계를 넘을 수 없습니다.');
  if (v.rentalBenefit > v.rentalSetup + payments(v, Math.min(v.months, v.term))) throw new Error('렌탈 확정 혜택은 비교 기간 내 렌탈료와 초기 비용 합계를 넘을 수 없습니다.');
  if (v.rentalTermDiscount > 0 && (v.months !== v.term || v.card > 0)) throw new Error('면제 회차 미확인 할인은 전체 납부 기간의 카드 할인 전 총액으로만 비교할 수 있습니다.');
  if (v.rentalBenefit + v.rentalTermDiscount > v.rentalSetup + payments(v, Math.min(v.months, v.term))) throw new Error('렌탈 할인 합계가 납부 금액을 넘을 수 없습니다.');
}
function atMonth(v, m) {
  const during = Math.min(m, v.term), after = Math.max(0, m - v.term);
  const rentPayments = payments(v, during) + after * v.afterRental;
  const rentCare = (during * v.rentalAnnual + after * v.afterAnnual) / 12;
  const transfer = m >= v.term ? v.endFee : 0;
  const exit = m === v.months && m < v.term ? v.exitFee : 0;
  const termDiscount = m >= v.term ? v.rentalTermDiscount : 0;
  const rent = v.rentalSetup + rentPayments + rentCare + transfer + exit - v.rentalBenefit - termDiscount;
  const initialCare = Math.min(m, v.purchaseCareMonths);
  const buyCare = initialCare * v.purchaseCareMonthly + (m - initialCare) * v.purchaseAnnual / 12;
  const buy = v.purchase + v.purchaseSetup + buyCare - v.purchaseBenefit;
  let cardDiscount = 0;
  for (let i = 1; i <= Math.min(m, v.cardMonths); i++) {
    const bill = i <= v.term ? (i <= v.promoMonths ? v.promo : v.rental) : v.afterRental;
    cardDiscount += Math.min(bill, v.card);
  }
  const cardFee = v.card > 0 && v.cardMonths > 0 ? Math.ceil(Math.min(m, v.cardMonths) / 12) * v.cardAnnual : 0;
  return { month: m, rent: Math.round(rent), buy: Math.round(buy), cardRent: Math.round(rent - cardDiscount + cardFee),
    rentPayments, rentCare: Math.round(rentCare), transfer, exit, termDiscount, buyCare: Math.round(buyCare), cardDiscount, cardFee };
}
export function compare(v) {
  validate(v);
  const series = Array.from({ length: v.months }, (_, i) => atMonth(v, i + 1));
  return { ...series.at(-1), series: v.rentalTermDiscount > 0 ? [series.at(-1)] : series };
}
