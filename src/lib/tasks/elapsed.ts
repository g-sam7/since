import { formatDistanceStrict } from 'date-fns'

import type { Task } from '#/db/task-schema'
import { formatTaskElapsed } from './due'

type ElapsedInput = Pick<
  Task,
  'intervalCount' | 'intervalUnit' | 'createdAt' | 'lastCompletedAt'
>

/**
 * The dashboard's headline sentence in the home page voice, e.g.
 * "It's been 3 months since you last did this." A task that has never been
 * completed is measured from its creation and worded accordingly:
 * "Created 2 weeks ago, never completed."
 */
export function formatElapsedLine(
  task: ElapsedInput,
  now: Date = new Date(),
): string {
  if (task.lastCompletedAt === null) {
    return `Created ${formatDistanceStrict(task.createdAt, now)} ago, never completed.`
  }
  return `It's been ${formatTaskElapsed(task, now)} since you last did this.`
}
