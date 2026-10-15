import type { APIRoute } from 'astro'
import { experimentItems, feed, FEEDS, postItems } from '../lib/feed'

export const GET: APIRoute = async (context) =>
  feed(context, FEEDS.main, [...(await postItems()), ...experimentItems()])
