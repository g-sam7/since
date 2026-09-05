import type { IntervalUnit, Task } from '#/db/task-schema'

export const DUE_STATUSES = ['overdue', 'dueSoon', 'upcoming'] as const
export type DueStatus = (typeof DUE_STATUSES)[number]

/** Tasks due within this window count as "due soon". */
export const DEFAULT_DUE_SOON_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

type Recurrence = Pick<Task, 'intervalCount' | 'intervalUnit'>
type DueInput = Recurrence & Pick<Task, 'createdAt' | 'lastCompletedAt'>

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Adds a recurrence interval to a date using UTC calendar arithmetic. Month
 * and year steps clamp to the last day of the target month, so Jan 31 plus
 * one month is Feb 28 (or 29) rather than spilling into March.
 */
export function addInterval(
  date: Date,
  count: number,
  unit: IntervalUnit,
): Date {
  const result = new Date(date.getTime())
  switch (unit) {
    case 'day':
      return new Date(result.getTime() + count * DAY_MS)
    case 'week':
      return new Date(result.getTime() + count * 7 * DAY_MS)
    case 'month':
      return addUtcMonths(result, count)
    case 'year':
      return addUtcMonths(result, count * 12)
  }
}

function addUtcMonths(date: Date, months: number): Date {
  const day = date.getUTCDate()
  const result = new Date(date.getTime())
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDayOfMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate()
  result.setUTCDate(Math.min(day, lastDayOfMonth))
  return result
}

/**
 * The anchor a task's next due date is measured from: its last completion, or
 * its creation if it has never been completed.
 */
export function getDueAnchor(task: DueInput): Date {
  return task.lastCompletedAt ?? task.createdAt
}

export function getNextDueAt(task: DueInput): Date {
  return addInterval(getDueAnchor(task), task.intervalCount, task.intervalUnit)
}

export function getDueStatus(
  task: DueInput,
  now: Date = new Date(),
  dueSoonWindowMs: number = DEFAULT_DUE_SOON_WINDOW_MS,
): DueStatus {
  const remainingMs = getNextDueAt(task).getTime() - now.getTime()
  if (remainingMs < 0) return 'overdue'
  if (remainingMs <= dueSoonWindowMs) return 'dueSoon'
  return 'upcoming'
}

/** Sort comparator: tasks due soonest (including most overdue) come first. */
export function compareByNextDue(a: DueInput, b: DueInput): number {
  return getNextDueAt(a).getTime() - getNextDueAt(b).getTime()
}
