export type ImportItemState = 'saved' | 'watching'

export interface ExternalMediaId {
  id: string
  source: string
}

export interface MediaImportItem {
  consumedAt?: string
  latestEpisode?: ExternalMediaId
  savedAt?: string
  show: ExternalMediaId
  sourceItemId: string
  startedAt?: string
  state: ImportItemState
  title: string
}

export interface SkippedImportItem {
  reason: string
  title: string
}

export interface MediaImportPreview {
  filesUsed: string[]
  items: MediaImportItem[]
  providerId: string
  providerName: string
  skippedItems: SkippedImportItem[]
  warnings: string[]
}

export interface ImportFile {
  name: string
  text: () => Promise<string>
  webkitRelativePath?: string
}

export interface MediaImportProvider {
  id: string
  name: string
  parse: (files: readonly ImportFile[]) => Promise<MediaImportPreview>
}

export interface ImportBatchResult {
  alreadyPresent: number
  imported: number
  unmatched: SkippedImportItem[]
}
