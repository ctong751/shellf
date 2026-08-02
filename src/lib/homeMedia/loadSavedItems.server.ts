import { formatReleaseDate, formatRuntime } from '@/lib/homeMedia/format'
import { savedSeeds } from '@/lib/homeMedia/seeds'
import type { SavedItem } from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadSavedItems = (tmdb: TmdbRequestClient) =>
  Promise.all(
    savedSeeds.map(async (seed): Promise<SavedItem> => {
      const movie = await tmdb.getMovieDetails(seed.tmdbId)
      return {
        accent: seed.accent,
        availability: formatReleaseDate(movie.release_date),
        description: movie.overview,
        id: `movie-${movie.id}`,
        posterUrl: getPosterUrl(movie.poster_path),
        runtime: formatRuntime(movie.runtime),
        title: movie.title,
      }
    }),
  )
