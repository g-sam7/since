import { createSerializationAdapter } from '@tanstack/react-router'
import { createStart } from '@tanstack/react-start'

import { AppError } from '#/lib/app-error'

// Start serialises a thrown error as its message only. This adapter keeps an
// `AppError`'s code, so server-function callers receive a real `AppError`.
const appErrorAdapter = createSerializationAdapter({
  key: 'app-error',
  test: (value) => value instanceof AppError,
  toSerializable: (error) => ({ code: error.code, message: error.message }),
  fromSerializable: ({ code, message }) => new AppError(code, message),
})

export const startInstance = createStart(() => ({
  serializationAdapters: [appErrorAdapter],
}))
