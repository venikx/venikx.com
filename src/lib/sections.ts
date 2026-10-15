import { FEEDS, type Feed } from './feed'

export type Section = {
  href: string
  label: string
  blurb: string
  feed: Feed
}

export const SECTIONS = [
  {
    href: '/posts/',
    label: 'Writing',
    blurb: 'posts on Nix, graphics programming and game dev.',
    feed: FEEDS.posts,
  },
  {
    href: '/braindump/',
    label: 'Brain',
    blurb:
      'my personal notes, all linked together. Rough, unfinished and always growing.',
    feed: FEEDS.braindump,
  },
  {
    href: '/lab/',
    label: 'Lab',
    blurb:
      'self-contained toys. Mostly canvas and digital art, but anything goes.',
    feed: FEEDS.experiments,
  },
] satisfies Section[]
