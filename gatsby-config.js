module.exports = {
  siteMetadata: {
    title: `Kevin Rangel | Freelance Web Developer`,
    author: {
      name: `Kevin Rangel`,
      company: `Babo Digital Oy`,
      email: `me@venikx.com`,
      location: `Helsinki, Finland`,
    },
    description: `Kevin Rangel is a freelance web developer who enjoys coding in Javascript, drawing pixel art, gaming and aspires to become a game developer when he retires. Kevin is a former Web Engineer at Epic Games.`,
    siteUrl: `https://kevinrangel.com`,
    social: {
      twitter: `https://twitter.com/_venikx`,
      github: `https://github.com/venikx`,
      gitlab: `https://gitlab.com/venikx`,
      linkedin: `https://www.linkedin.com/in/venikx/`,
      mastodon: `https://mastodon.social/@venikx`,
      stack_overflow: `https://stackoverflow.com/users/14380122/venikx`,
      dev_to: `https://dev.to/venikx`,
    },
  },
  plugins: [
    `gatsby-transformer-orga`,
    // Why is there a separation between the two contents
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content-org`,
        name: `org`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Kevin Rangel's Blog`,
        short_name: `KR Blog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/profile-pic.jpg`,
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
