import rss from '@astrojs/rss'
import type { AstroUserConfig } from 'astro/config'
import { getAllPosts } from '../lib/posts'

export const GET = async (context: AstroUserConfig) => {
  const allPosts = await getAllPosts()
  return rss({
    title: 'Kevin Blog',
    description: 'A humble Astronaut’s guide to the stars',
    site: context.site ?? 'https://venikx.com',
    items: allPosts.map((p) => {
      const categories = p.data.filetags.map((f) => `<category>${f}</category>`)

      return {
        title: p.data.title,
        pubDate: p.data.created,
        description: p.data.description,
        link: `/posts/${p.slug}/`,
        customData: `${categories}`,
      }
    }),
  })
}
