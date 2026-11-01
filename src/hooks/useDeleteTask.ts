import { useMutation, useQueryClient } from '@tanstack/react-query'

import { tasksQueryKey } from '#/lib/tasks/queries'
import { deleteArchivedTask } from '#/lib/tasks/server-functions'
import type { TaskIdInput } from '#/lib/tasks/task-input'

/**
 * Permanently deletes an archived task, then refetches every task list. The
 * refetch is awaited so a caller's `mutateAsync` settles once the lists show
 * the change.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskIdInput) => deleteArchivedTask({ data: input }),
    // Settled rather than success: a failure is often a stale list, such as
    // a task already archived in another tab, and the refetch corrects it.
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
  })
}
