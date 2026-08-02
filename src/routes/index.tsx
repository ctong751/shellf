import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '#/components/ui/Button'
import { Card, CardContent } from '#/components/ui/Card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '#/components/ui/input-group'
import { getViewer, startSignIn } from '#/lib/auth'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  loader: async () => {
    const viewer = await getViewer()
    if (viewer) {
      // TanStack Router redirects are control-flow objects, not Error instances.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/home' })
    }
  },
  component: Home,
})

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

const shelfClassName =
  "absolute left-[11%] flex w-[82%] items-end gap-[clamp(0.45rem,1vw,0.9rem)] border-b-[5px] border-ink px-[4%] pb-2 after:absolute after:-right-[4%] after:-bottom-[11px] after:-left-[4%] after:h-px after:bg-border after:content-['']"

const bookClassName =
  "w-[clamp(27px,4vw,47px)] border border-[rgba(37,39,31,0.3)] shadow-[inset_5px_0_rgba(255,255,255,0.11)] before:mx-auto before:mt-3.5 before:block before:h-px before:w-[65%] before:bg-[rgba(244,240,230,0.55)] before:content-['']"

function Home() {
  const { error } = Route.useSearch()
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1480px] px-[4vw] max-[650px]:px-5">
      <nav
        className="flex h-24 items-center justify-between border-b border-border max-[650px]:h-[78px]"
        aria-label="Primary navigation"
      >
        <a
          className="inline-flex items-center gap-[0.7rem] font-display text-[2rem] font-medium tracking-[-0.06em] text-ink no-underline max-[650px]:text-[1.7rem]"
          href="/"
          aria-label="Shellf home"
        >
          <span
            className="grid w-7 gap-1 [&_span]:block [&_span]:h-0.5 [&_span]:bg-accent [&_span:nth-child(2)]:ml-[25%] [&_span:nth-child(2)]:w-3/4 [&_span:nth-child(3)]:w-[55%]"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
          shellf
        </a>
        <a
          className="inline-flex items-center gap-[0.35rem] text-[0.76rem] font-semibold tracking-[0.08em] no-underline uppercase max-[650px]:text-[0px] max-[650px]:before:text-[0.68rem] max-[650px]:before:content-['ATProto'] [&_svg]:w-[15px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]"
          href="https://atproto.com/"
          target="_blank"
          rel="noreferrer"
        >
          Built on AT Protocol
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </nav>

      <section className="grid min-h-[720px] grid-cols-[minmax(0,1.03fr)_minmax(430px,0.97fr)] gap-[clamp(3rem,7vw,8rem)] py-[clamp(5rem,9vw,9rem)] pb-[clamp(6rem,10vw,10rem)] max-[980px]:grid-cols-1 max-[980px]:gap-20 max-[650px]:min-h-0 max-[650px]:pt-[4.7rem]">
        <div className="max-w-[680px] self-center max-[980px]:max-w-[760px]">
          <p className="mb-8 flex items-center gap-[0.6rem] font-mono text-[0.69rem] tracking-[0.12em] text-muted-foreground uppercase">
            <span className="h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]" />{' '}
            A place of your own
          </p>
          <h1 className="max-w-[700px] font-display text-[clamp(4.2rem,7vw,7.3rem)] leading-[0.88] font-normal tracking-[-0.067em] max-[650px]:text-[clamp(3.6rem,17vw,5rem)] [&_span]:block [&_span]:text-accent [&_span]:italic">
            Keep what matters.
            <span>Share what’s next.</span>
          </h1>
          <p className="my-[2.3rem] max-w-[570px] font-display text-[clamp(1.15rem,1.7vw,1.45rem)] leading-[1.55] text-muted-foreground">
            Shellf is your small corner of the open social web—portable,
            personal, and connected to the people you already know.
          </p>

          <AuthPanel
            formError={formError ?? searchError}
            handle={handle}
            isSubmitting={isSubmitting}
            onHandleChange={setHandle}
            onSignIn={handleSubmit}
          />
        </div>

        <div
          className="relative min-h-[580px] w-full self-center border-l border-border max-[980px]:mx-auto max-[980px]:min-h-[560px] max-[980px]:w-full max-[980px]:max-w-[620px] max-[650px]:min-h-[460px]"
          aria-label="A collection arranged on three shelves"
        >
          <div className="absolute top-0 right-0 font-mono text-[0.59rem] tracking-[0.1em] text-muted-foreground uppercase">
            things worth keeping
          </div>
          <div className="absolute bottom-0 left-[1.2rem] font-mono text-[0.59rem] tracking-[0.1em] text-muted-foreground uppercase">
            01 — your space
          </div>
          <div
            className={cn(shelfClassName, 'top-[18%] max-[650px]:top-[19%]')}
          >
            <div
              className={cn(
                bookClassName,
                'h-[124px] bg-accent max-[650px]:h-[94px]',
              )}
            />
            <div
              className={cn(
                bookClassName,
                'h-[75px] bg-ink max-[650px]:h-[58px]',
              )}
            />
            <div
              className={cn(
                bookClassName,
                'h-24 bg-highlight max-[650px]:h-[74px]',
              )}
            />
            <div className="ml-auto h-[92px] w-[clamp(75px,10vw,120px)] rounded-t-[70px] border-[19px] border-b-0 border-supporting max-[650px]:h-[72px] max-[650px]:border-[14px] max-[650px]:border-b-0" />
          </div>
          <div className={cn(shelfClassName, 'top-1/2 max-[650px]:top-[51%]')}>
            <div className="mr-auto h-[78px] w-[78px] rounded-full bg-highlight shadow-[inset_-10px_-7px_rgba(37,39,31,0.08)] max-[650px]:h-[58px] max-[650px]:w-[58px]" />
            <div
              className={cn(
                bookClassName,
                'h-24 bg-canvas-deep max-[650px]:h-[74px]',
              )}
            />
            <div
              className={cn(
                bookClassName,
                'h-[124px] bg-supporting max-[650px]:h-[94px]',
              )}
            />
            <div
              className={cn(
                bookClassName,
                'h-[75px] bg-accent max-[650px]:h-[58px]',
              )}
            />
            <div className="ml-auto grid h-[107px] w-[92px] place-items-center border-8 border-ink bg-canvas-deep font-display text-[2rem] text-accent max-[650px]:h-[82px] max-[650px]:w-[68px]">
              ✦
            </div>
          </div>
          <div
            className={cn(shelfClassName, 'top-[82%] max-[650px]:top-[83%]')}
          >
            <div
              className={cn(bookClassName, 'h-24 bg-ink max-[650px]:h-[74px]')}
            />
            <div
              className={cn(
                bookClassName,
                'h-[124px] bg-canvas-deep max-[650px]:h-[94px]',
              )}
            />
            <div className="mx-auto mb-[5px] h-[51px] w-[51px] rounded-full bg-accent shadow-[inset_-10px_-7px_rgba(37,39,31,0.08)]" />
            <div
              className={cn(
                bookClassName,
                'h-[75px] bg-highlight max-[650px]:h-[58px]',
              )}
            />
            <div
              className={cn(
                bookClassName,
                'h-24 bg-supporting max-[650px]:h-[74px]',
              )}
            />
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-[0.65fr_1.35fr] gap-[5vw] border-t border-border py-[clamp(5rem,9vw,8rem)] max-[980px]:grid-cols-1"
        aria-labelledby="principles-title"
      >
        <div>
          <p className="mb-[1.4rem] flex items-center gap-[0.6rem] font-mono text-[0.69rem] tracking-[0.12em] text-muted-foreground uppercase">
            02 — the foundation
          </p>
          <h2
            className="font-display text-[clamp(3rem,5vw,5rem)] leading-[0.95] font-normal tracking-[-0.055em]"
            id="principles-title"
          >
            Open by design.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-[1.2rem] max-[650px]:grid-cols-1 max-[650px]:gap-10">
          <article className="border-t-[3px] border-ink pt-[1.1rem]">
            <span className="font-mono text-[0.62rem] text-muted-foreground">
              01
            </span>
            <h3 className="mt-[2.7rem] mb-[0.8rem] font-display text-[1.35rem] font-medium max-[650px]:mt-[1.6rem]">
              Your identity travels
            </h3>
            <p className="text-[0.78rem] leading-[1.6] text-muted-foreground">
              Use the same handle and social graph across the AT Protocol
              network.
            </p>
          </article>
          <article className="border-t-[3px] border-accent pt-[1.1rem]">
            <span className="font-mono text-[0.62rem] text-muted-foreground">
              02
            </span>
            <h3 className="mt-[2.7rem] mb-[0.8rem] font-display text-[1.35rem] font-medium max-[650px]:mt-[1.6rem]">
              Your data stays yours
            </h3>
            <p className="text-[0.78rem] leading-[1.6] text-muted-foreground">
              Built on an open protocol designed for portability and user
              control.
            </p>
          </article>
          <article className="border-t-[3px] border-supporting pt-[1.1rem]">
            <span className="font-mono text-[0.62rem] text-muted-foreground">
              03
            </span>
            <h3 className="mt-[2.7rem] mb-[0.8rem] font-display text-[1.35rem] font-medium max-[650px]:mt-[1.6rem]">
              Your people are here
            </h3>
            <p className="text-[0.78rem] leading-[1.6] text-muted-foreground">
              Connect with the wider social web without rebuilding from zero.
            </p>
          </article>
        </div>
      </section>

      <footer className="flex justify-between border-t border-border py-[1.6rem] pb-[2.3rem] font-mono text-[0.61rem] tracking-[0.06em] text-muted-foreground uppercase max-[650px]:flex-col max-[650px]:gap-[0.6rem] [&_p]:m-0">
        <p>Shellf / an AT Protocol app</p>
        <p>TanStack Start · Cloudflare Workers</p>
      </footer>
    </main>
  )
}

interface AuthPanelProps {
  formError?: string
  handle: string
  isSubmitting: boolean
  onHandleChange: (value: string) => void
  onSignIn: (event: FormEvent<HTMLFormElement>) => void
}

function AuthPanel({
  formError,
  handle,
  isSubmitting,
  onHandleChange,
  onSignIn,
}: AuthPanelProps) {
  return (
    <div className="max-w-[570px]">
      <Card className="max-w-[570px]">
        <CardContent>
          <form onSubmit={onSignIn}>
            <FieldGroup>
              <Field data-invalid={Boolean(formError)}>
                <FieldLabel htmlFor="handle">
                  Your AT Protocol handle
                </FieldLabel>
                <div className="flex gap-[0.65rem] max-[650px]:flex-col">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText className="text-accent">@</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={Boolean(formError)}
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
                  </InputGroup>
                  <Button
                    className="max-[650px]:w-full"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? 'Connecting…' : 'Continue'}
                    {!isSubmitting && (
                      <ArrowRightIcon
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    )}
                  </Button>
                </div>
                <FieldError>{formError}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="mt-3 text-[0.67rem] leading-[1.55] text-subtle">
        Sign-in uses OAuth. Shellf resolves your handle through Bluesky’s public
        API and never sees your password.
      </p>
    </div>
  )
}
