import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadMediaItems } from '@/lib/homeMedia/loadItems.server'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadMediaItems', () => {
  it('keeps successful items when another item cannot be hydrated', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const records = [
      { content: { id: 'working' }, title: 'Working title' },
      { content: { id: 'broken' }, title: 'Broken title' },
    ]

    const items = await loadMediaItems(
      records,
      (record) => {
        if (record.content.id === 'broken') {
          return Promise.reject(new Error('Upstream failed'))
        }
        return Promise.resolve(record.title)
      },
      'Failed to load title',
    )

    expect(items).toEqual(['Working title'])
    expect(consoleError).toHaveBeenCalledWith(
      JSON.stringify({
        contentId: 'broken',
        error: 'Upstream failed',
        message: 'Failed to load title',
      }),
    )
  })
})
