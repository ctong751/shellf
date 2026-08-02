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
