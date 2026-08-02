import { deleteCookie, getCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'

import { withDb } from '#/db'
import { sessions, users } from '#/db/schema'

const SESSION_COOKIE = 'shellf_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

// Only the hash is stored, so a database leak does not leak usable tokens.
async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function createSessionCookie(userDid: string, secure: boolean) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)

  const id = await hashToken(token)
  await withDb((db) => db.insert(sessions).values({ id, userDid, expiresAt }))

  const attributes = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ]
  if (secure) {
    attributes.push('Secure')
  }
  return attributes.join('; ')
}

export async function getSessionUser() {
  const token = getCookie(SESSION_COOKIE)
  if (!token) {
    return null
  }

  const id = await hashToken(token)
  return withDb(async (db) => {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
    })
    if (!session) {
      return null
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await db.delete(sessions).where(eq(sessions.id, id))
      return null
    }

    const user = await db.query.users.findFirst({
      where: eq(users.did, session.userDid),
    })
    return user ?? null
  })
}

export async function destroySession() {
  const token = getCookie(SESSION_COOKIE)
  if (token) {
    const id = await hashToken(token)
    await withDb((db) => db.delete(sessions).where(eq(sessions.id, id)))
  }
  deleteCookie(SESSION_COOKIE)
}
