import { resolveTvTimeImportItem } from '@/lib/imports/providers/tvTime.server'
import type { MediaImportItem } from '@/lib/imports/types'

export interface ResolvedImportItem {
  episode?: {
    episodeNumber: number
    externalId: string
    seasonNumber: number
  }
  showExternalId: string
}

export interface ServerMediaImportProvider {
  id: string
  resolve: (item: MediaImportItem) => Promise<ResolvedImportItem | undefined>
}

const serverMediaImportProviders: readonly ServerMediaImportProvider[] = [
  { id: 'tv_time', resolve: resolveTvTimeImportItem },
]

export const getServerMediaImportProvider = (providerId: string) =>
  serverMediaImportProviders.find((provider) => provider.id === providerId)
