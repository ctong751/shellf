import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchFromTmdb } from '@/lib/tmdb/client.server'

beforeEach(() => {
  vi.stubEnv('TMDB_API_KEY', '0123456789abcdef0123456789abcdef')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('fetchFromTmdb', () => {
  it('retries a rate-limited request using Retry-After', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(null, {
          headers: { 'Retry-After': '0' },
          status: 429,
        }),
      )
      .mockResolvedValueOnce(Response.json({ name: 'Twin Peaks' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchFromTmdb<{ name: string }>('/tv/1920')).resolves.toEqual({
      name: 'Twin Peaks',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry a permanent error', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchFromTmdb('/tv/0')).rejects.toThrow('failed (404)')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
