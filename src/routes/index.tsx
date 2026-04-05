import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
      <h1 className="display-title mb-3 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Track what matters. Stay consistent.
      </h1>
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        A simple way to track your recurring tasks and see what needs attention.
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
