import { createServerFn } from '@tanstack/react-start'

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
      import('@/lib/auth/oauthClient.server'),
      import('@tanstack/react-start/server'),
    ])

    const origin = new URL(getRequest().url).origin
    const client = getOAuthClient(origin)
    const url = await client.authorize(handle)

    return { redirectUrl: url.toString() }
  })
