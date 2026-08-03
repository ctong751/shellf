import { createServerFn } from '@tanstack/react-start'

const validateRecordKey = (value: unknown) => {
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9._:~-]{1,512}$/.test(value) ||
    value === '.' ||
    value === '..'
  ) {
    throw new Error('Expected a valid record key.')
  }
  return value
}

const requireAccount = async () => {
  const { getSessionUser } = await import('@/lib/auth/session.server')
  const user = await getSessionUser()
  if (!user) throw new Error('Sign in to update your collection.')
  return user
}

const getStartUri = (did: string, recordKey: string) =>
  `at://${did}/net.shellf.temp.startConsuming/${recordKey}`

const getContentId = (kind: string, externalId: string) =>
  `tmdb:${kind}:${externalId}`

export const startWatching = createServerFn({ method: 'POST' })
  .validator(validateRecordKey)
  .handler(async ({ data: recordKey }) => {
    const [
      { and, eq },
      { withDb },
      { consumptionStarts, content, saves },
      { loadHomeMedia },
    ] = await Promise.all([
      import('drizzle-orm'),
      import('@/db'),
      import('@/db/schema'),
      import('@/lib/homeMedia/loadHomeMedia.server'),
    ])
    const user = await requireAccount()

    await withDb(async (db) => {
      const [item] = await db
        .select({ content, save: saves })
        .from(saves)
        .innerJoin(content, eq(saves.contentId, content.id))
        .where(
          and(eq(saves.authorDid, user.did), eq(saves.recordKey, recordKey)),
        )
        .limit(1)
      if (!item) throw new Error('That title is no longer saved.')
      if (item.content.kind === 'tv_episode') {
        throw new Error('Start the TV show rather than an individual episode.')
      }

      const now = new Date()
      await db.transaction(async (transaction) => {
        await transaction.insert(consumptionStarts).values({
          authorDid: user.did,
          contentId: item.content.id,
          recordKey: crypto.randomUUID(),
          startedAt: now,
        })
        await transaction
          .delete(saves)
          .where(
            and(eq(saves.authorDid, user.did), eq(saves.recordKey, recordKey)),
          )
      })
    })

    return loadHomeMedia(user.did)
  })

export const markWatched = createServerFn({ method: 'POST' })
  .validator(validateRecordKey)
  .handler(async ({ data: recordKey }) => {
    const [
      { and, desc, eq, notExists },
      { withDb },
      { consumptionStarts, consumptionStops, consumes, content },
      { createTmdbRequestClient },
      { getNextTvEpisode },
      { loadHomeMedia },
    ] = await Promise.all([
      import('drizzle-orm'),
      import('@/db'),
      import('@/db/schema'),
      import('@/lib/tmdb/createRequestClient.server'),
      import('@/lib/homeMedia/nextEpisode.server'),
      import('@/lib/homeMedia/loadHomeMedia.server'),
    ])
    const user = await requireAccount()
    const item = await withDb(async (db) => {
      const [result] = await db
        .select({ content, start: consumptionStarts })
        .from(consumptionStarts)
        .innerJoin(content, eq(consumptionStarts.contentId, content.id))
        .where(
          and(
            eq(consumptionStarts.authorDid, user.did),
            eq(consumptionStarts.recordKey, recordKey),
            notExists(
              db
                .select({ recordKey: consumptionStops.recordKey })
                .from(consumptionStops)
                .where(
                  and(
                    eq(consumptionStops.startAuthorDid, user.did),
                    eq(consumptionStops.startRecordKey, recordKey),
                  ),
                ),
            ),
          ),
        )
        .limit(1)
      if (!result) return undefined

      if (result.content.kind !== 'tv_show') return { ...result }

      const [lastConsumed] = await db
        .select({ content })
        .from(consumes)
        .innerJoin(content, eq(consumes.contentId, content.id))
        .where(
          and(
            eq(consumes.authorDid, user.did),
            eq(content.parentContentId, result.content.id),
          ),
        )
        .orderBy(desc(consumes.consumedAt))
        .limit(1)

      return { ...result, lastConsumedContent: lastConsumed?.content }
    })
    if (!item) throw new Error('That title is no longer in Up Next.')
    if (item.content.kind === 'tv_episode') {
      throw new Error('An episode cannot be started independently.')
    }

    const now = new Date()
    let consumedContentId = item.content.id
    let shouldStop = item.content.kind === 'movie'
    let episodeIdentity:
      | {
          episodeNumber: number
          externalId: string
          id: string
          seasonNumber: number
        }
      | undefined

    if (item.content.kind === 'tv_show') {
      const tmdb = createTmdbRequestClient()
      const showId = Number(item.content.externalId)
      const show = await tmdb.getTvDetails(showId)
      const lastConsumedContent =
        'lastConsumedContent' in item ? item.lastConsumedContent : undefined
      const next = await getNextTvEpisode(
        tmdb,
        showId,
        show.number_of_seasons,
        lastConsumedContent,
      )
      if (!next) throw new Error('There are no unwatched episodes available.')

      episodeIdentity = {
        episodeNumber: next.currentEpisode.episode_number,
        externalId: String(next.currentEpisode.id),
        id: getContentId('tv_episode', String(next.currentEpisode.id)),
        seasonNumber: next.currentEpisode.season_number,
      }
      consumedContentId = episodeIdentity.id
      shouldStop = !(await getNextTvEpisode(
        tmdb,
        showId,
        show.number_of_seasons,
        episodeIdentity,
      ))
    }

    await withDb((db) =>
      db.transaction(async (transaction) => {
        let indexedContentId = consumedContentId
        if (episodeIdentity) {
          const [indexedEpisode] = await transaction
            .insert(content)
            .values({
              episodeNumber: episodeIdentity.episodeNumber,
              externalId: episodeIdentity.externalId,
              id: episodeIdentity.id,
              kind: 'tv_episode',
              parentContentId: item.content.id,
              seasonNumber: episodeIdentity.seasonNumber,
              source: 'tmdb',
            })
            .onConflictDoUpdate({
              target: [content.source, content.kind, content.externalId],
              set: {
                episodeNumber: episodeIdentity.episodeNumber,
                parentContentId: item.content.id,
                seasonNumber: episodeIdentity.seasonNumber,
              },
            })
            .returning({ id: content.id })
          indexedContentId = indexedEpisode.id
        }

        await transaction.insert(consumes).values({
          authorDid: user.did,
          consumedAt: now,
          contentId: indexedContentId,
          recordKey: crypto.randomUUID(),
        })

        if (shouldStop) {
          await transaction.insert(consumptionStops).values({
            authorDid: user.did,
            recordKey: crypto.randomUUID(),
            startAuthorDid: user.did,
            startRecordKey: item.start.recordKey,
            stoppedAt: now,
            subjectUri: getStartUri(user.did, item.start.recordKey),
          })
        }
      }),
    )

    return loadHomeMedia(user.did)
  })

export const undoWatch = createServerFn({ method: 'POST' })
  .validator(validateRecordKey)
  .handler(async ({ data: recordKey }) => {
    const [
      { and, desc, eq },
      { withDb },
      { consumptionStarts, consumptionStops, consumes, content },
      { loadHomeMedia },
    ] = await Promise.all([
      import('drizzle-orm'),
      import('@/db'),
      import('@/db/schema'),
      import('@/lib/homeMedia/loadHomeMedia.server'),
    ])
    const user = await requireAccount()

    await withDb(async (db) => {
      const [event] = await db
        .select({ consume: consumes, content })
        .from(consumes)
        .innerJoin(content, eq(consumes.contentId, content.id))
        .where(
          and(
            eq(consumes.authorDid, user.did),
            eq(consumes.recordKey, recordKey),
          ),
        )
        .limit(1)
      if (!event)
        throw new Error('That consumption activity has already changed.')

      const startedContentId =
        event.content.kind === 'tv_episode'
          ? event.content.parentContentId
          : event.content.id
      const [start] = startedContentId
        ? await db
            .select()
            .from(consumptionStarts)
            .where(
              and(
                eq(consumptionStarts.authorDid, user.did),
                eq(consumptionStarts.contentId, startedContentId),
              ),
            )
            .orderBy(desc(consumptionStarts.startedAt))
            .limit(1)
        : []

      await db.transaction(async (transaction) => {
        if (start) {
          await transaction
            .delete(consumptionStops)
            .where(
              and(
                eq(consumptionStops.startAuthorDid, user.did),
                eq(consumptionStops.startRecordKey, start.recordKey),
              ),
            )
        }
        await transaction
          .delete(consumes)
          .where(
            and(
              eq(consumes.authorDid, user.did),
              eq(consumes.recordKey, recordKey),
            ),
          )
      })
    })

    return loadHomeMedia(user.did)
  })
