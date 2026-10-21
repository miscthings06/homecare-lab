// Read-only inventory. This detects review signals, not factual truth or AdSense eligibility.
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const categories = ['cheongso', 'rental', 'isa-junbi', 'jeolryak'];
const clean = text => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const keep = new Set(['rental/rental-vs-purchase', 'cheongso/cheongso-gyeonjeok-checklist', 'cheongso/cheongso-upche-hugi', 'isa-junbi/gwanrisauso-hwakyin']);
const merge = {
  'cheongso/aircon-type-cheongso': 'cheongso/aircon-cheongso',
  'cheongso/saetak-type-cheongso': 'cheongso/saetak-cheongso',
  'cheongso/cheongso-checklist-all': 'cheongso/cheongso-gyeonjeok-checklist',
  'rental/gonggi-filter-biyong': 'rental/gonggi-rental',
  'rental/rental-yakjeong': 'rental/rental-haejibiyong',
  'isa-junbi/internet-sinyu-vs-isa': 'isa-junbi/internet-isa',
  'isa-junbi/homeservice-dday': 'isa-junbi/isa-checklist',
  'jeolryak/boiler-oechul-mode': 'jeolryak/nanbangbi-jeollyak',
  'jeolryak/yeorim-jeongi': 'jeolryak/aircon-jeongi',
};
const priority = {
  'cheongso/ipju-cheongso-biyong': 'P0: 업체 5곳 직접 견적 주장 원본 확인; 카테고리 요약표와 가격 범위 대조',
  'rental/jeongsugi-filter-rental': 'P0: 브랜드 단위 관리 주기·연 5~10만원 필터비를 모델별 공식 근거와 대조',
  'rental/jeongsugi-rental': 'P0: 기존 5년 계산을 현재 모델별 비교와 구분; 생수 비교의 독립 목적 검토',
  'rental/rental-haejibiyong': 'P0: 잔여요금 50~80% 일반화 근거·계약별 약관 확인',
  'rental/rental-yakjeong': 'P0: 50% 적용 설명과 표·차트 수치 불일치; 해지비용 글과 통합 검토',
  'jeolryak/energy-voucher': 'P0: 사업연도·금액·대상·계절별 신청 설명을 최신 공식 공고와 대조',
  'jeolryak/gogoyul-hwanbul': 'P0: 사업명·운영기관·자격·신청 기간을 공식 공고별로 분리',
  'jeolryak/jeongi-nujin': 'P0: 계약종별·계절·요금 구성과 예시 재계산',
};
const defaults = {
  cheongso: 'P1: 가격 조사 조건·실제 사례 근거·제조사별 세척 주의사항 보강',
  rental: 'P1: 모델·납부기간·포함 관리·행사 조건·공식 링크와 재현 계산 보강',
  'isa-junbi': 'P1: 절차·연락처·기한·비용의 공식 출처와 지역별 예외 보강',
  jeolryak: 'P1: 소비전력 가정·요금 조건·절약 효과 근거와 산식 보강',
};
const articles = categories.flatMap(category => readdirSync(`src/pages/${category}`).filter(f => f.endsWith('.astro') && f !== 'index.astro').sort().map(file => {
  const sourcePath = `src/pages/${category}/${file}`;
  const source = readFileSync(sourcePath, 'utf8');
  const key = `${category}/${file.slice(0, -6)}`;
  const urls = [...new Set([...source.matchAll(/https?:\/\/[^\s"'<>}]+/g)].map(m => m[0]))];
  const evidenceLinks = urls.filter(url => !/ajd\.co\.kr|ajl\.to|schema\.org|homecare-lab\.co\.kr|\.(jpg|png|svg|webp)/i.test(url));
  const headings = [...source.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)].map(m => clean(m[1]));
  return { path: sourcePath, url: `/${key}/`, title: headings[0], headings,
    sourceSha256: createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex'),
    decision: merge[key] ? '통합 후보' : keep.has(key) ? '유지 후보' : '보강 후보',
    action: priority[key] || (merge[key] ? 'P1: 본문 비교축 중복 검토; 고유 항목과 유입 확인 후 대표 URL 결정' : keep.has(key) ? 'P2: 독립 목적 유지; 유지 후보는 정확성 검증 완료를 뜻하지 않음' : defaults[category]),
    proposedTarget: merge[key] ? `/${merge[key]}/` : null,
    evidenceLinks,
    existingNoindex: /<Layout\b[^>]*\bnoindex\b/s.test(source),
    reviewDates: [...source.matchAll(/reviewDate="([^"]+)"/g)].map(m => m[1]),
    firstHandClaims: [...source.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(m => clean(m[1])).filter(p => /직접.{0,15}(견적|받아|촬영|경험)|견적.{0,15}직접/.test(p)),
  };
}));
console.log(JSON.stringify({ date: '2026-10-21', scope: '전체 글의 제목·소제목·본문 정적 신호 1차 점검. 우선 위험 글은 본문 상세 점검. 전체 사실검증·검색 유입 분석은 미실시. 통합 실행·삭제·noindex 변경 없음.', counts: { total: articles.length, keep: articles.filter(a=>a.decision==='유지 후보').length, strengthen: articles.filter(a=>a.decision==='보강 후보').length, merge: articles.filter(a=>a.decision==='통합 후보').length }, articles }, null, 2));
