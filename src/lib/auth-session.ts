import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from './auth'

// Stays a server function rather than a plain helper: route `beforeLoad`
// runs on the client after hydration, so the request is only reachable here.
// Server functions that need the session should use `authMiddleware` instead
// of calling this.
export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })
    return session
  },
)
