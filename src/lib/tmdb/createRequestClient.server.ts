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

const REQUEST_INTERVAL_MS = 275

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

const createRequestScheduler = () => {
  let nextRequestAt = 0
  let pending = Promise.resolve()

  return <T>(request: () => Promise<T>) => {
    const result = pending.then(async () => {
      const delay = Math.max(0, nextRequestAt - Date.now())
      if (delay > 0) await wait(delay)
      nextRequestAt = Date.now() + REQUEST_INTERVAL_MS
      return request()
    })
    pending = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }
}

export const createTmdbRequestClient = (): TmdbRequestClient => {
  const movies = new Map<number, Promise<TmdbMovieDetails>>()
  const seasons = new Map<string, Promise<TmdbSeasonDetails>>()
  const series = new Map<number, Promise<TmdbTvDetails>>()
  const schedule = createRequestScheduler()

  return {
    getMovieDetails: (movieId) => {
      const request =
        movies.get(movieId) ?? schedule(() => getMovieDetails(movieId))
      movies.set(movieId, request)
      return request
    },
    getSeasonDetails: (seriesId, seasonNumber) => {
      const key = `${seriesId}:${seasonNumber}`
      const request =
        seasons.get(key) ??
        schedule(() => getSeasonDetails(seriesId, seasonNumber))
      seasons.set(key, request)
      return request
    },
    getTvDetails: (seriesId) => {
      const request =
        series.get(seriesId) ?? schedule(() => getTvDetails(seriesId))
      series.set(seriesId, request)
      return request
    },
  }
}
