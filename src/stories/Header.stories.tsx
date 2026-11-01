import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { expect, mocked, userEvent, waitFor, within } from 'storybook/test'
import Header from '#/components/Header'
import { authClient } from '#/lib/auth-client'

type Session = ReturnType<typeof authClient.useSession>

// `authClient` is the mock in `src/lib/__mocks__/auth-client.ts`.
function withSession(session: Pick<Session, 'data' | 'isPending'>) {
  return () => {
    mocked(authClient.useSession).mockReturnValue(session as Session)
  }
}

const signedIn = withSession({
  data: {
    user: { name: 'Sam', email: 'sam@example.com', image: null },
  } as Session['data'],
  isPending: false,
})
const signedOut = withSession({ data: null, isPending: false })
const loading = withSession({ data: null, isPending: true })

// Shared with `play` functions so they can inspect the cache.
const queryClient = new QueryClient()

function createStoryRouter(content?: ReactNode, path = '/') {
  const rootRoute = createRootRoute({
    component: () => (
      <div className="mx-auto w-full max-w-5xl border border-border bg-background">
        <Header />
        {content}
        <Outlet />
      </div>
    ),
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => null,
  })
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => null,
  })
  const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/app',
    component: () => null,
  })
  const routeTree = rootRoute.addChildren([indexRoute, signInRoute, appRoute])

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
}

function HeaderFrame({
  content,
  path,
}: {
  content?: ReactNode
  path?: string
}) {
  const router = createStoryRouter(content, path)

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  beforeEach: signedOut,
  render: () => <HeaderFrame />,
}

export const LoadingSession: Story = {
  beforeEach: loading,
  render: () => <HeaderFrame />,
}

export const SignedOut: Story = {
  beforeEach: signedOut,
  render: () => <HeaderFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Sign in' }),
    ).toBeVisible()
  },
}

export const SignedOutOnSignInPage: Story = {
  beforeEach: signedOut,
  render: () => <HeaderFrame path="/sign-in" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Since' })
    await expect(canvas.queryByRole('link', { name: 'Sign in' })).toBeNull()
  },
}

// The account menu renders in a portal outside the story's canvas.
const page = () => within(document.body)

export const SignedIn: Story = {
  beforeEach: signedIn,
  render: () => <HeaderFrame />,
  play: async ({ canvasElement }) => {
    // Stands in for the signed-in user's cached tasks. A literal key, as
    // importing the task queries pulls in server functions, which do not
    // load in the Storybook UI.
    queryClient.setQueryData(['tasks', 'dashboard'], [])
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('link', { name: 'Sign in' })).toBeNull()
    // Signing out lives in the menu, not the header itself.
    await expect(canvas.queryByRole('button', { name: 'Sign out' })).toBeNull()

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Account menu' }),
    )
    const menu = await page().findByRole('menu')
    await expect(menu).toHaveTextContent('Sam')
    await expect(menu).toHaveTextContent('sam@example.com')

    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Sign out' }),
    )
    await expect(authClient.signOut).toHaveBeenCalledOnce()
    await waitFor(() => expect(page().queryByRole('menu')).toBeNull())
    // Otherwise the next user to sign in in this tab sees these tasks.
    await waitFor(() =>
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0),
    )
  },
}

export const InPageContext: Story = {
  beforeEach: signedIn,
  render: () => (
    <HeaderFrame
      content={
        <main className="space-y-4 px-4 py-10">
          <p className="text-sm text-muted-foreground font-mono">
            Page content
          </p>
          <div className="h-56 rounded-lg border border-dashed border-border bg-surface-subtle" />
        </main>
      }
    />
  ),
}
