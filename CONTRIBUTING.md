# Contributing to Since

This document is the shared source of truth for repository development conventions and AI agent context. Agent-specific entrypoints should reference or edit this file instead of duplicating these instructions.

---

## Core Commands

Generally, always prefer a pnpm-based approach to commands. Avoid npm/npx/yarn/bun approaches and anything that depends on shell.

```sh
pnpm dev              # Start PostgreSQL, run migrations, and start Vite (port 3000)
pnpm dev:app          # Start only Vite (port 3000)
pnpm dev:db           # Start only PostgreSQL
pnpm build            # Build the production app
pnpm preview          # Preview the production build
pnpm test             # Run Vitest
pnpm lint             # Check with ESLint
pnpm format           # Check formatting with Prettier
pnpm check            # Write Prettier changes and apply ESLint fixes
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:pull          # Introspect the database schema
pnpm db:studio        # Open Drizzle Studio
pnpm storybook        # Start Storybook (port 6006)
pnpm build-storybook  # Build static Storybook
# db:push is disabled — always use db:generate + db:migrate
```

---

## High-Level Architecture

No floating dep ranges — pin all versions explicitly, especially @tanstack/\*

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Framework       | TanStack Start (React 19 + Vite + Server Functions) |
| Language        | TypeScript strict, ES2022                           |
| Database        | PostgreSQL + Drizzle ORM                            |
| Auth            | Better Auth (email/password, session-based)         |
| Data fetching   | TanStack Query                                      |
| Routing         | TanStack Router (file-based)                        |
| Forms           | TanStack Form                                       |
| Tables          | TanStack Table                                      |
| Styling         | Tailwind CSS v4 + shadcn/ui (new-york, zinc)        |
| Env vars        | T3Env (`@t3-oss/env-core`) + Zod                    |
| Testing         | Vitest + Storybook playtests                        |
| Package manager | pnpm                                                |

---

## Conventions & Style Rules

- **Imports**: `#/*` → `src/*` (preferred over `@/*`)
- **Components**: PascalCase filenames & exports. Use existing components for consistent UI patterns where possible; comment the justification when deviating.
- **Hooks**: `useX` prefix; one hook per file
- **State vs Refs**: Prefer `useState` over `useRef` for component state, as refs bypass the React render cycle and can introduce ephemeral behavior that's harder to reason about.
- **Typing**: Try to avoid generating separate .d.ts files; prefer strict TS types
- **Error Handling**: Never create parallel `useState` for errors—use TanStack Query's built-in `query.error` and `mutation.error` directly. For multiple mutations sharing error display, combine with `||` (e.g., `mutationA.error || mutationB.error`) and dismiss via `mutation.reset()`. This prevents temporal inconsistency and ensures UI matches actual query state.
- **Formatting**: Prettier — no semicolons, single quotes, trailing commas (see `prettier.config.js`). ESLint uses `@tanstack/eslint-config` plus `plugin:storybook/recommended`. Run `pnpm check` before committing.
- **Tailwind**: Use atomic classes; avoid custom CSS when possible
- **Dates and times**: `date-fns` (with `@date-fns/utc` and `@date-fns/tz`) is the default for all date handling in the frontend and shared domain code. Do not hand-roll date arithmetic or formatting, and do not add other date libraries (dayjs, luxon, moment). Call the library functions directly rather than wrapping them in local helper modules; if a local helper module is genuinely needed, comment the justification.
- **State Management**: Rely on the React Query cache as the single source of truth; avoid maintaining parallel local copies of query data for conciseness and consistency.
- **Forms**: Use `@tanstack/react-form` (`useForm`, `useStore`, `<form.Field>`) for all form state, validation, dirty tracking, and submission lifecycle. Always use an async `onSubmit` so TanStack Form tracks `isSubmitting` and `canSubmit` automatically. Do not use manual `useState` per field or hand-roll dirty comparisons. Wrap fields in a `<form onSubmit>` element with a `type="submit"` button for accessibility.
- **Awaiting mutations in `onSubmit`**: TanStack Form records the failure — setting `isSubmitSuccessful` to `false` and clearing `isSubmitting` — and **then re-throws** the error from `onSubmit`, so a bare `await mutation.mutateAsync(...)` becomes an unhandled promise rejection at the `void form.handleSubmit()` call site. Wrap the `mutateAsync` call in `try/catch` and make sure the error reaches the user: return from the `catch` when it is already surfaced via `mutation.error`, or hand it to whatever displays it (e.g. an `onSaveError` callback) when it is not. **Never re-throw from `onSubmit` on the theory that the form needs it to mark the submission failed** — the form has already done that before it re-throws, so the only remaining effect is the unhandled rejection. Reserve `form.handleSubmit().catch(() => {})` at the call site for when `onSubmit` cannot be changed; it still owes the user a visible error. Do not switch to `mutate()` to dodge this — the `await` is what makes `isSubmitting` track.
- **`async` handlers passed as `() => void` props**: TypeScript accepts an `async` function wherever a `void`-returning callback is expected, so a handler like `onConfirm={handleDelete}` silently discards the promise and any rejection inside it escapes unhandled. When an `async` handler awaits a mutation, wrap it in `try/catch` the same way as above — `tsc` cannot catch this for you.
- **Drawers and Modals**: When implementing heavy full-screen components, ensure that they are not rendered repeatedly in the DOM. Use a single instance of the component that is conditionally rendered based on state, rather than creating multiple instances that are always mounted. This helps with performance and avoids unnecessary re-renders. If possible, use portals to render these components outside the main DOM hierarchy to prevent layout shifts and improve user experience. If possible, use lazy loading techniques to load these components only when needed, especially if they are resource-intensive or not immediately visible to the user.
- **Testing Strategy**:
- **Frontend testing**: For UI components refer Storybook stories with `play` functions over traditional `.test.ts` files. Create `*.stories.ts` files alongside components/utilities with test logic in `play` functions using `storybook/test`. This approach provides browser-based testing, visual debugging via Storybook UI, and integrates with the existing Storybook workflow. Use `expect()` from `storybook/test` for assertions.
- **Story placement**: Component stories live in `src/stories/`. Stories for a utility or hook live alongside the module they test. Shared story fixtures and opt-in decorators belong in `src/test-utils/` — not in `.storybook/`, which sits outside the `src` tsconfig include and so loses path aliases and typechecking. Reserve `.storybook/preview.tsx` for global, always-on providers.
- **Server-side testing**: Use Vitest (`*.test.ts`) for anything that runs on the server — domain logic, services, data access, and server functions.

## Agent Rules & Existing Policies

- Follow repository ESLint config and import alias conventions
- Preserve project structure; avoid broad refactors
- **YAGNI**: Build only what the current story requires. Do not add features, abstractions, helpers, or configuration based on guesses about future needs; wait until a real requirement exists. Simpler code now is cheaper to extend later than speculative code that has to be unwound.
- Cite only facts from code & docs; do not invent features
- Prefer minimal changes to satisfy prompts. If a prompt seems to require a complicated solution, ask for clarification and/or suggest ways the user can break it down into smaller, more manageable tasks.
- **Stepwise operation**: When operating as an agent, do not attempt to complete complex tasks in one pass. This can lead to timeouts, context loss, and confusion. Instead, break it down into smaller steps and ask for confirmation before proceeding with each step. This ensures that the user is aligned with the approach and can provide feedback or adjustments as needed.
- **Reviews**: When asked for a review, perform a fresh `fetch` and compare the current branch to `origin/main`, and use this file as a guide to provide feedback on code quality, adherence to conventions, and potential improvements. Focus on the overall architecture, component structure, and state management practices. If the code deviates from the conventions outlined here, suggest specific changes to align it with the project's standards. If operating as an agent, make minor or stylistic changes as needed, but do not attempt larger improvements without user confirmation.
- **Codemods**: If a prompt may require touching many files (for example, reorganizing imports or changing common conventions), prefer and suggest implementing as a repeatable codemod script.

### Input Shortcuts

- **Review shortcut**: If a user message is a branch name preceded by `!review` (i.e. `!review <branch-name>`, where the branch follows the Shortcut-generated `<user>/sc-<id>/<short-description>` convention, e.g. `samuelgraham2060/sc-31/feature-create-reusable-table-component`), interpret it as: "Code review this branch against `main` per the **Reviews** policy above." Do not ask for clarification — proceed directly with the review.
  - **Identify the Shortcut story**: The story key is usually the prefix of the branch name. Take it from the branch name when present.
  - **With the Shortcut MCP connector** (tools named `mcp__shortcut__*`, e.g. `stories-get-by-id`): fetch the story from `app.shortcut.com` and read its description and acceptance criteria before reviewing. In addition to the code-quality review, state explicitly whether the branch fulfills the story — which acceptance criteria are covered, which are missing or only partially addressed, and any work in the diff that falls outside the story's scope. Read the story before the diff so the review is framed by the intended behavior rather than reverse-engineered from the code.
  - **Without the Shortcut MCP connector**: Perform the review from the code alone, and note in the review output that it would be better informed with visibility into the story, since fulfillment of acceptance criteria could not be checked. Include these brief setup steps so the user can add the connector.

- **Story Requirements shortcut**: If a user message is a `app.shortcut.com` Shortcut URL preceded by `!story-requirements` (i.e. `!story-requirements https://app.shortcut.com/sam-personal-scrum/story/123/feature-create-dashboard-ui`), interpret it as: "Gather and resolve the requirements for this story with me, then implement it on a new branch." Do not ask for clarification about the shortcut itself — proceed directly with the steps below.
  - **Without the Shortcut MCP connector**: stop and include the same brief setup steps listed under the **Review shortcut** above so the user can add the connector, since the story cannot be read without it.
  - **Read the story**: Using the Shortcut MCP connector, read the story thoroughly and note the problem statement, the acceptance criteria, any linked tickets, and the story key.
  - **Explore the code**: Explore all code areas referenced by or related to the ticket. Search broadly — look beyond what the ticket explicitly names for related usages, existing patterns, edge cases, or inconsistencies, including related feature flags, shared components, permissions, routes, and tests.
  - **Present questions**: Report findings to the user as a numbered list of questions covering:
    - Ambiguities or gaps in the acceptance criteria.
    - Inconsistencies between the ticket requirements and the actual codebase.
    - Scope concerns — areas affected by the change that the ticket doesn't address.
    - Proposed approaches for non-obvious implementation decisions.
  - **Q&A cycle**: Wait for the user to respond. If their answers raise new questions, ask them before proceeding. Continue this cycle until all ambiguities are resolved. Then ask: "Any other questions I should consider before starting implementation?" and wait for the user's explicit go-ahead before moving to implementation.
  - **Implement**: Once given the go-ahead, implement on a new branch following the Shortcut-generated `<user>/sc-<id>/<short-description>` naming convention (use the `stories-get-branch-name` tool to get the exact name). Do not commit the changes — leave them for the user to review; they may request changes, and they will commit and push the code themselves.
  - **Advice and pointers**:
    - Thoroughness in the requirements phase is the priority. Extra time on requirements saves rework later; don't rush to implementation.
    - When the user requests changes after reviewing the branch, keep them well-scoped so they can land as separate, atomic commits.
    - Answer code questions without making changes. When the user asks "why was X done?", explain first, then wait for instructions before editing.
    - Be concise in explanations without losing information.
    - Linkify every file and line reference.
  - **Forbidden actions**:
    - Do not begin implementation until all requirements questions are resolved and the user gives the go-ahead.
    - Do not modify code when the user asks a question about a change — explain first, wait for instructions.
    - Do not commit code to a branch unless requested to do so.
    - Do not push to protected branches, such as `main`, unless requested to do so.
    - Do not make changes outside the agreed-upon scope without asking first.

## Agent Compatibility

- Claude Code supports direct imports from wrapper files via `@path/to/file` syntax.
- `AGENTS.md` is provided as a root compatibility entrypoint for tools that look for agent-agnostic repository instructions; keep it as a thin wrapper pointing to `CONTRIBUTING.md`.
