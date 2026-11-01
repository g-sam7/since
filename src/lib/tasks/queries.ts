import { queryOptions } from '@tanstack/react-query'

import {
  listArchivedWorkspaceTasks,
  listDashboardTasks,
} from './server-functions'

/** Prefix of every task query, so a state change can refetch them all. */
export const tasksQueryKey = ['tasks'] as const

export const dashboardTasksQueryOptions = queryOptions({
  queryKey: [...tasksQueryKey, 'dashboard'],
  queryFn: () => listDashboardTasks(),
  // Without this the data hydrated from the `/app` loader is stale on arrival
  // and `useSuspenseQuery` refetches it as soon as it mounts, so every visit
  // fetches twice. Window focus still refetches a long-lived tab.
  staleTime: 30_000,
})

export const archivedTasksQueryOptions = queryOptions({
  queryKey: [...tasksQueryKey, 'archived'],
  queryFn: () => listArchivedWorkspaceTasks(),
  // As above, for the `/archived` loader.
  staleTime: 30_000,
})
