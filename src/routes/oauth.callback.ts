import { createFileRoute } from '@tanstack/react-router'

function redirect(location: string, cookie?: string) {
  const headers = new Headers({ Location: location })
  if (cookie) {
    headers.set('Set-Cookie', cookie)
  }
  return new Response(null, { status: 303, headers })
}

export const Route = createFileRoute('/oauth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)

        try {
          const [{ getOAuthClient }, { createSessionCookie }, { Agent }] =
            await Promise.all([
              import('#/lib/oauth-client.server'),
              import('#/lib/session.server'),
              import('@atproto/api'),
            ])

          const client = getOAuthClient(url.origin)
          const { session } = await client.callback(url.searchParams)
          const did = session.did

          const agent = new Agent(session)
          const { data: profile } = await agent.getProfile({ actor: did })

          const [{ withDb }, { users }] = await Promise.all([
            import('#/db'),
            import('#/db/schema'),
          ])
          await withDb((db) =>
            db
              .insert(users)
              .values({ did, handle: profile.handle })
              .onConflictDoUpdate({
                target: users.did,
                set: { handle: profile.handle, updatedAt: new Date() },
              }),
          )

          const cookie = await createSessionCookie(
            did,
            url.protocol === 'https:',
          )
          return redirect('/home', cookie)
        } catch (error) {
          console.error('OAuth callback failed', error)
          return redirect('/?error=signin_failed')
        }
      },
    },
  },
})
