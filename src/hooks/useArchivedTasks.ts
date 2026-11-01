import { useSuspenseQuery } from '@tanstack/react-query'

import { archivedTasksQueryOptions } from '#/lib/tasks/queries'

/**
 * Archived task list. Suspends rather than exposing a loading state because
 * the `/archived` loader has already ensured the data is in the cache.
 */
export function useArchivedTasks() {
  return useSuspenseQuery(archivedTasksQueryOptions)
}
