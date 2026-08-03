import { describe, expect, it } from 'vitest'

import { parseTvTimeExport } from '@/lib/imports/providers/tvTime'
import type { ImportFile } from '@/lib/imports/types'

const file = (name: string, contents: string): ImportFile => ({
  name,
  text: () => Promise.resolve(contents),
})

describe('parseTvTimeExport', () => {
  it('maps saved and in-progress followed shows into neutral import items', async () => {
    const preview = await parseTvTimeExport([
      file(
        'user_tv_show_data.csv',
        [
          'is_favorited,nb_episodes_seen,tv_show_name,user_id,tv_show_id,is_followed',
          '0,30,Twin Peaks,user,70533,1',
          '0,0,The Simpsons,user,71663,1',
          '0,4,Missing Progress,user,123,1',
          '0,0,Removed Show,user,456,0',
        ].join('\n'),
      ),
      file(
        'show_seen_episode_latest.csv',
        [
          'tv_show_name,user_id,tv_show_id,episode_id,created_at,updated_at',
          'Twin Peaks,user,70533,11702,2021-09-07 14:26:08,2021-09-07 14:26:08',
        ].join('\n'),
      ),
      file(
        'followed_tv_show.csv',
        [
          'folder_id,notification_offset,tv_show_name,tv_show_id,created_at,notification_type,diffusion,archived,user_id,updated_at,active',
          '1,0,Twin Peaks,70533,2020-09-15 17:33:45,0,0,1,user,2020-09-15 17:33:45,1',
          '1,0,The Simpsons,71663,2019-06-27 13:12:07,0,0,0,user,2019-06-27 13:12:07,0',
        ].join('\n'),
      ),
    ])

    expect(preview.providerId).toBe('tv_time')
    expect(preview.items).toEqual([
      {
        consumedAt: '2021-09-07T14:26:08.000Z',
        latestEpisode: { id: '11702', source: 'tvdb' },
        show: { id: '70533', source: 'tvdb' },
        sourceItemId: 'show:70533:episode:11702',
        startedAt: '2020-09-15T17:33:45.000Z',
        state: 'watching',
        title: 'Twin Peaks',
      },
      {
        savedAt: '2019-06-27T13:12:07.000Z',
        show: { id: '71663', source: 'tvdb' },
        sourceItemId: 'show:71663',
        state: 'saved',
        title: 'The Simpsons',
      },
    ])
    expect(preview.skippedItems).toEqual([
      {
        reason:
          'TV Time reports progress but did not include a latest episode.',
        title: 'Missing Progress',
      },
    ])
  })

  it('rejects folders that do not contain the identifying files', async () => {
    await expect(parseTvTimeExport([])).rejects.toThrow(
      'Choose the TV Time GDPR export folder',
    )
  })
})
