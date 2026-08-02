import { describe, expect, it } from 'vitest'

import { createOAuthClientMetadata } from '@/lib/auth/oauthMetadata'

describe('createOAuthClientMetadata', () => {
  it('declares the profile permission with a literal audience fragment', () => {
    const metadata = createOAuthClientMetadata({
      clientId: 'https://example.com/oauth-client-metadata.json',
      clientName: 'Example',
      clientUri: 'https://example.com/',
      redirectUris: ['https://example.com/'],
    })

    expect(metadata.scope).toContain('#bsky_appview')

    const query = new URLSearchParams({
      scope: metadata.scope ?? '',
    }).toString()
    expect(query).toContain('%23bsky_appview')
    expect(query).not.toContain('%2523bsky_appview')
  })
})
