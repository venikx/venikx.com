import fs from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'
import type { Loader } from 'astro/loaders'
import type { Root as AstRoot } from 'hast'
import type { OrgData, OrgNode, PropertyDrawer } from 'uniorg'
import { visit } from 'unist-util-visit'
import { visitIds } from 'orgast-util-visit-ids'
import { VFile } from 'vfile'

import { createOrgProcessor } from './astro-org'
import { orgOptions } from './org-options'

// The notes live in their own repo (github.com/venikx/braindump), managed by
// denote. Only top-level notes are published, unless tagged `private`.
const braindumpDir = path.resolve(
  (process.env.BRAINDUMP_DIR ?? '~/org').replace(/^~(?=\/|$)/, os.homedir())
)

export const INDEX = 'index'

export const noteHref = (slug: string) =>
  slug === INDEX ? '/braindump/' : `/braindump/${slug}/`

// denote names files `<identifier>--<title>__<tags>.<ext>`, and can turn any
// file into a note. Those are published as is, when a note links to them.
const DENOTE = /^(\d{8}T\d{6})(?:--([^_.]+))?/
const FILE_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const isFile = (name: string) => path.extname(name) in FILE_TYPES

const isPublishable = (name: string) =>
  DENOTE.test(name) &&
  isFile(name) &&
  !name.includes('/') &&
  existsSync(path.join(braindumpDir, name))

export function braindump(): AstroIntegration {
  return {
    name: 'braindump',
    hooks: {
      // NOTE: Not an endpoint, as dynamic routes always get a trailing slash
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/braindump/files/', (req, res, next) => {
          const name = new URL(req.url ?? '', 'file:').pathname.slice(1)
          if (!isPublishable(name)) return next()

          res.setHeader('Content-Type', FILE_TYPES[path.extname(name)]!)
          createReadStream(path.join(braindumpDir, name))
            .on('error', next)
            .pipe(res)
        })
      },
      'astro:build:done': async ({ dir, logger }) => {
        const pages = new URL('braindump/', dir)
        const html = await Promise.all(
          (await fs.readdir(pages, { recursive: true }))
            .filter((page) => page.endsWith('.html'))
            .map((page) => fs.readFile(new URL(page, pages), 'utf-8'))
        )
        const files = new Set(
          html
            .flatMap((h) => [...h.matchAll(/"\/braindump\/files\/([^"]+)"/g)])
            .map((m) => m[1] ?? '')
            .filter(isPublishable)
        )

        await fs.mkdir(new URL('files/', pages), { recursive: true })
        for (const name of files) {
          await fs.copyFile(
            path.join(braindumpDir, name),
            new URL(`files/${name}`, pages)
          )
        }
        logger.info(`Copied ${files.size} files`)
      },
    },
  }
}

type Note = {
  slug: string
  title: string
  tags: string[]
  file: VFile
  hast: AstRoot
  frontmatter: Record<string, string | undefined>
  backlinks: Set<Note>
}

type Target = { href: string; note?: Note }

export function braindumpLoader(): Loader {
  const processor = createOrgProcessor({
    ...orgOptions,
    uniorgPlugins: [resolveAttachments],
  })

  return {
    name: 'braindump',
    async load({ store, parseData, logger, config }) {
      const names = await fs.readdir(braindumpDir).catch(() => {
        logger.warn(`No notes at ${braindumpDir}, set BRAINDUMP_DIR.`)
        return []
      })

      const targets = new Map<string, Target>()
      const entries: {
        name: string
        identifier?: string | undefined
        title?: string | undefined
      }[] = []
      for (const name of names) {
        const [, identifier, title] = name.match(DENOTE) ?? []
        if (name === 'index.org') {
          entries.push({ name })
        } else if (identifier && path.extname(name) === '.org') {
          entries.push({ name, identifier, title })
        } else if (identifier && isFile(name)) {
          targets.set(identifier, { href: `/braindump/files/${name}` })
        }
      }

      const notes: Note[] = []
      for (const { name, identifier, title } of entries) {
        const file = new VFile({
          path: path.join(braindumpDir, name),
          value: await fs.readFile(path.join(braindumpDir, name), 'utf-8'),
        })
        const hast = await processor.toHast(file)
        file.messages.forEach((m) => logger.warn(`${name}: ${m.reason}`))

        const frontmatter = file.data.astro?.frontmatter ?? {}
        const tags = String(frontmatter.filetags ?? '')
          .split(/[:\s]+/)
          .filter((t) => !!t)
        if (tags.includes('private')) {
          // NOTE: Exports of the note (pdf, ...) share its identifier
          if (identifier) targets.delete(identifier)
          continue
        }

        const slug = !identifier
          ? INDEX
          : [identifier.toLowerCase(), title].filter((s) => !!s).join('-')
        const note: Note = {
          slug,
          title: frontmatter.title || slug,
          tags,
          file,
          hast,
          frontmatter,
          backlinks: new Set(),
        }
        notes.push(note)
        if (identifier) targets.set(identifier, { href: noteHref(slug), note })
      }

      for (const note of notes) {
        rewriteLinks(note.hast, (href) => {
          const target = resolveLink(targets, href)
          if (target?.note && target.note !== note) {
            target.note.backlinks.add(note)
          }
          return target
        })
      }

      const root = fileURLToPath(config.root)
      store.clear()
      for (const note of notes) {
        const { html, imagePaths } = await processor.toHtml(
          note.hast,
          note.file
        )
        store.set({
          id: note.slug,
          data: await parseData({
            id: note.slug,
            data: {
              title: note.title,
              filetags: note.tags,
              created: note.frontmatter.date,
              modified: note.frontmatter.modified,
              backlinks: [...note.backlinks].map((n) => n.slug),
            },
          }),
          filePath: path.relative(root, note.file.path),
          rendered: { html, metadata: { imagePaths } },
          assetImports: imagePaths,
        })
      }
      logger.info(`Loaded ${notes.length} notes from ${braindumpDir}`)
    },
  }
}

// Heading links look like `denote:<identifier>::#<custom-id>`
function resolveLink(
  targets: Map<string, Target>,
  href: string
): Target | undefined {
  if (!href.startsWith('denote:')) return

  const [identifier = '', search = ''] = href.slice(7).split('::')
  const target = targets.get(identifier)
  if (target?.note && search.startsWith('#')) {
    return { ...target, href: target.href + search }
  }
  return target
}

// Links that can't be followed on the web (private notes, local files) only
// keep their description.
function rewriteLinks(
  tree: AstRoot,
  resolve: (href: string) => Target | undefined
) {
  visit(tree, 'element', (node, index, parent) => {
    const href = node.properties.href
    if (node.tagName !== 'a' || typeof href !== 'string') return
    if (!/^(denote|file):/.test(href) || !parent || index === undefined) return

    const target = resolve(href)
    if (target) {
      node.properties.href = target.href
      return
    }
    parent.children.splice(index, 1, ...node.children)
    return index
  })
}

// org-attach stores attachments under `data/<2 chars of ID>/<rest of ID>/` of
// the closest heading with an ID, falling back to any ID in the note.
function resolveAttachments() {
  return function (tree: OrgData, file: VFile) {
    const dir = path.dirname(file.path)
    const noteIds: string[] = []
    visitIds(tree, (id) => {
      noteIds.push(id)
    })
    walk(tree, [])

    function walk(node: OrgData | OrgNode, ids: string[]) {
      if (!('children' in node)) return

      const children = node.children as OrgNode[]
      const drawer = children.find(
        (c): c is PropertyDrawer => c.type === 'property-drawer'
      )
      const id = drawer?.children.find((p) => p.key === 'ID')?.value
      const scope = id ? [id, ...ids] : ids

      for (const child of children) {
        if (child.type === 'link' && child.rawLink.startsWith('attachment:')) {
          const name = child.rawLink.slice('attachment:'.length)
          const found = [...scope, ...noteIds]
            .map((id) => `./data/${id.slice(0, 2)}/${id.slice(2)}/${name}`)
            .find((p) => existsSync(path.join(dir, p)))

          if (found) {
            child.linkType = 'file'
            child.rawLink = found
            child.path = found
          } else {
            file.message(`attachment "${name}" not found`)
          }
        }
        walk(child, scope)
      }
    }
  }
}
