import type { APIRoute } from 'astro'
import { feed, FEEDS, postItems } from '../../lib/feed'

export const GET: APIRoute = async (context) =>
  feed(context, FEEDS.posts, await postItems())
