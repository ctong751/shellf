import { fetchFromTmdb } from '@/lib/tmdb/client.server'

export interface TmdbEpisode {
  id: number
  episode_number: number
  name: string
  overview: string
  season_number: number
}

export interface TmdbSeasonDetails {
  episodes: TmdbEpisode[]
}

export const getSeasonDetails = (seriesId: number, seasonNumber: number) =>
  fetchFromTmdb<TmdbSeasonDetails>(`/tv/${seriesId}/season/${seasonNumber}`)
