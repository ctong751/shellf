import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '#/components/ui/Button'
import { getViewer, signOut } from '#/lib/auth'
import styles from './home.module.css'

type HomeTab = 'watch-list' | 'upcoming'

export const Route = createFileRoute('/home')({
  loader: async () => {
    const viewer = await getViewer()
    if (!viewer) {
      // TanStack Router redirects are control-flow objects, not Error instances.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/', search: { error: undefined } })
    }
    return viewer
  },
  component: Home,
})

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function Home() {
  const viewer = Route.useLoaderData()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<HomeTab>('watch-list')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string>()

  async function handleSignOut() {
    setIsSigningOut(true)
    setSignOutError(undefined)

    try {
      await signOut()
      await router.navigate({ to: '/', search: { error: undefined } })
    } catch (error) {
      setSignOutError(getErrorMessage(error))
      setIsSigningOut(false)
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <a className={styles.wordmark} href="/home" aria-label="Shellf home">
          <span className={styles['wordmark-mark']} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          shellf
        </a>

        <div className={styles['profile-menu']}>
          <div className={styles['profile-copy']}>
            <span>{viewer.displayName}</span>
            <span>@{viewer.handle}</span>
          </div>
          {viewer.avatar ? (
            <img src={viewer.avatar} alt="" className={styles.avatar} />
          ) : (
            <div
              className={`${styles.avatar} ${styles['avatar-fallback']}`}
              aria-hidden="true"
            >
              {viewer.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <Button
            className={styles['sign-out']}
            variant="text"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            type="button"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </nav>

      {signOutError && (
        <p className={styles.error} role="alert">
          {signOutError}
        </p>
      )}

      <section className={styles.collection} aria-label="Your collection">
        <div className={styles.tabs} role="tablist" aria-label="Collection">
          <button
            className={activeTab === 'watch-list' ? styles.active : undefined}
            id="watch-list-tab"
            type="button"
            role="tab"
            aria-controls="watch-list-panel"
            aria-selected={activeTab === 'watch-list'}
            onClick={() => setActiveTab('watch-list')}
          >
            Watch List
            <span>0</span>
          </button>
          <button
            className={activeTab === 'upcoming' ? styles.active : undefined}
            id="upcoming-tab"
            type="button"
            role="tab"
            aria-controls="upcoming-panel"
            aria-selected={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
            <span>0</span>
          </button>
        </div>

        {activeTab === 'watch-list' ? (
          <EmptyState
            id="watch-list-panel"
            labelledBy="watch-list-tab"
            eyebrow="Your watch list is empty"
            title="Save something for later."
            description="Movies and shows you want to watch will live here, ready whenever you are."
            icon={<BookmarkIcon />}
          />
        ) : (
          <EmptyState
            id="upcoming-panel"
            labelledBy="upcoming-tab"
            eyebrow="Nothing on the horizon"
            title="Upcoming releases, all in one place."
            description="Release dates for titles on your watch list will appear here as they get closer."
            icon={<CalendarIcon />}
          />
        )}
      </section>

      <footer className={styles.footer}>
        <p>Shellf / your place for what’s next</p>
      </footer>
    </main>
  )
}

interface EmptyStateProps {
  description: string
  eyebrow: string
  icon: React.ReactNode
  id: string
  labelledBy: string
  title: string
}

const EmptyState = ({
  description,
  eyebrow,
  icon,
  id,
  labelledBy,
  title,
}: EmptyStateProps) => (
  <div
    className={styles['empty-state']}
    id={id}
    role="tabpanel"
    aria-labelledby={labelledBy}
  >
    <div className={styles['empty-art']} aria-hidden="true">
      <span className={styles['art-index']}>01</span>
      <div className={styles['icon-wrap']}>{icon}</div>
      <span className={styles['art-note']}>ready when you are</span>
    </div>
    <div className={styles['empty-copy']}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </div>
  </div>
)

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 80 96">
      <path d="M17 9h46v77L40 71 17 86V9Z" />
      <path d="M28 25h24M28 36h17" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 96 96">
      <path d="M15 22h66v61H15V22ZM15 40h66M32 12v19M64 12v19" />
      <path d="m40 58 7 7 13-15" />
    </svg>
  )
}
