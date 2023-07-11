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
        link: p.frontmatter.slug ?? '',
        title: p.frontmatter.icon ?? '' + ' ' + p.frontmatter.title,
        pubDate: p.frontmatter.date ?? '',
        description: p.frontmatter.description ?? '',
      }
    }),
  })
}
