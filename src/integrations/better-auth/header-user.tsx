import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/utils/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/utils/DropdownMenu'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useLocation({ select: (location) => location.pathname })

  async function handleSignOut() {
    try {
      await authClient.signOut()
    } catch {
      // Session will be invalidated server-side on next navigation
    }
    await navigate({ to: '/sign-in' })
    // Loaders serve fresh cached data without refetching, so the next user
    // to sign in in this tab would otherwise see this user's tasks. Cleared
    // after leaving the page so its queries are not refetched signed out.
    queryClient.clear()
  }

  if (isPending) {
    return (
      <div className="h-9 w-16 animate-pulse rounded-full border border-border bg-surface-subtle" />
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Styled like the theme toggle beside it. */}
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Account menu"
            title="Account menu"
            className="overflow-hidden rounded-full border-border bg-surface-subtle shadow-[0_10px_24px_var(--shadow-color)]"
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {session.user.name.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate">{session.user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {session.user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleSignOut()}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // On the sign-in page the link would lead nowhere.
  if (pathname === '/sign-in') return null

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="rounded-full bg-surface-subtle px-4"
    >
      <Link to="/sign-in">Sign in</Link>
    </Button>
  )
}
