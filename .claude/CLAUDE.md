# Since — Claude Code Instructions

## What This App Is

A recurring task tracker centered on **time elapsed**. Core question: "When did I last do this?"

Users see tasks as overdue, due soon, or recently completed. This is **not** a todo app — the value is time-based awareness. Derived state (`last_completed_at`, `next_due_at`, overdue status) is **computed at query time, never stored**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React 19 + Vite + Server Functions) |
| Language | TypeScript strict, ES2022 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (email/password, session-based) |
| Data fetching | TanStack Query |
| Routing | TanStack Router (file-based) |
| Forms | TanStack Form |
| Styling | Tailwind CSS v4 + shadcn/ui (new-york, zinc) |
| Env vars | T3Env (`@t3-oss/env-core`) + Zod |
| Testing | Vitest |
| Package manager | pnpm |

---

## Commands

```sh
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm test             # Run vitest
pnpm lint             # ESLint check
pnpm check            # Prettier write + ESLint fix
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
# db:push is disabled — always use db:generate + db:migrate
```

---

## Project Structure

```
src/
├── components/ui/       # shadcn/ui primitives
├── db/
│   ├── index.ts         # DB connection
│   ├── schema.ts        # Drizzle schema entrypoint (add app tables here)
│   └── auth-schema.ts   # Better Auth generated — DO NOT EDIT
├── lib/
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client
│   ├── auth-session.ts  # getAuthSession() server fn
│   └── utils.ts         # cn() helper
├── routes/
│   ├── api/auth/$.ts    # Auth API catch-all
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── _authed.tsx      # Protected layout (redirects to /sign-in if no session)
│   └── _authed/
│       └── app.tsx      # Main authenticated view
├── env.ts               # T3Env + Zod validated env vars
├── router.tsx
├── routeTree.gen.ts     # AUTO-GENERATED — NEVER EDIT
└── styles.css           # Design tokens, global styles
```

### Target Module Structure (build toward this)

```
src/modules/
├── workspaces/
├── tasks/
├── completions/
├── reminders/
└── audit/
```

Each module: domain logic → services → data access → server functions → UI components.

> Auth is already implemented across `lib/`, `db/`, `routes/`, `integrations/`. Do **not** move it into `modules/auth/`.

---

## Key Conventions

- **Path alias**: `#/*` → `src/*` (preferred over `@/*`)
- **className merging**: `cn()` from `#/lib/utils`
- **UI components**: shadcn primitives from `#/components/ui/`
- **Protected routes**: nest under `src/routes/_authed/`
- **Auth guard pattern**: `getAuthSession()` in route `beforeLoad`; redirect to `/sign-in` if null
- **Never** rely on client-side session state for authorization
- **UTC storage**: all timestamps stored UTC, rendered in user timezone
- **Business logic**: lives in services/domain functions — not in UI components
- **Formatting**: no semicolons, single quotes, trailing commas (Prettier)

---

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Server | Auth secret (min 32 chars) |
| `SERVER_URL` | Server | App URL (optional) |
| `VITE_APP_TITLE` | Client | App title (optional) |

Add new vars to `src/env.ts` with a Zod schema.

---

## Storybook

Storybook runs on port 6006 (`pnpm storybook`). Stories live in `src/stories/`.

### Setup facts
- Framework package is `@storybook/tanstack-react` — never import from `@storybook/react`
- Story files must be `.tsx` (not `.ts`) since they render JSX
- Global styles are imported in `.storybook/preview.tsx` via `import '../src/styles.css'`
- `"use client"` directives in shadcn components are no-ops in TanStack Start — remove them when touching a file

### UI component conventions
- All files in `src/components/ui/` use PascalCase (e.g. `Button.tsx`, `Card.tsx`, `TextArea.tsx`)
- Exported function names match the filename exactly (e.g. `TextArea`, not `Textarea`)
- When renaming a component file: grep for all imports and update them in the same step

### Story structure
Every story file should include:

1. **Playground** — a single story with `args` wired to controls so every prop is interactive
2. **Variant/size grids** (for components with variants/sizes) — render all options side by side, labeled with `font-mono` captions
3. **State stories** — at minimum: disabled, and `aria-invalid` if the component supports it
4. **Composition stories** (for compound components) — show meaningful real-world arrangements of sub-components, not contrived ones; skip compositions that don't appear in practice
5. **Real-world example** — at least one story that shows the component in a realistic UI context (e.g. a form group, a settings list)

### Story file template conventions
```tsx
import type { Meta, StoryObj } from '@storybook/tanstack-react'

const meta = {
  title: 'UI/ComponentName',
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

## Hard Rules

- **Never edit** `src/routeTree.gen.ts` or `src/db/auth-schema.ts`
- **No `db:push`** — always migrate via `db:generate` + `db:migrate`
- **No floating dep ranges** — pin all versions explicitly, especially `@tanstack/*`
- **No Supabase / Firebase** — build against standard PostgreSQL only
- **No stored derived data** — compute `last_completed_at`, `next_due_at`, overdue status at query time
- **No auth/permission changes** without explicit instruction
- **No overengineering** — keep it simple MVP
