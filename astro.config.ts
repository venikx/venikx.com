//import { defineConfig, sharpImageService } from 'astro/config'
import { defineConfig, passthroughImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import shiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import rehypeShiftHeading, {
  type Options as RehypeShiftOptions,
} from 'rehype-shift-heading'
import icon from 'astro-icon'
import { h } from 'hastscript'

import org from './src/lib/astro-org'
import { replaceOrgLinks } from './src/lib/plugins'

export default defineConfig({
  trailingSlash: 'always', // if path doesn't resolve it shows up in dev
  prefetch: true,
  site: 'https://venikx.com',
  image: {
    //service: sharpImageService(),
    service: passthroughImageService(),
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
      uniorgPlugins: [replaceOrgLinks],
      rehypePlugins: [
        [rehypeShiftHeading, { shift: 1 } as RehypeShiftOptions],
        [shiki, { theme: 'synthwave-84' } as RehypeShikiOptions],
      ],
      uniorgRehypeOptions: {
        handlers: {
          'example-block': (org) => {
            return h('pre.example', [{ type: 'text', value: org.value }])
          },
          'src-block': function (org) {
            const snippet = h(
              'pre.src-block',
              {},
              h(
                'code',
                {
                  className: org.language
                    ? `language-${org.language}`
                    : undefined,
                },
                org.value
              )
            )

            const captions: any[] = Array.isArray(org.affiliated.CAPTION)
              ? org.affiliated.CAPTION.flat()
              : []

            if (captions.length <= 0) {
              return snippet
            } else {
              const figcaption = h('figcaption', captions[0]!.value)
              return h('figure', [snippet, figcaption])
            }
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
