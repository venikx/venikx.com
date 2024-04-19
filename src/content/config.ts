import { z, defineCollection } from 'astro:content'

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
  type: 'content',
  schema: post.extend({
    created: z.string().transform(orgDateToDate),
    modified: z.string().transform(orgDateToDate),
  }),
})

const interactive = defineCollection({
  schema: post.extend({
    created: z.coerce.date(),
  }),
})

const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    socials: z.object({
      email: z.string(),
      github: z.string(),
      linkedin: z.string(),
    }),
  }),
})

export const collections = { blog, interactive, authors }
