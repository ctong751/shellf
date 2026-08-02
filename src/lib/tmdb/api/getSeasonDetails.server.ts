import { fetchFromTmdb } from '@/lib/tmdb/client.server'

export interface TmdbEpisode {
  episode_number: number
  name: string
  overview: string
}

export interface TmdbSeasonDetails {
  episodes: TmdbEpisode[]
}

export const getSeasonDetails = (seriesId: number, seasonNumber: number) =>
  fetchFromTmdb<TmdbSeasonDetails>(`/tv/${seriesId}/season/${seasonNumber}`)
