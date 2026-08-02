import {
  NodeOAuthClient,
  atprotoLoopbackClientMetadata,
  didDocumentValidator,
  isLoopbackHost,
  type NodeOAuthClientOptions,
  type NodeSavedSessionStore,
  type NodeSavedStateStore,
} from '@atproto/oauth-client-node'
import { eq } from 'drizzle-orm'

import { withDb } from '#/db'
import { oauthSessions, oauthStates } from '#/db/schema'
import { createOAuthClientMetadata } from '#/lib/oauth-metadata'
import { ATPROTO_PROFILE_SCOPE } from '#/lib/oauth-scopes'

const stateStore: NodeSavedStateStore = {
  async get(key) {
    const row = await withDb((db) =>
      db.query.oauthStates.findFirst({ where: eq(oauthStates.key, key) }),
    )
    return row?.state
  },
  async set(key, state) {
    await withDb((db) =>
      db
        .insert(oauthStates)
        .values({ key, state })
        .onConflictDoUpdate({ target: oauthStates.key, set: { state } }),
    )
  },
  async del(key) {
    await withDb((db) => db.delete(oauthStates).where(eq(oauthStates.key, key)))
  },
}

const sessionStore: NodeSavedSessionStore = {
  async get(did) {
    const row = await withDb((db) =>
      db.query.oauthSessions.findFirst({ where: eq(oauthSessions.did, did) }),
    )
    return row?.session
  },
  async set(did, session) {
    await withDb((db) =>
      db
        .insert(oauthSessions)
        .values({ did, session })
        .onConflictDoUpdate({
          target: oauthSessions.did,
          set: { session, updatedAt: new Date() },
        }),
    )
  },
  async del(did) {
    await withDb((db) =>
      db.delete(oauthSessions).where(eq(oauthSessions.did, did)),
    )
  },
}

// workerd's fetch rejects `redirect: 'error'`, which the atproto resolvers
// use; emulate it with 'manual' and treat any redirect as a failure.
const workerdSafeFetch: typeof globalThis.fetch = async (input, init) => {
  if (init?.redirect !== 'error') {
    return fetch(input, init)
  }

  const response = await fetch(input, { ...init, redirect: 'manual' })
  if (response.status >= 300 && response.status < 400) {
    throw new TypeError(`Unexpected redirect while fetching ${response.url}`)
  }
  return response
}

// The library's built-in DID resolver constructs Request objects with
// `redirect: 'error'` before any injected fetch can intervene, which throws
// in workerd. Resolving DID documents with plain fetches sidesteps that;
// the client still wraps this in its own caching layer.
const didResolver = {
  async resolve(did: string, options?: { signal?: AbortSignal }) {
    const response = await fetch(didDocumentUrl(did), {
      headers: { accept: 'application/did+ld+json,application/json' },
      redirect: 'manual',
      signal: options?.signal,
    })
    if (!response.ok) {
      throw new Error(
        `Failed to resolve DID document for ${did} (${response.status})`,
      )
    }
    return didDocumentValidator.parse(await response.json())
  },
} as NonNullable<NodeOAuthClientOptions['didResolver']>

function didDocumentUrl(did: string) {
  if (did.startsWith('did:plc:')) {
    return new URL(`/${encodeURIComponent(did)}`, 'https://plc.directory')
  }

  if (did.startsWith('did:web:')) {
    const [host, ...path] = did
      .slice('did:web:'.length)
      .split(':')
      .map(decodeURIComponent)
    return new URL(
      path.length
        ? `https://${host}/${path.join('/')}/did.json`
        : `https://${host}/.well-known/did.json`,
    )
  }

  throw new Error(`Unsupported DID method: ${did}`)
}

const clients = new Map<string, NodeOAuthClient>()

export function getOAuthClient(origin: string) {
  const existing = clients.get(origin)
  if (existing) {
    return existing
  }

  const client = createClient(origin)
  clients.set(origin, client)
  return client
}

function createClient(origin: string) {
  return new NodeOAuthClient({
    clientMetadata: createMetadata(origin),
    handleResolver: 'https://public.api.bsky.app',
    didResolver,
    fetch: workerdSafeFetch,
    stateStore,
    sessionStore,
  })
}

function createMetadata(origin: string) {
  const redirectUri = `${origin}/oauth/callback`

  // On loopback hosts ATProto allows an unregistered dev client whose
  // client_id is `http://localhost` with the real config in the query string.
  if (isLoopbackHost(new URL(origin).hostname)) {
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      scope: ATPROTO_PROFILE_SCOPE,
    })
    return atprotoLoopbackClientMetadata(`http://localhost?${params}`)
  }

  return createOAuthClientMetadata({
    clientId: `${origin}/oauth-client-metadata.json`,
    clientName: 'Shellf',
    clientUri: `${origin}/`,
    redirectUris: [redirectUri],
  })
}
