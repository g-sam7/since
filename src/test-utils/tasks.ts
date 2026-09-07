import type { DashboardTask, TaskWithCreator } from '#/lib/tasks/dashboard'
import { toDashboardTask } from '#/lib/tasks/dashboard'

/** Fixed "now" so story assertions on elapsed and due copy are stable. */
export const FIXTURE_NOW = new Date('2026-09-06T12:00:00Z')

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001'
const CREATOR_ID = 'user_fixture'

let nextId = 0

function makeTask(overrides: Partial<TaskWithCreator> = {}): TaskWithCreator {
  nextId += 1
  const createdAt = new Date('2026-06-01T09:00:00Z')
  return {
    id: `00000000-0000-4000-8000-${String(nextId).padStart(12, '0')}`,
    workspaceId: WORKSPACE_ID,
    createdById: CREATOR_ID,
    createdByName: 'Sam',
    name: 'Change the air filter',
    description: null,
    notes: null,
    intervalCount: 3,
    intervalUnit: 'month',
    lastCompletedAt: null,
    archivedAt: null,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  }
}

function fixture(overrides: Partial<TaskWithCreator> = {}): DashboardTask {
  return toDashboardTask(makeTask(overrides), FIXTURE_NOW)
}

/** Completed 4 months ago on a 3-month interval: a month overdue. */
export const overdueTask = fixture({
  name: 'Change the air filter',
  description: 'The HVAC filter in the hallway return.',
  notes: '20x25x1, MERV 11.\nSpares are in the garage cabinet.',
  lastCompletedAt: new Date('2026-05-06T12:00:00Z'),
})

/** Completed 6 days ago on a weekly interval: due tomorrow. */
export const dueSoonTask = fixture({
  name: 'Water the plants',
  description: 'Everything on the balcony plus the fiddle-leaf fig.',
  intervalCount: 1,
  intervalUnit: 'week',
  lastCompletedAt: new Date('2026-08-31T12:00:00Z'),
})

/** Completed 2 months ago on a yearly interval: due in 10 months. */
export const upcomingTask = fixture({
  name: 'See the dentist',
  intervalCount: 1,
  intervalUnit: 'year',
  lastCompletedAt: new Date('2026-07-06T12:00:00Z'),
})

/** Never completed; created 29 days ago on a monthly interval: due in 2 days. */
export const neverCompletedTask = fixture({
  name: 'Clean the oven',
  description: 'Run the self-clean cycle and wipe down the door.',
  intervalCount: 1,
  intervalUnit: 'month',
  createdAt: new Date('2026-08-08T12:00:00Z'),
  updatedAt: new Date('2026-08-08T12:00:00Z'),
})

/** The creator's account was deleted, so the foreign key is null. */
export const deletedCreatorTask = fixture({
  name: 'Rotate the tyres',
  createdById: null,
  createdByName: null,
  intervalCount: 6,
  intervalUnit: 'month',
  lastCompletedAt: new Date('2026-08-01T12:00:00Z'),
})

/** A populated dashboard in the order the server returns: soonest due first. */
export const dashboardTasks: DashboardTask[] = [
  overdueTask,
  dueSoonTask,
  neverCompletedTask,
  deletedCreatorTask,
  upcomingTask,
]
