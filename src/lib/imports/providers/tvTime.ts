import { parseCsv, type ParsedCsv } from '@/lib/imports/csv'
import type {
  ImportFile,
  MediaImportItem,
  MediaImportPreview,
  MediaImportProvider,
} from '@/lib/imports/types'

const TV_TIME_PROVIDER_ID = 'tv_time'
const SHOW_DATA_FILE = 'user_tv_show_data.csv'
const LATEST_EPISODE_FILE = 'show_seen_episode_latest.csv'
const FOLLOWED_SHOW_FILE = 'followed_tv_show.csv'

const requiredColumns = {
  [SHOW_DATA_FILE]: [
    'is_followed',
    'nb_episodes_seen',
    'tv_show_id',
    'tv_show_name',
  ],
  [LATEST_EPISODE_FILE]: [
    'created_at',
    'episode_id',
    'tv_show_id',
    'tv_show_name',
  ],
} as const

const getFileName = (file: ImportFile) => {
  const path = file.webkitRelativePath || file.name
  return path.split('/').at(-1)?.toLowerCase() ?? file.name.toLowerCase()
}

const readCsv = async (file: ImportFile, required: readonly string[]) => {
  const parsed = parseCsv(await file.text())
  const missing = required.filter((column) => !parsed.headers.includes(column))
  if (missing.length > 0) {
    throw new Error(
      `${file.name} is missing expected columns: ${missing.join(', ')}.`,
    )
  }
  return parsed
}

const normalizeDate = (value: string | undefined) => {
  if (!value) return undefined
  const candidate = value.includes('T')
    ? value
    : `${value.trim().replace(' ', 'T')}Z`
  const date = new Date(candidate)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

const indexRows = (parsed: ParsedCsv, column: string) =>
  new Map(
    parsed.rows.flatMap((row) => {
      const key = row[column]?.trim()
      return key ? [[key, row] as const] : []
    }),
  )

export const parseTvTimeExport = async (
  files: readonly ImportFile[],
): Promise<MediaImportPreview> => {
  const filesByName = new Map(files.map((file) => [getFileName(file), file]))
  const showDataFile = filesByName.get(SHOW_DATA_FILE)
  const latestEpisodeFile = filesByName.get(LATEST_EPISODE_FILE)

  if (!showDataFile || !latestEpisodeFile) {
    throw new Error(
      `Choose the TV Time GDPR export folder. It must include ${SHOW_DATA_FILE} and ${LATEST_EPISODE_FILE}.`,
    )
  }

  const followedShowFile = filesByName.get(FOLLOWED_SHOW_FILE)
  const [showData, latestEpisodes, followedShows] = await Promise.all([
    readCsv(showDataFile, requiredColumns[SHOW_DATA_FILE]),
    readCsv(latestEpisodeFile, requiredColumns[LATEST_EPISODE_FILE]),
    followedShowFile
      ? readCsv(followedShowFile, ['created_at', 'tv_show_id'])
      : Promise.resolve<ParsedCsv>({ headers: [], rows: [] }),
  ])
  const latestByShow = indexRows(latestEpisodes, 'tv_show_id')
  const followedByShow = indexRows(followedShows, 'tv_show_id')
  const items: MediaImportItem[] = []
  const skippedItems: MediaImportPreview['skippedItems'] = []

  for (const show of showData.rows) {
    if (show.is_followed !== '1') continue

    const showId = show.tv_show_id?.trim()
    const title = show.tv_show_name?.trim() || 'Unknown title'
    if (!showId || !/^\d+$/.test(showId)) {
      skippedItems.push({ reason: 'Missing a valid TVDB show ID.', title })
      continue
    }

    const followed = followedByShow.get(showId)
    const latest = latestByShow.get(showId)
    const latestEpisodeId = latest?.episode_id?.trim()
    const watchedCount = Number.parseInt(show.nb_episodes_seen || '0', 10)

    if (latestEpisodeId && /^\d+$/.test(latestEpisodeId)) {
      items.push({
        consumedAt: normalizeDate(latest?.created_at),
        latestEpisode: { id: latestEpisodeId, source: 'tvdb' },
        show: { id: showId, source: 'tvdb' },
        sourceItemId: `show:${showId}:episode:${latestEpisodeId}`,
        startedAt: normalizeDate(followed?.created_at),
        state: 'watching',
        title,
      })
      continue
    }

    if (!Number.isFinite(watchedCount) || watchedCount <= 0) {
      items.push({
        savedAt: normalizeDate(followed?.created_at),
        show: { id: showId, source: 'tvdb' },
        sourceItemId: `show:${showId}`,
        state: 'saved',
        title,
      })
      continue
    }

    skippedItems.push({
      reason: 'TV Time reports progress but did not include a latest episode.',
      title,
    })
  }

  const warnings = [
    'TV Time provides the latest watched episode for most shows, not a complete dated episode history. Shellf will resume each show from that episode.',
  ]
  if (!followedShowFile) {
    warnings.push(
      `${FOLLOWED_SHOW_FILE} was not present, so original follow dates cannot be preserved.`,
    )
  }
  if (skippedItems.length > 0) {
    warnings.push(
      `${skippedItems.length} followed ${skippedItems.length === 1 ? 'title was' : 'titles were'} skipped because the export did not contain enough progress data.`,
    )
  }

  return {
    filesUsed: [showDataFile, latestEpisodeFile, followedShowFile]
      .filter((file): file is ImportFile => Boolean(file))
      .map((file) => file.name),
    items,
    providerId: TV_TIME_PROVIDER_ID,
    providerName: 'TV Time',
    skippedItems,
    warnings,
  }
}

export const tvTimeImportProvider: MediaImportProvider = {
  id: TV_TIME_PROVIDER_ID,
  name: 'TV Time',
  parse: parseTvTimeExport,
}
