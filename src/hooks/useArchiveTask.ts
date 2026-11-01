import { useMutation, useQueryClient } from '@tanstack/react-query'

import { tasksQueryKey } from '#/lib/tasks/queries'
import { archiveDashboardTask } from '#/lib/tasks/server-functions'
import type { TaskIdInput } from '#/lib/tasks/task-input'

/**
 * Archives a task, then refetches every task list. The refetch is awaited
 * so a caller's `mutateAsync` settles once the lists show the change.
 */
export function useArchiveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskIdInput) => archiveDashboardTask({ data: input }),
    // Settled rather than success: a failure is often a stale list, such as
    // a task already archived in another tab, and the refetch corrects it.
    //
    // `all` also refetches the list that is not on screen (the dashboard or
    // the archived view), which this action changes too. Otherwise its loader
    // serves the cached copy and shows the old list until a background
    // refetch lands.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey,
        refetchType: 'all',
      }),
  })
}
