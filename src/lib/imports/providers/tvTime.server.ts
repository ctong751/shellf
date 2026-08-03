import type { MediaImportItem } from '@/lib/imports/types'
import { findByTvdbId } from '@/lib/tmdb/api/findByExternalId.server'
import type { ResolvedImportItem } from '@/lib/imports/providers/server'

export const resolveTvTimeImportItem = async (
  item: MediaImportItem,
): Promise<ResolvedImportItem | undefined> => {
  if (item.show.source !== 'tvdb') return undefined

  if (item.state === 'saved') {
    const result = await findByTvdbId(item.show.id)
    const show = result.tv_results[0]
    return show ? { showExternalId: String(show.id) } : undefined
  }

  if (!item.latestEpisode || item.latestEpisode.source !== 'tvdb') {
    return undefined
  }

  const result = await findByTvdbId(item.latestEpisode.id)
  const episode = result.tv_episode_results[0]
  if (!episode) return undefined

  return {
    episode: {
      episodeNumber: episode.episode_number,
      externalId: String(episode.id),
      seasonNumber: episode.season_number,
    },
    showExternalId: String(episode.show_id),
  }
}
