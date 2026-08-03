import { getMediaAccent } from '@/lib/homeMedia/accent'
import { formatReleaseDate, formatRuntime } from '@/lib/homeMedia/format'
import { loadMediaItems } from '@/lib/homeMedia/loadItems.server'
import type { SavedContentRecord } from '@/lib/homeMedia/records'
import type { SavedItem } from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadSavedItems = (
  tmdb: TmdbRequestClient,
  records: SavedContentRecord[],
) =>
  loadMediaItems(
    records,
    async ({ content, save }): Promise<SavedItem> => {
      const tmdbId = Number(content.externalId)
      const accent = getMediaAccent(
        `${content.source}:${content.kind}:${content.externalId}`,
      )

      if (content.kind === 'tv_show') {
        const series = await tmdb.getTvDetails(tmdbId)
        return {
          accent,
          availability: 'Series',
          description: series.overview,
          id: save.recordKey,
          posterUrl: getPosterUrl(series.poster_path),
          runtime: 'Series',
          title: series.name,
        }
      }

      if (content.kind !== 'movie') {
        throw new Error(`Cannot hydrate content kind: ${content.kind}`)
      }

      const movie = await tmdb.getMovieDetails(tmdbId)
      return {
        accent,
        availability: formatReleaseDate(movie.release_date),
        description: movie.overview,
        id: save.recordKey,
        posterUrl: getPosterUrl(movie.poster_path),
        runtime: formatRuntime(movie.runtime),
        title: movie.title,
      }
    },
    'Failed to load saved title',
  )
