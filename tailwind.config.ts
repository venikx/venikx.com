import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typographyPlugin from '@tailwindcss/typography'
import type { ThemeConfig } from 'tailwindcss/types/config'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.sans],
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        serif: ['IBM Plex Serif', ...defaultTheme.fontFamily.sans],
      },
      typography: ({ theme }: ThemeConfig) => ({
        hackerman: {
          css: {
            '--tw-prose-body': theme('colors.pink[200]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-lead': theme('colors.pink[300]'),
            '--tw-prose-links': theme('colors.white'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-counters': theme('colors.pink[400]'),
            '--tw-prose-bullets': theme('colors.pink[600]'),
            '--tw-prose-hr': theme('colors.pink[700]'),
            '--tw-prose-quotes': theme('colors.pink[100]'),
            '--tw-prose-quote-borders': theme('colors.pink[700]'),
            '--tw-prose-captions': theme('colors.pink[400]'),
            '--tw-prose-code': theme('colors.white'),
            '--tw-prose-pre-code': theme('colors.pink[300]'),
            '--tw-prose-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-th-borders': theme('colors.pink[600]'),
            '--tw-prose-td-borders': theme('colors.pink[700]'),
            '--tw-prose-invert-body': theme('colors.pink[800]'),
            '--tw-prose-invert-headings': theme('colors.pink[900]'),
            '--tw-prose-invert-lead': theme('colors.pink[700]'),
            '--tw-prose-invert-links': theme('colors.pink[900]'),
            '--tw-prose-invert-bold': theme('colors.pink[900]'),
            '--tw-prose-invert-counters': theme('colors.pink[600]'),
            '--tw-prose-invert-bullets': theme('colors.pink[400]'),
            '--tw-prose-invert-hr': theme('colors.pink[300]'),
            '--tw-prose-invert-quotes': theme('colors.pink[900]'),
            '--tw-prose-invert-quote-borders': theme('colors.pink[300]'),
            '--tw-prose-invert-captions': theme('colors.pink[700]'),
            '--tw-prose-invert-code': theme('colors.pink[900]'),
            '--tw-prose-invert-pre-code': theme('colors.pink[100]'),
            '--tw-prose-invert-pre-bg': theme('colors.pink[900]'),
            '--tw-prose-invert-th-borders': theme('colors.pink[300]'),
            '--tw-prose-invert-td-borders': theme('colors.pink[200]'),
          },
        },
      }),
    },
  },
  plugins: [typographyPlugin],
} satisfies Config
