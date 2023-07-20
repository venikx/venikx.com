import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typographyPlugin from '@tailwindcss/typography'
import tw3DPlugin from 'tailwindcss-3d'
import type { ThemeConfig } from 'tailwindcss/types/config'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Iosevka', ...defaultTheme.fontFamily.mono],
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        serif: ['IBM Plex Serif', ...defaultTheme.fontFamily.serif],
      },
      typography: ({ theme }: ThemeConfig) => ({
        hackerman: {
          css: {
            '--tw-prose-body': theme('colors.zinc[900]'),
            '--tw-prose-headings': theme('colors.zinc[900]'),
            //'--tw-prose-lead': theme('colors.yellow[500]'), // ?
            '--tw-prose-links': theme('colors.pink[700]'),
            '--tw-prose-bold': theme('colors.pink[700]'),
            //'--tw-prose-counters': theme('colors.yellow[500]'),
            //'--tw-prose-bullets': theme('colors.yellow[500]'),
            //'--tw-prose-hr': theme('colors.pink[700]'),
            '--tw-prose-quotes': theme('colors.pink[700]'),
            '--tw-prose-quote-borders': theme('colors.pink[700]'),
            //'--tw-prose-captions': theme('colors.pink[700]'),
            '--tw-prose-code': theme('colors.pink[700]'),
            '--tw-prose-pre-code': theme('colors.zinc[950]'),
            '--tw-prose-pre-bg': theme('colors.purple[100]'),
            //'--tw-prose-th-borders': theme('colors.yellow[500]'),
            //'--tw-prose-td-borders': theme('colors.yellow[500]'),
            //'--tw-prose-invert-body': theme('colors.pink[200]'),
            //'--tw-prose-invert-headings': theme('colors.white'),
            //'--tw-prose-invert-lead': theme('colors.pink[300]'),
            //'--tw-prose-invert-links': theme('colors.white'),
            //'--tw-prose-invert-bold': theme('colors.white'),
            //'--tw-prose-invert-counters': theme('colors.pink[400]'),
            //'--tw-prose-invert-bullets': theme('colors.pink[600]'),
            //'--tw-prose-invert-hr': theme('colors.pink[700]'),
            //'--tw-prose-invert-quotes': theme('colors.pink[100]'),
            //'--tw-prose-invert-quote-borders': theme('colors.pink[700]'),
            //'--tw-prose-invert-captions': theme('colors.pink[400]'),
            //'--tw-prose-invert-code': theme('colors.white'),
            //'--tw-prose-invert-pre-code': theme('colors.pink[300]'),
            //'--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            //'--tw-prose-invert-th-borders': theme('colors.pink[600]'),
            //'--tw-prose-invert-td-borders': theme('colors.pink[700]'),
          },
        },
      }),
    },
  },
  plugins: [typographyPlugin, tw3DPlugin as any],
} satisfies Config
