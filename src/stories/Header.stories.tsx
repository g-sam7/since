import type { Meta, StoryObj } from '@storybook/tanstack-react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import Header from '#/components/Header'
import { authClient } from '#/lib/auth-client'

let authState: 'signed-out' | 'loading' | 'signed-in' = 'signed-out'

function configureAuthClient() {
  ;(authClient as unknown as {
    useSession: () => { data: unknown; isPending: boolean }
    signOut: () => Promise<void>
  }).useSession = () => {
    if (authState === 'loading') {
      return { data: null, isPending: true }
    }

    if (authState === 'signed-in') {
      return {
        data: {
          user: {
            name: 'Sam',
            image: null,
          },
        },
        isPending: false,
      }
    }

    return { data: null, isPending: false }
  }

  ;(authClient as unknown as { signOut: () => Promise<void> }).signOut = async () => {}
}

function createStoryRouter(content?: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => (
      <div className="mx-auto w-full max-w-5xl border border-border bg-background">
        <Header />
        {content}
        <Outlet />
      </div>
    ),
  })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null })
  const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: '/sign-in', component: () => null })
  const appRoute = createRoute({ getParentRoute: () => rootRoute, path: '/app', component: () => null })
  const routeTree = rootRoute.addChildren([indexRoute, signInRoute, appRoute])

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

function HeaderFrame({ content }: { content?: ReactNode }) {
  configureAuthClient()
  const router = createStoryRouter(content)

  return <RouterProvider router={router} />
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
  render: () => {
    authState = 'signed-out'
    return <HeaderFrame />
  },
}

export const LoadingSession: Story = {
  render: () => {
    authState = 'loading'
    return <HeaderFrame />
  },
}

export const SignedOut: Story = {
  render: () => {
    authState = 'signed-out'
    return <HeaderFrame />
  },
}

export const SignedIn: Story = {
  render: () => {
    authState = 'signed-in'
    return <HeaderFrame />
  },
}

export const InPageContext: Story = {
  render: () => {
    authState = 'signed-in'

    return (
      <HeaderFrame
        content={(
          <main className="space-y-4 px-4 py-10">
            <p className="text-sm text-muted-foreground font-mono">Page content</p>
            <div className="h-56 rounded-lg border border-dashed border-border bg-surface-subtle" />
          </main>
        )}
      />
    )
  },
}
