import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { auth } from './auth'

// TODO: Refactor to a plain async helper that accepts Request directly,
// removing the implicit getRequest() dependency. Update route guards to
// pass the request from beforeLoad({ request }).

export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    return session
  },
)
