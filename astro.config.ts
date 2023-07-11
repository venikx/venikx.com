import { defineConfig } from 'astro/config'
import image from '@astrojs/image'
import sitemap from '@astrojs/sitemap'
import prefetch from '@astrojs/prefetch'
import org from 'astro-org'

import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://venikx.com',
  integrations: [
    org(),
    prefetch(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    sitemap(),
    tailwind(),
  ],
})
