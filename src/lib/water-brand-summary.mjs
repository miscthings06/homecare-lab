// Cost accrued while continuing the selected contract, NOT an early-exit quote.
export function summarizeProduct(product, months) {
  if (!Number.isInteger(months) || months < 1 || months > 120) throw new Error('비교 기간은 1~120개월이어야 합니다.');
  const remaining = Math.max(0, product.term - months);
  let rental = null, rentalNote;
  if (months > product.term) {
    rentalNote = `계약 종료 후 ${months - product.term}개월 요금·관리비 미확인`;
  } else if (product.rentalTermDiscount && months < product.term) {
    rentalNote = '면제 적용 회차 미확인 · 만기 총액만 확인 가능';
  } else {
    const promoMonths = Math.min(months, product.promoMonths);
    rental = promoMonths * product.promo + (months - promoMonths) * product.rental - (months === product.term ? product.rentalTermDiscount ?? 0 : 0);
    rentalNote = remaining ? `계약 유지 기준 · 이후 ${remaining}개월 납부 별도` : '선택 계약 만기까지의 요금';
  }
  const careLimit = product.purchaseCareVerifiedMonths ?? product.purchaseCareMonths;
  const careKnown = months <= careLimit && (months <= product.purchaseCareMonths || product.purchaseAnnual !== null);
  const initial = Math.min(months, product.purchaseCareMonths);
  const care = careKnown ? Math.round(initial * product.purchaseCareMonthly + Math.max(0, months - initial) * (product.purchaseAnnual ?? 0) / 12) : null;
  const purchaseTotal = product.purchase !== null && care !== null ? product.purchase + care : null;
  return { months, rental, rentalNote, remaining, care, purchaseTotal,
    careStatus: careKnown ? '관리비 확인' : product.careEvidence?.items.length ? '부품가 확인 · 총관리비 미확인' : '관리비 미확인',
    careNote: careKnown ? (months <= product.purchaseCareMonths && product.purchaseCareMonthly === 0 ? '확인된 무상 관리 기간 내' : '선택 기간의 관리비 합계') : (careLimit > 0 ? `${careLimit + 1}개월 차 이후 관리비 확인 필요` : '관리비·무료 관리 기간 확인 필요'),
    purchaseNote: product.purchase === null ? '구매가·관리비 견적 필요' : care === null ? '관리 조건 미확정 · 총비용 산출 불가' : '제품가 + 확인된 관리비',
    contractNote: months < product.term ? `${remaining}개월 계약 남음` : months === product.term ? '계약 만기' : `계약 후 ${months - product.term}개월 포함`,
  };
}
export const summaryMoney = value => value === null ? '산출 불가' : `${value.toLocaleString('ko-KR')}원`;
