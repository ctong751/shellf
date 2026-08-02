const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500'

export const getPosterUrl = (path: string | null) =>
  path ? `${TMDB_POSTER_URL}${path}` : undefined
