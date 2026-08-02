import {
  getMovieDetails,
  type TmdbMovieDetails,
} from '@/lib/tmdb/api/getMovieDetails.server'
import {
  getSeasonDetails,
  type TmdbSeasonDetails,
} from '@/lib/tmdb/api/getSeasonDetails.server'
import {
  getTvDetails,
  type TmdbTvDetails,
} from '@/lib/tmdb/api/getTvDetails.server'

export interface TmdbRequestClient {
  getMovieDetails: (movieId: number) => Promise<TmdbMovieDetails>
  getSeasonDetails: (
    seriesId: number,
    seasonNumber: number,
  ) => Promise<TmdbSeasonDetails>
  getTvDetails: (seriesId: number) => Promise<TmdbTvDetails>
}

export const createTmdbRequestClient = (): TmdbRequestClient => {
  const movies = new Map<number, Promise<TmdbMovieDetails>>()
  const seasons = new Map<string, Promise<TmdbSeasonDetails>>()
  const series = new Map<number, Promise<TmdbTvDetails>>()

  return {
    getMovieDetails: (movieId) => {
      const request = movies.get(movieId) ?? getMovieDetails(movieId)
      movies.set(movieId, request)
      return request
    },
    getSeasonDetails: (seriesId, seasonNumber) => {
      const key = `${seriesId}:${seasonNumber}`
      const request =
        seasons.get(key) ?? getSeasonDetails(seriesId, seasonNumber)
      seasons.set(key, request)
      return request
    },
    getTvDetails: (seriesId) => {
      const request = series.get(seriesId) ?? getTvDetails(seriesId)
      series.set(seriesId, request)
      return request
    },
  }
}
