import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CheckIcon,
  Clock3Icon,
  FolderOpenIcon,
  ImportIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import {
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react'

import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { getViewer, signOut } from '@/lib/auth'
import {
  importMediaBatch,
  mediaImportProviders,
  type MediaImportPreview,
  type MediaImportProvider,
} from '@/lib/imports'

const IMPORT_BATCH_SIZE = 8

interface DirectoryInputProps extends InputHTMLAttributes<HTMLInputElement> {
  directory: string
  webkitdirectory: string
}

const directoryInputProps: DirectoryInputProps = {
  directory: '',
  webkitdirectory: '',
}

interface ImportProgress {
  alreadyPresent: number
  imported: number
  processed: number
  total: number
  unmatched: MediaImportPreview['skippedItems']
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'

const formatTitleCount = (count: number) =>
  `${count} ${count === 1 ? 'title' : 'titles'}`

const Account = () => {
  const { viewer } = Route.useLoaderData()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string>()

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

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-[4vw] max-[700px]:px-5">
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
        <a
          className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.05em] text-muted-foreground no-underline hover:text-foreground"
          href="/home"
        >
          <ArrowLeftIcon aria-hidden="true" />
          Back to collection
        </a>
      </nav>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 border-b border-border py-[clamp(3rem,6vw,5.5rem)] max-[700px]:grid-cols-1">
        <div>
          <p className="mb-3 font-mono text-[0.62rem] tracking-[0.1em] text-supporting uppercase">
            Account / your data
          </p>
          <h1 className="font-display text-[clamp(3.4rem,7vw,6.5rem)] leading-[0.9] font-normal tracking-[-0.065em]">
            A place that’s yours.
          </h1>
        </div>
        <p className="max-w-[340px] pb-2 text-[0.78rem] leading-[1.7] text-muted-foreground">
          Review your portable identity and bring your watch history with you.
          Imports are read locally and only the titles you confirm are sent to
          Shellf.
        </p>
      </header>

      {signOutError && (
        <p className="mt-6 text-[0.76rem] text-destructive" role="alert">
          {signOutError}
        </p>
      )}

      <div className="grid grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] gap-5 py-[clamp(2.5rem,5vw,4.5rem)] max-[820px]:grid-cols-1">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your AT Protocol identity on Shellf.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={viewer.avatar} alt="" />
                <AvatarFallback>
                  {viewer.displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-medium">
                  {viewer.displayName}
                </p>
                <p className="truncate font-mono text-[0.62rem] text-muted-foreground">
                  @{viewer.handle}
                </p>
              </div>
            </div>
            {viewer.description && (
              <p className="text-[0.76rem] leading-[1.65] text-muted-foreground">
                {viewer.description}
              </p>
            )}
            <Separator />
            <dl className="flex flex-col gap-3 text-[0.7rem]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Following</dt>
                <dd className="font-mono">{viewer.followsCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Followers</dt>
                <dd className="font-mono">{viewer.followersCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Posts</dt>
                <dd className="font-mono">{viewer.postsCount}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button
              disabled={isSigningOut}
              onClick={() => void handleSignOut()}
              size="sm"
              type="button"
              variant="outline"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </CardFooter>
        </Card>

        <section aria-labelledby="imports-title">
          <div className="mb-4 flex items-end justify-between gap-5">
            <div>
              <p className="mb-1 font-mono text-[0.58rem] tracking-[0.09em] text-supporting uppercase">
                Data portability
              </p>
              <h2
                className="font-display text-[2rem] font-medium tracking-[-0.04em]"
                id="imports-title"
              >
                Imports
              </h2>
            </div>
            <span className="font-mono text-[0.56rem] tracking-[0.07em] text-muted-foreground uppercase">
              {mediaImportProviders.length} supported source
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {mediaImportProviders.map((provider) => (
              <ImportProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between gap-8 border-t border-border py-7 font-mono text-[0.58rem] tracking-[0.06em] text-muted-foreground uppercase max-[700px]:flex-col max-[700px]:items-start">
        <p>Shellf / your data travels with you</p>
        <p>Raw export files are never uploaded</p>
      </footer>
    </main>
  )
}

const ImportProviderCard = ({
  provider,
}: {
  provider: MediaImportProvider
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()
  const [isImporting, setIsImporting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [preview, setPreview] = useState<MediaImportPreview>()
  const [progress, setProgress] = useState<ImportProgress>()

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    setError(undefined)
    setPreview(undefined)
    setProgress(undefined)
    if (files.length === 0) return

    setIsParsing(true)
    try {
      setPreview(await provider.parse(files))
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsParsing(false)
      event.currentTarget.value = ''
    }
  }

  const handleImport = async () => {
    if (!preview || preview.items.length === 0) return

    setError(undefined)
    setIsImporting(true)
    let nextProgress: ImportProgress = {
      alreadyPresent: 0,
      imported: 0,
      processed: 0,
      total: preview.items.length,
      unmatched: [],
    }
    setProgress(nextProgress)

    try {
      for (
        let index = 0;
        index < preview.items.length;
        index += IMPORT_BATCH_SIZE
      ) {
        const items = preview.items.slice(index, index + IMPORT_BATCH_SIZE)
        const batch = await importMediaBatch({
          data: { items, providerId: preview.providerId },
        })
        nextProgress = {
          alreadyPresent: nextProgress.alreadyPresent + batch.alreadyPresent,
          imported: nextProgress.imported + batch.imported,
          processed: nextProgress.processed + items.length,
          total: preview.items.length,
          unmatched: [...nextProgress.unmatched, ...batch.unmatched],
        }
        setProgress(nextProgress)
      }
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsImporting(false)
    }
  }

  const watchingCount =
    preview?.items.filter((item) => item.state === 'watching').length ?? 0
  const savedCount =
    preview?.items.filter((item) => item.state === 'saved').length ?? 0
  const progressPercent = progress
    ? Math.round((progress.processed / progress.total) * 100)
    : 0
  const isComplete = Boolean(progress && progress.processed === progress.total)
  const hasImportIssues = Boolean(
    isComplete && progress && progress.unmatched.length > 0,
  )
  let progressLabel = 'Importing titles'
  let completionTextClass = 'text-muted-foreground'
  let CompletionIcon = CheckIcon
  if (isComplete) progressLabel = 'Import complete'
  if (hasImportIssues) {
    progressLabel = 'Import finished with issues'
    completionTextClass = 'text-destructive'
    CompletionIcon = TriangleAlertIcon
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 grid size-11 place-items-center bg-accent-soft text-accent">
          <Clock3Icon aria-hidden="true" />
        </div>
        <CardTitle>{provider.name}</CardTitle>
        <CardDescription>
          Select the unzipped GDPR export folder from TV Time. Shellf looks only
          for show progress files and ignores account, device, token, and
          tracking data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel className="sr-only" htmlFor={`${provider.id}-folder`}>
              {provider.name} GDPR export folder
            </FieldLabel>
            <Input
              {...directoryInputProps}
              hidden
              id={`${provider.id}-folder`}
              multiple
              onChange={(event) => void handleFiles(event)}
              ref={fileInputRef}
              type="file"
            />
            <Button
              disabled={isImporting || isParsing}
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <FolderOpenIcon data-icon="inline-start" aria-hidden="true" />
              {isParsing ? 'Reading export…' : 'Choose GDPR folder'}
            </Button>
            <FieldDescription>
              Nothing is imported until you review the preview and confirm.
            </FieldDescription>
            <FieldError>{error}</FieldError>
          </Field>
        </FieldGroup>

        {preview && (
          <div className="mt-6 flex flex-col gap-5">
            <Separator />
            <div>
              <p className="font-mono text-[0.56rem] tracking-[0.08em] text-supporting uppercase">
                Ready to import
              </p>
              <p className="mt-2 font-display text-[1.5rem] font-medium">
                {formatTitleCount(preview.items.length)} found
              </p>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">
                {watchingCount} in progress · {savedCount} want to watch
              </p>
            </div>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[0.7rem] leading-[1.55] text-muted-foreground">
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>

            {progress && (
              <div className="flex flex-col gap-2" aria-live="polite">
                <div className="flex items-center justify-between gap-4 font-mono text-[0.56rem] text-muted-foreground uppercase">
                  <span>{progressLabel}</span>
                  <span>
                    {progress.processed} / {progress.total}
                  </span>
                </div>
                <div
                  aria-label="Import progress"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={progressPercent}
                  className="h-1.5 overflow-hidden bg-muted"
                  role="progressbar"
                >
                  <span
                    className="block h-full bg-accent transition-[width]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {isComplete && (
                  <div className="mt-1 flex flex-col gap-3">
                    <p
                      className={`flex items-center gap-2 text-[0.7rem] ${completionTextClass}`}
                    >
                      <CompletionIcon aria-hidden="true" />
                      {progress.imported} imported, {progress.alreadyPresent}{' '}
                      already present, {progress.unmatched.length} unmatched.
                    </p>
                    {hasImportIssues && (
                      <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.68rem] leading-[1.5] text-destructive">
                        {progress.unmatched.slice(0, 5).map((item, index) => (
                          <li key={`${item.title}-${index}`}>
                            {item.title}: {item.reason}
                          </li>
                        ))}
                        {progress.unmatched.length > 5 && (
                          <li>
                            {progress.unmatched.length - 5} more titles had
                            issues.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {preview && !isComplete && (
        <CardFooter>
          <Button
            disabled={isImporting || preview.items.length === 0}
            onClick={() => void handleImport()}
            size="sm"
            type="button"
          >
            <ImportIcon data-icon="inline-start" aria-hidden="true" />
            {isImporting
              ? 'Importing…'
              : `Import ${formatTitleCount(preview.items.length)}`}
          </Button>
        </CardFooter>
      )}
      {isComplete && (
        <CardFooter>
          <Button
            onClick={() => window.location.assign('/home')}
            size="sm"
            type="button"
            variant="outline"
          >
            View collection
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export const Route = createFileRoute('/account')({
  loader: async () => {
    const viewer = await getViewer()
    if (!viewer) {
      // TanStack Router redirects are control-flow objects, not Error instances.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/', search: { error: undefined } })
    }
    return { viewer }
  },
  component: Account,
})

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
