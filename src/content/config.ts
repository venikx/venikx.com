import { z, defineCollection } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    //created: z.string(),
    //description: z.string(),
    //cover: z.string(),
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

export const collections = { blog, authors }
