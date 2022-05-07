import Fuse from 'fuse.js'
import rawEmojis from './emojis.json'

interface Emoji {
  emoji: string
  description: string
  category: string
  aliases: string[]
  tags: string[]
}

const FUSE_OPTIONS = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['description'],
}

export const allEmojis = rawEmojis
export const emojis = groupEmojis(rawEmojis)
export const emojiFuse = new Fuse(rawEmojis, FUSE_OPTIONS)

export function groupEmojis(emojis: Emoji[]): Array<Emoji[]> {
  const emojisArray: Array<Emoji[]> = []

  for (let i = 0; i < emojis.length; i += 15) {
    emojisArray.push(emojis.slice(i, i + 15))
  }

  return emojisArray
}
