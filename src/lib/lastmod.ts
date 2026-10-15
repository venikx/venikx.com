import fs from 'node:fs/promises'

import type { SitemapItem } from '@astrojs/sitemap'
import type { AstroIntegration } from 'astro'

// NOTE: Must be listed before the sitemap, as hooks run in order.
export function lastmod() {
  const dates = new Map<string, string>()

  const integration: AstroIntegration = {
    name: 'lastmod',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const pages = (await fs.readdir(dir, { recursive: true })).filter(
          (page) => page.endsWith('index.html')
        )
        await Promise.all(
          pages.map(async (page) => {
            const html = await fs.readFile(new URL(page, dir), 'utf-8')
            const date = html.match(
              /<meta property="article:modified_time" content="([^"]+)"/
            )?.[1]
            if (date) dates.set(`/${page.replace(/index\.html$/, '')}`, date)
          })
        )
      },
    },
  }

  const serialize = (item: SitemapItem): SitemapItem => {
    const date = dates.get(new URL(item.url).pathname)
    return date ? { ...item, lastmod: date } : item
  }

  return { integration, serialize }
}
