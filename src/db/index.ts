import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import * as schema from '#/db/schema'

export type Db = NodePgDatabase<typeof schema>

// workerd forbids performing I/O on a socket created by another request, so
// there is no shared pool: every operation opens a short-lived connection and
// closes it before the response ends. Revisit once production pooling (e.g.
// Hyperdrive) is in place.
export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    return await fn(drizzle(client, { schema }))
  } finally {
    await client.end()
  }
}
