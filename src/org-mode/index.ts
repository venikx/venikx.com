import path from 'node:path'
import type { AstroIntegration, ContentEntryType, HookParameters } from 'astro'

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  // `addPageExtension` and `contentEntryType` are not a public APIs
  // Add type defs here
  addPageExtension: (extension: string) => void
  addContentEntryType: (contentEntryType: ContentEntryType) => void
}

export default function orgMode(): AstroIntegration {
  return {
    name: '@astro/org-mode',
    hooks: {
      'astro:config:setup': (options) => {
        const { addPageExtension, addContentEntryType } =
          options as SetupHookParams

        addPageExtension('.orgd')
        addContentEntryType({
          extensions: ['.org'],
          async getEntryInfo({
            fileUrl,
            contents,
          }: {
            fileUrl: URL
            contents: string
          }) {
            const dirs = path.dirname(fileUrl.pathname).split(path.sep)
            const slug = dirs[dirs.length - 1] ?? ''
            console.log('==orgx===', slug)
            contents
            //const parsed = parseFrontmatter(contents, fileURLToPath(fileUrl));
            return {
              data: { title: 'YOLO' },
              body: 'ur mam',
              slug,
              rawData: '',
            }
          },
          //contentModuleTypes: await fs.readFile(
          //    new URL('../template/content-module-types.d.ts', import.meta.url),
          //    'utf-8'
          //),
          // MDX can import scripts and styles,
          // so wrap all MDX files with script / style propagation checks
          //handlePropagation: true,
        })
      },
    },
  }
}
