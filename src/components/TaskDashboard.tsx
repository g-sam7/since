import { TaskCard } from '#/components/TaskCard'
import { Button } from '#/components/utils/Button'
import type { DashboardTask } from '#/lib/tasks/dashboard'

export type TaskDashboardProps = {
  /** Already sorted soonest due first by the server. */
  tasks: DashboardTask[]
  /** Reference time for elapsed and due copy; defaults to now. */
  now?: Date
}

// Purely presentational so stories can render the empty and populated states.
export function TaskDashboard({ tasks, now = new Date() }: TaskDashboardProps) {
  if (tasks.length === 0) {
    return (
      <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
        <div className="island-shell rounded-2xl p-6 sm:p-10">
          <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back
          </h1>
          <p className="mb-6 text-base text-muted-foreground">
            You don&apos;t have any tracked tasks yet.
          </p>
          {/* Enabled by sc-41 (create/edit). */}
          <Button disabled>Create your first task</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap flex flex-col items-center px-4 py-10">
      <h1 className="display-title mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Your tasks
      </h1>
      <ul
        aria-label="Tasks"
        className="flex max-h-[70vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto p-1"
      >
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} now={now} />
          </li>
        ))}
      </ul>
    </main>
  )
}
