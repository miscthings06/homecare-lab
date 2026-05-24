import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://homecare-lab.com',
  output: 'static',
  vite: {
    build: {
      assetsInlineLimit: 0,
    }
  }
});
