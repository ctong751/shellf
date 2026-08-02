export type Accent =
  'amber' | 'blue' | 'green' | 'ochre' | 'plum' | 'rust' | 'slate'

export interface Episode {
  description: string
  number: number
  title: string
}

export interface WatchingSeries {
  accent: Accent
  currentEpisode: Episode
  id: string
  kind: 'series'
  nextEpisode?: Episode
  posterUrl?: string
  season: number
  showDescription: string
  title: string
  totalEpisodes: number
  watchedEpisodes: number
}

export interface WatchingMovie {
  accent: Accent
  description: string
  id: string
  kind: 'movie'
  posterUrl?: string
  runtime: string
  title: string
}

export type WatchingItem = WatchingMovie | WatchingSeries

export interface RecentItem {
  accent: Accent
  id: string
  meta: string
  posterUrl?: string
  sourceItem?: WatchingItem
  time: string
  title: string
}

export interface SavedItem {
  accent: Accent
  availability: string
  description: string
  id: string
  posterUrl?: string
  runtime: string
  title: string
}

export interface HomeMedia {
  recentItems: RecentItem[]
  savedItems: SavedItem[]
  watchingItems: WatchingItem[]
}
