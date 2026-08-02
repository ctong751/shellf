import { createServerFn } from '@tanstack/react-start'

import type { HomeMedia } from '@/lib/homeMedia/types'

export const getHomeMedia = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeMedia | null> => {
    try {
      const { loadHomeMedia } =
        await import('@/lib/homeMedia/loadHomeMedia.server')
      return await loadHomeMedia()
    } catch (error) {
      console.error(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          message: 'Failed to load TMDB media data',
        }),
      )
      return null
    }
  },
)
