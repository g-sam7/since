import { getYear } from 'date-fns'

import { env } from '#/env'

export default function Footer() {
  return (
    // Raised like the header, with its shadow cast upwards, and pinned like
    // it: at the foot of a short page, stuck to the window's bottom edge on a
    // long one.
    <footer className="sticky bottom-0 z-40 mt-10 border-t border-border bg-surface-header px-4 py-6 shadow-[0_-4px_16px_var(--shadow-color)] backdrop-blur-lg">
      <p className="page-wrap text-xs text-muted-foreground">
        © {getYear(new Date())} Since
        {env.VITE_COMMIT_SHA && ` · ${env.VITE_COMMIT_SHA}`}
      </p>
    </footer>
  )
}
