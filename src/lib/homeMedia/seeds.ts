import type { Accent } from '@/lib/homeMedia/types'

interface WatchingSeed {
  accent: Accent
  currentEpisode: number
  season: number
  tmdbId: number
}

interface RecentSeriesSeed {
  accent: Accent
  episode: number
  kind: 'series'
  season: number
  time: string
  tmdbId: number
}

interface RecentMovieSeed {
  accent: Accent
  kind: 'movie'
  time: string
  tmdbId: number
}

interface SavedSeed {
  accent: Accent
  tmdbId: number
}

export const watchingSeeds = [
  { accent: 'green', currentEpisode: 4, season: 2, tmdbId: 95396 },
  { accent: 'blue', currentEpisode: 7, season: 3, tmdbId: 136315 },
  { accent: 'ochre', currentEpisode: 3, season: 4, tmdbId: 95480 },
  { accent: 'slate', currentEpisode: 5, season: 2, tmdbId: 125988 },
  { accent: 'plum', currentEpisode: 6, season: 4, tmdbId: 125935 },
] as const satisfies readonly WatchingSeed[]

export const recentSeeds = [
  {
    accent: 'green',
    episode: 3,
    kind: 'series',
    season: 2,
    time: '2 hours ago',
    tmdbId: 95396,
  },
  {
    accent: 'ochre',
    episode: 10,
    kind: 'series',
    season: 1,
    time: 'Yesterday',
    tmdbId: 126308,
  },
  {
    accent: 'rust',
    kind: 'movie',
    time: '3 days ago',
    tmdbId: 693134,
  },
] as const satisfies readonly (RecentSeriesSeed | RecentMovieSeed)[]

export const savedSeeds = [
  { accent: 'blue', tmdbId: 666277 },
  { accent: 'plum', tmdbId: 1064213 },
  { accent: 'amber', tmdbId: 1184918 },
  { accent: 'slate', tmdbId: 937287 },
] as const satisfies readonly SavedSeed[]
