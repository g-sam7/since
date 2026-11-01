import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { EyeIcon, HourglassIcon, ListPlusIcon } from 'lucide-react'

import { SinceTicker } from '#/components/SinceTicker'
import { Button } from '#/components/utils/Button'
import { getAuthSession } from '#/lib/auth-session'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (session) {
      throw redirect({ to: '/app' })
    }
  },
  component: App,
})

// Words only, no screenshots, so they stay true while the app's UI changes.
const STEPS = [
  { icon: ListPlusIcon, text: 'Add something you do regularly' },
  { icon: HourglassIcon, text: 'See how long it’s been' },
  { icon: EyeIcon, text: 'Spot what’s overdue at a glance' },
]

const EXAMPLES = [
  'Air filter',
  'Oil change',
  'Dentist',
  'Passwords',
  'Smoke alarm batteries',
  'Gutters',
  'Car registration',
  'Water filter',
]

function App() {
  return (
    <main className="page-wrap relative isolate flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-14 text-center">
      {/* A soft glow of the brand blue and green behind the hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
      >
        <div className="absolute top-8 left-[12%] size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-28 right-[8%] size-72 rounded-full bg-state-ok/15 blur-3xl" />
      </div>

      <SinceTicker />
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        Time flies. Stay on top of the things that matter. You might be
        surprised just how long it's been.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="rounded-full px-5 text-primary-foreground no-underline hover:text-primary-foreground"
        >
          <Link to="/sign-up">Get started</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-5 text-foreground no-underline hover:text-accent-foreground"
        >
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </div>

      <ol className="mt-16 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_var(--shadow-color)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-action-soft text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col items-center gap-3">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Keep track of things like
        </p>
        <ul className="flex max-w-2xl flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <li
              key={example}
              className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-sm text-muted-foreground"
            >
              {example}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
