import { createServerFn } from '@tanstack/react-start'

import type { ViewerProfile } from '#/lib/viewer'

// Server-only modules are imported dynamically inside handlers so nothing
// database- or Node-flavored can end up in the client bundle.

export const startSignIn = createServerFn({ method: 'POST' })
  .validator((handle: unknown) => {
    if (typeof handle !== 'string') {
      throw new Error('Expected a handle.')
    }
    const normalized = handle.trim().replace(/^@/, '')
    if (!normalized) {
      throw new Error('Enter your handle to continue.')
    }
    return normalized
  })
  .handler(async ({ data: handle }) => {
    const [{ getOAuthClient }, { getRequest }] = await Promise.all([
      import('#/lib/oauth-client.server'),
      import('@tanstack/react-start/server'),
    ])

    const origin = new URL(getRequest().url).origin
    const client = getOAuthClient(origin)
    const url = await client.authorize(handle)

    return { redirectUrl: url.toString() }
  })

export const getViewer = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ViewerProfile | null> => {
    const { getSessionUser } = await import('#/lib/session.server')
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
          import('#/lib/oauth-client.server'),
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

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const [
    { getSessionUser, destroySession },
    { getOAuthClient },
    { getRequest },
  ] = await Promise.all([
    import('#/lib/session.server'),
    import('#/lib/oauth-client.server'),
    import('@tanstack/react-start/server'),
  ])

  const user = await getSessionUser()
  if (user) {
    const origin = new URL(getRequest().url).origin
    try {
      await getOAuthClient(origin).revoke(user.did)
    } catch (error) {
      console.error('Failed to revoke OAuth session', error)
    }
  }

  await destroySession()
})
