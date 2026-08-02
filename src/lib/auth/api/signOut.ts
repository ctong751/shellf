import { createServerFn } from '@tanstack/react-start'

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const [
    { getSessionUser, destroySession },
    { getOAuthClient },
    { getRequest },
  ] = await Promise.all([
    import('@/lib/auth/session.server'),
    import('@/lib/auth/oauthClient.server'),
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
