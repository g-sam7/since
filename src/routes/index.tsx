import { Link, createFileRoute } from '@tanstack/react-router'

import { SinceTicker } from '#/components/SinceTicker'
import { Button } from '#/components/utils/Button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
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
    </main>
  )
}
