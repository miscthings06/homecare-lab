import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const read = path => readFileSync(path, 'utf8');
const filter = read('src/pages/rental/jeongsugi-filter-rental.astro');
const exit = read('src/pages/rental/rental-haejibiyong.astro');
const contract = read('src/pages/rental/rental-yakjeong.astro');
const cleaning = read('src/pages/cheongso/ipju-cheongso-biyong.astro');
test('filter guide distinguishes official unit prices, assumptions and unknown compatibility', () => {
  for (const value of ['140,000', '160,000', '104,000', '135,000', '예상 비용', '호환은 미확인', '필터 단품 합계 미확인', '37회차']) assert.ok(filter.includes(value), value);
  for (const id of ['prdno=1520', 'prdno=1521', 'prdno=1596', 'productNo=9977', 'wd520awb']) assert.ok(filter.includes(id));
  for (const stale of ['jeongsugi-filter-cycle.svg', '연 5~10만원 별도', '144~260만원']) assert.ok(!filter.includes(stale));
});
test('termination guide scopes rates and does not equate penalty with final settlement', () => {
  for (const text of ['2026-09-14', '1년 미만 30%', '할인 전', '2년 계약', '108,000원', '실제 고객 견적이 아닌', '최종 해지비용도 미확인', '회수비', '환급액']) assert.ok(exit.includes(text), text);
  assert.equal(1080 * (30000 / 30) * 0.1, 108000);
  assert.ok(!exit.includes('rental-haeji-penalty.svg'));
  assert.ok(contract.includes(' noindex'));
  assert.ok(contract.includes('의무사용기간과 소유권 이전은 다릅니다'));
});
test('unsubstantiated firsthand quotes become a correction and a blank worksheet', () => {
  for (const text of ['수정 안내', '원자료를 확보하지 못해', '빈 견적 기록란', '설명용 가상 예시', 'publishDate="2026년 5월 7일"']) assert.ok(cleaning.includes(text), text);
  for (const text of ['견적을 5개 업체에서 직접 받아', '전화·앱 견적 기준', '플랫폼 중개 A', 'ipju-cheongso-cost.svg']) assert.ok(!cleaning.includes(text), text);
  assert.ok(!read('src/pages/cheongso/index.astro').includes('✅ 직접 견적 비교 데이터'));
  assert.ok(!read('src/pages/about.astro').includes('복수 업체 비교 후 중간 범위'));
});
test('reviewed pages have one heading, dated review, official links and working local destinations', { skip: !existsSync('dist/index.html') }, () => {
  const revisions = JSON.parse(read('docs/content-revisions-2026-10-21.json'));
  for (const article of revisions.articles) {
    const url = article.path.replace('src/pages', '').replace('.astro', '/');
    const html = read(resolve('dist', '.' + url + 'index.html'));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, url);
    assert.ok(html.includes('2026년 10월 21일'), url);
    assert.ok(/href="https:\/\/(www\.)?(coway|lge|cuckoo|kca)\./.test(html), url);
    for (const [, link] of html.matchAll(/href="(\/[^"]*)"/g)) {
      const [pathname, anchor] = link.split('#');
      const clean = pathname.split('?')[0];
      const target = resolve('dist', '.' + (clean.endsWith('/') ? clean + 'index.html' : clean));
      assert.ok(existsSync(target), link);
      if (anchor) assert.ok(read(target).includes('id="' + anchor + '"'), link);
    }
  }
});
