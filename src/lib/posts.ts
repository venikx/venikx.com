import { getCollection } from 'astro:content'

export async function getAllPosts() {
  const allBlogPosts = await getCollection('blog')
  const allInteractivePosts = await getCollection('interactive')

  return [...allBlogPosts, ...allInteractivePosts].filter(
    (p) => process.env.NODE_ENV === 'development' || !p.data.draft
  )
}
