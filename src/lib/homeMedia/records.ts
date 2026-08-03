import type { consumptionStarts, consumes, content, saves } from '@/db/schema'

export interface SavedContentRecord {
  content: typeof content.$inferSelect
  save: typeof saves.$inferSelect
}

export interface ConsumedContentRecord {
  consume: typeof consumes.$inferSelect
  content: typeof content.$inferSelect
  parentContent?: typeof content.$inferSelect
}

export interface ActiveConsumptionRecord {
  content: typeof content.$inferSelect
  lastConsumedContent?: typeof content.$inferSelect
  start: typeof consumptionStarts.$inferSelect
}
