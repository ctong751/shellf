export const formatRuntime = (minutes: number | null) => {
  if (!minutes || minutes < 1) return 'Runtime unavailable'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes}m`
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

export const formatReleaseDate = (releaseDate: string) => {
  if (!releaseDate) return 'Release date unavailable'

  const date = new Date(`${releaseDate}T00:00:00Z`)
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
  return `Released ${formatted}`
}

export const formatRelativeTime = (date: Date, now = new Date()) => {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  )
  if (elapsedSeconds < 60) return 'Just now'

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours}h ago`

  const elapsedDays = Math.floor(elapsedHours / 24)
  if (elapsedDays === 1) return 'Yesterday'
  if (elapsedDays < 7) return `${elapsedDays}d ago`

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
