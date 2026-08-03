import { and, desc, eq, inArray, notExists } from 'drizzle-orm'

import { withDb } from '@/db'
import {
  consumptionStarts,
  consumptionStops,
  consumes,
  content,
  saves,
} from '@/db/schema'
import { loadRecentItems } from '@/lib/homeMedia/loadRecentItems.server'
import { loadSavedItems } from '@/lib/homeMedia/loadSavedItems.server'
import { loadWatchingItems } from '@/lib/homeMedia/loadWatchingItems.server'
import type { HomeMedia } from '@/lib/homeMedia/types'
import { createTmdbRequestClient } from '@/lib/tmdb/createRequestClient.server'

export const loadHomeMedia = async (authorDid: string): Promise<HomeMedia> => {
  const { recentRecords, savedRecords, watchingRecords } = await withDb(
    async (db) => {
      const [recent, saved, activeStarts] = await Promise.all([
        db
          .select({ consume: consumes, content })
          .from(consumes)
          .innerJoin(content, eq(consumes.contentId, content.id))
          .where(
            and(
              eq(consumes.authorDid, authorDid),
              inArray(content.kind, ['movie', 'tv_episode']),
            ),
          )
          .orderBy(desc(consumes.consumedAt))
          .limit(3),
        db
          .select({ content, save: saves })
          .from(saves)
          .innerJoin(content, eq(saves.contentId, content.id))
          .where(
            and(
              eq(saves.authorDid, authorDid),
              inArray(content.kind, ['movie', 'tv_show']),
            ),
          )
          .orderBy(desc(saves.createdAt)),
        db
          .select({ content, start: consumptionStarts })
          .from(consumptionStarts)
          .innerJoin(content, eq(consumptionStarts.contentId, content.id))
          .where(
            and(
              eq(consumptionStarts.authorDid, authorDid),
              inArray(content.kind, ['movie', 'tv_show']),
              notExists(
                db
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
          .orderBy(desc(consumptionStarts.startedAt)),
      ])

      const parentIds = recent.flatMap(({ content: item }) =>
        item.parentContentId ? [item.parentContentId] : [],
      )
      const parents =
        parentIds.length > 0
          ? await db
              .select()
              .from(content)
              .where(inArray(content.id, parentIds))
          : []
      const parentById = new Map(parents.map((item) => [item.id, item]))

      const uniqueStarts = activeStarts.filter(
        ({ start }, index, records) =>
          records.findIndex(
            ({ start: candidate }) => candidate.contentId === start.contentId,
          ) === index,
      )
      const activeShowIds = uniqueStarts.flatMap(({ content: item }) =>
        item.kind === 'tv_show' ? [item.id] : [],
      )
      const consumedEpisodes =
        activeShowIds.length > 0
          ? await db
              .select({ consume: consumes, content })
              .from(consumes)
              .innerJoin(content, eq(consumes.contentId, content.id))
              .where(
                and(
                  eq(consumes.authorDid, authorDid),
                  inArray(content.parentContentId, activeShowIds),
                ),
              )
              .orderBy(desc(consumes.consumedAt))
          : []
      const latestEpisodeByShow = new Map<
        string,
        (typeof consumedEpisodes)[number]['content']
      >()
      consumedEpisodes.forEach(({ content: episode }) => {
        if (
          episode.parentContentId &&
          !latestEpisodeByShow.has(episode.parentContentId)
        ) {
          latestEpisodeByShow.set(episode.parentContentId, episode)
        }
      })

      return {
        recentRecords: recent.map((record) => ({
          ...record,
          parentContent: record.content.parentContentId
            ? parentById.get(record.content.parentContentId)
            : undefined,
        })),
        savedRecords: saved,
        watchingRecords: uniqueStarts.map((record) => ({
          ...record,
          lastConsumedContent: latestEpisodeByShow.get(record.content.id),
        })),
      }
    },
  )

  const tmdb = createTmdbRequestClient()
  const [recentItems, savedItems, watchingItems] = await Promise.all([
    loadRecentItems(tmdb, recentRecords),
    loadSavedItems(tmdb, savedRecords),
    loadWatchingItems(tmdb, watchingRecords),
  ])

  return { recentItems, savedItems, watchingItems }
}
