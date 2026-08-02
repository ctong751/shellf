import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckIcon,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { getViewer, signOut } from '#/lib/auth'
import { cn } from '#/lib/utils'

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

const posterAccentClasses: Record<Accent, string> = {
  amber: 'bg-[#b78334]',
  blue: 'bg-[#526b78]',
  green: 'bg-[#3f5d4b]',
  ochre: 'bg-[#b57c2b]',
  plum: 'bg-[#755363]',
  rust: 'bg-[#a84931]',
  slate: 'bg-[#4d5557]',
}

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
    <main className="mx-auto min-h-screen w-full max-w-[1480px] overflow-hidden px-[4vw] max-[700px]:px-5">
      <nav
        className="flex min-h-[88px] items-center justify-between border-b border-border max-[700px]:min-h-[76px]"
        aria-label="Primary navigation"
      >
        <a
          className="inline-flex items-center gap-[0.7rem] font-display text-[1.9rem] font-medium tracking-[-0.06em] text-ink no-underline max-[700px]:text-[1.7rem]"
          href="/home"
          aria-label="Shellf home"
        >
          <ShellfMark />
          shellf
        </a>

        <div className="flex items-center gap-3 max-[430px]:gap-[0.45rem]">
          <div className="grid text-right max-[700px]:hidden">
            <span className="font-display text-[0.95rem] font-medium">
              {viewer.displayName}
            </span>
            <span className="font-mono text-[0.59rem] text-muted-foreground">
              @{viewer.handle}
            </span>
          </div>
          <Avatar size="lg" className="max-[430px]:size-9">
            <AvatarImage src={viewer.avatar} alt="" />
            <AvatarFallback>
              {viewer.displayName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            className="ml-[0.45rem] max-[700px]:ml-0 max-[700px]:text-[0.68rem]"
            size="xs"
            variant="link"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            type="button"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </nav>

      {signOutError && (
        <p className="mt-6 text-[0.76rem] text-destructive" role="alert">
          {signOutError}
        </p>
      )}

      <section className="min-h-[470px]" aria-label="Your collection">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HomeTab)}
          className="gap-0"
        >
          <TabsList variant="collection" aria-label="Collection">
            <TabsTrigger value="watch-list">
              Watch List
              <span>{watchListCount}</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              <span>0</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="[animation:panel-in_220ms_ease_both]"
            value="watch-list"
          >
            <section className="pt-[clamp(2.4rem,4vw,3.8rem)]">
              <SectionHeading
                count={`${watchingItems.length} active`}
                eyebrow="Continue watching"
                title="Pick up where you left off."
              >
                {watchingItems.length > 1 && (
                  <div className="flex [&_button+button]:-ml-px">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Scroll Continue Watching left"
                      onClick={() => scrollQueue(-1)}
                    >
                      <ArrowLeftIcon aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Scroll Continue Watching right"
                      onClick={() => scrollQueue(1)}
                    >
                      <ArrowRightIcon aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </SectionHeading>

              {watchingItems.length > 0 ? (
                <div
                  className="mt-[1.8rem] flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-[0.8rem] [scrollbar-color:var(--color-accent)_var(--color-canvas-deep)] [scrollbar-width:thin]"
                  ref={queueRef}
                >
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

            <section className="mt-[clamp(2.7rem,4vw,3.8rem)]">
              <CompactHeading title="Recently watched" />
              {recentItems.length > 0 ? (
                <div className="grid grid-cols-3 border-b border-border max-[900px]:grid-cols-[repeat(3,minmax(300px,1fr))] max-[900px]:overflow-x-auto">
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

            <section className="mt-[clamp(2.7rem,4vw,3.8rem)]">
              <CompactHeading
                eyebrow={`${savedItems.length} available`}
                title="Want to watch"
              />
              {savedItems.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 pt-4 max-[900px]:grid-cols-2 max-[900px]:gap-y-8 max-[700px]:grid-cols-2 max-[700px]:gap-x-3 max-[700px]:gap-y-6 max-[430px]:grid-cols-1">
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
          </TabsContent>
          <TabsContent value="upcoming">
            <EmptyState
              eyebrow="Nothing on the horizon"
              title="Upcoming releases, all in one place."
              description="Release dates for titles on your watch list will appear here as they get closer."
              icon={<CalendarCheckIcon className="size-13" />}
            />
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mt-14 flex items-center justify-between border-t border-border pt-6 pb-8 font-mono text-[0.59rem] tracking-[0.06em] text-muted-foreground uppercase [&_p]:m-0">
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
  <header className="flex items-end justify-between gap-8">
    <div>
      <p className="mb-[0.55rem] font-mono text-[0.6rem] tracking-[0.1em] text-supporting uppercase">
        {eyebrow}
      </p>
      <h1 className="font-display text-[clamp(2.6rem,4.5vw,4.5rem)] leading-[0.95] font-normal tracking-[-0.055em] max-[430px]:max-w-60">
        {title}
      </h1>
    </div>
    <div className="flex items-center gap-4 pb-[0.2rem]">
      <span className="font-mono text-[0.58rem] tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase max-[700px]:hidden">
        {count}
      </span>
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
    <article className="grid min-h-[242px] flex-[0_0_min(380px,calc(100vw-3rem))] snap-start grid-cols-[minmax(112px,0.72fr)_minmax(0,1.28fr)] border border-border bg-surface shadow-card max-[700px]:basis-[min(350px,calc(100vw-3rem))] max-[700px]:grid-cols-[106px_minmax(0,1fr)] max-[430px]:basis-[calc(100vw-3rem)]">
      <Poster accent={item.accent} title={item.title} />
      <div className="flex min-w-0 flex-col p-[1.2rem] max-[700px]:p-4">
        <span className="font-mono text-[0.56rem] tracking-[0.09em] text-supporting uppercase">
          {kicker}
        </span>
        <h2 className="mt-[0.38rem] truncate font-display text-[1.55rem] font-medium tracking-[-0.04em]">
          {item.title}
        </h2>
        <p className="mt-[0.1rem] text-[0.72rem] text-muted-foreground">
          {subtitle}
        </p>
        <p className="mt-[0.7rem] mb-auto line-clamp-2 overflow-hidden font-display text-[0.69rem] leading-[1.4] text-muted-foreground max-[430px]:line-clamp-3">
          {description}
        </p>
        <div className="mt-[0.9rem] mb-[0.42rem] flex justify-between font-mono text-[0.52rem] text-muted-foreground uppercase">
          <span>{remaining}</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-1 w-full overflow-hidden bg-canvas-deep"
          role="progressbar"
          aria-label={`${item.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span
            className="block h-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Button
          className="mt-3 w-full"
          size="sm"
          type="button"
          onClick={() => onMarkWatched(item.id)}
        >
          <CheckIcon data-icon="inline-start" aria-hidden="true" /> Mark watched
        </Button>
      </div>
    </article>
  )
}

interface CompactHeadingProps {
  eyebrow?: string
  title: string
}

const CompactHeading = ({ eyebrow, title }: CompactHeadingProps) => (
  <header className="flex items-center justify-between border-b border-border pb-[0.8rem]">
    <h2 className="font-display text-2xl font-medium tracking-[-0.025em]">
      {title}
    </h2>
    {eyebrow && (
      <span className="font-mono text-[0.54rem] tracking-[0.07em] text-muted-foreground uppercase">
        {eyebrow}
      </span>
    )}
  </header>
)

interface RecentCardProps {
  item: RecentItem
  onUndo: (item: RecentItem) => void
}

const RecentCard = ({ item, onUndo }: RecentCardProps) => (
  <article className="grid min-w-0 grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-[0.9rem] border-r border-border p-4 last:border-r-0">
    <Poster
      accent={item.accent}
      className="min-h-[76px] [&>span]:hidden"
      title={item.title}
    />
    <div>
      <span className="font-mono text-[0.49rem] text-muted-foreground uppercase">
        {item.time}
      </span>
      <h3 className="mt-[0.28rem] mb-[0.08rem] truncate font-display text-base font-medium">
        {item.title}
      </h3>
      <p className="truncate text-[0.59rem] text-muted-foreground">
        {item.meta}
      </p>
    </div>
    <Button size="xs" variant="link" type="button" onClick={() => onUndo(item)}>
      Undo
    </Button>
  </article>
)

interface SavedCardProps {
  item: SavedItem
  onStartWatching: (item: SavedItem) => void
}

const SavedCard = ({ item, onStartWatching }: SavedCardProps) => (
  <article className="flex min-w-0 flex-col">
    <Poster
      accent={item.accent}
      className="min-h-[220px] max-[700px]:min-h-[190px] max-[430px]:min-h-[250px]"
      title={item.title}
    />
    <div className="py-[0.8rem]">
      <h3 className="truncate font-display text-[1.12rem] font-medium">
        {item.title}
      </h3>
      <p className="mt-[0.48rem] mb-[0.68rem] line-clamp-2 min-h-[2.7em] overflow-hidden font-display text-[0.7rem] leading-[1.35] text-muted-foreground">
        {item.description}
      </p>
      <p className="flex items-center gap-[0.35rem] font-mono text-[0.51rem] text-muted-foreground uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-supporting" />{' '}
        {item.availability}
      </p>
    </div>
    <Button
      className="mt-auto w-full"
      size="sm"
      variant="outline"
      type="button"
      onClick={() => onStartWatching(item)}
    >
      Start watching
    </Button>
  </article>
)

interface PosterProps {
  accent: Accent
  className?: string
  title: string
}

const Poster = ({ accent, className, title }: PosterProps) => (
  <div
    className={cn(
      "relative isolate grid min-h-[180px] items-end justify-items-start overflow-hidden bg-supporting before:absolute before:inset-[12%] before:-z-10 before:rounded-[50%_50%_7%_7%] before:border before:border-[rgba(255,255,255,0.36)] before:content-[''] after:absolute after:right-[-50%] after:-bottom-[12%] after:-z-10 after:h-[45%] after:w-[150%] after:-rotate-[18deg] after:bg-[rgba(244,240,230,0.15)] after:content-[''] [&>span]:p-4 [&>span]:font-display [&>span]:text-[1.15rem] [&>span]:tracking-[-0.025em] [&>span]:text-[rgba(255,255,255,0.94)]",
      posterAccentClasses[accent],
      className,
    )}
    aria-hidden="true"
  >
    <span>{title}</span>
  </div>
)

const InlineEmptyState = ({ children }: { children: ReactNode }) => (
  <Empty className="items-start border-b border-border p-8 text-left">
    <EmptyDescription className="font-display text-[0.9rem]">
      {children}
    </EmptyDescription>
  </Empty>
)

interface EmptyStateProps {
  description: string
  eyebrow: string
  icon: ReactNode
  title: string
}

const EmptyState = ({ description, eyebrow, icon, title }: EmptyStateProps) => (
  <Empty className="grid min-h-[380px] grid-cols-[minmax(250px,0.7fr)_minmax(0,1.3fr)] items-center gap-[clamp(2.5rem,7vw,7rem)] px-[5vw] py-[clamp(2.8rem,5vw,4.5rem)] max-[700px]:grid-cols-1 max-[700px]:gap-10 max-[700px]:px-0">
    <EmptyMedia className="relative grid aspect-[1.3] w-full max-w-[310px] place-items-center border border-border bg-surface shadow-card before:absolute before:top-[15%] before:bottom-[15%] before:left-[18px] before:w-px before:bg-border before:content-[''] after:absolute after:right-[15%] after:bottom-[18px] after:left-[15%] after:h-px after:bg-border after:content-['']">
      <span className="absolute top-3.5 left-4 font-mono text-[0.52rem] tracking-[0.09em] text-muted-foreground uppercase">
        02
      </span>
      <div className="grid size-[100px] place-items-center rounded-full bg-accent-soft text-accent">
        {icon}
      </div>
      <span className="absolute right-[13px] bottom-[9px] font-mono text-[0.52rem] tracking-[0.09em] text-muted-foreground uppercase">
        ready when you are
      </span>
    </EmptyMedia>
    <EmptyHeader className="max-w-[620px] items-start text-left">
      <p className="mb-[0.8rem] font-mono text-[0.62rem] tracking-[0.1em] text-supporting uppercase">
        {eyebrow}
      </p>
      <EmptyTitle className="mb-4 font-display text-[clamp(2.6rem,4.5vw,4.8rem)] leading-[0.98] font-normal tracking-[-0.055em]">
        {title}
      </EmptyTitle>
      <EmptyDescription className="max-w-[480px] text-[0.82rem] leading-[1.7]">
        {description}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)

const ShellfMark = () => (
  <span
    className="grid w-[27px] gap-1 [&_span]:block [&_span]:h-0.5 [&_span]:bg-accent [&_span:nth-child(2)]:ml-[25%] [&_span:nth-child(2)]:w-3/4 [&_span:nth-child(3)]:w-[55%]"
    aria-hidden="true"
  >
    <span />
    <span />
    <span />
  </span>
)
