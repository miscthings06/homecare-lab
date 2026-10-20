// Manually verified official storefront options. Not a live price feed.
import { example } from '../lib/water-cost.mjs';
export const verifiedAt = '2026-10-21';
export const products = [
  {
    id: 'coway-icon3', brand: '코웨이', name: '아이콘 정수기3',
    model: 'CHP-7220N_BG', option: '크림 베이지 · 냉온정 · 자가관리',
    purchase: 1310000, rental: 28900, promo: 10000, promoMonths: 12, term: 84,
    purchaseCareMonths: 12, purchaseCareMonthly: 0, purchaseAnnual: null,
    rentalTotal: 2200800,
    sources: [{ label: '코웨이 공식 가격', url: 'https://www.coway.com/product/detail?optno=2&prdno=1384' }],
    notes: '7년 약정·소유권 이전, 자가 필터 교체 6개월 기준. 자동이체 및 약정 할인 반영, 등록비 10만원 PRE-PASS 면제 조건. 조기 해지 시 면제액 환수 가능. 구매는 1년 무상 서비스 이후 관리비 별도 확인.',
    care: '구매: 첫 12개월 무상 · 이후 관리비 직접 입력',
  },
  {
    id: 'coway-icon2', brand: '코웨이', name: '아이콘 정수기2',
    model: 'CHP-7211N_V2/GR', option: '페블 그레이 · 냉온정 · 자가관리',
    purchase: 1260000, rental: 27900, promo: 10000, promoMonths: 12, term: 84,
    purchaseCareMonths: 12, purchaseCareMonthly: 0, purchaseAnnual: null,
    rentalTotal: 2128800,
    sources: [{ label: '코웨이 공식 가격', url: 'https://www.coway.com/product/detail?optno=6&prdno=1494' }],
    notes: '7년 약정·소유권 이전, 자가 필터 교체 6개월 기준. 자동이체 및 약정 할인 반영, 등록비 10만원 PRE-PASS 면제 조건. 조기 해지 시 면제액 환수 가능. 구매는 1년 무상 서비스 이후 관리비 별도 확인.',
    care: '구매: 첫 12개월 무상 · 이후 관리비 직접 입력',
  },
  {
    id: 'lg-wd520awb', brand: 'LG전자', name: '퓨리케어 오브제컬렉션 맞춤 lite',
    model: 'WD520AWB', option: '카밍 크림 화이트 · 냉온정 · 자가관리',
    purchase: 1410000, rental: 28900, promo: 14400, promoMonths: 12, term: 72,
    purchaseCareMonths: 36, purchaseCareMonthly: 5000, purchaseAnnual: 198000,
    rentalTotal: 1906800,
    sources: [
      { label: 'LG 공식 구매 가격', url: 'https://www.lge.co.kr/water-purifiers/wd520awb' },
      { label: 'LG 공식 구독 가격', url: 'https://www.lge.co.kr/care-solutions/water-purifiers/wd520awb?dpType=careTab' },
    ],
    notes: '6년 계약·방문없음/자가관리 기준. 구매는 회원할인가이며 앱 쿠폰·결제일 할인 제외. 필수 케어십은 1~36회 월 5,000원, 37~84회 월 16,500원. 기본 설치 무료, 환경별 추가 비용 별도. 구매 총비용은 현재 회원가와 해당 케어십을 합산하므로 구독 페이지의 일시불 비교 금액과 다를 수 있습니다.',
    care: '구매 케어십: 첫 36개월 월 5,000원 → 37~84개월 월 16,500원',
  },
];
export function productQuote(product) {
  const values = Object.fromEntries(Object.keys(example).map(key => [key, 0]));
  return { ...values, months: product.term, term: product.term, rental: product.rental,
    promo: product.promo, promoMonths: product.promoMonths, purchase: product.purchase,
    purchaseCareMonths: product.purchaseCareMonths, purchaseCareMonthly: product.purchaseCareMonthly,
    purchaseAnnual: product.purchaseAnnual };
}
