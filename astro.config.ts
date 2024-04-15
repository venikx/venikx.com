import { defineConfig, sharpImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { h } from 'hastscript'
import org from './src/lib/astro-org'
import mdx from '@astrojs/mdx'
import rehypeShiftHeading from 'rehype-shift-heading'

export default defineConfig({
  prefetch: true,
  site: 'https://venikx.com',
  image: {
    service: sharpImageService(),
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
  integrations: [
    mdx(),
    icon({
      include: {
        jam: ['menu', 'close'],
        carbon: ['logo-github', 'logo-linkedin', 'email'],
      },
    }),
    org({
      rehypePlugins: [[rehypeShiftHeading, { shift: 1 }]],
      uniorgRehypeOptions: {
        handlers: {
          'example-block': (org) => {
            return h('pre.example', [{ type: 'text', value: org.value }])
          },
        },
      },
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
})
