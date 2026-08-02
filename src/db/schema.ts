import type {
  NodeSavedSession,
  NodeSavedState,
} from '@atproto/oauth-client-node'
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  did: text('did').primaryKey(),
  handle: text('handle').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Backing store for the OAuth client's in-flight authorization requests,
// keyed by the state parameter. Rows are short-lived and safe to prune.
export const oauthStates = pgTable('oauth_states', {
  key: text('key').primaryKey(),
  state: jsonb('state').$type<NodeSavedState>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Backing store for the OAuth client's DPoP-bound token sets, keyed by the
// account DID. The client refreshes these in place.
export const oauthSessions = pgTable('oauth_sessions', {
  did: text('did').primaryKey(),
  session: jsonb('session').$type<NodeSavedSession>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Shellf's own login sessions: an opaque token in an HttpOnly cookie, stored
// here as a SHA-256 hash so a database leak does not leak usable tokens.
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userDid: text('user_did')
    .notNull()
    .references(() => users.did, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
