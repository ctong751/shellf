import { fetchFromTmdb } from '@/lib/tmdb/client.server'

export interface TmdbFindTvEpisodeResult {
  episode_number: number
  id: number
  name: string
  season_number: number
  show_id: number
}

export interface TmdbFindTvResult {
  id: number
  name: string
}

export interface TmdbFindResults {
  tv_episode_results: TmdbFindTvEpisodeResult[]
  tv_results: TmdbFindTvResult[]
}

export const findByTvdbId = (externalId: string) =>
  fetchFromTmdb<TmdbFindResults>(
    `/find/${encodeURIComponent(externalId)}?external_source=tvdb_id`,
  )
