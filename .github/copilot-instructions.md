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

Derived state (`last_completed_at`, `next_due_at`, overdue status) is **computed, not stored**.

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

### Infrastructure Direction

- **Local development DB**: PostgreSQL via Docker
- **Production DB target**: AWS RDS PostgreSQL
- **Database portability requirement**: build against standard PostgreSQL and environment-driven connection settings only
- Do not introduce Supabase, Firebase, or other hosted database/auth platforms unless explicitly requested

---

## Project Structure

```txt
src/
├── components/          # Shared UI components
│   └── utils/           # shadcn/ui primitives
├── db/
│   ├── index.ts         # Database connection
│   ├── schema.ts        # Drizzle schema entrypoint
│   └── auth-schema.ts   # Better Auth generated schema (if present, generated/owned)
├── hooks/               # Shared hooks
├── integrations/        # Third-party integration wrappers
│   ├── better-auth/     # Auth UI components
│   └── tanstack-query/  # Query provider & devtools
├── lib/
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client
│   ├── auth-session.ts  # Server-side session helper
│   └── utils.ts         # Utilities (cn() for className merging)
├── data/                # Static data / seed helpers
├── routes/              # File-based routes (TanStack Router)
│   ├── api/auth/$.ts    # Auth API catch-all handler
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── _authed.tsx      # Protected route layout
│   └── _authed/
│       └── app.tsx      # Main authenticated app page
├── env.ts               # Type-safe env vars (T3Env + Zod)
├── router.tsx           # Router config with QueryClient context
├── routeTree.gen.ts     # AUTO-GENERATED — never edit
└── styles.css           # Design tokens and global styles
```

### Key Conventions

- **Path alias**: `#/*` maps to `src/*` (primary). `@/*` also works but prefer `#/`.
- **Routing**: File-based under `src/routes/`. Route tree is auto-generated — never edit `routeTree.gen.ts`.
- **UI primitives**: Use shadcn components from `#/components/utils/`.
- **className merging**: Use `cn()` from `#/lib/utils`.
- **Styling**: Tailwind v4 with CSS custom properties. See `src/styles.css` for current design tokens (palette is not finalized).
- **Database**: PostgreSQL via Drizzle. Schema in `src/db/schema.ts`, config in `drizzle.config.ts`. Connection configured via environment variables.
- **Env vars**: Defined with Zod validation in `src/env.ts`. Prefix client vars with `VITE_`.

### Required Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Server | Auth secret key (min 32 chars) |
| `SERVER_URL` | Server | Application URL (optional) |
| `VITE_APP_TITLE` | Client | App title (optional) |

All server env vars are validated at startup via `src/env.ts`. Add new vars there with a Zod schema.

### Auth Patterns (Established)

- **Session helper**: `getAuthSession()` in `src/lib/auth-session.ts` — a `createServerFn` that returns the current session or `null`. Use in route `beforeLoad` guards.
- **Protected routes**: Nest route files under `src/routes/_authed/`. The `_authed.tsx` layout calls `getAuthSession()` in `beforeLoad` and redirects unauthenticated users to `/sign-in`.
- **Redirect-if-authenticated**: Public auth pages (`sign-in.tsx`, `sign-up.tsx`) check the session in `beforeLoad` and redirect to `/app` if the user is already signed in.
- **Auth schema ownership**: `src/db/auth-schema.ts` is generated/owned by Better Auth — do not hand-edit. `src/db/schema.ts` re-exports it and is the entrypoint for adding new app tables.
- Never rely on client-side session state for authorization

---

## Target Module Architecture

New features should follow this modular structure (not yet created — build toward it).

> **Note:** Auth is already implemented across `lib/`, `db/`, `routes/`, and `integrations/`. It does not need to move into `modules/auth/`. Future auth changes should follow the existing locations.

```
src/modules/
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
- Pin dependency changes to explicit versions already verified in the lockfile or in trusted advisories/release metadata; refresh lockfiles with scripts disabled when investigating supply-chain risk
- Write clear, simple TypeScript

### Do Not

- Introduce unnecessary dependencies
- Over-engineer solutions beyond current requirements
- Modify auth or permission logic without explicit instruction
- Store derived data that can be computed
- Edit `src/routeTree.gen.ts` (auto-generated by TanStack Router)
- Use floating dependency ranges like `latest` for direct dependencies, especially `@tanstack/*` packages; keep versions explicit to reduce supply-chain exposure
- Add complex patterns unless clearly justified

---

## Storybook

Storybook runs on port 6006 (`pnpm storybook`). Stories live in `src/stories/`.

### Setup facts

- Framework package is `@storybook/tanstack-react` — never import from `@storybook/react`
- Story files must be `.tsx` (not `.ts`) since they render JSX
- Global styles are imported in `.storybook/preview.tsx` via `import '../src/styles.css'`

### UI component conventions

- All files in `src/components/utils/` use PascalCase (e.g. `Button.tsx`, `Card.tsx`, `TextArea.tsx`)
- Exported function names match the filename exactly (e.g. `TextArea`, not `Textarea`)

### Story structure

Every story file should include:

1. **Playground** — a single story with `args` wired to controls so every prop is interactive
2. **Variant/size grids** (for components with variants/sizes) — render all options side by side, labeled with `font-mono` captions
3. **State stories** — at minimum: disabled, and `aria-invalid` if the component supports it
4. **Composition stories** (for compound components) — show meaningful real-world arrangements of sub-components, not contrived ones; skip compositions that don't appear in practice
5. **Real-world example** — at least one story that shows the component in a realistic UI context (e.g. a form group, a settings list)

### Story file template

```tsx
import type { Meta, StoryObj } from '@storybook/tanstack-react'

const meta = {
  title: 'Utils/ComponentName', // use Utils/ for components in src/components/utils/
  component: ComponentName,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-80"><Story /></div>], // set a sensible fixed width
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>
```

- Use `parameters: { layout: 'centered' }` for all UI component stories
- Use a `decorators` width wrapper (`w-80` or `w-96`) so stories aren't edge-to-edge
- Override the decorator per-story when a story needs different dimensions (e.g. vertical sliders need a height wrapper)
- Use `defaultValue` (not `value`) in render functions so stories remain uncontrolled

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
pnpm db:studio        # Open Drizzle Studio
# pnpm db:push is intentionally disabled — always use db:generate + db:migrate
```
