import { useHydrated } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { TaskCard } from '#/components/TaskCard'
import { Button } from '#/components/utils/Button'
import type { DashboardTask } from '#/lib/tasks/dashboard'
import { cn } from '#/lib/utils'

export type TaskDashboardProps = {
  /** Already sorted soonest due first by the server. */
  tasks: DashboardTask[]
  /** Reference time for elapsed and due copy; defaults to now. */
  now?: Date
  onCreate: () => void
  onEdit: (task: DashboardTask) => void
}

// Purely presentational so stories can render the empty and populated states.
export function TaskDashboard({
  tasks,
  now = new Date(),
  onCreate,
  onEdit,
}: TaskDashboardProps) {
  // The top fade only appears once the list has scrolled, so the cards look
  // untouched in their resting state.
  const [isScrolled, setIsScrolled] = useState(false)
  // Creating needs JavaScript, so the button stays disabled until hydration.
  const hydrated = useHydrated()

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
          <Button disabled={!hydrated} onClick={onCreate}>
            Create your first task
          </Button>
        </div>
      </main>
    )
  }

  return (
    // Padding sits outside `page-wrap`, as in the header, so the list edges
    // line up with the header's logo and theme toggle.
    <main className="px-4 py-10">
      <div className="page-wrap flex flex-col items-center">
        <div className="mb-6 flex w-full items-center justify-center gap-3">
          <h1 className="display-title text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your tasks
          </h1>
          <Button
            size="icon"
            aria-label="New task"
            disabled={!hydrated}
            onClick={onCreate}
          >
            <PlusIcon />
          </Button>
        </div>
        <ul
          aria-label="Tasks"
          onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 0)}
          // Bottom fade signals there is more to scroll; the extra bottom
          // padding keeps the last card clear of the fade at the end of the
          // list. The 1px inset plus matching negative margin stops the
          // scroll container clipping card borders without shifting them.
          className={cn(
            '-mx-px flex max-h-[70vh] w-[calc(100%+2px)] flex-col gap-4 overflow-y-auto px-px pt-px pb-16 mask-b-from-95% mask-b-to-100%',
            isScrolled && 'mask-t-from-95% mask-t-to-100%',
          )}
        >
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} now={now} onEdit={() => onEdit(task)} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
