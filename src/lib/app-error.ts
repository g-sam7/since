// Errors a server function reports to the client on purpose. The `code` lets
// the client choose its message; the adapter in `src/start.ts` carries it
// across serialisation. Anything else thrown on the server is replaced with
// an `internal` error by `errorMiddleware` so database details (queries,
// parameters, connection strings) never reach the browser.

export const APP_ERROR_CODES = [
  'unauthorized',
  'notFound',
  'invalidInput',
  'internal',
] as const
export type AppErrorCode = (typeof APP_ERROR_CODES)[number]

export const APP_ERROR_STATUS: Record<AppErrorCode, number> = {
  unauthorized: 401,
  notFound: 404,
  invalidInput: 400,
  internal: 500,
}

export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(code: AppErrorCode, message: string = code) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

/**
 * The code of an error thrown by a server function. Errors that never reached
 * the server (e.g. a network failure) are `internal`.
 */
export function getAppErrorCode(error: unknown): AppErrorCode {
  return error instanceof AppError ? error.code : 'internal'
}
