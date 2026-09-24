import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'
import { createDashboardTask } from '#/lib/tasks/server-functions'
import type { TaskFormValues } from '#/lib/tasks/task-input'

/**
 * Creates a task, then refetches the dashboard. The refetch is awaited so a
 * caller's `mutateAsync` settles once the new task is in the list.
 */
export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: TaskFormValues) =>
      createDashboardTask({ data: values }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: dashboardTasksQueryOptions.queryKey,
      }),
  })
}
