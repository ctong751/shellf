import { loadRecentItems } from '@/lib/homeMedia/loadRecentItems.server'
import { loadSavedItems } from '@/lib/homeMedia/loadSavedItems.server'
import { loadWatchingItems } from '@/lib/homeMedia/loadWatchingItems.server'
import type { HomeMedia } from '@/lib/homeMedia/types'
import { createTmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'

export const loadHomeMedia = async (): Promise<HomeMedia> => {
  const tmdb = createTmdbRequestClient()
  const [recentItems, savedItems, watchingItems] = await Promise.all([
    loadRecentItems(tmdb),
    loadSavedItems(tmdb),
    loadWatchingItems(tmdb),
  ])

  return { recentItems, savedItems, watchingItems }
}
