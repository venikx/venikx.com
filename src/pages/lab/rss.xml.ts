import type { APIRoute } from 'astro'
import { experimentItems, feed, FEEDS } from '../../lib/feed'

export const GET: APIRoute = (context) =>
  feed(context, FEEDS.experiments, experimentItems())
