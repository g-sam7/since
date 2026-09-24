import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useState } from 'react'

import { TaskDashboard } from '#/components/TaskDashboard'
import { useDashboardTasks } from '#/hooks/useDashboardTasks'
import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'

// Loaded on first open so the form stays out of the dashboard's bundle.
const TaskFormSheet = lazy(() => import('#/components/TaskFormSheet'))

export const Route = createFileRoute('/_authed/app')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardTasksQueryOptions),
  component: AppPage,
})

function AppPage() {
  const { data: tasks } = useDashboardTasks()
  // One sheet instance serves create and every card's edit. It stays mounted
  // after its first open so closing can animate; `editingTaskId` is kept
  // while closing so the title does not flip to "New task" mid-animation.
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  // Read from the query each render so the form opens with persisted values.
  const editingTask = tasks.find((task) => task.id === editingTaskId)

  function openSheet(taskId: string | null) {
    setEditingTaskId(taskId)
    setSheetOpen(true)
    setHasOpenedSheet(true)
  }

  return (
    <>
      <TaskDashboard
        tasks={tasks}
        onCreate={() => openSheet(null)}
        onEdit={(task) => openSheet(task.id)}
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
          />
        </Suspense>
      )}
    </>
  )
}
