import { describe, expect, it } from 'vitest'

import { parseCsv } from '@/lib/imports/csv'

describe('parseCsv', () => {
  it('parses quoted commas, escaped quotes, and Windows line endings', () => {
    const parsed = parseCsv(
      '\uFEFFid,title,description\r\n1,"Twin Peaks","A ""damn fine"" show"\r\n2,"Hello, Tomorrow!",\r\n',
    )

    expect(parsed.headers).toEqual(['id', 'title', 'description'])
    expect(parsed.rows).toEqual([
      {
        description: 'A "damn fine" show',
        id: '1',
        title: 'Twin Peaks',
      },
      { description: '', id: '2', title: 'Hello, Tomorrow!' },
    ])
  })

  it('keeps newlines inside quoted fields', () => {
    const parsed = parseCsv('id,notes\n1,"first line\nsecond line"')

    expect(parsed.rows[0]?.notes).toBe('first line\nsecond line')
  })
})
