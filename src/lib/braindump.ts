import fs from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'
import type { Loader } from 'astro/loaders'
import type { Element, Root as AstRoot } from 'hast'
import type { OrgData, OrgNode, PropertyDrawer } from 'uniorg'
import { visit } from 'unist-util-visit'
import { visitIds } from 'orgast-util-visit-ids'
import { VFile } from 'vfile'

import { createOrgProcessor } from './astro-org'
import { orgOptions } from './org-options'

// The notes live in their own repo (github.com/venikx/braindump) and are
// managed by denote. Only the top-level notes are published, sub-directories
// (gtd, work, collections, ...) and notes tagged `private` are skipped.
const braindumpDir = path.resolve(
  expandHome(process.env.BRAINDUMP_DIR ?? '~/org')
)

// `index.org` is rendered on the landing page, instead of on its own page
export const INDEX = 'index'

export const noteHref = (slug: string) =>
  slug === INDEX ? '/braindump/' : `/braindump/${slug}/`

// denote names every note `<identifier>--<title>__<tag1>_<tag2>.<ext>`
function parseDenoteName(name: string) {
  const [, identifier, title, tags] =
    name.match(/^(\d{8}T\d{6})(?:==[^-.]*)?(?:--([^_.]+))?(?:__([^.]+))?\./) ??
    []
  if (!identifier) return
  return { identifier, title, tags: tags?.split('_') ?? [] }
}

async function readDenoteNames() {
  if (!existsSync(braindumpDir)) return []

  return (await fs.readdir(braindumpDir)).flatMap((name) => {
    const denote = parseDenoteName(name)
    return denote && !denote.tags.includes('private')
      ? [{ name, ...denote }]
      : []
  })
}

// denote can turn any file into a note (pdfs, tex, ...), those are served as
// is.
async function braindumpFiles() {
  return (await readDenoteNames())
    .filter(({ name }) => !name.endsWith('.org'))
    .map((file) => ({
      ...file,
      path: path.join(braindumpDir, file.name),
      title: file.title?.replaceAll('-', ' ') ?? file.name,
    }))
}

// NOTE: Not an Astro endpoint, as dynamic routes always get the
// `trailingSlash` treatment, which breaks `/braindump/files/foo.pdf` in dev.
export function braindump(): AstroIntegration {
  return {
    name: 'braindump',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/braindump/files/', async (req, res, next) => {
          // denote file names are url safe, so no decoding needed
          const name = req.url?.slice(1)
          const file = (await braindumpFiles()).find((f) => f.name === name)
          if (!file) return next()
          createReadStream(file.path).pipe(res)
        })
      },
      'astro:build:done': async ({ dir, logger }) => {
        const out = new URL('braindump/files/', dir)
        const files = await braindumpFiles()
        await fs.mkdir(out, { recursive: true })
        for (const file of files) {
          await fs.copyFile(file.path, new URL(file.name, out))
        }
        logger.info(`Copied ${files.length} files to ${fileURLToPath(out)}`)
      },
    },
  }
}

type Note = {
  slug: string
  identifier: string | undefined
  title: string
  tags: string[]
  file: VFile
  hast: AstRoot
  frontmatter: Record<string, string | undefined>
}

type Target = { href: string; title: string; note?: Note }

export function braindumpLoader(): Loader {
  const processor = createOrgProcessor({
    ...orgOptions,
    uniorgPlugins: [resolveAttachments],
  })

  return {
    name: 'braindump',
    async load({ store, parseData, generateDigest, logger, config, watcher }) {
      async function readNotes(): Promise<Note[]> {
        if (!existsSync(braindumpDir)) {
          logger.warn(`No notes at ${braindumpDir}, set BRAINDUMP_DIR.`)
          return []
        }

        // NOTE: `archive` is taken by src/pages/braindump/archive.astro
        const slugs = new Set<string>([INDEX, 'archive'])
        const entries: (Pick<Note, 'slug' | 'identifier' | 'tags'> & {
          name: string
        })[] = (await readDenoteNames())
          .filter(({ name }) => name.endsWith('.org'))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, identifier, title, tags }) => {
            // Same as the file name, unless two notes share a title
            const id = identifier.toLowerCase()
            let slug = title ?? id
            if (slugs.has(slug)) slug = `${slug}-${id}`
            slugs.add(slug)
            return { name, slug, identifier, tags }
          })
        if (existsSync(path.join(braindumpDir, 'index.org'))) {
          entries.push({
            name: 'index.org',
            slug: INDEX,
            identifier: undefined,
            tags: [],
          })
        }

        const notes: Note[] = []
        for (const { name, slug, identifier, tags } of entries) {
          const filePath = path.join(braindumpDir, name)
          const file = new VFile({
            path: filePath,
            value: await fs.readFile(filePath, 'utf-8'),
          })
          const hast = await processor.toHast(file)
          file.messages.forEach((m) => logger.warn(`${name}: ${m.reason}`))

          const frontmatter = file.data.astro?.frontmatter ?? {}
          notes.push({
            slug,
            identifier,
            title: frontmatter.title || slug,
            tags,
            file,
            hast,
            frontmatter,
          })
        }

        return notes
      }

      async function sync() {
        const notes = await readNotes()

        // denote identifier to its target
        const targets = new Map<string, Target>()
        for (const file of await braindumpFiles()) {
          targets.set(file.identifier, {
            href: `/braindump/files/${file.name}`,
            title: file.title,
          })
        }
        // NOTE: Added after the files, as org exports (pdf, tex) share the
        // identifier of their note, and the note is the one to link to.
        for (const note of notes) {
          if (!note.identifier) continue
          targets.set(note.identifier, {
            href: noteHref(note.slug),
            title: note.title,
            note,
          })
        }

        const backlinks = new Map(notes.map((n) => [n, new Set<Note>()]))
        for (const note of notes) {
          rewriteLinks(note.hast, (href) => {
            const target = resolveLink(targets, href)
            if (target?.note && target.note !== note) {
              backlinks.get(target.note)!.add(note)
            }
            return target
          })
        }

        const root = fileURLToPath(config.root)
        const entries = await Promise.all(
          notes.map(async (note) => {
            const { html, imagePaths } = await processor.toHtml(
              note.hast,
              note.file
            )
            const data = await parseData({
              id: note.slug,
              data: {
                title: note.title,
                filetags: note.tags,
                created: note.frontmatter.date,
                modified: note.frontmatter.modified,
                backlinks: [...backlinks.get(note)!].map((n) => n.slug),
              },
            })

            return {
              id: note.slug,
              data,
              filePath: path.relative(root, note.file.path),
              digest: generateDigest({ html, ...data }),
              rendered: { html, metadata: { imagePaths } },
              assetImports: imagePaths,
            }
          })
        )

        // NOTE: Swap the whole collection at once, as every note can change
        // the links and backlinks of any other note.
        store.clear()
        entries.forEach((entry) => store.set(entry))
        logger.info(`Loaded ${entries.length} notes from ${braindumpDir}`)
      }

      await sync()

      watcher?.add(braindumpDir)
      watcher?.on('all', (_event, changed) => {
        if (path.dirname(changed) === braindumpDir) {
          sync().catch((e) => logger.error(String(e)))
        }
      })
    },
  }
}

function resolveLink(
  targets: Map<string, Target>,
  href: string
): Target | undefined {
  if (!href.startsWith('denote:')) return

  // Links to a heading look like `denote:<identifier>::#<custom-id>`, which
  // uniorg-slug also uses as the heading's html id.
  const [identifier = '', search = ''] = href.slice(7).split('::')
  const target = targets.get(identifier)
  if (target?.note && search.startsWith('#')) {
    return { ...target, href: target.href + search }
  }
  return target
}

// Points `denote:` links to the note's page, or the served file. Links to
// private or missing notes, or local paths (`file:`), can't be followed on the
// web, so only their description is kept.
function rewriteLinks(
  tree: AstRoot,
  resolve: (href: string) => Target | undefined
) {
  visit(tree, 'element', (node, index, parent) => {
    const href = node.properties.href
    if (node.tagName !== 'a' || typeof href !== 'string') return
    if (!/^(denote|file):/.test(href)) return

    const target = resolve(href)
    if (!target) {
      ;(parent as Element).children.splice(index!, 1, ...node.children)
      return index
    }

    node.properties.href = target.href
    const [child] = node.children
    if (child?.type === 'text' && child.value.startsWith('denote:')) {
      // Link without a description, show the title instead of the raw link
      node.children = [{ type: 'text', value: target.title }]
    }
    return
  })
}

// org-attach stores attachments under `data/<2 chars of ID>/<rest of ID>/`,
// where the ID is the one of the closest heading (or file) that has one. As a
// fallback, any other ID in the note is tried, for when an attachment is
// reused under another heading.
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

function expandHome(p: string) {
  return p.replace(/^~(?=\/|$)/, os.homedir())
}
