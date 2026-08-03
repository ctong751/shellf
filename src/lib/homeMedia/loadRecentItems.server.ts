import { getMediaAccent } from '@/lib/homeMedia/accent'
import { findEpisode } from '@/lib/homeMedia/episode'
import { formatRelativeTime, formatRuntime } from '@/lib/homeMedia/format'
import type { ConsumedContentRecord } from '@/lib/homeMedia/records'
import type { RecentItem } from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadRecentItems = (
  tmdb: TmdbRequestClient,
  records: ConsumedContentRecord[],
) =>
  Promise.all(
    records.map(
      async ({ consume, content, parentContent }): Promise<RecentItem> => {
        const accent = getMediaAccent(
          `${content.source}:${content.kind}:${content.externalId}`,
        )
        const time = formatRelativeTime(consume.consumedAt)

        if (content.kind === 'movie') {
          const movie = await tmdb.getMovieDetails(Number(content.externalId))
          return {
            accent,
            id: consume.recordKey,
            meta: `Movie · ${formatRuntime(movie.runtime)}`,
            posterUrl: getPosterUrl(movie.poster_path),
            time,
            title: movie.title,
          }
        }

        if (content.kind !== 'tv_episode' || !parentContent) {
          throw new Error(
            `Cannot hydrate consumed content kind: ${content.kind}`,
          )
        }

        const tmdbId = Number(parentContent.externalId)
        const seasonNumber = content.seasonNumber ?? 1
        const episodeNumber = content.episodeNumber ?? 1
        const [tv, season] = await Promise.all([
          tmdb.getTvDetails(tmdbId),
          tmdb.getSeasonDetails(tmdbId, seasonNumber),
        ])
        const episode = findEpisode(season, episodeNumber)
        return {
          accent,
          id: consume.recordKey,
          meta: `S${seasonNumber} E${episodeNumber} · ${episode.name}`,
          posterUrl: getPosterUrl(tv.poster_path),
          time,
          title: tv.name,
        }
      },
    ),
  )
