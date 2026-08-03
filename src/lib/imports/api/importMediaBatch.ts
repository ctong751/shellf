import { createServerFn } from '@tanstack/react-start'

import type {
  ImportBatchResult,
  ImportItemState,
  MediaImportItem,
} from '@/lib/imports/types'

interface ImportBatchInput {
  items: MediaImportItem[]
  providerId: string
}

const MAX_BATCH_SIZE = 8
const validStates: readonly ImportItemState[] = ['saved', 'watching']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getRequiredString = (
  record: Record<string, unknown>,
  key: string,
  maximumLength = 512,
) => {
  const value = record[key]
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > maximumLength
  ) {
    throw new Error(`Expected ${key} to be a non-empty string.`)
  }
  return value
}

const getOptionalDate = (record: Record<string, unknown>, key: string) => {
  const value = record[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`Expected ${key} to be a valid date.`)
  }
  return value
}

const validateExternalId = (value: unknown) => {
  if (!isRecord(value)) throw new Error('Expected an external media ID.')
  const id = getRequiredString(value, 'id', 256)
  const source = getRequiredString(value, 'source', 64)
  if (!/^[a-z0-9_-]+$/.test(source) || !/^[A-Za-z0-9._:-]+$/.test(id)) {
    throw new Error('Expected a valid external media ID.')
  }
  return { id, source }
}

const validateItem = (value: unknown): MediaImportItem => {
  if (!isRecord(value)) throw new Error('Expected an import item.')
  const state = getRequiredString(value, 'state', 32)
  if (!validStates.includes(state as ImportItemState)) {
    throw new Error('Expected a supported import state.')
  }

  return {
    consumedAt: getOptionalDate(value, 'consumedAt'),
    latestEpisode:
      value.latestEpisode === undefined
        ? undefined
        : validateExternalId(value.latestEpisode),
    savedAt: getOptionalDate(value, 'savedAt'),
    show: validateExternalId(value.show),
    sourceItemId: getRequiredString(value, 'sourceItemId'),
    startedAt: getOptionalDate(value, 'startedAt'),
    state: state as ImportItemState,
    title: getRequiredString(value, 'title', 300),
  }
}

const validateInput = (value: unknown): ImportBatchInput => {
  if (!isRecord(value)) throw new Error('Expected an import batch.')
  const providerId = getRequiredString(value, 'providerId', 64)
  if (!/^[a-z0-9_-]+$/.test(providerId)) {
    throw new Error('Expected a valid import provider.')
  }
  if (
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > MAX_BATCH_SIZE
  ) {
    throw new Error(`Import batches must contain 1–${MAX_BATCH_SIZE} items.`)
  }
  return { items: value.items.map(validateItem), providerId }
}

const toDate = (value: string | undefined) =>
  value ? new Date(value) : new Date()

const getContentId = (kind: 'tv_episode' | 'tv_show', externalId: string) =>
  `tmdb:${kind}:${externalId}`

const getImportRecordKey = (
  providerId: string,
  kind: 'episode' | 'show',
  externalId: string,
) => `import:${providerId}:${kind}:${externalId}`

export const importMediaBatch = createServerFn({ method: 'POST' })
  .validator(validateInput)
  .handler(async ({ data }): Promise<ImportBatchResult> => {
    const [
      { and, eq, notExists },
      { withDb },
      { consumptionStarts, consumptionStops, consumes, content, saves },
      { getSessionUser },
      { getServerMediaImportProvider },
    ] = await Promise.all([
      import('drizzle-orm'),
      import('@/db'),
      import('@/db/schema'),
      import('@/lib/auth/session.server'),
      import('@/lib/imports/providers/server'),
    ])
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in to import your collection.')
    const provider = getServerMediaImportProvider(data.providerId)
    if (!provider) throw new Error('Unsupported import provider.')

    const result: ImportBatchResult = {
      alreadyPresent: 0,
      imported: 0,
      unmatched: [],
    }

    for (const item of data.items) {
      try {
        const resolved = await provider.resolve(item)
        if (!resolved) {
          result.unmatched.push({
            reason: 'No matching title was found on TMDB.',
            title: item.title,
          })
          continue
        }

        const didImport = await withDb((db) =>
          db.transaction(async (transaction) => {
            const showContentId = getContentId(
              'tv_show',
              resolved.showExternalId,
            )
            await transaction
              .insert(content)
              .values({
                externalId: resolved.showExternalId,
                id: showContentId,
                kind: 'tv_show',
                source: 'tmdb',
              })
              .onConflictDoUpdate({
                target: [content.source, content.kind, content.externalId],
                set: { updatedAt: new Date() },
              })

            if (item.state === 'saved') {
              const inserted = await transaction
                .insert(saves)
                .values({
                  authorDid: user.did,
                  contentId: showContentId,
                  createdAt: toDate(item.savedAt),
                  recordKey: getImportRecordKey(
                    data.providerId,
                    'show',
                    item.show.id,
                  ),
                })
                .onConflictDoNothing()
                .returning({ recordKey: saves.recordKey })
              return inserted.length > 0
            }

            if (!resolved.episode || !item.latestEpisode) return false

            const episodeContentId = getContentId(
              'tv_episode',
              resolved.episode.externalId,
            )
            await transaction
              .insert(content)
              .values({
                episodeNumber: resolved.episode.episodeNumber,
                externalId: resolved.episode.externalId,
                id: episodeContentId,
                kind: 'tv_episode',
                parentContentId: showContentId,
                seasonNumber: resolved.episode.seasonNumber,
                source: 'tmdb',
              })
              .onConflictDoUpdate({
                target: [content.source, content.kind, content.externalId],
                set: {
                  episodeNumber: resolved.episode.episodeNumber,
                  parentContentId: showContentId,
                  seasonNumber: resolved.episode.seasonNumber,
                  updatedAt: new Date(),
                },
              })

            const [[existingStart], [existingConsume], [existingSave]] =
              await Promise.all([
                transaction
                  .select({ recordKey: consumptionStarts.recordKey })
                  .from(consumptionStarts)
                  .where(
                    and(
                      eq(consumptionStarts.authorDid, user.did),
                      eq(consumptionStarts.contentId, showContentId),
                      notExists(
                        transaction
                          .select({ recordKey: consumptionStops.recordKey })
                          .from(consumptionStops)
                          .where(
                            and(
                              eq(
                                consumptionStops.startAuthorDid,
                                consumptionStarts.authorDid,
                              ),
                              eq(
                                consumptionStops.startRecordKey,
                                consumptionStarts.recordKey,
                              ),
                            ),
                          ),
                      ),
                    ),
                  )
                  .limit(1),
                transaction
                  .select({ recordKey: consumes.recordKey })
                  .from(consumes)
                  .where(
                    and(
                      eq(consumes.authorDid, user.did),
                      eq(consumes.contentId, episodeContentId),
                    ),
                  )
                  .limit(1),
                transaction
                  .select({ recordKey: saves.recordKey })
                  .from(saves)
                  .where(
                    and(
                      eq(saves.authorDid, user.did),
                      eq(saves.contentId, showContentId),
                    ),
                  )
                  .limit(1),
              ])

            let changed = false
            if (!existingStart) {
              const inserted = await transaction
                .insert(consumptionStarts)
                .values({
                  authorDid: user.did,
                  contentId: showContentId,
                  recordKey: getImportRecordKey(
                    data.providerId,
                    'show',
                    item.show.id,
                  ),
                  startedAt: toDate(item.startedAt),
                })
                .onConflictDoNothing()
                .returning({ recordKey: consumptionStarts.recordKey })
              changed ||= inserted.length > 0
            }

            if (!existingConsume) {
              const inserted = await transaction
                .insert(consumes)
                .values({
                  authorDid: user.did,
                  consumedAt: toDate(item.consumedAt),
                  contentId: episodeContentId,
                  recordKey: getImportRecordKey(
                    data.providerId,
                    'episode',
                    item.latestEpisode.id,
                  ),
                })
                .onConflictDoNothing()
                .returning({ recordKey: consumes.recordKey })
              changed ||= inserted.length > 0
            }

            if (existingSave) {
              await transaction
                .delete(saves)
                .where(
                  and(
                    eq(saves.authorDid, user.did),
                    eq(saves.contentId, showContentId),
                  ),
                )
              changed = true
            }

            return changed
          }),
        )

        if (didImport) result.imported += 1
        else result.alreadyPresent += 1
      } catch (error) {
        console.error('Failed to import media item', {
          error,
          providerId: data.providerId,
          sourceItemId: item.sourceItemId,
        })
        result.unmatched.push({
          reason: 'The title could not be imported. You can try again later.',
          title: item.title,
        })
      }
    }

    return result
  })
