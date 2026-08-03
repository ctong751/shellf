import { getMediaAccent } from '@/lib/homeMedia/accent'
import { toEpisode } from '@/lib/homeMedia/episode'
import { formatRuntime } from '@/lib/homeMedia/format'
import { getNextTvEpisode } from '@/lib/homeMedia/nextEpisode.server'
import type { ActiveConsumptionRecord } from '@/lib/homeMedia/records'
import type {
  WatchingItem,
  WatchingMovie,
  WatchingTvShow,
} from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadWatchingItems = async (
  tmdb: TmdbRequestClient,
  records: ActiveConsumptionRecord[],
): Promise<WatchingItem[]> => {
  const items = await Promise.all(
    records.map(
      async ({
        content,
        lastConsumedContent,
        start,
      }): Promise<WatchingItem | null> => {
        const tmdbId = Number(content.externalId)
        const accent = getMediaAccent(
          `${content.source}:${content.kind}:${content.externalId}`,
        )

        if (content.kind === 'movie') {
          const movie = await tmdb.getMovieDetails(tmdbId)
          return {
            accent,
            description: movie.overview,
            id: start.recordKey,
            kind: 'movie',
            posterUrl: getPosterUrl(movie.poster_path),
            runtime: formatRuntime(movie.runtime),
            title: movie.title,
          } satisfies WatchingMovie
        }

        if (content.kind !== 'tv_show') {
          throw new Error(
            `Cannot start consuming content kind: ${content.kind}`,
          )
        }

        const tv = await tmdb.getTvDetails(tmdbId)
        const next = await getNextTvEpisode(
          tmdb,
          tmdbId,
          tv.number_of_seasons,
          lastConsumedContent,
        )
        if (!next) return null

        const { currentEpisode, season } = next
        const nextEpisode = season.episodes.find(
          ({ episode_number }) =>
            episode_number === currentEpisode.episode_number + 1,
        )

        return {
          accent,
          currentEpisode: toEpisode(currentEpisode),
          id: start.recordKey,
          kind: 'tv_show',
          nextEpisode: nextEpisode ? toEpisode(nextEpisode) : undefined,
          posterUrl: getPosterUrl(tv.poster_path),
          season: currentEpisode.season_number,
          showDescription: tv.overview,
          title: tv.name,
          totalEpisodes: season.episodes.length,
          watchedEpisodes: Math.max(0, currentEpisode.episode_number - 1),
        } satisfies WatchingTvShow
      },
    ),
  )

  return items.filter((item): item is WatchingItem => item !== null)
}
