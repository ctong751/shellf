import { fetchFromTmdb } from '@/lib/tmdb/client.server'

export interface TmdbMovieDetails {
  id: number
  overview: string
  poster_path: string | null
  release_date: string
  runtime: number | null
  title: string
}

export const getMovieDetails = (movieId: number) =>
  fetchFromTmdb<TmdbMovieDetails>(`/movie/${movieId}`)
