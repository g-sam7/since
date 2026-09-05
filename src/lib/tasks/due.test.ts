import { describe, expect, it } from 'vitest'

import {
  addInterval,
  compareByNextDue,
  getDueStatus,
  getNextDueAt,
} from './due'

const at = (iso: string) => new Date(iso)

const baseTask = {
  intervalCount: 1,
  intervalUnit: 'month' as const,
  createdAt: at('2026-01-01T00:00:00Z'),
  lastCompletedAt: null,
}

describe('addInterval', () => {
  it('adds days and weeks as fixed durations', () => {
    expect(addInterval(at('2026-03-01T12:00:00Z'), 3, 'day')).toEqual(
      at('2026-03-04T12:00:00Z'),
    )
    expect(addInterval(at('2026-03-01T12:00:00Z'), 2, 'week')).toEqual(
      at('2026-03-15T12:00:00Z'),
    )
  })

  it('clamps month arithmetic to the end of the target month', () => {
    expect(addInterval(at('2026-01-31T09:30:00Z'), 1, 'month')).toEqual(
      at('2026-02-28T09:30:00Z'),
    )
    expect(addInterval(at('2028-01-31T09:30:00Z'), 1, 'month')).toEqual(
      at('2028-02-29T09:30:00Z'),
    )
  })

  it('rolls months across year boundaries', () => {
    expect(addInterval(at('2026-11-15T00:00:00Z'), 3, 'month')).toEqual(
      at('2027-02-15T00:00:00Z'),
    )
  })

  it('handles leap day when adding years', () => {
    expect(addInterval(at('2028-02-29T00:00:00Z'), 1, 'year')).toEqual(
      at('2029-02-28T00:00:00Z'),
    )
  })
})

describe('getNextDueAt', () => {
  it('measures from creation when never completed', () => {
    expect(getNextDueAt(baseTask)).toEqual(at('2026-02-01T00:00:00Z'))
  })

  it('measures from the last completion once completed', () => {
    expect(
      getNextDueAt({
        ...baseTask,
        lastCompletedAt: at('2026-03-10T00:00:00Z'),
      }),
    ).toEqual(at('2026-04-10T00:00:00Z'))
  })
})

describe('getDueStatus', () => {
  const task = {
    ...baseTask,
    intervalCount: 7,
    intervalUnit: 'day' as const,
    lastCompletedAt: at('2026-06-01T00:00:00Z'),
  }

  it('is overdue after the due date passes', () => {
    expect(getDueStatus(task, at('2026-06-08T00:00:01Z'))).toBe('overdue')
  })

  it('is due soon inside the window', () => {
    expect(getDueStatus(task, at('2026-06-06T00:00:00Z'))).toBe('dueSoon')
    expect(getDueStatus(task, at('2026-06-08T00:00:00Z'))).toBe('dueSoon')
  })

  it('is upcoming outside the window', () => {
    expect(getDueStatus(task, at('2026-06-02T00:00:00Z'))).toBe('upcoming')
  })

  it('respects a custom window', () => {
    expect(getDueStatus(task, at('2026-06-06T00:00:00Z'), 0)).toBe('upcoming')
  })
})

describe('compareByNextDue', () => {
  it('sorts the soonest due task first', () => {
    const soon = { ...baseTask, intervalCount: 1, intervalUnit: 'day' as const }
    const later = {
      ...baseTask,
      intervalCount: 1,
      intervalUnit: 'year' as const,
    }
    expect([later, soon].sort(compareByNextDue)).toEqual([soon, later])
  })
})
