import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Rollup } from 'vite'
import type { AstroConfig, AstroIntegration, ContentEntryType } from 'astro'
import { emitImageMetadata } from 'astro/assets/utils'
import { unified, type PluggableList } from 'unified'
import { visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import uniorg from 'uniorg-parse'
import uniorg2rehype, {
  type Options as UniorgRehypeOptions,
} from 'uniorg-rehype'
import rehypeStringify from 'rehype-stringify'
import type { Root as AstRoot, Element as AstElement } from 'hast'

export type OrgOptions = {
  uniorgPlugins?: PluggableList
  uniorgRehypeOptions?: UniorgRehypeOptions
  rehypePlugins?: PluggableList
}

export default function astroOrg(options: OrgOptions = {}): AstroIntegration {
  return {
    name: 'astro-org',
    hooks: {
      'astro:config:setup': async (params) => {
        const { addPageExtension, addContentEntryType, config } =
          params as unknown as {
            addPageExtension: (ext: string) => void
            addContentEntryType: (type: ContentEntryType) => void
            config: AstroConfig
          }

        const processor = unified()
          .use(uniorg)
          .use(options.uniorgPlugins ?? [])
          .use(uniorg2rehype, options.uniorgRehypeOptions ?? {})
          .use(options.rehypePlugins ?? [])
          .use(rehypeStringify)

        addPageExtension('.org')
        addContentEntryType({
          extensions: ['.org'],
          async getEntryInfo({ contents }) {
            // No custom frontmatter extraction needed—Astro handles data
            return {
              data: {},
              body: contents,
              slug: undefined as unknown as string,
              rawData: contents,
            }
          },
          async getRenderModule({ fileUrl, contents }) {
            const pluginContext = this
            const filePath = fileURLToPath(fileUrl)

            // Parse Org → HAST first (to optimize images)
            const file = new VFile({ path: fileUrl, value: contents })
            const hast = await processor.run(processor.parse(file) as any, file)

            // Optimize images inside the Org document
            await optimizeImages(hast, {
              pluginContext,
              filePath,
              astroConfig: config,
            })

            // Stringify final HTML
            const htmlStr = processor.stringify(hast)

            const code = `
import { jsx, Fragment } from 'astro/jsx-runtime';
const html = ${JSON.stringify(htmlStr)};
export async function Content() {
  return jsx(Fragment, { 'set:html': html });
}
export default Content;
`
            return { code }
          },
          contentModuleTypes: fs.readFileSync(
            new URL('./content-module-types.d.ts', import.meta.url),
            'utf-8'
          ),
          handlePropagation: true,
        })
      },
    },
  }
}

/* --- Helpers --- */
function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function shouldOptimizeImage(src: string): boolean {
  // Optimize anything that is NOT external and not absolute `/public`
  return !isValidUrl(src) && !src.startsWith('/')
}

async function optimizeImages(
  tree: AstRoot,
  ctx: {
    pluginContext: Rollup.PluginContext
    filePath: string
    astroConfig: AstroConfig
  }
) {
  const images: AstElement[] = []
  visit(tree, 'element', (node) => {
    if (
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string' &&
      shouldOptimizeImage(node.properties.src)
    ) {
      images.push(node)
    }
  })

  for (const node of images) {
    const src = node.properties.src as string
    const resolved = await ctx.pluginContext.resolve(src, ctx.filePath)

    if (resolved?.id && fs.existsSync(new URL(resolved.id, 'file://'))) {
      const metadata = await emitImageMetadata(
        resolved.id,
        ctx.pluginContext.emitFile
      )
      if (metadata?.src) node.properties.src = metadata.src
    }
  }
}
