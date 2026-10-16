import shiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import rehypeShiftHeading, {
  type Options as RehypeShiftOptions,
} from 'rehype-shift-heading'
import { h } from 'hastscript'
import type { Paragraph, WithAffiliatedKeywords } from 'uniorg'

import type { Options } from './astro-org'

export const orgOptions: Options = {
  rehypePlugins: [
    [rehypeShiftHeading, { shift: 1 } as RehypeShiftOptions],
    [
      shiki,
      {
        theme: 'synthwave-84',
        // NOTE: Bump colors below 4.5:1 contrast on the #262335 background
        colorReplacements: { '#fe4450': '#ff5562', '#d50': '#f26a1b' },
        // NOTE: Only load the languages in use, unknown ones stay plain
        langs: [],
        lazy: true,
        onError: () => {},
      } as RehypeShikiOptions,
    ],
  ],
  uniorgRehypeOptions: {
    handlers: {
      paragraph: function (org) {
        // NOTE: uniorg's Paragraph type omits the affiliated keywords the
        // parser attaches to it
        const { affiliated } = org as Paragraph & WithAffiliatedKeywords
        const caption = [affiliated.CAPTION ?? []]
          .flat(3)
          .filter((n) => typeof n !== 'string')
        if (caption.length <= 0) return null

        const children = this.toHast(org.children, org)
        const hasImage = children.some(
          (c) => c.type === 'element' && c.tagName === 'img'
        )
        if (!hasImage) return null

        return h('figure', [
          ...children,
          h('figcaption', this.toHast(caption, org)),
        ])
      },
      'example-block': (org) => {
        return h('pre.example', [{ type: 'text', value: org.value }])
      },
      'src-block': function (org) {
        const snippet = h(
          'pre.src-block',
          {},
          h(
            'code',
            {
              className: org.language ? `language-${org.language}` : undefined,
            },
            org.value
          )
        )
        const captions: any[] = Array.isArray(org.affiliated.CAPTION)
          ? org.affiliated.CAPTION.flat()
          : []
        if (captions.length <= 0) {
          return snippet
        } else {
          const figcaption = h('figcaption', captions[0]!.value)
          return h('figure', [snippet, figcaption])
        }
      },
    },
  },
}
