import { z, defineCollection } from 'astro:content'

const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
  }),
})

export const collections = { authors }
