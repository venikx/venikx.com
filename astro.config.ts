import { defineConfig, sharpImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import prefetch from '@astrojs/prefetch'
import org from 'astro-org'

import tailwind from '@astrojs/tailwind'
import orgMode from './src/org-mode'

export default defineConfig({
  experimental: {
    assets: true,
  },
  image: {
    service: sharpImageService(),
  },
  site: 'https://venikx.com',
  integrations: [
    orgMode(),
    org(),
    prefetch(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
})
