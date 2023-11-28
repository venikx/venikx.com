import { defineConfig, sharpImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import prefetch from '@astrojs/prefetch'
import org from '@orgajs/astro'
import tailwind from '@astrojs/tailwind'
import { demoteHeadings } from './src/lib/plugins'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://venikx.com',
  image: {
    service: sharpImageService(),
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
  integrations: [
    prefetch(),
    mdx(),
    org({
      rehypePlugins: [demoteHeadings],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
})
