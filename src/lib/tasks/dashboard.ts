import type { Task } from '#/db/task-schema'
import type { DueStatus } from './due'
import { getDueStatus, getNextDueAt } from './due'

/** A task row joined with its creator's display name. */
export type TaskWithCreator = Task & {
  /** Null when the creator's account has been deleted. */
  createdByName: string | null
}

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
