import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'
import { completeDashboardTask } from '#/lib/tasks/server-functions'
import type { TaskIdInput } from '#/lib/tasks/task-input'

/**
 * Marks a task done now, then refetches the dashboard. The refetch is
 * awaited so a caller's `mutateAsync` settles once the list shows the change.
 */
export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskIdInput) => completeDashboardTask({ data: input }),
    // Settled rather than success: a failure is often a stale list, such as
    // a task already archived in another tab, and the refetch corrects it.
    //
    // Only the dashboard: completing never changes the archived view.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: dashboardTasksQueryOptions.queryKey,
      }),
  })
}
