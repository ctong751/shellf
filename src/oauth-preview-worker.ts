import { createOAuthClientMetadata } from './lib/oauth-metadata'

const metadataPathPattern =
  /^\/oauth-client-metadata(?:-[A-Za-z0-9._~-]+)?\.json$/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

export default {
  fetch(request: Request, env: OAuthPreviewEnv): Response {
    const url = new URL(request.url)

    if (!metadataPathPattern.test(url.pathname) || url.search) {
      return Response.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders },
      )
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json(
        { error: 'Method not allowed' },
        {
          status: 405,
          headers: { ...corsHeaders, Allow: 'GET, HEAD, OPTIONS' },
        },
      )
    }

    try {
      const redirectUri = getRedirectUri(env.OAUTH_REDIRECT_URI)
      const metadata = createOAuthClientMetadata({
        clientId: `${url.origin}${url.pathname}`,
        clientName: 'Shellf Preview',
        clientUri: new URL('/', redirectUri).href,
        redirectUris: [redirectUri],
      })
      const body = JSON.stringify(metadata)

      return new Response(request.method === 'HEAD' ? null : body, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error(
        JSON.stringify({
          message: 'Invalid OAuth preview Worker configuration',
          error: error instanceof Error ? error.message : String(error),
        }),
      )
      return Response.json(
        { error: 'Worker configuration error' },
        { status: 500, headers: corsHeaders },
      )
    }
  },
} satisfies ExportedHandler<OAuthPreviewEnv>

function getRedirectUri(value: string) {
  const url = new URL(value)

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('OAUTH_REDIRECT_URI must use HTTP or HTTPS')
  }

  return url.href
}
