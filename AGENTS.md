# Since - AGENTS Instructions for Codex

## Mission
Build and maintain Since as a recurring task tracker focused on time elapsed: "When did I last do this?"

This is not a traditional todo app. Favor time-based awareness and quick completion logging.

## Product Guardrails
- MVP scope includes: email/password auth, single-user workspaces, tasks, completions, dashboard, daily email digest reminders, and lightweight audit trail.
- Derived state is computed, not stored: `last_completed_at`, `next_due_at`, and overdue status must be calculated at query time.
- Keep implementation MVP-simple. Avoid speculative abstractions.

## Stack and Architecture
- Framework: TanStack Start (React 19 + Vite + Server Functions)
- Language: TypeScript strict (ES2022)
- DB: PostgreSQL + Drizzle ORM
- Auth: Better Auth (session-based email/password)
- Data: TanStack Query
- Routing: TanStack Router (file-based)
- Forms: TanStack Form
- Tables: TanStack Table
- Styling: Tailwind CSS v4 + shadcn/ui (new-york, zinc)
- Env: T3Env (`@t3-oss/env-core`) + Zod
- Tests: Vitest
- Package manager: pnpm

Infrastructure direction:
- Local DB via Docker PostgreSQL
- Production DB target: AWS RDS PostgreSQL
- Keep DB/auth portable and standards-based (no hosted lock-in)

## Repository Conventions
- Preferred import alias: `#/*` -> `src/*` (prefer over `@/*`)
- UI primitives from `#/components/ui/`
- `cn()` helper from `#/lib/utils`
- File-based routes under `src/routes/`
- Do not edit generated files:
  - `src/routeTree.gen.ts`
  - `src/db/auth-schema.ts`

## Auth and Routing Patterns
- Use `getAuthSession()` from `src/lib/auth-session.ts` in route `beforeLoad` guards.
- Protected routes live under `src/routes/_authed/`.
- Redirect unauthenticated users to `/sign-in`.
- Public auth pages redirect authenticated users to `/app`.
- Never rely on client-side session state for authorization.
- Do not modify auth/permission logic without explicit user instruction.

## Module Direction
Build new features toward:

`src/modules/{workspaces,tasks,completions,reminders,audit}`

Within each module:
- Domain logic (pure functions/types/schemas)
- Services (business logic, testable)
- Data access (Drizzle queries/mutations)
- Server functions (API boundary)
- UI components

Rule: business logic belongs in domain/services, not React components.

## Data and Validation Rules
- Validate boundaries with Zod (inputs, API payloads, env).
- Add new env vars to `src/env.ts` with Zod schema.
- Required env vars:
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET` (min 32 chars)
  - `SERVER_URL` (optional)
  - `VITE_APP_TITLE` (optional client)
- Store timestamps in UTC; render in user timezone.

## Dependency and Security Policy
- Do not introduce unnecessary dependencies.
- Pin dependency versions explicitly; do not use floating ranges like `latest`.
- Be especially strict with `@tanstack/*` version pinning.
- If touching dependencies, keep lockfile consistent and deterministic.

## Database Workflow Rules
- Use migrations only:
  - `pnpm db:generate`
  - `pnpm db:migrate`
- Do not use `pnpm db:push`.
- Keep schema changes in `src/db/schema.ts` (app-owned schema entrypoint).

## Coding Standards
- Prettier style: no semicolons, single quotes, trailing commas.
- Prefer explicit, readable code over clever abstractions.
- Keep changes small, focused, and testable.

## Standard Commands
- `pnpm dev`
- `pnpm build`
- `pnpm test`
- `pnpm lint`
- `pnpm check`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:studio`

## Codex Execution Guidance
When implementing tasks in this repo:
- Preserve existing architecture and naming patterns.
- Before editing, inspect nearby files for established patterns and follow them.
- Prefer minimal diffs that satisfy the requirement.
- Add or update tests when behavior changes.
- If a requested change conflicts with hard rules above, pause and call out the conflict clearly.
