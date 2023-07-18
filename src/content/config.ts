import { z, defineCollection } from 'astro:content'

const post = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.optional(z.string()),
  draft: z.optional(z.string()),
})

const blog = defineCollection({
  type: 'content',
  schema: post.extend({
    created: z
      .string()
      .datetime()
      .transform((d) => new Date(d)),
  }),
})

const interactive = defineCollection({
  schema: post.extend({
    created: z.date(),
    draft: z.optional(z.boolean()),
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
