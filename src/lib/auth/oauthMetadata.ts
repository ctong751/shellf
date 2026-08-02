import type { OAuthClientMetadataInput } from '@atproto/oauth-types'

import { ATPROTO_PROFILE_SCOPE } from '@/lib/auth/oauthScopes'

interface OAuthClientMetadataOptions {
  clientId: string
  clientName: string
  clientUri: string
  redirectUris: [string, ...string[]]
}

export function createOAuthClientMetadata({
  clientId,
  clientName,
  clientUri,
  redirectUris,
}: OAuthClientMetadataOptions): OAuthClientMetadataInput {
  return {
    client_id: clientId,
    client_name: clientName,
    client_uri: clientUri,
    redirect_uris: redirectUris,
    scope: ATPROTO_PROFILE_SCOPE,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  }
}
