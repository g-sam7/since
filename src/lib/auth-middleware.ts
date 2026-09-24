import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { AppError } from './app-error'
import { auth } from './auth'
import { errorMiddleware } from './error-middleware'

// Server-function middleware that rejects unauthenticated calls and exposes
// the session in `context`. Route guards (`beforeLoad`) only keep users off
// protected screens; every server function that returns private data must
// authorise the request itself, and this is the shared way to do that.
// `errorMiddleware` runs first, so the rejection reaches the client as a 401.
export const authMiddleware = createMiddleware({ type: 'function' })
  .middleware([errorMiddleware])
  .server(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })
    if (!session) {
      throw new AppError('unauthorized')
    }
    return next({ context: { session } })
  })
