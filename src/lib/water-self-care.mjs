import { summarizeProduct } from './water-brand-summary.mjs';

// An explicitly hypothetical prepaid filter budget, never an official service quote.
export function summarizeSelfCare(product, months, includeCowayFreeYear = true) {
  const official = summarizeProduct(product, months); // also validates the horizon
  const base = { rental: official.rental, rentalNote: official.rentalNote, care: null, total: null,
    status: '견적 필요', formula: '', assumption: '', estimated: false };
  if (product.id === 'lg-wd520awb') {
    return { ...base, care: official.care, total: official.purchaseTotal,
      status: official.care === null ? '기간 밖 요금 미확인' : '공식 자가교체 케어십',
      formula: '1~36개월 월 5,000원 + 37~84개월 월 16,500원',
      assumption: '필터 단품 DIY가 아닌 방문없는 케어십입니다. 필수 케어십 비용을 빼지 않으며 84개월 이후 요금은 추정하지 않습니다.' };
  }
  if (product.id === 'skmagic-jac104') {
    return { ...base, assumption: '구매가와 JAC104용 필터 단가 미확인. 다른 모델 필터값으로 예상하지 않습니다.' };
  }
  const coway = product.id === 'coway-icon3' || product.id === 'coway-icon2';
  const freeMonths = coway && includeCowayFreeYear ? Math.min(months, 12) : 0;
  const paidMonths = months - freeMonths;
  let care, formula, assumption;
  if (product.id === 'coway-icon3') {
    const count = Math.ceil(paidMonths / 12);
    const [six, twelve] = product.careEvidence.items;
    care = count * (six.price + twelve.price);
    formula = `유료 ${paidMonths}개월 → 12개월분 ${count}묶음 × (${six.price.toLocaleString('ko-KR')} + ${twelve.price.toLocaleString('ko-KR')})원`;
    assumption = '6개월차·12개월차 키트 각 1개를 매년 반복 구매한다고 가정. 추가 위생부품·배송비 제외.';
  } else if (product.id === 'coway-icon2') {
    const count = Math.ceil(paidMonths / 6), price = product.careEvidence.items[0].price;
    care = count * price;
    formula = `유료 ${paidMonths}개월 → 6개월형 ${count}개 × ${price.toLocaleString('ko-KR')}원`;
    assumption = 'CHP-7211N 키트가 V2/GR에도 호환되고 모든 회차에 같은 키트를 쓴다는 미확인 가정. 구매 전 반드시 호환·회차별 구성 확인.';
  } else if (product.id === 'cuckoo-ts011ws') {
    const count = Math.ceil(paidMonths / 8), price = product.careEvidence.items[0].price;
    care = count * price;
    formula = `${paidMonths}개월 → 8개월분 ${count}세트 × ${price.toLocaleString('ko-KR')}원`;
    assumption = '카본 2개·나노 1개 세트를 8개월마다 구매하고 WS 모델에 호환된다고 가정. 최초 장착 필터·무상 관리 혜택은 차감하지 않음. 일시불 구매 가능 여부도 확인 필요.';
  } else {
    return { ...base, assumption: '이 모델의 직접 교체 시나리오는 아직 없습니다.' };
  }
  if (coway) assumption += includeCowayFreeYear ? ' 첫 12개월 무상 서비스에 필요한 필터가 모두 포함된다고 가정해 차감.' : ' 첫해 무상 필터 혜택을 차감하지 않은 예산.';
  return { ...base, care, total: product.purchase === null ? null : product.purchase + care,
    status: '예상 비용 · 가정 포함', formula, assumption, estimated: true };
}
