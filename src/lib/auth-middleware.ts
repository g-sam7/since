import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from './auth'

// Server-function middleware that rejects unauthenticated calls and exposes
// the session in `context`. Route guards (`beforeLoad`) only keep users off
// protected screens; every server function that returns private data must
// authorise the request itself, and this is the shared way to do that.
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })
    if (!session) {
      // TODO(sc-41): a plain error surfaces as a 500. Once mutations call
      // this without a route guard in front, throw a 401 response instead.
      throw new Error('Unauthorized')
    }
    return next({ context: { session } })
  },
)
