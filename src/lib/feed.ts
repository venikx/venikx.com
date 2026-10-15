import rss, { type RSSFeedItem } from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

import { INDEX, noteHref } from './braindump'
import { getAllExperiments } from './experiments'
import { getAllPosts } from './posts'

export type Feed = { href: string; title: string; description: string }

export const FEEDS = {
  main: {
    href: '/rss.xml',
    title: "Kevin's Hackerspace",
    description: 'Posts and experiments by Kevin De Baerdemaeker.',
  },
  posts: {
    href: '/posts/rss.xml',
    title: "Kevin's Hackerspace: Posts",
    description:
      'Curated deep dives, for when I really want to understand or share a topic.',
  },
  experiments: {
    href: '/experiments/rss.xml',
    title: "Kevin's Hackerspace: Experiments",
    description:
      'Self-contained toys. Mostly canvas and digital art, but anything goes.',
  },
  braindump: {
    href: '/braindump/rss.xml',
    title: "Kevin's Hackerspace: Braindump",
    description: "New notes in Kevin's braindump, rough and always growing.",
  },
} satisfies Record<string, Feed>

export const postItems = async (): Promise<RSSFeedItem[]> =>
  (await getAllPosts()).map((p) => ({
    title: p.data.title,
    description: p.data.description,
    pubDate: p.data.created,
    link: `/posts/${p.id}/`,
    categories: p.data.filetags,
  }))

export const experimentItems = (): RSSFeedItem[] =>
  getAllExperiments().map((e) => ({
    title: e.data.title,
    description: e.data.description,
    pubDate: e.data.created,
    link: `/experiments/${e.id}/`,
  }))

export const braindumpItems = async (): Promise<RSSFeedItem[]> =>
  (await getCollection('braindump', (n) => n.id !== INDEX)).map((n) => ({
    title: n.data.title,
    pubDate: n.data.created,
    link: noteHref(n.id),
    categories: n.data.filetags,
  }))

export const feed = (
  context: APIContext,
  { title, description }: Feed,
  items: RSSFeedItem[]
) =>
  rss({
    title,
    description,
    site: context.site ?? 'https://venikx.com',
    items: items.toSorted(
      (a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)
    ),
  })
