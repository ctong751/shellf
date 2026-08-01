import '@tanstack/react-start/client-only'

import { Agent } from '@atproto/api'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

export interface ViewerProfile {
  avatar?: string
  description?: string
  did: string
  displayName: string
  followersCount: number
  followsCount: number
  handle: string
  postsCount: number
}

let clientPromise: Promise<BrowserOAuthClient> | undefined
let initializationPromise: Promise<ViewerProfile | null> | undefined

function isLoopbackHost(hostname: string) {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  )
}

function getClient() {
  clientPromise ??= (async () => {
    const handleResolver = 'https://bsky.social'
    const configuredClientId = import.meta.env.VITE_ATPROTO_CLIENT_ID

    if (configuredClientId) {
      return BrowserOAuthClient.load({
        clientId: configuredClientId,
        handleResolver,
      })
    }

    if (isLoopbackHost(window.location.hostname)) {
      return new BrowserOAuthClient({
        clientMetadata: undefined,
        handleResolver,
      })
    }

    return BrowserOAuthClient.load({
      clientId: `${window.location.origin}/oauth-client-metadata.json`,
      handleResolver,
    })
  })()

  return clientPromise
}

async function loadProfile() {
  const client = await getClient()
  const result = await client.init()

  if (!result) {
    return null
  }

  const agent = new Agent(result.session)
  const response = await agent.getProfile({ actor: result.session.sub })
  const profile = response.data

  return {
    avatar: profile.avatar,
    description: profile.description,
    did: profile.did,
    displayName: profile.displayName || profile.handle,
    followersCount: profile.followersCount ?? 0,
    followsCount: profile.followsCount ?? 0,
    handle: profile.handle,
    postsCount: profile.postsCount ?? 0,
  } satisfies ViewerProfile
}

export function initializeAtproto() {
  initializationPromise ??= loadProfile()
  return initializationPromise
}

export async function signIn(identifier: string) {
  const client = await getClient()
  await client.signIn(identifier)
}

export async function signOut(did: string) {
  const client = await getClient()
  await client.revoke(did)
  initializationPromise = undefined
}
