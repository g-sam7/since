import { Link, useHydrated } from '@tanstack/react-router'
import { ArchiveIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { ErrorAlert } from '#/components/ErrorAlert'
import { TaskCard } from '#/components/TaskCard'
import type { TaskCardFocus } from '#/components/TaskCard'
import { Button } from '#/components/utils/Button'
import { getTaskActionErrorMessage } from '#/lib/tasks/action-error'
import type { TaskActionError } from '#/lib/tasks/action-error'
import type { DashboardTask } from '#/lib/tasks/dashboard'
import { cn } from '#/lib/utils'

export type TaskDashboardProps = {
  /** Already sorted soonest due first by the server. */
  tasks: DashboardTask[]
  /** Reference time for elapsed and due copy; defaults to now. */
  now?: Date
  onCreate: () => void
  onEdit: (task: DashboardTask) => void
  onComplete: (task: DashboardTask) => void
  onArchive: (task: DashboardTask) => void
  /** Disables every card's Done and Archive while an action is in flight. */
  actionsDisabled?: boolean
  /** The failed Done or Archive, from the route's mutations. */
  actionError?: TaskActionError | null
  onDismissError: () => void
  /** The task just created, edited, or completed, marked so the user can find it. */
  highlightedTaskId?: string | null
  /** Which of the highlighted card's buttons takes focus. */
  highlightFocus?: TaskCardFocus
}

// Purely presentational so stories can render the empty and populated states.
export function TaskDashboard({
  tasks,
  now = new Date(),
  onCreate,
  onEdit,
  onComplete,
  onArchive,
  actionsDisabled = false,
  actionError = null,
  onDismissError,
  highlightedTaskId = null,
  highlightFocus,
}: TaskDashboardProps) {
  // The top fade only appears once the list has scrolled, so the cards look
  // untouched in their resting state.
  const [isScrolled, setIsScrolled] = useState(false)
  // Creating needs JavaScript, so the button stays disabled until hydration.
  const hydrated = useHydrated()

  const errorAlert = actionError && (
    <ErrorAlert onDismiss={onDismissError}>
      {getTaskActionErrorMessage(actionError)}
    </ErrorAlert>
  )

  if (tasks.length === 0) {
    return (
      <main className="page-wrap flex min-h-[60vh] flex-col items-center justify-center px-4 py-14 text-center">
        <div className="island-shell flex flex-col items-center gap-6 rounded-2xl p-6 sm:p-10">
          {errorAlert}
          <div>
            <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your tasks
            </h1>
            {/* Worded, with the buttons below, to suit both a new user and one
                who has just archived everything, since the dashboard does not
                know which. */}
            <p className="text-base text-muted-foreground">
              You don&apos;t have any active tasks.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button disabled={!hydrated} onClick={onCreate}>
              Create a task
            </Button>
            <Button variant="outline" asChild>
              <Link to="/archived">View archived tasks</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    // Padding sits outside `page-wrap`, as in the header, so the list edges
    // line up with the header's logo and theme toggle.
    <main className="px-4 py-10">
      <div className="page-wrap flex flex-col">
        <div className="mb-6 flex w-full items-center justify-between gap-3">
          <h1 className="display-title text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your tasks
          </h1>
          {/* Icon buttons alike in shape, each with a browser tooltip naming
              it. Create keeps the primary fill as the main action. */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              aria-label="New task"
              title="New task"
              disabled={!hydrated}
              onClick={onCreate}
            >
              <PlusIcon />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link
                to="/archived"
                aria-label="Archived tasks"
                title="Archived tasks"
              >
                <ArchiveIcon />
              </Link>
            </Button>
          </div>
        </div>
        {errorAlert && <div className="mb-4 w-full">{errorAlert}</div>}
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
              <TaskCard
                task={task}
                now={now}
                onEdit={() => onEdit(task)}
                onComplete={() => onComplete(task)}
                onArchive={() => onArchive(task)}
                actionsDisabled={actionsDisabled}
                highlighted={task.id === highlightedTaskId}
                highlightFocus={highlightFocus}
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
