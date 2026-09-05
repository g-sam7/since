import { and, asc, eq, isNull } from 'drizzle-orm'

import { db } from '#/db/index'
import { task, taskCompletion, workspace, workspaceMember } from '#/db/schema'
import type { NewTask, Task, Workspace } from '#/db/task-schema'
import { compareByNextDue } from './due'

// Server-only data access for tasks. These helpers use the core query builder
// rather than `db.query` so they survive the Drizzle 1.0 relations rewrite
// unchanged.

/** Creates the personal workspace a user gets on sign-up. */
export async function createPersonalWorkspace(
  userId: string,
  name = 'Personal',
): Promise<Workspace> {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(workspace)
      .values({ name, createdById: userId })
      .returning()
    await tx
      .insert(workspaceMember)
      .values({ workspaceId: created.id, userId, role: 'owner' })
    return created
  })
}

export async function listWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  const rows = await db
    .select({ workspace })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(eq(workspaceMember.userId, userId))
    .orderBy(asc(workspace.createdAt))
  return rows.map((row) => row.workspace)
}

/** Active (non-archived) tasks in a workspace, soonest due first. */
export async function listActiveTasks(workspaceId: string): Promise<Task[]> {
  const rows = await db
    .select()
    .from(task)
    .where(and(eq(task.workspaceId, workspaceId), isNull(task.archivedAt)))
  return rows.sort(compareByNextDue)
}

export async function createTask(values: NewTask): Promise<Task> {
  const [created] = await db.insert(task).values(values).returning()
  return created
}

export async function updateTask(
  taskId: string,
  values: Partial<
    Pick<
      NewTask,
      'name' | 'description' | 'notes' | 'intervalCount' | 'intervalUnit'
    >
  >,
): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set(values)
    .where(eq(task.id, taskId))
    .returning()
  return updated
}

/**
 * Records a completion and advances the task's denormalised
 * `lastCompletedAt` in one transaction.
 */
export async function completeTask(
  taskId: string,
  completedById: string,
  completedAt: Date = new Date(),
): Promise<Task | undefined> {
  return db.transaction(async (tx) => {
    await tx
      .insert(taskCompletion)
      .values({ taskId, completedById, completedAt })
    const [updated] = await tx
      .update(task)
      .set({ lastCompletedAt: completedAt })
      .where(eq(task.id, taskId))
      .returning()
    return updated
  })
}

export async function archiveTask(taskId: string): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set({ archivedAt: new Date() })
    .where(eq(task.id, taskId))
    .returning()
  return updated
}

export async function restoreTask(taskId: string): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set({ archivedAt: null })
    .where(eq(task.id, taskId))
    .returning()
  return updated
}

/** Permanently deletes a task and, via cascade, its completions. */
export async function deleteTask(taskId: string): Promise<void> {
  await db.delete(task).where(eq(task.id, taskId))
}
