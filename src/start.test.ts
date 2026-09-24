import { describe, expect, it } from 'vitest'

import { startInstance } from './start'

// Guards the CSRF protection Start drops once `src/start.ts` exists: these
// fail if the start instance stops listing the CSRF middleware.

const SERVER_FN_URL = 'http://localhost:3000/_serverFn/fn-id'

type RequestHandler = (ctx: {
  request: Request
  handlerType: 'serverFn' | 'router'
  next: () => Promise<unknown>
}) => Promise<unknown>

/**
 * Runs the start instance's request middleware in order, as Start does.
 * Resolves to `'passed'` when every middleware calls `next`, or to whatever
 * a middleware returned instead (e.g. a rejection `Response`).
 */
async function runRequestMiddleware(
  request: Request,
  handlerType: 'serverFn' | 'router' = 'serverFn',
): Promise<unknown> {
  const { requestMiddleware = [] } = await startInstance.getOptions()
  const handlers = requestMiddleware.map(
    (middleware) => (middleware.options as { server?: RequestHandler }).server,
  )
  const run = (index: number): Promise<unknown> => {
    if (index === handlers.length) return Promise.resolve('passed')
    const handler = handlers[index]
    if (!handler) return run(index + 1)
    return handler({ request, handlerType, next: () => run(index + 1) })
  }
  return run(0)
}

const post = (headers: Record<string, string>) =>
  new Request(SERVER_FN_URL, { method: 'POST', headers })

describe('start instance request middleware', () => {
  it('rejects a cross-site server-function request', async () => {
    const result = await runRequestMiddleware(
      post({ 'Sec-Fetch-Site': 'cross-site' }),
    )
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(403)
  })

  it('rejects a server-function request from another origin', async () => {
    // Browsers without `Sec-Fetch-Site` fall back to the Origin check.
    const result = await runRequestMiddleware(
      post({ Origin: 'https://attacker.example' }),
    )
    expect((result as Response).status).toBe(403)
  })

  it('allows a same-origin server-function request', async () => {
    expect(
      await runRequestMiddleware(post({ 'Sec-Fetch-Site': 'same-origin' })),
    ).toBe('passed')
    expect(
      await runRequestMiddleware(post({ Origin: 'http://localhost:3000' })),
    ).toBe('passed')
  })

  it('leaves page requests alone', async () => {
    // A link from another site to a page must still load.
    const request = new Request('http://localhost:3000/app', {
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    })
    expect(await runRequestMiddleware(request, 'router')).toBe('passed')
  })
})
