import { createServerFn } from '@tanstack/react-start'

import type { ViewerProfile } from '@/lib/auth/types'

export const getViewer = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ViewerProfile | null> => {
    const { getSessionUser } = await import('@/lib/auth/session.server')
    const user = await getSessionUser()
    if (!user) {
      return null
    }

    const fallback: ViewerProfile = {
      did: user.did,
      handle: user.handle,
      displayName: user.handle,
      followersCount: 0,
      followsCount: 0,
      postsCount: 0,
    }

    try {
      const [{ getOAuthClient }, { getRequest }, { Agent }] = await Promise.all(
        [
          import('@/lib/auth/oauthClient.server'),
          import('@tanstack/react-start/server'),
          import('@atproto/api'),
        ],
      )

      const origin = new URL(getRequest().url).origin
      const oauthSession = await getOAuthClient(origin).restore(user.did)
      const agent = new Agent(oauthSession)
      const { data: profile } = await agent.getProfile({ actor: user.did })

      return {
        avatar: profile.avatar,
        description: profile.description,
        did: profile.did,
        displayName: profile.displayName || profile.handle,
        followersCount: profile.followersCount ?? 0,
        followsCount: profile.followsCount ?? 0,
        handle: profile.handle,
        postsCount: profile.postsCount ?? 0,
      }
    } catch (error) {
      console.error('Failed to load live profile, using stored user', error)
      return fallback
    }
  },
)
