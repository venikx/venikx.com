import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.sans],
        sans: ['IBM Plex Sans Condensed', ...defaultTheme.fontFamily.sans],
        serif: ['IBM Plex Serif', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
