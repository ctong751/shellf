import { fetchFromTmdb } from '@/lib/tmdb/client.server'

export interface TmdbTvDetails {
  id: number
  name: string
  number_of_seasons: number
  overview: string
  poster_path: string | null
}

export const getTvDetails = (seriesId: number) =>
  fetchFromTmdb<TmdbTvDetails>(`/tv/${seriesId}`)
