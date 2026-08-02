import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useRef, useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/Button'
import { getViewer, signOut } from '#/lib/auth'
import styles from './home.module.css'

type Accent = 'amber' | 'blue' | 'green' | 'ochre' | 'plum' | 'rust' | 'slate'
type HomeTab = 'watch-list' | 'upcoming'

interface Episode {
  description: string
  number: number
  title: string
}

interface WatchingSeries {
  accent: Accent
  currentEpisode: Episode
  id: string
  kind: 'series'
  nextEpisode?: Episode
  season: number
  showDescription: string
  title: string
  totalEpisodes: number
  watchedEpisodes: number
}

interface WatchingMovie {
  accent: Accent
  description: string
  id: string
  kind: 'movie'
  runtime: string
  title: string
}

type WatchingItem = WatchingMovie | WatchingSeries

interface RecentItem {
  accent: Accent
  id: string
  meta: string
  sourceItem?: WatchingItem
  time: string
  title: string
}

interface SavedItem {
  accent: Accent
  availability: string
  description: string
  id: string
  runtime: string
  title: string
}

const initialWatchingItems: WatchingItem[] = [
  {
    accent: 'green',
    currentEpisode: {
      description:
        'The team is sent on an unsettling winter retreat where old loyalties and new suspicions begin to surface.',
      number: 4,
      title: 'Woe’s Hollow',
    },
    id: 'severance',
    kind: 'series',
    nextEpisode: {
      description:
        'Tensions follow the team back to Lumon as the consequences of the retreat begin to settle in.',
      number: 5,
      title: 'Trojan’s Horse',
    },
    season: 2,
    showDescription:
      'Office workers whose memories have been surgically divided uncover the truth about their jobs and themselves.',
    title: 'Severance',
    totalEpisodes: 10,
    watchedEpisodes: 3,
  },
  {
    accent: 'blue',
    currentEpisode: {
      description:
        'The restaurant pushes through another demanding service while the team confronts what they want from its future.',
      number: 7,
      title: 'Legacy',
    },
    id: 'the-bear',
    kind: 'series',
    nextEpisode: {
      description:
        'The staff weighs the cost of perfection as pressure builds both inside and outside the kitchen.',
      number: 8,
      title: 'Ice Chips',
    },
    season: 3,
    showDescription:
      'A young chef returns home to run his family sandwich shop and transform it alongside a determined crew.',
    title: 'The Bear',
    totalEpisodes: 10,
    watchedEpisodes: 6,
  },
  {
    accent: 'ochre',
    currentEpisode: {
      description:
        'A dangerous new assignment puts the team back in the field while old mistakes threaten to catch up with them.',
      number: 3,
      title: 'Penny for Your Thoughts',
    },
    id: 'slow-horses',
    kind: 'series',
    nextEpisode: {
      description:
        'River closes in on an answer while the rest of Slough House tries to stay ahead of a growing threat.',
      number: 4,
      title: 'Returns',
    },
    season: 4,
    showDescription:
      'A dysfunctional team of British intelligence agents navigates the espionage world’s smoke and mirrors.',
    title: 'Slow Horses',
    totalEpisodes: 6,
    watchedEpisodes: 2,
  },
  {
    accent: 'slate',
    currentEpisode: {
      description:
        'Juliette searches for a way forward as new evidence challenges what everyone believes about the silo.',
      number: 5,
      title: 'Descent',
    },
    id: 'silo',
    kind: 'series',
    nextEpisode: {
      description:
        'A fragile alliance offers Juliette a path forward, while unrest deepens among those left behind.',
      number: 6,
      title: 'Barricades',
    },
    season: 2,
    showDescription:
      'Thousands live deep underground under rules they believe protect them from the ruined world outside.',
    title: 'Silo',
    totalEpisodes: 10,
    watchedEpisodes: 4,
  },
  {
    accent: 'plum',
    currentEpisode: {
      description:
        'A routine school day becomes anything but routine when competing plans throw the teachers into chaos.',
      number: 6,
      title: 'The Deli',
    },
    id: 'abbott-elementary',
    kind: 'series',
    nextEpisode: {
      description:
        'The teachers rally around a new school challenge while Janine tries to keep an ambitious plan on track.',
      number: 7,
      title: 'Winter Break',
    },
    season: 4,
    showDescription:
      'A group of dedicated teachers works to help their students succeed at an underfunded Philadelphia school.',
    title: 'Abbott Elementary',
    totalEpisodes: 22,
    watchedEpisodes: 5,
  },
]

const initialRecentItems: RecentItem[] = [
  {
    accent: 'green',
    id: 'recent-severance',
    meta: 'S2 E3 · Who Is Alive?',
    time: '2 hours ago',
    title: 'Severance',
  },
  {
    accent: 'ochre',
    id: 'recent-shogun',
    meta: 'S1 E10 · A Dream of a Dream',
    time: 'Yesterday',
    title: 'Shōgun',
  },
  {
    accent: 'rust',
    id: 'recent-dune',
    meta: 'Movie · 2h 46m',
    time: '3 days ago',
    title: 'Dune: Part Two',
  },
]

const initialSavedItems: SavedItem[] = [
  {
    accent: 'blue',
    availability: 'Streaming',
    description:
      'Two childhood friends reunite decades after their lives take them in different directions.',
    id: 'past-lives',
    runtime: '1h 46m',
    title: 'Past Lives',
  },
  {
    accent: 'plum',
    availability: 'In theaters',
    description:
      'A young woman’s whirlwind romance collides with the expectations of a powerful family.',
    id: 'anora',
    runtime: '2h 19m',
    title: 'Anora',
  },
  {
    accent: 'amber',
    availability: 'Streaming',
    description:
      'A shipwrecked robot must learn to survive—and connect—with the animals of a remote island.',
    id: 'wild-robot',
    runtime: '1h 42m',
    title: 'The Wild Robot',
  },
  {
    accent: 'slate',
    availability: 'Rent or buy',
    description:
      'Three tennis players find old rivalries resurfacing on and off the court.',
    id: 'challengers',
    runtime: '2h 11m',
    title: 'Challengers',
  },
]

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'

const Home = () => {
  const viewer = Route.useLoaderData()
  const router = useRouter()
  const queueRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<HomeTab>('watch-list')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [recentItems, setRecentItems] = useState(initialRecentItems)
  const [savedItems, setSavedItems] = useState(initialSavedItems)
  const [signOutError, setSignOutError] = useState<string>()
  const [watchingItems, setWatchingItems] = useState(initialWatchingItems)

  const handleSignOut = async () => {
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

  const scrollQueue = (direction: -1 | 1) => {
    queueRef.current?.scrollBy({
      behavior: 'smooth',
      left: direction * 400,
    })
  }

  const handleMarkWatched = (itemId: string) => {
    const item = watchingItems.find(({ id }) => id === itemId)
    if (!item) return

    const meta =
      item.kind === 'series'
        ? `S${item.season} E${item.currentEpisode.number} · ${item.currentEpisode.title}`
        : `Movie · ${item.runtime}`

    setRecentItems((items) => [
      {
        accent: item.accent,
        id: `recent-${item.id}-${Date.now()}`,
        meta,
        sourceItem: item,
        time: 'Just now',
        title: item.title,
      },
      ...items,
    ])

    if (
      item.kind === 'movie' ||
      item.currentEpisode.number >= item.totalEpisodes
    ) {
      setWatchingItems((items) => items.filter(({ id }) => id !== itemId))
      return
    }

    const nextEpisode = item.nextEpisode ?? {
      description: item.showDescription,
      number: item.currentEpisode.number + 1,
      title: 'Next episode',
    }

    setWatchingItems((items) =>
      items.map((candidate) => {
        if (candidate.id !== itemId || candidate.kind !== 'series') {
          return candidate
        }

        return {
          ...candidate,
          currentEpisode: nextEpisode,
          nextEpisode: undefined,
          watchedEpisodes: candidate.watchedEpisodes + 1,
        }
      }),
    )
  }

  const handleUndo = (recentItem: RecentItem) => {
    setRecentItems((items) => items.filter(({ id }) => id !== recentItem.id))
    const sourceItem = recentItem.sourceItem
    if (!sourceItem) return

    setWatchingItems((items) => {
      const existingIndex = items.findIndex(({ id }) => id === sourceItem.id)
      if (existingIndex === -1) return [sourceItem, ...items]

      return items.map((item) =>
        item.id === sourceItem.id ? sourceItem : item,
      )
    })
  }

  const handleStartWatching = (savedItem: SavedItem) => {
    setSavedItems((items) => items.filter(({ id }) => id !== savedItem.id))
    setWatchingItems((items) => [
      {
        accent: savedItem.accent,
        description: savedItem.description,
        id: savedItem.id,
        kind: 'movie',
        runtime: savedItem.runtime,
        title: savedItem.title,
      },
      ...items,
    ])
    setActiveTab('watch-list')
    requestAnimationFrame(() => queueRef.current?.scrollTo({ left: 0 }))
  }

  const watchListCount = watchingItems.length + savedItems.length

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <a className={styles.wordmark} href="/home" aria-label="Shellf home">
          <ShellfMark />
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
            <span>{watchListCount}</span>
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
          <div
            className={styles['watch-list-panel']}
            id="watch-list-panel"
            role="tabpanel"
            aria-labelledby="watch-list-tab"
          >
            <section className={styles['continue-section']}>
              <SectionHeading
                count={`${watchingItems.length} active`}
                eyebrow="Continue watching"
                title="Pick up where you left off."
              >
                {watchingItems.length > 1 && (
                  <div className={styles['carousel-actions']}>
                    <button
                      type="button"
                      aria-label="Scroll Continue Watching left"
                      onClick={() => scrollQueue(-1)}
                    >
                      <ArrowIcon direction="left" />
                    </button>
                    <button
                      type="button"
                      aria-label="Scroll Continue Watching right"
                      onClick={() => scrollQueue(1)}
                    >
                      <ArrowIcon direction="right" />
                    </button>
                  </div>
                )}
              </SectionHeading>

              {watchingItems.length > 0 ? (
                <div className={styles['progress-carousel']} ref={queueRef}>
                  {watchingItems.map((item) => (
                    <ProgressCard
                      item={item}
                      key={item.id}
                      onMarkWatched={handleMarkWatched}
                    />
                  ))}
                </div>
              ) : (
                <InlineEmptyState>
                  Start something from Want to watch and it will appear here.
                </InlineEmptyState>
              )}
            </section>

            <section className={styles['recent-section']}>
              <CompactHeading title="Recently watched" />
              {recentItems.length > 0 ? (
                <div className={styles['recent-row']}>
                  {recentItems.slice(0, 3).map((item) => (
                    <RecentCard item={item} key={item.id} onUndo={handleUndo} />
                  ))}
                </div>
              ) : (
                <InlineEmptyState>
                  Anything you complete will show up here.
                </InlineEmptyState>
              )}
            </section>

            <section className={styles['saved-section']}>
              <CompactHeading
                eyebrow={`${savedItems.length} available`}
                title="Want to watch"
              />
              {savedItems.length > 0 ? (
                <div className={styles['saved-grid']}>
                  {savedItems.map((item) => (
                    <SavedCard
                      item={item}
                      key={item.id}
                      onStartWatching={handleStartWatching}
                    />
                  ))}
                </div>
              ) : (
                <InlineEmptyState>
                  Your saved titles will live here when they become available.
                </InlineEmptyState>
              )}
            </section>
          </div>
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

interface SectionHeadingProps {
  children?: ReactNode
  count: string
  eyebrow: string
  title: string
}

const SectionHeading = ({
  children,
  count,
  eyebrow,
  title,
}: SectionHeadingProps) => (
  <header className={styles['section-heading']}>
    <div>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
    </div>
    <div className={styles['heading-tools']}>
      <span>{count}</span>
      {children}
    </div>
  </header>
)

interface ProgressCardProps {
  item: WatchingItem
  onMarkWatched: (itemId: string) => void
}

const ProgressCard = ({ item, onMarkWatched }: ProgressCardProps) => {
  const isSeries = item.kind === 'series'
  const progress = isSeries
    ? Math.round((item.watchedEpisodes / item.totalEpisodes) * 100)
    : 0
  const kicker = isSeries
    ? `S${item.season} E${item.currentEpisode.number}`
    : `Movie · ${item.runtime}`
  const subtitle = isSeries ? item.currentEpisode.title : 'Ready to watch'
  const description = isSeries
    ? item.currentEpisode.description
    : item.description
  const remaining = isSeries
    ? `${item.totalEpisodes - item.watchedEpisodes} episodes left`
    : item.runtime

  return (
    <article className={styles['progress-card']}>
      <Poster accent={item.accent} title={item.title} />
      <div className={styles['progress-copy']}>
        <span className={styles.kicker}>{kicker}</span>
        <h2>{item.title}</h2>
        <p>{subtitle}</p>
        <p className={styles.description}>{description}</p>
        <div className={styles['progress-meta']}>
          <span>{remaining}</span>
          <span>{progress}%</span>
        </div>
        <div
          className={styles['progress-track']}
          role="progressbar"
          aria-label={`${item.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <button
          className={styles['primary-action']}
          type="button"
          onClick={() => onMarkWatched(item.id)}
        >
          <CheckIcon /> Mark watched
        </button>
      </div>
    </article>
  )
}

interface CompactHeadingProps {
  eyebrow?: string
  title: string
}

const CompactHeading = ({ eyebrow, title }: CompactHeadingProps) => (
  <header className={styles['compact-heading']}>
    <h2>{title}</h2>
    {eyebrow && <span>{eyebrow}</span>}
  </header>
)

interface RecentCardProps {
  item: RecentItem
  onUndo: (item: RecentItem) => void
}

const RecentCard = ({ item, onUndo }: RecentCardProps) => (
  <article className={styles['recent-card']}>
    <Poster accent={item.accent} title={item.title} />
    <div>
      <span>{item.time}</span>
      <h3>{item.title}</h3>
      <p>{item.meta}</p>
    </div>
    <button type="button" onClick={() => onUndo(item)}>
      Undo
    </button>
  </article>
)

interface SavedCardProps {
  item: SavedItem
  onStartWatching: (item: SavedItem) => void
}

const SavedCard = ({ item, onStartWatching }: SavedCardProps) => (
  <article className={styles['saved-card']}>
    <Poster accent={item.accent} title={item.title} />
    <div>
      <h3>{item.title}</h3>
      <p className={styles['saved-description']}>{item.description}</p>
      <p className={styles.availability}>
        <span /> {item.availability}
      </p>
    </div>
    <button type="button" onClick={() => onStartWatching(item)}>
      Start watching
    </button>
  </article>
)

interface PosterProps {
  accent: Accent
  title: string
}

const Poster = ({ accent, title }: PosterProps) => (
  <div className={`${styles.poster} ${styles[accent]}`} aria-hidden="true">
    <span>{title}</span>
  </div>
)

const InlineEmptyState = ({ children }: { children: ReactNode }) => (
  <p className={styles['inline-empty']}>{children}</p>
)

interface EmptyStateProps {
  description: string
  eyebrow: string
  icon: ReactNode
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
      <span className={styles['art-index']}>02</span>
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

const ShellfMark = () => (
  <span className={styles['wordmark-mark']} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
)

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="m4 10 4 4 8-9" />
  </svg>
)

const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    {direction === 'left' ? (
      <path d="m12.5 4.5-5.5 5.5 5.5 5.5M7.5 10H17" />
    ) : (
      <path d="m7.5 4.5 5.5 5.5-5.5 5.5M3 10h9.5" />
    )}
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 96 96">
    <path d="M15 22h66v61H15V22ZM15 40h66M32 12v19M64 12v19" />
    <path d="m40 58 7 7 13-15" />
  </svg>
)
