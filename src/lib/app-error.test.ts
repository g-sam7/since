import { describe, expect, it } from 'vitest'

import { AppError, getAppErrorCode } from './app-error'

describe('getAppErrorCode', () => {
  it('reads the code from an AppError', () => {
    expect(getAppErrorCode(new AppError('notFound'))).toBe('notFound')
  })

  it('treats other errors as internal', () => {
    const systemError = Object.assign(new Error('connect'), {
      code: 'ECONNREFUSED',
    })
    expect(getAppErrorCode(systemError)).toBe('internal')
    expect(getAppErrorCode(new TypeError('Failed to fetch'))).toBe('internal')
    expect(getAppErrorCode('oops')).toBe('internal')
  })
})
