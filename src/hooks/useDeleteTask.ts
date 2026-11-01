import { useMutation, useQueryClient } from '@tanstack/react-query'

import { archivedTasksQueryOptions } from '#/lib/tasks/queries'
import { deleteArchivedTask } from '#/lib/tasks/server-functions'
import type { TaskIdInput } from '#/lib/tasks/task-input'

/**
 * Permanently deletes an archived task, then refetches the archived view.
 * The refetch is awaited so a caller's `mutateAsync` settles once the list
 * shows the change.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskIdInput) => deleteArchivedTask({ data: input }),
    // Settled rather than success: a failure is often a stale list, such as
    // a task already restored or deleted in another tab, and the refetch
    // corrects it.
    //
    // Only the archived view: the dashboard never lists an archived task.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: archivedTasksQueryOptions.queryKey,
      }),
  })
}
