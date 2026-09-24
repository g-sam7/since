import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'
import { updateDashboardTask } from '#/lib/tasks/server-functions'
import type { UpdateTaskValues } from '#/lib/tasks/task-input'

/**
 * Updates a task, then refetches the dashboard. The refetch is awaited so a
 * caller's `mutateAsync` settles once the list shows the change.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpdateTaskValues) =>
      updateDashboardTask({ data: values }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: dashboardTasksQueryOptions.queryKey,
      }),
  })
}
