import { queryOptions } from '@tanstack/react-query'

import { listDashboardTasks } from './server-functions'

export const dashboardTasksQueryOptions = queryOptions({
  queryKey: ['tasks', 'dashboard'],
  queryFn: () => listDashboardTasks(),
})
