import { isNotFound, isRedirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'

import { APP_ERROR_STATUS, AppError } from './app-error'

// Server-function middleware that sets the HTTP status for an `AppError` and
// replaces any other error with a generic `internal` one after logging it.
// Must run first so it sees errors from every later middleware and handler.
export const errorMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (error) {
      if (isRedirect(error) || isNotFound(error)) throw error
      const appError =
        error instanceof AppError ? error : new AppError('internal')
      if (appError.code === 'internal') console.error(error)
      setResponseStatus(APP_ERROR_STATUS[appError.code])
      throw appError
    }
  },
)
