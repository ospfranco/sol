import Fuse from 'fuse.js'
import {emojis as rawEmojis} from './emojis'

export interface Emoji {
  emoji: string
  description: string
  category: string
  aliases: string[]
  tags: string[]
}

const FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['description', 'category', 'aliases'],
}

export const EMOJIS_PER_ROW = 10

export const allEmojis = rawEmojis
export const emojis = groupEmojis(rawEmojis)
export const emojiFuse = new Fuse(rawEmojis, FUSE_OPTIONS)

export function groupEmojis(emojis: Emoji[]): Array<Emoji[]> {
  const emojisArray: Array<Emoji[]> = []

  for (let i = 0; i < emojis.length; i += EMOJIS_PER_ROW) {
    emojisArray.push(emojis.slice(i, i + EMOJIS_PER_ROW))
  }

  return emojisArray
}
