import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useState } from 'react'

import type { TaskCardFocus } from '#/components/TaskCard'
import { TaskDashboard } from '#/components/TaskDashboard'
import { useArchiveTask } from '#/hooks/useArchiveTask'
import { useCompleteTask } from '#/hooks/useCompleteTask'
import { useDashboardTasks } from '#/hooks/useDashboardTasks'
import type { TaskActionError } from '#/lib/tasks/action-error'
import type { DashboardTask } from '#/lib/tasks/dashboard'
import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'

// Loaded on first open so the form stays out of the dashboard's bundle.
const TaskFormSheet = lazy(() => import('#/components/TaskFormSheet'))

export const Route = createFileRoute('/_authed/app')({
  head: () => ({ meta: [{ title: 'Your tasks · Since' }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardTasksQueryOptions),
  component: AppPage,
})

function AppPage() {
  const { data: tasks } = useDashboardTasks()
  const completeTask = useCompleteTask()
  const archiveTask = useArchiveTask()
  // One sheet instance serves create and every card's edit. It stays mounted
  // after its first open so closing can animate; `editingTaskId` is kept
  // while closing so the title does not flip to "New task" mid-animation.
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  // The task last created, edited, or completed, marked on the dashboard so
  // it can be found after the sort moves it, with the button to focus. Cleared
  // on the next opening or action so repeating it marks the card afresh.
  const [highlight, setHighlight] = useState<{
    taskId: string
    focus: TaskCardFocus
  } | null>(null)
  // Read from the query each render so the form opens with persisted values.
  const editingTask = tasks.find((task) => task.id === editingTaskId)

  const actionError: TaskActionError | null = completeTask.error
    ? { action: 'complete', error: completeTask.error }
    : archiveTask.error
      ? { action: 'archive', error: archiveTask.error }
      : null

  function openSheet(taskId: string | null) {
    setHighlight(null)
    setEditingTaskId(taskId)
    setSheetOpen(true)
    setHasOpenedSheet(true)
  }

  // Each action starts by clearing the last one's error, so the alert only
  // ever describes the most recent action.
  function resetActions() {
    setHighlight(null)
    completeTask.reset()
    archiveTask.reset()
  }

  async function handleComplete(task: DashboardTask) {
    resetActions()
    try {
      await completeTask.mutateAsync({ taskId: task.id })
      setHighlight({ taskId: task.id, focus: 'done' })
    } catch {
      // Shown through `actionError`.
    }
  }

  async function handleArchive(task: DashboardTask) {
    resetActions()
    try {
      await archiveTask.mutateAsync({ taskId: task.id })
    } catch {
      // Shown through `actionError`.
    }
  }

  return (
    <>
      <TaskDashboard
        tasks={tasks}
        onCreate={() => openSheet(null)}
        onEdit={(task) => openSheet(task.id)}
        onComplete={handleComplete}
        onArchive={handleArchive}
        actionsDisabled={completeTask.isPending || archiveTask.isPending}
        actionError={actionError}
        onDismissError={resetActions}
        highlightedTaskId={highlight?.taskId ?? null}
        highlightFocus={highlight?.focus}
      />
      {hasOpenedSheet && (
        <Suspense fallback={null}>
          <TaskFormSheet
            // A task that disappears from the list while being edited (e.g.
            // removed in another tab) closes the sheet rather than turning
            // it into a create form.
            open={sheetOpen && (editingTaskId === null || !!editingTask)}
            onOpenChange={setSheetOpen}
            task={editingTask}
            onSaved={(taskId) => setHighlight({ taskId, focus: 'edit' })}
          />
        </Suspense>
      )}
    </>
  )
}
