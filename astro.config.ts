import { defineConfig } from 'astro/config'
import image from '@astrojs/image'
import sitemap from '@astrojs/sitemap'
import prefetch from '@astrojs/prefetch'
import org from 'astro-org'

// https://astro.build/config
export default defineConfig({
  site: 'https://venikx.com',
  integrations: [
    org({}),
    prefetch(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    sitemap(),
  ],
})
