import { tvTimeImportProvider } from '@/lib/imports/providers/tvTime'
import type { MediaImportProvider } from '@/lib/imports/types'

export const mediaImportProviders: readonly MediaImportProvider[] = [
  tvTimeImportProvider,
]

export const getMediaImportProvider = (providerId: string) =>
  mediaImportProviders.find((provider) => provider.id === providerId)
