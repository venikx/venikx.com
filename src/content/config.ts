import { z, defineCollection } from 'astro:content'

const post = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.optional(z.string()),
  draft: z.optional(z.coerce.boolean()),
  filetags: z
    .string()
    .default('')
    .transform((f) => f.split(':').filter((f) => !!f)),
  created: z.coerce.date(),
})

const blog = defineCollection({
  type: 'content',
  schema: post.extend({}),
})

const interactive = defineCollection({
  schema: post.extend({}),
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
