const pages = import.meta.glob<true, '', any>(['./pages/posts/**/*.org'], {
  eager: true,
})

export const allPages = Object.values(pages).filter(
  (p) => process.env.NODE_ENV === 'development' || !('draft' in p.frontmatter)
)
