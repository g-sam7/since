import { createFileRoute } from '@tanstack/react-router'

import { ArchivedTaskList } from '#/components/ArchivedTaskList'
import { useArchivedTasks } from '#/hooks/useArchivedTasks'
import { useDeleteTask } from '#/hooks/useDeleteTask'
import { useRestoreTask } from '#/hooks/useRestoreTask'
import type { ArchivedTask } from '#/db/task-schema'
import type { TaskActionError } from '#/lib/tasks/action-error'
import { archivedTasksQueryOptions } from '#/lib/tasks/queries'

export const Route = createFileRoute('/_authed/archived')({
  head: () => ({ meta: [{ title: 'Archived tasks · Since' }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(archivedTasksQueryOptions),
  component: ArchivedPage,
})

function ArchivedPage() {
  const { data: tasks } = useArchivedTasks()
  const restoreTask = useRestoreTask()
  const deleteTask = useDeleteTask()

  const actionError: TaskActionError | null = restoreTask.error
    ? { action: 'restore', error: restoreTask.error }
    : deleteTask.error
      ? { action: 'delete', error: deleteTask.error }
      : null

  // Each action starts by clearing the last one's error, so the alert only
  // ever describes the most recent action.
  function resetActions() {
    restoreTask.reset()
    deleteTask.reset()
  }

  async function handleRestore(task: ArchivedTask) {
    resetActions()
    try {
      await restoreTask.mutateAsync({ taskId: task.id })
    } catch {
      // Shown through `actionError`.
    }
  }

  // Rejects so the confirmation stays open; the list shows the error.
  async function handleDelete(task: ArchivedTask) {
    resetActions()
    await deleteTask.mutateAsync({ taskId: task.id })
  }

  return (
    <ArchivedTaskList
      tasks={tasks}
      onRestore={handleRestore}
      onDelete={handleDelete}
      actionsDisabled={restoreTask.isPending || deleteTask.isPending}
      actionError={actionError}
      onDismissError={resetActions}
    />
  )
}
