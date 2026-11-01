import { describe, expect, it } from 'vitest'

import { AppError } from '#/lib/app-error'
import { getTaskActionErrorMessage } from './action-error'

describe('getTaskActionErrorMessage', () => {
  it('names the action for an internal error', () => {
    expect(
      getTaskActionErrorMessage({
        action: 'archive',
        error: new AppError('internal'),
      }),
    ).toBe("Couldn't archive the task. Please try again.")
  })

  it('treats an error that never reached the server as internal', () => {
    expect(
      getTaskActionErrorMessage({
        action: 'complete',
        error: new TypeError('Failed to fetch'),
      }),
    ).toBe("Couldn't mark the task done. Please try again.")
  })

  it('explains a task that changed elsewhere', () => {
    expect(
      getTaskActionErrorMessage({
        action: 'delete',
        error: new AppError('notFound'),
      }),
    ).toBe(
      'This task was changed or removed elsewhere. The list now shows its latest state.',
    )
  })

  it('asks the user to sign in again when the session has expired', () => {
    expect(
      getTaskActionErrorMessage({
        action: 'restore',
        error: new AppError('unauthorized'),
      }),
    ).toBe('Your session has expired. Sign in again to continue.')
  })
})
