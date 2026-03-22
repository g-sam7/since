# Since — Copilot Instructions

## Product Context

Since is a recurring task tracker centered around **time elapsed**. The core question it answers: "When did I last do this?"

Users track everyday recurring tasks (working out, changing air filters, car maintenance, etc.) and see what is overdue, due soon, or recently completed. This is **not** a traditional todo app — the primary value is time-based awareness, not task completion.

### MVP Scope

- **Auth**: Email/password login, session-based (no OAuth)
- **Workspaces**: Single-user containers for tasks
- **Tasks**: Create, edit, archive — each with name, optional description, recurrence rule, workspace
- **Completions**: Quick "mark done" interaction (1–2 clicks), optional note — this is the core UX
- **Dashboard**: Single view showing overdue, due soon, and recently completed tasks with "time since last done"
- **Reminders**: Email-based daily digest for overdue tasks
- **Audit trail**: Lightweight logging of key actions (created, updated, completed)

Derived state (last_completed_at, next_due_at, overdue status) is **computed, not stored**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React 19 + Vite + Server Functions) |
| Language | TypeScript (strict mode, ES2022) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (email/password, session-based) |
| Data fetching | TanStack Query |
| Routing | TanStack Router (file-based) |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Styling | Tailwind CSS v4 + shadcn/ui (new-york style, zinc base) |
| Env vars | T3Env (`@t3-oss/env-core`) + Zod |
| Testing | Vitest |
| Package manager | pnpm |

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   └── ui/              # shadcn/ui primitives
├── db/
│   ├── index.ts         # Database connection
│   └── schema.ts        # Drizzle schema definitions
├── hooks/               # Shared hooks
├── integrations/        # Third-party integration wrappers
│   ├── better-auth/     # Auth UI components
│   └── tanstack-query/  # Query provider & devtools
├── lib/
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client (useSession)
│   └── utils.ts         # Utilities (cn() for className merging)
├── routes/              # File-based routes (TanStack Router)
│   └── api/auth/$.ts    # Auth API catch-all handler
├── env.ts               # Type-safe env vars (T3Env + Zod)
├── router.tsx           # Router config with QueryClient context
├── routeTree.gen.ts     # AUTO-GENERATED — never edit
└── styles.css           # Design tokens and global styles
```

### Key Conventions

- **Path alias**: `#/*` maps to `src/*` (primary). `@/*` also works but prefer `#/`.
- **Routing**: File-based under `src/routes/`. Route tree is auto-generated — never edit `routeTree.gen.ts`.
- **UI primitives**: Use shadcn components from `#/components/ui/`.
- **className merging**: Use `cn()` from `#/lib/utils`.
- **Styling**: Tailwind v4 with CSS custom properties. See `src/styles.css` for current design tokens (palette is not finalized).
- **Database**: PostgreSQL via Drizzle. Schema in `src/db/schema.ts`, config in `drizzle.config.ts`. Connection configured via environment variables.
- **Env vars**: Defined with Zod validation in `src/env.ts`. Prefix client vars with `VITE_`.

---

## Target Module Architecture

New features should follow this modular structure (not yet created — build toward it):

```
src/modules/
├── auth/
├── workspaces/
├── tasks/
├── completions/
├── reminders/
└── audit/
```

Each module contains:
- **Domain logic** — Pure functions, types, validation schemas
- **Services** — Application/business logic (testable, framework-agnostic)
- **Data access** — Drizzle queries and mutations
- **Server functions** — TanStack Start server functions (API layer)
- **UI components** — Module-specific React components

Business logic lives in services and domain functions, **not** in UI components.

---

## Coding Standards

### Formatting (Prettier)

- No semicolons
- Single quotes
- Trailing commas (all)

### Linting

- Base: `@tanstack/eslint-config`

### Principles

- **Explicitness over abstraction** — Prefer clear, readable code over clever abstractions
- **Business logic outside components** — Services and domain functions should be testable and reusable
- **Type safety** — Use Zod for runtime validation, Drizzle types for database, TypeScript strict mode throughout
- **UTC storage** — Store all timestamps in UTC; render in user timezone in the UI
- **Computed derived data** — Calculate values like "last completed" and "next due" at query time; do not store prematurely
- **Simple MVP** — Avoid overengineering recurrence logic, notification systems, or unnecessary abstractions

---

## Agent Guidelines

### Do

- Follow the module structure when building new features
- Keep business logic in services/domain functions, not UI components
- Use existing patterns (`cn()`, shadcn primitives, T3Env, Drizzle schema conventions)
- Add Zod validation at system boundaries (user input, API responses)
- Write clear, simple TypeScript

### Do Not

- Introduce unnecessary dependencies
- Over-engineer solutions beyond current requirements
- Modify auth or permission logic without explicit instruction
- Store derived data that can be computed
- Edit `src/routeTree.gen.ts` (auto-generated by TanStack Router)
- Add complex patterns unless clearly justified

---

## Development Commands

```sh
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm test             # Run vitest
pnpm lint             # ESLint check
pnpm check            # Prettier write + ESLint fix
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio
```