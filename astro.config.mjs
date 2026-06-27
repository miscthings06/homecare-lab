import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.homecare-lab.co.kr',
  integrations: [sitemap({
    filter: (page) => ![
      'https://www.homecare-lab.co.kr/jeolryak/tv-jeongi/',
      'https://www.homecare-lab.co.kr/jeolryak/naengjangg-jeongi/',
      'https://www.homecare-lab.co.kr/jeolryak/saetakgi-jeongi/',
      'https://www.homecare-lab.co.kr/jeolryak/gonggi-jeongi/',
      'https://www.homecare-lab.co.kr/jeolryak/jesiugi-jeongi/',
      'https://www.homecare-lab.co.kr/cheongso/cheongso-gyeonjeok-checklist/',
      'https://www.homecare-lab.co.kr/rental/rental-yakjeong/',
      'https://www.homecare-lab.co.kr/isa-junbi/internet-isa/',
    ].includes(page),
  })],
  output: 'static',
  vite: {
    build: {
      assetsInlineLimit: 0,
    }
  }
});
