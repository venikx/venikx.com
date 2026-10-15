import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'

import org from './src/lib/astro-org'
import { orgOptions } from './src/lib/org-options'
import { replaceOrgLinks } from './src/lib/plugins'
import { braindump } from './src/lib/braindump'
import { lastmod } from './src/lib/lastmod'

const modified = lastmod()

export default defineConfig({
  trailingSlash: 'always',
  prefetch: true,
  site: 'https://venikx.com',
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
  integrations: [
    mdx(),
    icon({
      include: {
        jam: ['menu', 'close'],
        carbon: ['logo-github', 'logo-linkedin', 'email', 'rss'],
      },
    }),
    org({ ...orgOptions, uniorgPlugins: [replaceOrgLinks] }),
    braindump(),
    modified.integration,
    sitemap({ serialize: modified.serialize }),
  ],
})
