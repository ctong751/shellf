const TMDB_API_URL = 'https://api.themoviedb.org/3'

const getCredential = () => {
  const credential = process.env.TMDB_API_KEY?.trim()
  if (!credential) {
    throw new Error('TMDB_API_KEY is not set')
  }
  return credential
}

const isV3ApiKey = (credential: string) => /^[a-f\d]{32}$/i.test(credential)

export const fetchFromTmdb = async <T>(path: string): Promise<T> => {
  const credential = getCredential()
  const url = new URL(`${TMDB_API_URL}${path}`)
  url.searchParams.set('language', 'en-US')

  const headers = new Headers({ accept: 'application/json' })
  if (isV3ApiKey(credential)) {
    url.searchParams.set('api_key', credential)
  } else {
    headers.set('Authorization', `Bearer ${credential}`)
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`TMDB request to ${path} failed (${response.status})`)
  }

  return response.json()
}
