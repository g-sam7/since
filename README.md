# Since

A recurring task tracker centered around **time elapsed**. Since helps you answer: "How long since I last did this task?"

Track everyday recurring tasks — working out, changing air filters, car maintenance — and see what's overdue, due soon, or recently completed. This is not a traditional todo app; the primary value is time-based awareness.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or another Docker installation with Docker Compose v2

## Getting Started

```sh
# Install dependencies
pnpm install

# Create a local env file
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/since
# BETTER_AUTH_SECRET=replace-this-with-at-least-32-characters

# Start PostgreSQL, run migrations, then start Vite
pnpm dev
```

If PostgreSQL is already running, start just the app with:

```sh
pnpm dev:app
```

To start only the local database service:

```sh
pnpm dev:db
```

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + Vite + Server Functions)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://www.better-auth.com/) (email/password, session-based)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/)
- **Testing**: [Vitest](https://vitest.dev/)

