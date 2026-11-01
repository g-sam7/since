import { env } from '#/env'

export default function Footer() {
  return (
    <footer className="site-footer mt-20 border-t border-border px-4 py-6">
      <p className="page-wrap text-xs text-muted-foreground">
        Since
        {env.VITE_COMMIT_SHA && ` · ${env.VITE_COMMIT_SHA}`}
      </p>
    </footer>
  )
}
