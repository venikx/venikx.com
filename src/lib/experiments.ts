import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

export interface ExperimentMeta {
  title: string
  description: string
  created: Date
  modified?: Date
  draft?: boolean
  fullscreen?: boolean
}

// NOTE(venikx): Every experiment must `export const meta: ExperimentMeta`
const modules = import.meta.glob<{
  meta?: ExperimentMeta
  default: AstroComponentFactory
}>('../experiments/*.astro', { eager: true })

export function getAllExperiments() {
  return Object.entries(modules)
    .map(([path, { meta, default: Content }]) => {
      if (!meta) throw new Error(`${path} is missing \`export const meta\``)
      const id = path
        .split('/')
        .pop()!
        .replace(/\.astro$/, '')
      return { id, data: meta, Content }
    })
    .filter((e) => process.env.NODE_ENV === 'development' || !e.data.draft)
    .sort((a, b) => b.data.created.getTime() - a.data.created.getTime())
}
