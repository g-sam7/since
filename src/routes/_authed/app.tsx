import { createFileRoute } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/_authed/app')({
  component: AppPage,
})

function AppPage() {
  // Authorization is enforced by the _authed route guard (server-side).
  // This hook is for display purposes only — do not use it for access control.
  const { data: session } = authClient.useSession()

  return (
    <main className="page-wrap px-4 py-14">
      <div className="island-shell rounded-2xl p-6 sm:p-10">
        <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-4xl">
          Welcome
        </h1>
        {session?.user && (
          <p className="text-base text-(--sea-ink-soft)">
            Signed in as{' '}
            <span className="font-medium text-(--sea-ink)">
              {session.user.email}
            </span>
          </p>
        )}
      </div>
    </main>
  )
}
