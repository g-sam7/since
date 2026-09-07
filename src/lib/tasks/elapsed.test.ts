import { describe, expect, it } from 'vitest'

import { formatElapsedLine } from './elapsed'

const at = (iso: string) => new Date(iso)

const baseTask = {
  intervalCount: 1,
  intervalUnit: 'month' as const,
  createdAt: at('2026-01-01T00:00:00Z'),
  lastCompletedAt: null,
}

describe('formatElapsedLine', () => {
  it('measures a never-completed task from its creation', () => {
    expect(formatElapsedLine(baseTask, at('2026-01-15T00:00:00Z'))).toBe(
      'Created 14 days ago, never completed.',
    )
  })

  it('uses the home page phrasing once completed', () => {
    expect(
      formatElapsedLine(
        { ...baseTask, lastCompletedAt: at('2026-03-01T00:00:00Z') },
        at('2026-06-01T00:00:00Z'),
      ),
    ).toBe("It's been 3 months since you last did this.")
  })

  it('measures from the last completion, not creation', () => {
    expect(
      formatElapsedLine(
        { ...baseTask, lastCompletedAt: at('2026-05-30T00:00:00Z') },
        at('2026-06-01T00:00:00Z'),
      ),
    ).toBe("It's been 2 days since you last did this.")
  })
})
