import { createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_authed/app')({
  component: AppPage,
})

// TODO: Replace this with task list once tasks feature is implemented
function AppPage() {
  return (
    <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
      <div className="island-shell rounded-2xl p-6 sm:p-10">
        <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-4xl">
          Welcome back
        </h1>
        <p className="mb-6 text-base text-(--sea-ink-soft)">
          You don&apos;t have any tracked tasks yet.
        </p>
        <Button disabled>Create your first task</Button>
      </div>
    </main>
  )
}
