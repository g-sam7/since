import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
      <h1 className="display-title mb-3 text-4xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
        Track what matters. Stay consistent.
      </h1>
      <p className="mb-8 max-w-md text-base text-(--sea-ink-soft)">
        A simple way to track your recurring tasks and see what needs attention.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/sign-up"
          className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
        >
          Get started
        </Link>
        <Link
          to="/sign-in"
          className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
