export type FieldErrorProps = {
  id: string
  /** Schema issues and validator messages, as TanStack Form collects them. */
  errors: ReadonlyArray<{ message: string } | string | undefined>
}

/** A field's validation messages, linked to its input by `id`. */
export function FieldError({ id, errors }: FieldErrorProps) {
  // The form schema and a field validator can report the same message.
  const messages = [
    ...new Set(
      errors.flatMap((error) => {
        if (!error) return []
        return typeof error === 'string' ? error : error.message
      }),
    ),
  ]
  if (messages.length === 0) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {messages.join(' ')}
    </p>
  )
}
