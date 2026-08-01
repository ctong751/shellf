import { createFileRoute } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { useEffect, useState, type FormEvent } from 'react'
import type { ViewerProfile } from '#/lib/atproto.client'

export const Route = createFileRoute('/')({ component: Home })

const getAtprotoClient = createClientOnlyFn(
  () => import('#/lib/atproto.client'),
)

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; profile: ViewerProfile }
  | { status: 'error'; message: string }

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function Home() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })
  const [handle, setHandle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>()

  useEffect(() => {
    let active = true

    void getAtprotoClient()
      .then(({ initializeAtproto }) => initializeAtproto())
      .then((profile) => {
        if (!active) return
        setAuth(
          profile ? { status: 'signed-in', profile } : { status: 'signed-out' },
        )
      })
      .catch((error: unknown) => {
        if (!active) return
        setAuth({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      active = false
    }
  }, [])

  async function beginSignIn(identifier: string) {
    const normalized = identifier.trim().replace(/^@/, '')
    if (!normalized) {
      setFormError('Enter your handle to continue.')
      return
    }

    setIsSubmitting(true)
    setFormError(undefined)

    try {
      const { signIn } = await getAtprotoClient()
      await signIn(normalized)
    } catch (error) {
      setFormError(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void beginSignIn(handle)
  }

  async function handleSignOut(profile: ViewerProfile) {
    setIsSubmitting(true)
    setFormError(undefined)

    try {
      const { signOut } = await getAtprotoClient()
      await signOut(profile.did)
      setAuth({ status: 'signed-out' })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="wordmark" href="/" aria-label="Shellf home">
          <span className="wordmark-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          shellf
        </a>
        <a
          className="nav-link"
          href="https://atproto.com/"
          target="_blank"
          rel="noreferrer"
        >
          Built on AT Protocol
          <ArrowUpRight />
        </a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> A place of your own
          </p>
          <h1>
            Keep what matters.
            <span>Share what’s next.</span>
          </h1>
          <p className="lede">
            Shellf is your small corner of the open social web—portable,
            personal, and connected to the people you already know.
          </p>

          <AuthPanel
            auth={auth}
            formError={formError}
            handle={handle}
            isSubmitting={isSubmitting}
            onHandleChange={setHandle}
            onSignIn={handleSubmit}
            onSignOut={handleSignOut}
          />
        </div>

        <div
          className="shelf-scene"
          aria-label="A collection arranged on three shelves"
        >
          <div className="scene-note note-one">things worth keeping</div>
          <div className="scene-note note-two">01 — your space</div>
          <div className="shelf shelf-one">
            <div className="book rust tall" />
            <div className="book ink short" />
            <div className="book ochre medium" />
            <div className="object arch" />
          </div>
          <div className="shelf shelf-two">
            <div className="object orb" />
            <div className="book cream medium" />
            <div className="book green tall" />
            <div className="book rust short" />
            <div className="object frame">✦</div>
          </div>
          <div className="shelf shelf-three">
            <div className="book ink medium" />
            <div className="book cream tall" />
            <div className="object small-orb" />
            <div className="book ochre short" />
            <div className="book green medium" />
          </div>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <div>
          <p className="section-number">02 — the foundation</p>
          <h2 id="principles-title">Open by design.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>Your identity travels</h3>
            <p>
              Use the same handle and social graph across the AT Protocol
              network.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Your data stays yours</h3>
            <p>
              Built on an open protocol designed for portability and user
              control.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Your people are here</h3>
            <p>
              Connect with the wider social web without rebuilding from zero.
            </p>
          </article>
        </div>
      </section>

      <footer>
        <p>Shellf / an AT Protocol app</p>
        <p>TanStack Start · Cloudflare Workers</p>
      </footer>
    </main>
  )
}

interface AuthPanelProps {
  auth: AuthState
  formError?: string
  handle: string
  isSubmitting: boolean
  onHandleChange: (value: string) => void
  onSignIn: (event: FormEvent<HTMLFormElement>) => void
  onSignOut: (profile: ViewerProfile) => Promise<void>
}

function AuthPanel({
  auth,
  formError,
  handle,
  isSubmitting,
  onHandleChange,
  onSignIn,
  onSignOut,
}: AuthPanelProps) {
  if (auth.status === 'loading') {
    return (
      <div className="auth-card loading-card" role="status">
        <span className="loader" />
        Checking for your AT Protocol session…
      </div>
    )
  }

  if (auth.status === 'signed-in') {
    const { profile } = auth

    return (
      <div className="auth-card profile-card">
        <div className="profile-main">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="avatar" />
          ) : (
            <div className="avatar avatar-fallback" aria-hidden="true">
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="signed-in-label">Connected to the atmosphere</p>
            <h2>{profile.displayName}</h2>
            <p className="handle">@{profile.handle}</p>
          </div>
        </div>
        {profile.description && (
          <p className="profile-description">{profile.description}</p>
        )}
        <div className="profile-stats">
          <span>
            <strong>{profile.postsCount.toLocaleString()}</strong> posts
          </span>
          <span>
            <strong>{profile.followersCount.toLocaleString()}</strong> followers
          </span>
          <span>
            <strong>{profile.followsCount.toLocaleString()}</strong> following
          </span>
        </div>
        <div className="profile-actions">
          <a
            href={`https://bsky.app/profile/${profile.did}`}
            target="_blank"
            rel="noreferrer"
          >
            View profile <ArrowUpRight />
          </a>
          <button
            className="text-button"
            disabled={isSubmitting}
            onClick={() => void onSignOut(profile)}
            type="button"
          >
            {isSubmitting ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
        {formError && <p className="form-error">{formError}</p>}
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSignIn}>
        <label htmlFor="handle">Your AT Protocol handle</label>
        <div className="input-row">
          <div className="input-shell">
            <span aria-hidden="true">@</span>
            <input
              autoCapitalize="none"
              autoComplete="username"
              id="handle"
              name="handle"
              onChange={(event) => onHandleChange(event.target.value)}
              placeholder="alice.bsky.social"
              spellCheck={false}
              type="text"
              value={handle}
            />
          </div>
          <button
            className="primary-button"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Connecting…' : 'Continue'}
            {!isSubmitting && <ArrowRight />}
          </button>
        </div>
        {(formError || auth.status === 'error') && (
          <p className="form-error" role="alert">
            {formError || (auth.status === 'error' ? auth.message : '')}
          </p>
        )}
      </form>
      <p className="privacy-note">
        Sign-in uses OAuth. For handle discovery, bsky.social receives your
        handle and IP address. Shellf never sees your password.
      </p>
    </div>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  )
}
