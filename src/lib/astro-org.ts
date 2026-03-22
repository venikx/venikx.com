import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

import type { AstroIntegration, ContentEntryType, HookParameters } from 'astro'
import type { Root as AstRoot } from 'hast'
import { visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { unified, type PluggableList } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

import uniorg from 'uniorg-parse'
import uniorg2rehype, {
  type Options as UniorgRehypeOptions,
} from 'uniorg-rehype'
import { extractKeywords } from 'uniorg-extract-keywords'
import { uniorgSlug } from 'uniorg-slug'
import { visitIds } from 'orgast-util-visit-ids'
import type { OrgData } from 'uniorg'

export type Options = {
  uniorgPlugins?: PluggableList
  uniorgRehypeOptions?: UniorgRehypeOptions
  rehypePlugins?: PluggableList
}

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  // NOTE: `addPageExtension` and `contentEntryType` are not a public APIs
  // Add type defs here
  addPageExtension: (extension: string) => void
  addContentEntryType: (contentEntryType: ContentEntryType) => void
}

export default function org(options: Options = {}): AstroIntegration {
  const uniorgPlugins: PluggableList = [
    initFrontmatter,
    [extractKeywords, { name: 'keywords' }],
    keywordsToFrontmatter,
    uniorgSlug,
    saveIds,
    ...(options.uniorgPlugins ?? []),
  ]

  const rehypePlugins: PluggableList = [...(options.rehypePlugins ?? [])]

  return {
    name: 'astro-org',
    hooks: {
      'astro:config:setup': async (params) => {
        const { addContentEntryType, addPageExtension } =
          params as SetupHookParams

        const uniorgToHast = unified()
          .use(uniorg)
          .use(uniorgPlugins)
          .use(uniorg2rehype, options.uniorgRehypeOptions ?? {})

        const htmlToHtml = unified()
          .use(rehypeParse)
          .use(rehypePlugins)
          .use(rehypeStringify)

        addPageExtension('.org')
        addContentEntryType({
          extensions: ['.org'],
          async getEntryInfo({ fileUrl, contents }) {
            const f = new VFile({ path: fileUrl, value: contents })

            await uniorgToHast.run(uniorgToHast.parse(f) as OrgData, f)
            const frontmatter = f.data.astro!.frontmatter

            return {
              data: {
                ...frontmatter,
                metadata: f.data.astro,
              },
              body: contents,
              // NOTE: Astro typing requires slug to be a string, however I'm
              // pretty sure that mdx integration returns undefined if slug is
              // not set in frontmatter.
              slug: frontmatter?.slug as string,
              rawData: contents,
            }
          },
          async getRenderFunction() {
            return async function renderToString(entry) {
              const filePath = entry.filePath
              const fileUrl = filePath ? pathToFileURL(filePath) : undefined

              const f = new VFile({
                path: fileUrl,
                value: entry.body,
              })
              const hast = await uniorgToHast.run(
                uniorgToHast.parse(f) as OrgData,
                f
              )

              const localImagePaths = collectLocalImagePaths(hast)
              markImagesForOptimization(hast)

              // TODO(Kevin): Typescript mismatch about the same packag?
              await htmlToHtml.run(hast)
              const html = htmlToHtml.stringify(hast as any, f)

              return {
                html,
                metadata: {
                  imagePaths: localImagePaths,
                  headings: [],
                  frontmatter: {},
                },
              }
            }
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

function initFrontmatter() {
  return transformer

  function transformer(_tree: unknown, file: VFile) {
    if (!file.data.astro) {
      file.data.astro = { frontmatter: {} }
    }
  }
}

function keywordsToFrontmatter() {
  return transformer

  function transformer(_tree: unknown, file: any) {
    file.data.astro.frontmatter = {
      ...file.data.astro.frontmatter,
      ...file.data.keywords,
    }
  }
}

function saveIds() {
  return transformer

  function transformer(tree: OrgData, file: any) {
    const astro = file.data.astro
    const ids = astro.ids || (astro.ids = {})

    visitIds(tree, (id, node) => {
      if (node.type === 'org-data') {
        ids['id:' + id] = ''
      } else if (node.type === 'section') {
        const headline = node.children[0] as any
        const data: any = (headline.data = headline.data || {})
        if (!data?.hProperties?.id) {
          // NOTE: The headline doesn't have an html id assigned.
          //
          // Assign an html id property based on org id property, so the links
          // are not broken.
          data.hProperties = data.hProperties || {}
          data.hProperties.id = id
        }

        ids['id:' + id] = '#' + data?.hProperties?.id
      }
    })
  }
}

function isLocalImage(src: string): boolean {
  try {
    new URL(src)
    return false
  } catch {
    return !src.startsWith('/')
  }
}

function collectLocalImagePaths(tree: AstRoot): string[] {
  const paths: string[] = []

  visit(tree, 'element', (node) => {
    if (
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string' &&
      isLocalImage(node.properties.src)
    ) {
      paths.push(decodeURI(node.properties.src))
    }
  })

  return paths
}

// Replaces <img src="./foo.png" alt="bar"> with
// <img __ASTRO_IMAGE_='{"src":"./foo.png","alt":"bar","index":0}'>
// so Astro's content layer image pipeline picks them up.
function markImagesForOptimization(tree: AstRoot) {
  const occurrenceMap = new Map<string, number>()

  visit(tree, 'element', (node) => {
    if (
      node.tagName === 'img' &&
      typeof node.properties?.src === 'string' &&
      isLocalImage(node.properties.src)
    ) {
      const src = decodeURI(node.properties.src)
      const index = occurrenceMap.get(src) || 0
      occurrenceMap.set(src, index + 1)

      const imageProps = { ...node.properties, src, index }
      node.properties = {
        __ASTRO_IMAGE_: JSON.stringify(imageProps),
      }
    }
  })
}
