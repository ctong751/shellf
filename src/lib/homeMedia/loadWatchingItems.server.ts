import { findEpisode, toEpisode } from '@/lib/homeMedia/episode'
import { watchingSeeds } from '@/lib/homeMedia/seeds'
import type { WatchingSeries } from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadWatchingItems = (tmdb: TmdbRequestClient) =>
  Promise.all(
    watchingSeeds.map(async (seed): Promise<WatchingSeries> => {
      const [tv, season] = await Promise.all([
        tmdb.getTvDetails(seed.tmdbId),
        tmdb.getSeasonDetails(seed.tmdbId, seed.season),
      ])
      const currentEpisode = findEpisode(season, seed.currentEpisode)
      const nextEpisode = season.episodes.find(
        ({ episode_number }) =>
          episode_number === currentEpisode.episode_number + 1,
      )

      return {
        accent: seed.accent,
        currentEpisode: toEpisode(currentEpisode),
        id: `tv-${tv.id}`,
        kind: 'series',
        nextEpisode: nextEpisode ? toEpisode(nextEpisode) : undefined,
        posterUrl: getPosterUrl(tv.poster_path),
        season: seed.season,
        showDescription: tv.overview,
        title: tv.name,
        totalEpisodes: season.episodes.length,
        watchedEpisodes: seed.currentEpisode - 1,
      }
    }),
  )
