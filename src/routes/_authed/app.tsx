import { createFileRoute } from '@tanstack/react-router'

import { TaskDashboard } from '#/components/TaskDashboard'
import { useDashboardTasks } from '#/hooks/useDashboardTasks'
import { dashboardTasksQueryOptions } from '#/lib/tasks/queries'

export const Route = createFileRoute('/_authed/app')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardTasksQueryOptions),
  component: AppPage,
})

function AppPage() {
  const { data: tasks } = useDashboardTasks()
  return <TaskDashboard tasks={tasks} />
}
