// Keep the audience fragment literal. URLSearchParams percent-encodes it once
// when the OAuth client serializes the authorization request.
export const ATPROTO_PROFILE_SCOPE =
  'atproto rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app#bsky_appview'
