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

// The notes live in their own repo (github.com/venikx/braindump), which is
// migrating from org-roam to denote, so both flavors are supported. Only the
// top-level notes are published, sub-directories (gtd, work, collections, ...)
// and notes tagged `private` are skipped.
const braindumpDir = path.resolve(
  expandHome(process.env.BRAINDUMP_DIR ?? '~/org')
)

// `index.org` is rendered on the landing page, instead of on its own page
export const INDEX = 'index'

export const noteHref = (slug: string) =>
  slug === INDEX ? '/braindump/' : `/braindump/${slug}/`

// denote can turn any file into a note (pdfs, tex, ...), by naming it
// `<identifier>--<title>__<tags>.<ext>`. Those are served as is.
async function braindumpFiles() {
  if (!existsSync(braindumpDir)) return []

  return (await fs.readdir(braindumpDir))
    .filter((name) => DENOTE_ID.test(name) && !name.endsWith('.org'))
    .filter((name) => !denoteTags(name).includes('private'))
    .map((name) => ({
      name,
      path: path.join(braindumpDir, name),
      identifier: name.match(DENOTE_ID)![0],
      title: name.match(/--([^_.]+)/)?.[1]?.replaceAll('-', ' ') ?? name,
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

const DENOTE_ID = /^\d{8}T\d{6}/

type Note = {
  slug: string
  title: string
  filetags: string[]
  file: VFile
  hast: AstRoot
  frontmatter: Record<string, string | undefined>
  // org-roam style `id:<uuid>` mapped to an anchor, '' for the file itself
  ids: Record<string, string>
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

        const names = (await fs.readdir(braindumpDir))
          .filter((name) => name.endsWith('.org'))
          .sort()
        // NOTE: `archive` is taken by src/pages/braindump/archive.astro
        const slugs = new Set<string>([INDEX, 'archive'])
        const notes: Note[] = []

        for (const name of names) {
          const filePath = path.join(braindumpDir, name)
          const file = new VFile({
            path: filePath,
            value: await fs.readFile(filePath, 'utf-8'),
          })
          const hast = await processor.toHast(file)
          file.messages.forEach((m) => logger.warn(`${name}: ${m.reason}`))

          const frontmatter = file.data.astro?.frontmatter ?? {}
          const filetags = String(frontmatter.filetags ?? '')
            .split(':')
            .map((t) => t.trim())
            .filter((t) => !!t)
          if (filetags.includes('private')) continue

          const stem = path.basename(name, '.org')
          const title = frontmatter.title || stem
          let slug = slugify(title) || slugify(stem)
          if (slugs.has(slug)) slug = `${slug}-${slugify(stem)}`
          if (name === 'index.org') slug = INDEX
          slugs.add(slug)

          notes.push({
            slug,
            title,
            filetags,
            file,
            hast,
            frontmatter,
            ids:
              (file.data.astro as { ids?: Record<string, string> }).ids ?? {},
          })
        }

        return notes
      }

      async function sync() {
        const notes = await readNotes()

        const targets = new Map<string, Target>()
        for (const file of await braindumpFiles()) {
          const target = { href: `/braindump/files/${file.name}`, ...file }
          targets.set(`denote:${file.identifier}`, target)
          targets.set(`file:${file.path}`, target)
        }
        // NOTE: Added after the files, as org exports (pdf, tex) share the
        // identifier of their note, and the note is the one to link to.
        for (const note of notes) {
          const href = noteHref(note.slug)
          const target = { href, title: note.title, note }
          for (const [id, hash] of Object.entries(note.ids)) {
            targets.set(id, { ...target, href: href + hash })
          }
          const identifier =
            note.frontmatter.identifier ??
            path.basename(note.file.path).match(DENOTE_ID)?.[0]
          if (identifier) targets.set(`denote:${identifier}`, target)
          targets.set(`file:${note.file.path}`, target)
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
                filetags: note.filetags,
                created: note.frontmatter.created ?? note.frontmatter.date,
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
  // Drop org's search options (e.g. `file:foo.org::*Heading`)
  const [link = ''] = decodeURI(href).split('::')
  if (link.startsWith('file:')) {
    const file = path.resolve(braindumpDir, expandHome(link.slice(5)))
    return targets.get(`file:${file}`)
  }
  return targets.get(link)
}

// Points `id:`, `denote:` and `file:` links to the note's page, or the served
// file. Links to private or missing notes, or local paths, can't be followed
// on the web, so only their description is kept.
function rewriteLinks(
  tree: AstRoot,
  resolve: (href: string) => Target | undefined
) {
  visit(tree, 'element', (node, index, parent) => {
    const href = node.properties.href
    if (node.tagName !== 'a' || typeof href !== 'string') return
    if (!/^(id|denote|file):/.test(href)) return

    const target = resolve(href)
    if (!target) {
      ;(parent as Element).children.splice(index!, 1, ...node.children)
      return index
    }

    node.properties.href = target.href
    const [child] = node.children
    if (child?.type === 'text' && /^(id|denote|file):/.test(child.value)) {
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

// `20251204T000210--title__tag1_tag2.pdf` has the tags tag1 and tag2
function denoteTags(name: string) {
  return name.match(/__([^.]+)/)?.[1]?.split('_') ?? []
}

function expandHome(p: string) {
  return p.replace(/^~(?=\/|$)/, os.homedir())
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
