import type { DueStatus } from './due'
import { getDueStatus, getNextDueAt } from './due'
// Type-only import: erased at compile time, so this module stays safe to
// import from client code even though the repository touches the database.
import type { TaskWithCreator } from './repository'

export type { TaskWithCreator }

/** What the dashboard renders: a task decorated with its computed due info. */
export type DashboardTask = TaskWithCreator & {
  nextDueAt: Date
  dueStatus: DueStatus
}

export function toDashboardTask(
  task: TaskWithCreator,
  now: Date = new Date(),
): DashboardTask {
  return {
    ...task,
    nextDueAt: getNextDueAt(task),
    dueStatus: getDueStatus(task, now),
  }
}
