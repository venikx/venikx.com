module.exports = {
  pathPrefix: `/`,
  siteMetadata: {
    siteUrl: `https://venikx.com`,
    title: `Kevin Rangel | Freelance Web Developer`,
    description: `Kevin Rangel is a freelance web developer who enjoys coding in Javascript, drawing pixel art, gaming and aspires to become a game developer when he retires. Kevin is a former Web Engineer at Epic Games.`,
    author: `Kevin Rangel`,
    twitter: "_venikx",
    me: {
      name: `Kevin Rangel`,
      company: `Babo Digital Oy`,
      email: `code@venikx.com`,
      location: `Helsinki, Finland`,
    },
    social: [
      { name: "twitter", url: `https://twitter.com/_venikx` },
      { name: "github", url: `https://github.com/venikx` },
      { name: "email", url: `mailto:code@venikx.com` },
      // { name: "gitlab", url: `https://gitlab.com/venikx` },
      // { name: 'linkedin', url: `https://www.linkedin.com/in/venikx/` },
      // { name: 'mastodon', url: `https://mastodon.social/@venikx` },
      // { name: 'stack_overflow', url: `https://stackoverflow.com/users/14380122/venikx` },
      // { name: 'dev_to', url: `https://dev.to/venikx` },
    ],
  },
  plugins: [
    // `gatsby-plugin-feed`,
    {
      resolve: `gatsby-theme-blorg`,
      options: {
        // contentPath: 'content',
        // filter: () => true,
        // pagination: 5,
        // columns: 2,
        // indexPath: '/',
        // imageMaxWidth: 1380,
        // categoryIndexPath: category => `/${category}`,
        // tagIndexPath: tag => `/:${tag}:`,
        // slug: ({ export_file_name }) => `/${export_file_name}`,
        // postRedirect: () => [],
      },
    },
  ],
}
