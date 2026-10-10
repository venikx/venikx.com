import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

import { braindumpLoader } from './lib/braindump'

const post = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.optional(z.string()),
  draft: z.optional(z.coerce.boolean()),
  filetags: z.string().transform((f) => f.split(':').filter((f) => !!f)),
})

const orgDateToDate = (d: string): Date =>
  new Date(d.slice(1, -1).split(' ')[0] as string)

const blog = defineCollection({
  loader: glob({ pattern: '**/*.org', base: './src/content/blog' }),
  schema: post.extend({
    created: z.string().transform(orgDateToDate),
    modified: z.string().transform(orgDateToDate),
  }),
})

const interactive = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/interactive' }),
  schema: post.extend({
    created: z.coerce.date(),
  }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    socials: z.object({
      email: z.string(),
      github: z.string(),
      linkedin: z.string(),
    }),
  }),
})

const braindump = defineCollection({
  loader: braindumpLoader(),
  schema: z.object({
    title: z.string(),
    filetags: z.array(z.string()),
    created: z.string().transform(orgDateToDate).optional(),
    modified: z.string().transform(orgDateToDate).optional(),
    backlinks: z.array(reference('braindump')),
  }),
})

export const collections = { blog, interactive, authors, braindump }
