import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-header px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-3 py-3 sm:py-4">
        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-sm text-foreground no-underline shadow-[0_10px_24px_var(--shadow-color)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_var(--action-soft)]" />
            Since
          </Link>
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
