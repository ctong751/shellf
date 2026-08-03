import { describe, expect, it } from 'vitest'

import { formatRelativeTime } from '@/lib/homeMedia/format'

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-02T16:00:00.000Z')

  it.each([
    ['2026-08-02T15:59:40.000Z', 'Just now'],
    ['2026-08-02T15:42:00.000Z', '18m ago'],
    ['2026-08-02T13:00:00.000Z', '3h ago'],
    ['2026-08-01T13:00:00.000Z', 'Yesterday'],
    ['2026-07-29T16:00:00.000Z', '4d ago'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatRelativeTime(new Date(value), now)).toBe(expected)
  })
})
