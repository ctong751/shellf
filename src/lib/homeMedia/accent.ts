import type { Accent } from '@/lib/homeMedia/types'

const accents: readonly Accent[] = [
  'amber',
  'blue',
  'green',
  'ochre',
  'plum',
  'rust',
  'slate',
]

export const getMediaAccent = (key: string): Accent => {
  const hash = [...key].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  )
  return accents[hash % accents.length] ?? 'slate'
}
