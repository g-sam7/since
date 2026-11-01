import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import { SinceWordmark } from './SinceWordmark'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-header px-4 shadow-[0_4px_16px_var(--shadow-color)] backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-3 py-3 sm:py-4">
        <Link
          to="/"
          aria-label="Since"
          className="shrink-0 rounded-md no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {/* Coloured here: the global link colour would otherwise turn the
              letters primary. */}
          <SinceWordmark className="h-7 w-auto text-foreground sm:h-8" />
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
