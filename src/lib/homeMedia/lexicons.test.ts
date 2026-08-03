import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { lexicons } from '@atproto/api'

const recordNames = [
  'comment',
  'consume',
  'like',
  'review',
  'save',
  'startConsuming',
  'stopConsuming',
] as const

const ids = [
  'net.shellf.temp.defs',
  ...recordNames.map((name) => `net.shellf.temp.${name}`),
]

const loadLexicon = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../../lexicons/net/shellf/temp/${name}.json`,
        import.meta.url,
      ),
      'utf8',
    ),
  ) as Parameters<typeof lexicons.add>[0]

const movie = {
  $type: 'net.shellf.temp.defs#content',
  id: '693134',
  kind: 'movie',
  source: 'tmdb',
}

const episode = {
  $type: 'net.shellf.temp.defs#content',
  episodeNumber: 4,
  id: '5510069',
  kind: 'tv_episode',
  seasonNumber: 2,
  showId: '95396',
  source: 'tmdb',
}

const strongRef = {
  cid: 'bafyreigh2akiscaildc3zc4j4apqufna6u3wj5hht3mwq3o3s2d7sz6huu',
  uri: 'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/net.shellf.temp.comment/3k2a2ar7xcs2p',
}

describe('draft Shellf lexicons', () => {
  beforeAll(() => {
    lexicons.add(loadLexicon('defs'))
    recordNames.forEach((name) => lexicons.add(loadLexicon(name)))
  })

  afterAll(() => {
    ids.forEach((id) => lexicons.remove(id))
  })

  it('validates movie and episode consumption', () => {
    for (const content of [movie, episode]) {
      const result = lexicons.validate('net.shellf.temp.consume', {
        $type: 'net.shellf.temp.consume',
        consumedAt: '2026-08-02T16:00:00.000Z',
        content,
      })

      expect(result.success).toBe(true)
    }
  })

  it('requires a one-to-five review rating while allowing omitted text', () => {
    const valid = lexicons.validate('net.shellf.temp.review', {
      $type: 'net.shellf.temp.review',
      content: movie,
      rating: 5,
    })
    const invalid = lexicons.validate('net.shellf.temp.review', {
      $type: 'net.shellf.temp.review',
      content: movie,
      rating: 0,
    })

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it('validates comments, replies, and comment likes', () => {
    const comment = lexicons.validate('net.shellf.temp.comment', {
      $type: 'net.shellf.temp.comment',
      content: episode,
      createdAt: '2026-08-02T16:00:00.000Z',
      reply: strongRef,
      text: 'That ending worked for me.',
    })
    const like = lexicons.validate('net.shellf.temp.like', {
      $type: 'net.shellf.temp.like',
      createdAt: '2026-08-02T16:05:00.000Z',
      subject: strongRef,
    })

    expect(comment.success).toBe(true)
    expect(like.success).toBe(true)
  })

  it('validates saved and active consumption records', () => {
    const saved = lexicons.validate('net.shellf.temp.save', {
      $type: 'net.shellf.temp.save',
      content: movie,
      createdAt: '2026-08-02T16:00:00.000Z',
    })
    const started = lexicons.validate('net.shellf.temp.startConsuming', {
      $type: 'net.shellf.temp.startConsuming',
      content: {
        $type: 'net.shellf.temp.defs#content',
        id: '95396',
        kind: 'tv_show',
        source: 'tmdb',
      },
      startedAt: '2026-08-02T16:00:00.000Z',
    })
    const stopped = lexicons.validate('net.shellf.temp.stopConsuming', {
      $type: 'net.shellf.temp.stopConsuming',
      start: {
        ...strongRef,
        uri: 'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/net.shellf.temp.startConsuming/3k2a2ar7xcs2p',
      },
      stoppedAt: '2026-08-02T17:00:00.000Z',
    })

    expect(saved.success).toBe(true)
    expect(started.success).toBe(true)
    expect(stopped.success).toBe(true)
  })
})
