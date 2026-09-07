import { useSuspenseQuery } from '@tanstack/react-query'

import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'

/**
 * Dashboard task list. Suspends rather than exposing a loading state because
 * the `/app` loader has already ensured the data is in the cache.
 */
export function useDashboardTasks() {
  return useSuspenseQuery(dashboardTasksQueryOptions)
}
