import { findEpisode } from '@/lib/homeMedia/episode'
import { formatRuntime } from '@/lib/homeMedia/format'
import { recentSeeds } from '@/lib/homeMedia/seeds'
import type { RecentItem } from '@/lib/homeMedia/types'
import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'
import { getPosterUrl } from '@/lib/tmdb/getPosterUrl'

export const loadRecentItems = (tmdb: TmdbRequestClient) =>
  Promise.all(
    recentSeeds.map(async (seed): Promise<RecentItem> => {
      if (seed.kind === 'movie') {
        const movie = await tmdb.getMovieDetails(seed.tmdbId)
        return {
          accent: seed.accent,
          id: `recent-movie-${movie.id}`,
          meta: `Movie · ${formatRuntime(movie.runtime)}`,
          posterUrl: getPosterUrl(movie.poster_path),
          time: seed.time,
          title: movie.title,
        }
      }

      const [tv, season] = await Promise.all([
        tmdb.getTvDetails(seed.tmdbId),
        tmdb.getSeasonDetails(seed.tmdbId, seed.season),
      ])
      const episode = findEpisode(season, seed.episode)
      return {
        accent: seed.accent,
        id: `recent-tv-${tv.id}-${seed.season}-${seed.episode}`,
        meta: `S${seed.season} E${seed.episode} · ${episode.name}`,
        posterUrl: getPosterUrl(tv.poster_path),
        time: seed.time,
        title: tv.name,
      }
    }),
  )
