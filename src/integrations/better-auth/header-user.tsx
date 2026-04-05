import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  if (isPending) {
    return (
      <div className="h-9 w-16 animate-pulse rounded-full border border-border bg-surface-subtle" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full border border-border object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-subtle">
            <span className="text-xs font-medium text-muted-foreground">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <Button
          onClick={async () => {
            try {
              await authClient.signOut()
            } catch {
              // Session will be invalidated server-side on next navigation
            }
            await navigate({ to: '/sign-in' })
          }}
          variant="outline"
          size="sm"
          className="rounded-full bg-surface-subtle px-4"
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button asChild variant="outline" size="sm" className="rounded-full bg-surface-subtle px-4">
      <Link to="/sign-in">Sign in</Link>
    </Button>
  )
}
