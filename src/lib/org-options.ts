import shiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import rehypeShiftHeading, {
  type Options as RehypeShiftOptions,
} from 'rehype-shift-heading'
import { h } from 'hastscript'

import type { Options } from './astro-org'

export const orgOptions: Options = {
  rehypePlugins: [
    [rehypeShiftHeading, { shift: 1 } as RehypeShiftOptions],
    [
      shiki,
      {
        theme: 'synthwave-84',
        // NOTE: Only load the languages in use, unknown ones stay plain
        langs: [],
        lazy: true,
        onError: () => {},
      } as RehypeShikiOptions,
    ],
  ],
  uniorgRehypeOptions: {
    handlers: {
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
