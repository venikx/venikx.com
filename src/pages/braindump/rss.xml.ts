import type { APIRoute } from 'astro'
import { braindumpItems, feed, FEEDS } from '../../lib/feed'

export const GET: APIRoute = async (context) =>
  feed(context, FEEDS.braindump, await braindumpItems())
