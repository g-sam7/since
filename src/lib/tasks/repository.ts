import { and, asc, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'

import { db } from '#/db/index'
import {
  task,
  taskCompletion,
  user,
  workspace,
  workspaceMember,
} from '#/db/schema'
import type { ArchivedTask, NewTask, Task, Workspace } from '#/db/task-schema'
import { compareByNextDue } from './due'

// Server-only data access for tasks. These helpers use the core query builder
// rather than `db.query` so they survive the Drizzle 1.0 relations rewrite
// unchanged. Every task write is scoped by `workspaceId` so a caller cannot
// reach a task outside the workspace it is authorised for.

export const PERSONAL_WORKSPACE_NAME = 'Personal'

/** Creates the personal workspace a user gets on sign-up. */
export async function createPersonalWorkspace(
  userId: string,
  name: string = PERSONAL_WORKSPACE_NAME,
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

/**
 * Returns the user's first workspace, creating a personal one if they have
 * none. Covers users created before workspaces existed and any sign-up whose
 * `createPersonalWorkspace` hook failed after the user row was committed.
 */
export async function getOrCreatePersonalWorkspace(
  userId: string,
): Promise<Workspace> {
  const existing = (await listWorkspacesForUser(userId)).at(0)
  return existing ?? createPersonalWorkspace(userId)
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

/** A task row joined with its creator's display name. */
export type TaskWithCreator = Task & {
  /** Null when the creator's account has been deleted. */
  createdByName: string | null
}

/**
 * Active (non-archived) tasks in a workspace with their creator's name,
 * soonest due first. The join is a left join because `createdById` is set
 * null when the creator's account is deleted.
 */
export async function listActiveTasks(
  workspaceId: string,
): Promise<TaskWithCreator[]> {
  const rows = await db
    .select({ task, createdByName: user.name })
    .from(task)
    .leftJoin(user, eq(task.createdById, user.id))
    .where(and(eq(task.workspaceId, workspaceId), isNull(task.archivedAt)))
  return rows
    .map((row) => ({ ...row.task, createdByName: row.createdByName }))
    .sort(compareByNextDue)
}

/** Archived tasks in a workspace, most recently archived first. */
export async function listArchivedTasks(
  workspaceId: string,
): Promise<ArchivedTask[]> {
  const rows = await db
    .select()
    .from(task)
    .where(and(eq(task.workspaceId, workspaceId), isNotNull(task.archivedAt)))
    .orderBy(desc(task.archivedAt))
  // The `isNotNull` filter guarantees `archivedAt`; Drizzle cannot narrow it.
  return rows as ArchivedTask[]
}

export type TaskFields = Pick<
  NewTask,
  'name' | 'description' | 'notes' | 'intervalCount' | 'intervalUnit'
>

// `createdById` is nullable in the schema only so the foreign key can set
// null when the author is deleted. New tasks must always record an author.
export type CreateTaskInput = TaskFields &
  Pick<NewTask, 'workspaceId' | 'lastCompletedAt'> & {
    createdById: string
  }

/**
 * Creates a task. A `lastCompletedAt` is also recorded as a completion by the
 * creator so the completion history agrees with the denormalised column.
 */
export async function createTask(values: CreateTaskInput): Promise<Task> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(task).values(values).returning()
    if (values.lastCompletedAt) {
      await tx.insert(taskCompletion).values({
        taskId: created.id,
        completedById: values.createdById,
        completedAt: values.lastCompletedAt,
      })
    }
    return created
  })
}

export async function updateTask(
  workspaceId: string,
  taskId: string,
  values: Partial<TaskFields>,
): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set(values)
    .where(and(eq(task.id, taskId), eq(task.workspaceId, workspaceId)))
    .returning()
  return updated
}

// The state changes below each match only a task in the state the action
// starts from (active to complete or archive, archived to restore or delete),
// so a stale client cannot, say, delete an active task. A miss returns
// `undefined` whether the task is in another workspace, in the wrong state,
// or gone.

/**
 * Records a completion on an active task and advances its denormalised
 * `lastCompletedAt` in one transaction. A backdated completion is kept in the
 * history but never moves `lastCompletedAt` backwards.
 */
export async function completeTask(
  workspaceId: string,
  taskId: string,
  completedById: string,
  completedAt: Date = new Date(),
): Promise<Task | undefined> {
  return db.transaction(async (tx) => {
    const target = (
      await tx
        .select({ id: task.id })
        .from(task)
        .where(
          and(
            eq(task.id, taskId),
            eq(task.workspaceId, workspaceId),
            isNull(task.archivedAt),
          ),
        )
        // Holds the row so a concurrent archive or delete cannot slip in
        // between this check and the writes below.
        .for('update')
    ).at(0)
    if (!target) return undefined

    await tx
      .insert(taskCompletion)
      .values({ taskId, completedById, completedAt })
    const [updated] = await tx
      .update(task)
      .set({
        lastCompletedAt: sql`greatest(${task.lastCompletedAt}, ${completedAt})`,
      })
      .where(eq(task.id, taskId))
      .returning()
    return updated
  })
}

export async function archiveTask(
  workspaceId: string,
  taskId: string,
): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set({ archivedAt: new Date() })
    .where(
      and(
        eq(task.id, taskId),
        eq(task.workspaceId, workspaceId),
        isNull(task.archivedAt),
      ),
    )
    .returning()
  return updated
}

export async function restoreTask(
  workspaceId: string,
  taskId: string,
): Promise<Task | undefined> {
  const [updated] = await db
    .update(task)
    .set({ archivedAt: null })
    .where(
      and(
        eq(task.id, taskId),
        eq(task.workspaceId, workspaceId),
        isNotNull(task.archivedAt),
      ),
    )
    .returning()
  return updated
}

/**
 * Permanently deletes an archived task and, via cascade, its completions.
 * Returns the deleted row so callers can tell whether anything matched.
 */
export async function deleteTask(
  workspaceId: string,
  taskId: string,
): Promise<Task | undefined> {
  const [deleted] = await db
    .delete(task)
    .where(
      and(
        eq(task.id, taskId),
        eq(task.workspaceId, workspaceId),
        isNotNull(task.archivedAt),
      ),
    )
    .returning()
  return deleted
}
