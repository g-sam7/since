import { createServerFn } from '@tanstack/react-start'
import type { z } from 'zod'

import { AppError } from '#/lib/app-error'
import { authMiddleware } from '#/lib/auth-middleware'
import { toDashboardTask } from './dashboard'
import type { DashboardTask } from './dashboard'
import {
  createTask,
  getOrCreatePersonalWorkspace,
  listActiveTasks,
  updateTask,
} from './repository'
import { taskFormSchema, updateTaskSchema } from './task-input'
import type { TaskFormValues, UpdateTaskValues } from './task-input'

/** Parses server-function input, rejecting it as `invalidInput`. */
function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input)
  if (!result.success) throw new AppError('invalidInput')
  return result.data
}

/** Active tasks in the signed-in user's workspace, soonest due first. */
export const listDashboardTasks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardTask[]> => {
    const workspace = await getOrCreatePersonalWorkspace(
      context.session.user.id,
    )
    const tasks = await listActiveTasks(workspace.id)
    // `dueStatus` is fixed at fetch time on the server, while the card's
    // elapsed and due copy use the clock at render. They can disagree for a
    // single render at a band boundary and realign on the next refetch.
    // Deferred: the full fix is to return `now` here and thread it through
    // to the card so the badge, copy, and hydration all share one timestamp.
    const now = new Date()
    return tasks.map((task) => toDashboardTask(task, now))
  })

// The workspace and author always come from the session. The input schemas
// have no such fields, so any the client sends are stripped by the parse.

/** Creates a task in the signed-in user's workspace. */
export const createDashboardTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: TaskFormValues) => parseInput(taskFormSchema, input))
  .handler(async ({ context, data }): Promise<void> => {
    const userId = context.session.user.id
    const workspace = await getOrCreatePersonalWorkspace(userId)
    const { lastCompletedOn, ...fields } = data
    await createTask({
      ...fields,
      lastCompletedAt: lastCompletedOn,
      workspaceId: workspace.id,
      createdById: userId,
    })
  })

/** Updates a task's editable fields in the signed-in user's workspace. */
export const updateDashboardTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: UpdateTaskValues) => parseInput(updateTaskSchema, input))
  .handler(async ({ context, data }): Promise<void> => {
    const workspace = await getOrCreatePersonalWorkspace(
      context.session.user.id,
    )
    const { taskId, ...fields } = data
    const updated = await updateTask(workspace.id, taskId, fields)
    // Also covers a task id from another workspace, which the scoped update
    // leaves untouched.
    if (!updated) throw new AppError('notFound')
  })
