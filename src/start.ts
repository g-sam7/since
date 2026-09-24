import { createSerializationAdapter } from '@tanstack/react-router'
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'

import { AppError } from '#/lib/app-error'

// Start serialises a thrown error as its message only. This adapter keeps an
// `AppError`'s code, so server-function callers receive a real `AppError`.
const appErrorAdapter = createSerializationAdapter({
  key: 'app-error',
  test: (value) => value instanceof AppError,
  toSerializable: (error) => ({ code: error.code, message: error.message }),
  fromSerializable: ({ code, message }) => new AppError(code, message),
})

// Start applies this by default only when there is no start file; defining
// `startInstance` replaces the default, so it has to be listed here.
// `start.test.ts` fails if it goes missing.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  serializationAdapters: [appErrorAdapter],
}))
