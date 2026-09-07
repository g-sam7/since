import { QueryClient } from '@tanstack/react-query'

// A fresh client per call. `getRouter` runs once per request on the server,
// so a module-level singleton would share one cache across every user's
// request and let `ensureQueryData` serve one user's data to another. The
// `QueryClientProvider` is installed by `setupRouterSsrQueryIntegration`.
export function getContext() {
  return { queryClient: new QueryClient() }
}
