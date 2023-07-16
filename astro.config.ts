import { defineConfig, sharpImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import prefetch from '@astrojs/prefetch'
import org from '@orgajs/astro'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  experimental: {
    assets: true,
  },
  image: {
    service: sharpImageService(),
  },
  site: 'https://venikx.com',
  integrations: [
    org({}),
    prefetch(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
})
