export interface ParsedCsv {
  headers: string[]
  rows: Array<Record<string, string>>
}

export const parseCsv = (input: string): ParsedCsv => {
  const table: string[][] = []
  let field = ''
  let inQuotes = false
  let row: string[] = []

  const finishField = () => {
    row.push(field)
    field = ''
  }

  const finishRow = () => {
    finishField()
    if (row.some((value) => value.length > 0)) {
      table.push(row)
    }
    row = []
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (inQuotes) {
      if (character !== '"') {
        field += character
        continue
      }

      if (input[index + 1] === '"') {
        field += '"'
        index += 1
        continue
      }

      inQuotes = false
      continue
    }

    if (character === '"') {
      inQuotes = true
      continue
    }

    if (character === ',') {
      finishField()
      continue
    }

    if (character === '\n') {
      finishRow()
      continue
    }

    if (character !== '\r') {
      field += character
    }
  }

  if (field.length > 0 || row.length > 0) {
    finishRow()
  }

  const [rawHeaders = [], ...dataRows] = table
  const headers = rawHeaders.map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim(),
  )

  return {
    headers,
    rows: dataRows.map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? '']),
      ),
    ),
  }
}
