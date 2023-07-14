import rss from '@astrojs/rss'
import type { AstroUserConfig } from 'astro/config'
import { allPages } from '../utils'

export const get = async (context: AstroUserConfig) => {
  return rss({
    title: 'Kevin Blog',
    description: 'A humble Astronaut’s guide to the stars',
    site: context.site ?? 'https://venikx.com',
    items: allPages.map((p) => {
      return {
        title: p.frontmatter.title ?? '',
        pubDate: p.frontmatter.created ?? '',
        description: p.frontmatter.description ?? '',
        link: `/posts/${p.frontmatter.slug}/`,
      }
    }),
  })
}
