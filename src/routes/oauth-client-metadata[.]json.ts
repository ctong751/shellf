import { createFileRoute } from '@tanstack/react-router'

import { createOAuthClientMetadata } from '../lib/oauth-metadata'

export const Route = createFileRoute('/oauth-client-metadata.json')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin
        const clientId = `${origin}/oauth-client-metadata.json`

        return Response.json(
          createOAuthClientMetadata({
            clientId,
            clientName: 'Shellf',
            clientUri: `${origin}/`,
            redirectUris: [`${origin}/`],
          }),
          {
            headers: {
              'Cache-Control': 'public, max-age=300',
              'X-Content-Type-Options': 'nosniff',
            },
          },
        )
      },
    },
  },
})
