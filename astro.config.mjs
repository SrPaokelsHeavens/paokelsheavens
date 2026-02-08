import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://srpaokelsheavens.eu.org',
  base: '/',
  i18n: {
    defaultLocale: 'en',
    locales: ['es', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
