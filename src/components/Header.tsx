import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-header px-4 shadow-[0_4px_16px_var(--shadow-color)] backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-3 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-sm font-semibold tracking-tight text-foreground no-underline shadow-[0_10px_24px_var(--shadow-color)] sm:px-4 sm:py-2"
        >
          <img
            src="/apple-touch-icon.png"
            alt=""
            className="h-5 w-5 rounded-[5px]"
          />
          Since
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
