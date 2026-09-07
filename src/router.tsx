import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

import { getContext } from './integrations/tanstack-query/root-provider'

export function getRouter() {
  const { queryClient } = getContext()

  const router = createTanStackRouter({
    routeTree,

    context: { queryClient },

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  // Dehydrates queries fetched in loaders during SSR and rehydrates them on
  // the client, so `useSuspenseQuery` has data on first render and neither
  // suspends nor shows a loading state. Whether it then refetches in the
  // background is governed by each query's `staleTime`.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
