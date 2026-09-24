import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { intervalUnit } from '#/db/task-schema'
import { INTERVAL_UNITS, taskFormSchema, updateTaskSchema } from './task-input'
import type { TaskFormValues } from './task-input'

const validValues: TaskFormValues = {
  name: 'Change the air filter',
  description: '',
  notes: '',
  intervalCount: '3',
  intervalUnit: 'month',
  lastCompletedOn: '',
}

const messagesFor = (values: Partial<TaskFormValues>) => {
  const result = taskFormSchema.safeParse({ ...validValues, ...values })
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('INTERVAL_UNITS', () => {
  it('matches the interval_unit Postgres enum', () => {
    expect(INTERVAL_UNITS).toEqual(intervalUnit.enumValues)
  })
})

describe('taskFormSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-23T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('outputs trimmed repository values', () => {
    expect(
      taskFormSchema.parse({
        ...validValues,
        name: '  Change the air filter  ',
        description: '  Hallway return  ',
        notes: ' ',
        intervalCount: ' 12 ',
      }),
    ).toEqual({
      name: 'Change the air filter',
      description: 'Hallway return',
      notes: null,
      intervalCount: 12,
      intervalUnit: 'month',
      lastCompletedOn: null,
    })
  })

  it('requires a name that is not only whitespace', () => {
    expect(messagesFor({ name: '' })).toEqual(['Enter a name'])
    expect(messagesFor({ name: '   ' })).toEqual(['Enter a name'])
  })

  it.each(['', '0', '-1', '1.5', '1e2', 'abc', '1000'])(
    'rejects an interval count of %j',
    (intervalCount) => {
      expect(messagesFor({ intervalCount })).toEqual([
        'Enter a whole number from 1 to 999',
      ])
    },
  )

  it.each(['1', '999'])('accepts an interval count of %s', (intervalCount) => {
    expect(messagesFor({ intervalCount })).toEqual([])
  })

  it('rejects an unknown interval unit', () => {
    expect(
      taskFormSchema.safeParse({ ...validValues, intervalUnit: 'hour' })
        .success,
    ).toBe(false)
  })

  it('stores the last-done day as midnight UTC', () => {
    const { lastCompletedOn } = taskFormSchema.parse({
      ...validValues,
      lastCompletedOn: '2026-09-01',
    })
    expect(lastCompletedOn?.toISOString()).toBe('2026-09-01T00:00:00.000Z')
  })

  it('rejects a malformed last-done day', () => {
    expect(
      taskFormSchema.safeParse({
        ...validValues,
        lastCompletedOn: '09/01/2026',
      }).success,
    ).toBe(false)
  })

  it('accepts a day that has begun in some zone and rejects later days', () => {
    // At 12:00 UTC on Sep 23 it is already Sep 24 in UTC+14.
    expect(messagesFor({ lastCompletedOn: '2026-09-24' })).toEqual([])
    expect(messagesFor({ lastCompletedOn: '2026-09-25' })).toEqual([
      "Can't be in the future",
    ])
  })

  it('strips fields the server derives from the session', () => {
    const parsed = taskFormSchema.parse({
      ...validValues,
      workspaceId: 'another-workspace',
      createdById: 'another-user',
    })
    expect(parsed).not.toHaveProperty('workspaceId')
    expect(parsed).not.toHaveProperty('createdById')
  })
})

describe('updateTaskSchema', () => {
  const taskId = '00000000-0000-4000-8000-000000000001'

  it('keeps only the editable fields and the task id', () => {
    const parsed = updateTaskSchema.parse({
      ...validValues,
      taskId,
      lastCompletedOn: '2026-09-01',
      createdById: 'another-user',
      archivedAt: new Date(),
    })
    expect(parsed).toEqual({
      taskId,
      name: 'Change the air filter',
      description: null,
      notes: null,
      intervalCount: 3,
      intervalUnit: 'month',
    })
  })

  it('requires a UUID task id', () => {
    expect(
      updateTaskSchema.safeParse({ ...validValues, taskId: 'not-a-uuid' })
        .success,
    ).toBe(false)
  })
})
