import { env } from '#/env'

export default function Footer() {
  return (
    // Raised like the header, with its shadow cast upwards.
    <footer className="mt-20 border-t border-border bg-surface-header px-4 py-6 shadow-[0_-4px_16px_var(--shadow-color)] backdrop-blur-lg">
      <p className="page-wrap text-xs text-muted-foreground">
        Since
        {env.VITE_COMMIT_SHA && ` · ${env.VITE_COMMIT_SHA}`}
      </p>
    </footer>
  )
}
