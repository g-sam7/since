import { queryOptions } from '@tanstack/react-query'

import { listDashboardTasks } from './server-functions'

export const dashboardTasksQueryOptions = queryOptions({
  queryKey: ['tasks', 'dashboard'],
  queryFn: () => listDashboardTasks(),
  // Without this the data hydrated from the `/app` loader is stale on arrival
  // and `useSuspenseQuery` refetches it as soon as it mounts, so every visit
  // fetches twice. Window focus still refetches a long-lived tab.
  staleTime: 30_000,
})
