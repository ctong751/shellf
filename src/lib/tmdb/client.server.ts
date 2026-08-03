const TMDB_API_URL = 'https://api.themoviedb.org/3'
const MAX_RATE_LIMIT_RETRIES = 3
const MAX_RETRY_DELAY_MS = 5_000

const getCredential = () => {
  const credential = process.env.TMDB_API_KEY?.trim()
  if (!credential) {
    throw new Error('TMDB_API_KEY is not set')
  }
  return credential
}

const isV3ApiKey = (credential: string) => /^[a-f\d]{32}$/i.test(credential)

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

const getRetryDelay = (response: Response, attempt: number) => {
  const retryAfter = response.headers.get('Retry-After')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1_000, MAX_RETRY_DELAY_MS)
    }

    const retryAt = Date.parse(retryAfter)
    if (Number.isFinite(retryAt)) {
      return Math.min(Math.max(0, retryAt - Date.now()), MAX_RETRY_DELAY_MS)
    }
  }

  return Math.min(1_000 * 2 ** attempt, MAX_RETRY_DELAY_MS)
}

export const fetchFromTmdb = async <T>(path: string): Promise<T> => {
  const credential = getCredential()
  const url = new URL(`${TMDB_API_URL}${path}`)
  if (!url.searchParams.has('language')) {
    url.searchParams.set('language', 'en-US')
  }

  const headers = new Headers({ accept: 'application/json' })
  if (isV3ApiKey(credential)) {
    url.searchParams.set('api_key', credential)
  } else {
    headers.set('Authorization', `Bearer ${credential}`)
  }

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch(url, { headers })
    if (response.ok) return response.json()

    const shouldRetry =
      response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES
    if (!shouldRetry) {
      throw new Error(`TMDB request to ${path} failed (${response.status})`)
    }

    await response.body?.cancel()
    await wait(getRetryDelay(response, attempt))
  }

  throw new Error(`TMDB request to ${path} failed after retrying`)
}
