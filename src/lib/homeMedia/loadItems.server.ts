interface ContentRecord {
  content: { id: string }
}

export const loadMediaItems = async <Record extends ContentRecord, Item>(
  records: readonly Record[],
  load: (record: Record) => Promise<Item | null>,
  failureMessage: string,
): Promise<Awaited<Item>[]> => {
  const items = await Promise.all(
    records.map(async (record) => {
      try {
        return await load(record)
      } catch (error) {
        console.error(
          JSON.stringify({
            contentId: record.content.id,
            error: error instanceof Error ? error.message : String(error),
            message: failureMessage,
          }),
        )
        return null
      }
    }),
  )

  return items.filter((item): item is Awaited<Item> => item !== null)
}
