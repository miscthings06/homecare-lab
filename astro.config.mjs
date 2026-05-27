import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.homecare-lab.co.kr',
  integrations: [sitemap()],
  output: 'static',
  vite: {
    build: {
      assetsInlineLimit: 0,
    }
  }
});
