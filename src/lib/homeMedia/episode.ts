import type { Episode } from '@/lib/homeMedia/types'
import type {
  TmdbEpisode,
  TmdbSeasonDetails,
} from '@/lib/tmdb/api/getSeasonDetails.server'

export const findEpisode = (
  season: TmdbSeasonDetails,
  episodeNumber: number,
) => {
  const episode = season.episodes.find(
    ({ episode_number }) => episode_number === episodeNumber,
  )
  if (!episode) {
    throw new Error(`TMDB episode ${episodeNumber} was not found`)
  }
  return episode
}

export const toEpisode = (episode: TmdbEpisode): Episode => ({
  description: episode.overview,
  number: episode.episode_number,
  title: episode.name,
})
