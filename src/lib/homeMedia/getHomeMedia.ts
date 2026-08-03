import { createServerFn } from '@tanstack/react-start'

import type { HomeMedia } from '@/lib/homeMedia/types'

export const getHomeMedia = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeMedia | null> => {
    try {
      const [{ getSessionUser }, { loadHomeMedia }] = await Promise.all([
        import('@/lib/auth/session.server'),
        import('@/lib/homeMedia/loadHomeMedia.server'),
      ])
      const user = await getSessionUser()
      if (!user) return null

      return await loadHomeMedia(user.did)
    } catch (error) {
      console.error(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          message: 'Failed to load account media data',
        }),
      )
      return null
    }
  },
)
