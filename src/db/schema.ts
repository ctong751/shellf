import type {
  NodeSavedSession,
  NodeSavedState,
} from '@atproto/oauth-client-node'
import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export type ContentKind = 'movie' | 'tv_episode' | 'tv_show'

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

// Content is a canonical TMDB identity, not a local copy of TMDB metadata.
// Episode coordinates are identity data required to resolve TMDB's nested
// episode endpoints and connect an episode back to its show.
export const content = pgTable(
  'content',
  {
    id: text('id').primaryKey(),
    kind: text('kind').$type<ContentKind>().notNull(),
    source: text('source').notNull().default('tmdb'),
    externalId: text('external_id').notNull(),
    parentContentId: text('parent_content_id').references(
      (): AnyPgColumn => content.id,
      { onDelete: 'cascade' },
    ),
    seasonNumber: integer('season_number'),
    episodeNumber: integer('episode_number'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('content_source_identity_unique').on(
      table.source,
      table.kind,
      table.externalId,
    ),
    index('content_parent_idx').on(table.parentContentId),
    check(
      'content_kind_check',
      sql`${table.kind} in ('movie', 'tv_show', 'tv_episode')`,
    ),
    check('content_source_check', sql`${table.source} = 'tmdb'`),
    check(
      'content_external_id_check',
      sql`length(${table.externalId}) between 1 and 256`,
    ),
    check(
      'content_episode_identity_check',
      sql`(${table.kind} = 'tv_episode' and ${table.parentContentId} is not null and ${table.seasonNumber} >= 0 and ${table.episodeNumber} > 0) or (${table.kind} <> 'tv_episode' and ${table.parentContentId} is null and ${table.seasonNumber} is null and ${table.episodeNumber} is null)`,
    ),
  ],
)

export const saves = pgTable(
  'saves',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    uniqueIndex('saves_author_content_unique').on(
      table.authorDid,
      table.contentId,
    ),
    index('saves_author_created_at_idx').on(table.authorDid, table.createdAt),
  ],
)

export const consumes = pgTable(
  'consumes',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    consumedAt: timestamp('consumed_at', { withTimezone: true }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    index('consumes_author_consumed_at_idx').on(
      table.authorDid,
      table.consumedAt,
    ),
    index('consumes_content_consumed_at_idx').on(
      table.contentId,
      table.consumedAt,
    ),
  ],
)

export const reviews = pgTable(
  'reviews',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    text: text('text'),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    uniqueIndex('reviews_author_content_unique').on(
      table.authorDid,
      table.contentId,
    ),
    index('reviews_content_created_at_idx').on(
      table.contentId,
      table.createdAt,
    ),
    check('reviews_rating_check', sql`${table.rating} between 1 and 5`),
  ],
)

export const comments = pgTable(
  'comments',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    replyUri: text('reply_uri'),
    replyCid: text('reply_cid'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    index('comments_content_created_at_idx').on(
      table.contentId,
      table.createdAt,
    ),
    index('comments_reply_uri_idx').on(table.replyUri),
    check(
      'comments_reply_ref_check',
      sql`(${table.replyUri} is null and ${table.replyCid} is null) or (${table.replyUri} is not null and ${table.replyCid} is not null)`,
    ),
    check(
      'comments_reply_target_check',
      sql`${table.replyUri} is null or split_part(${table.replyUri}, '/', 4) = 'net.shellf.temp.comment'`,
    ),
  ],
)

export const likes = pgTable(
  'likes',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    subjectUri: text('subject_uri').notNull(),
    subjectCid: text('subject_cid').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    uniqueIndex('likes_author_subject_unique').on(
      table.authorDid,
      table.subjectUri,
    ),
    index('likes_subject_uri_idx').on(table.subjectUri),
    check(
      'likes_subject_target_check',
      sql`split_part(${table.subjectUri}, '/', 4) = 'net.shellf.temp.comment'`,
    ),
  ],
)

export const consumptionStarts = pgTable(
  'consumption_starts',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    index('consumption_starts_author_started_at_idx').on(
      table.authorDid,
      table.startedAt,
    ),
    index('consumption_starts_author_content_idx').on(
      table.authorDid,
      table.contentId,
    ),
  ],
)

export const consumptionStops = pgTable(
  'consumption_stops',
  {
    authorDid: text('author_did')
      .notNull()
      .references(() => users.did, { onDelete: 'cascade' }),
    recordKey: text('record_key').notNull(),
    subjectUri: text('subject_uri').notNull(),
    subjectCid: text('subject_cid'),
    startAuthorDid: text('start_author_did').notNull(),
    startRecordKey: text('start_record_key').notNull(),
    stoppedAt: timestamp('stopped_at', { withTimezone: true }).notNull(),
    indexedAt: timestamp('indexed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.authorDid, table.recordKey] }),
    foreignKey({
      columns: [table.startAuthorDid, table.startRecordKey],
      foreignColumns: [
        consumptionStarts.authorDid,
        consumptionStarts.recordKey,
      ],
      name: 'consumption_stops_start_fk',
    }).onDelete('cascade'),
    uniqueIndex('consumption_stops_start_unique').on(
      table.startAuthorDid,
      table.startRecordKey,
    ),
    index('consumption_stops_author_stopped_at_idx').on(
      table.authorDid,
      table.stoppedAt,
    ),
    check(
      'consumption_stops_author_check',
      sql`${table.authorDid} = ${table.startAuthorDid}`,
    ),
    check(
      'consumption_stops_subject_target_check',
      sql`split_part(${table.subjectUri}, '/', 4) = 'net.shellf.temp.startConsuming'`,
    ),
  ],
)
