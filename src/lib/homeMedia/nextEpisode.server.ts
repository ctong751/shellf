import type { TmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'

interface EpisodePosition {
  episodeNumber: number | null
  seasonNumber: number | null
}

export const getNextTvEpisode = async (
  tmdb: TmdbRequestClient,
  showId: number,
  numberOfSeasons: number,
  lastConsumed?: EpisodePosition,
) => {
  const initialSeason = lastConsumed?.seasonNumber ?? 1
  const initialEpisode = lastConsumed?.episodeNumber ?? 0

  for (
    let seasonNumber = initialSeason;
    seasonNumber <= numberOfSeasons;
    seasonNumber += 1
  ) {
    const season = await tmdb.getSeasonDetails(showId, seasonNumber)
    const afterEpisode = seasonNumber === initialSeason ? initialEpisode : 0
    const currentEpisode = season.episodes
      .filter(({ episode_number }) => episode_number > afterEpisode)
      .sort((left, right) => left.episode_number - right.episode_number)[0]

    if (currentEpisode) return { currentEpisode, season }
  }

  return undefined
}
