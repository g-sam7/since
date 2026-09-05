import { UTCDate } from '@date-fns/utc'
import { add, formatDistanceStrict, milliseconds } from 'date-fns'
import type { Duration } from 'date-fns'

import type { IntervalUnit, Task } from '#/db/task-schema'

export const DUE_STATUSES = ['overdue', 'dueSoon', 'upcoming'] as const
export type DueStatus = (typeof DUE_STATUSES)[number]

/** Tasks due within this window count as "due soon". */
export const DEFAULT_DUE_SOON_WINDOW_MS = milliseconds({ days: 3 })

type Recurrence = Pick<Task, 'intervalCount' | 'intervalUnit'>
type DueInput = Recurrence & Pick<Task, 'createdAt' | 'lastCompletedAt'>

const DURATION_KEY: Record<IntervalUnit, keyof Duration> = {
  day: 'days',
  week: 'weeks',
  month: 'months',
  year: 'years',
}

/**
 * Adds a recurrence interval to a date using UTC calendar arithmetic. Month
 * and year steps clamp to the last day of the target month, so Jan 31 plus
 * one month is Feb 28 (or 29) rather than spilling into March.
 *
 * date-fns does calendar math in the date's own zone, so the input is wrapped
 * in `UTCDate` to keep the result independent of the runtime's local zone.
 */
export function addInterval(
  date: Date,
  count: number,
  unit: IntervalUnit,
): Date {
  const result = add(new UTCDate(date), { [DURATION_KEY[unit]]: count })
  return new Date(result.getTime())
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

// Display copy below is strict (no "about"/"almost") and rounded to the
// nearest unit; it is marketing-style copy, not a precise measurement.

/** "It's been X since" copy measured from the task's due anchor, e.g. "3 months". */
export function formatTaskElapsed(
  task: DueInput,
  now: Date = new Date(),
): string {
  return formatDistanceStrict(getDueAnchor(task), now)
}

/** Relative due time for a task list, e.g. "in 5 days" or "2 days ago". */
export function formatDueIn(task: DueInput, now: Date = new Date()): string {
  return formatDistanceStrict(getNextDueAt(task), now, { addSuffix: true })
}
