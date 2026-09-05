import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'

// Tasks belong to a workspace rather than directly to a user so that shared
// workspaces (multiple members viewing, creating, editing, and deleting the
// same task list) can be added later without migrating task ownership. Every
// user gets a personal workspace on sign-up; see `createPersonalWorkspace`.
//
// "Created by" and "completed by" are display information, so those foreign
// keys set null when the user is deleted rather than removing the rows. The
// workspace creator still cascades because every workspace is personal today;
// the shared-workspace story should replace that with ownership transfer.

export const workspaceMemberRole = pgEnum('workspace_member_role', [
  'owner',
  'member',
])

export const intervalUnit = pgEnum('interval_unit', [
  'day',
  'week',
  'month',
  'year',
])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}

export const workspace = pgTable(
  'workspace',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [index('workspace_createdById_idx').on(table.createdById)],
)

export const workspaceMember = pgTable(
  'workspace_member',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: workspaceMemberRole('role').default('member').notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    index('workspaceMember_userId_idx').on(table.userId),
  ],
)

export const task = pgTable(
  'task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    description: text('description'),
    notes: text('notes'),
    intervalCount: integer('interval_count').notNull(),
    intervalUnit: intervalUnit('interval_unit').notNull(),
    // Denormalised from `task_completion` so the dashboard can sort by due
    // date without a join. `completeTask` keeps the two in sync.
    lastCompletedAt: timestamp('last_completed_at', { withTimezone: true }),
    // Archived tasks are hidden from the dashboard but kept for restore.
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('task_workspaceId_idx').on(table.workspaceId),
    index('task_workspaceId_archivedAt_idx').on(
      table.workspaceId,
      table.archivedAt,
    ),
    check('task_intervalCount_positive', sql`${table.intervalCount} > 0`),
  ],
)

export const taskCompletion = pgTable(
  'task_completion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => task.id, { onDelete: 'cascade' }),
    completedById: text('completed_by_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    completedAt: timestamp('completed_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    index('taskCompletion_taskId_completedAt_idx').on(
      table.taskId,
      table.completedAt,
    ),
  ],
)

// Drizzle merges multiple `relations()` declarations for the same table, so
// the user side of these relations lives here instead of in the generated
// Better Auth schema file.
export const userTaskRelations = relations(user, ({ many }) => ({
  workspaceMemberships: many(workspaceMember),
  createdWorkspaces: many(workspace),
  createdTasks: many(task),
  taskCompletions: many(taskCompletion),
}))

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [workspace.createdById],
    references: [user.id],
  }),
  members: many(workspaceMember),
  tasks: many(task),
}))

export const workspaceMemberRelations = relations(
  workspaceMember,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMember.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMember.userId],
      references: [user.id],
    }),
  }),
)

export const taskRelations = relations(task, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [task.workspaceId],
    references: [workspace.id],
  }),
  createdBy: one(user, {
    fields: [task.createdById],
    references: [user.id],
  }),
  completions: many(taskCompletion),
}))

export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
  task: one(task, {
    fields: [taskCompletion.taskId],
    references: [task.id],
  }),
  completedBy: one(user, {
    fields: [taskCompletion.completedById],
    references: [user.id],
  }),
}))

export type Workspace = typeof workspace.$inferSelect
export type NewWorkspace = typeof workspace.$inferInsert
export type WorkspaceMember = typeof workspaceMember.$inferSelect
export type Task = typeof task.$inferSelect
export type NewTask = typeof task.$inferInsert
export type TaskCompletion = typeof taskCompletion.$inferSelect
export type IntervalUnit = (typeof intervalUnit.enumValues)[number]
export type WorkspaceMemberRole =
  (typeof workspaceMemberRole.enumValues)[number]
