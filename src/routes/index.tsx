import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '#/components/ui/Button'
import { Card } from '#/components/ui/Card'
import { TextField } from '#/components/ui/TextField'
import { getViewer, signOut, startSignIn } from '#/lib/auth'
import type { ViewerProfile } from '#/lib/viewer'
import styles from './index.module.css'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  loader: () => getViewer(),
  component: Home,
})

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ')

function Home() {
  const viewer = Route.useLoaderData()
  const { error } = Route.useSearch()
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>()

  const searchError =
    error === 'signin_failed'
      ? 'Sign-in didn’t complete. Please try again.'
      : undefined

  async function beginSignIn(identifier: string) {
    const normalized = identifier.trim().replace(/^@/, '')
    if (!normalized) {
      setFormError('Enter your handle to continue.')
      return
    }

    setIsSubmitting(true)
    setFormError(undefined)

    try {
      const { redirectUrl } = await startSignIn({ data: normalized })
      window.location.assign(redirectUrl)
    } catch (error) {
      setFormError(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void beginSignIn(handle)
  }

  async function handleSignOut() {
    setIsSubmitting(true)
    setFormError(undefined)

    try {
      await signOut()
      await router.invalidate()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <a className={styles.wordmark} href="/" aria-label="Shellf home">
          <span className={styles['wordmark-mark']} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          shellf
        </a>
        <a
          className={styles['nav-link']}
          href="https://atproto.com/"
          target="_blank"
          rel="noreferrer"
        >
          Built on AT Protocol
          <ArrowUpRight />
        </a>
      </nav>

      <section className={styles.hero}>
        <div className={styles['hero-copy']}>
          <p className={styles.eyebrow}>
            <span className={styles['status-dot']} /> A place of your own
          </p>
          <h1 className={styles.title}>
            Keep what matters.
            <span>Share what’s next.</span>
          </h1>
          <p className={styles.lede}>
            Shellf is your small corner of the open social web—portable,
            personal, and connected to the people you already know.
          </p>

          <AuthPanel
            viewer={viewer}
            formError={formError ?? searchError}
            handle={handle}
            isSubmitting={isSubmitting}
            onHandleChange={setHandle}
            onSignIn={handleSubmit}
            onSignOut={handleSignOut}
          />
        </div>

        <div
          className={styles['shelf-scene']}
          aria-label="A collection arranged on three shelves"
        >
          <div className={cx(styles['scene-note'], styles['note-one'])}>
            things worth keeping
          </div>
          <div className={cx(styles['scene-note'], styles['note-two'])}>
            01 — your space
          </div>
          <div className={cx(styles.shelf, styles['shelf-one'])}>
            <div className={cx(styles.book, styles.rust, styles.tall)} />
            <div className={cx(styles.book, styles.ink, styles.short)} />
            <div className={cx(styles.book, styles.ochre, styles.medium)} />
            <div className={cx(styles.object, styles.arch)} />
          </div>
          <div className={cx(styles.shelf, styles['shelf-two'])}>
            <div className={cx(styles.object, styles.orb)} />
            <div className={cx(styles.book, styles.cream, styles.medium)} />
            <div className={cx(styles.book, styles.green, styles.tall)} />
            <div className={cx(styles.book, styles.rust, styles.short)} />
            <div className={cx(styles.object, styles.frame)}>✦</div>
          </div>
          <div className={cx(styles.shelf, styles['shelf-three'])}>
            <div className={cx(styles.book, styles.ink, styles.medium)} />
            <div className={cx(styles.book, styles.cream, styles.tall)} />
            <div className={cx(styles.object, styles['small-orb'])} />
            <div className={cx(styles.book, styles.ochre, styles.short)} />
            <div className={cx(styles.book, styles.green, styles.medium)} />
          </div>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <div>
          <p className={styles['section-number']}>02 — the foundation</p>
          <h2 id="principles-title">Open by design.</h2>
        </div>
        <div className={styles['principle-grid']}>
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

      <footer className={styles.footer}>
        <p>Shellf / an AT Protocol app</p>
        <p>TanStack Start · Cloudflare Workers</p>
      </footer>
    </main>
  )
}

interface AuthPanelProps {
  viewer: ViewerProfile | null
  formError?: string
  handle: string
  isSubmitting: boolean
  onHandleChange: (value: string) => void
  onSignIn: (event: FormEvent<HTMLFormElement>) => void
  onSignOut: () => Promise<void>
}

function AuthPanel({
  viewer,
  formError,
  handle,
  isSubmitting,
  onHandleChange,
  onSignIn,
  onSignOut,
}: AuthPanelProps) {
  if (viewer) {
    return (
      <Card className={cx(styles['auth-card'], styles['profile-card'])}>
        <div className={styles['profile-main']}>
          {viewer.avatar ? (
            <img src={viewer.avatar} alt="" className={styles.avatar} />
          ) : (
            <div
              className={cx(styles.avatar, styles['avatar-fallback'])}
              aria-hidden="true"
            >
              {viewer.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className={styles['signed-in-label']}>
              Connected to the atmosphere
            </p>
            <h2>{viewer.displayName}</h2>
            <p className={styles.handle}>@{viewer.handle}</p>
          </div>
        </div>
        {viewer.description && (
          <p className={styles['profile-description']}>{viewer.description}</p>
        )}
        <div className={styles['profile-stats']}>
          <span>
            <strong>{viewer.postsCount.toLocaleString()}</strong> posts
          </span>
          <span>
            <strong>{viewer.followersCount.toLocaleString()}</strong> followers
          </span>
          <span>
            <strong>{viewer.followsCount.toLocaleString()}</strong> following
          </span>
        </div>
        <div className={styles['profile-actions']}>
          <a
            href={`https://bsky.app/profile/${viewer.did}`}
            target="_blank"
            rel="noreferrer"
          >
            View profile <ArrowUpRight />
          </a>
          <Button
            variant="text"
            disabled={isSubmitting}
            onClick={() => void onSignOut()}
            type="button"
          >
            {isSubmitting ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
        {formError && <p className={styles['form-error']}>{formError}</p>}
      </Card>
    )
  }

  return (
    <div className={styles['auth-wrap']}>
      <Card className={styles['auth-card']}>
        <form onSubmit={onSignIn}>
          <label htmlFor="handle">Your AT Protocol handle</label>
          <div className={styles['input-row']}>
            <TextField
              autoCapitalize="none"
              autoComplete="username"
              id="handle"
              name="handle"
              onChange={(event) => onHandleChange(event.target.value)}
              placeholder="alice.bsky.social"
              spellCheck={false}
              type="text"
              value={handle}
              prefix="@"
            />
            <Button
              className={styles['submit-button']}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Connecting…' : 'Continue'}
              {!isSubmitting && <ArrowRight />}
            </Button>
          </div>
          {formError && (
            <p className={styles['form-error']} role="alert">
              {formError}
            </p>
          )}
        </form>
      </Card>
      <p className={styles['privacy-note']}>
        Sign-in uses OAuth. Shellf resolves your handle through Bluesky’s public
        API and never sees your password.
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
