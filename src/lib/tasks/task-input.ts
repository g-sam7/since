import { utc } from '@date-fns/utc'
import { isAfter, parseISO, subHours } from 'date-fns'
import { z } from 'zod'

import type { IntervalUnit } from '#/db/task-schema'

// Validation shared by the task form and the create/update server functions.
// The schemas take the form's raw string values as input and output what the
// repository stores, so the client and the server parse identically and the
// server stays the authority. This module is imported by client code, so it
// must not import database values (types only).

// Kept in sync with the `interval_unit` Postgres enum by `task-input.test.ts`.
export const INTERVAL_UNITS = [
  'day',
  'week',
  'month',
  'year',
] as const satisfies readonly IntervalUnit[]

export const MAX_INTERVAL_COUNT = 999

// The latest UTC offset in use (UTC+14). A calendar day has already begun
// somewhere once UTC midnight of that day is at most this many hours away,
// so the server, which cannot know the user's zone, only rejects days that
// have not started anywhere. The form applies the exact check in local time.
const LATEST_UTC_OFFSET_HOURS = 14

const INTERVAL_COUNT_MESSAGE = `Enter a whole number from 1 to ${MAX_INTERVAL_COUNT}`

/** An optional text field: trimmed, with blank stored as null. */
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)

export const taskFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name'),
  description: optionalText,
  notes: optionalText,
  intervalCount: z
    .string()
    .trim()
    .regex(/^\d+$/, INTERVAL_COUNT_MESSAGE)
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(1, INTERVAL_COUNT_MESSAGE)
        .max(MAX_INTERVAL_COUNT, INTERVAL_COUNT_MESSAGE),
    ),
  intervalUnit: z.enum(INTERVAL_UNITS),
})

/**
 * The day a task was last done, as `YYYY-MM-DD` from a date input, stored as
 * midnight UTC so the card (which formats in UTC) shows the day picked.
 */
const lastCompletedOn = z
  .union([z.literal(''), z.iso.date()])
  .transform((value) => (value ? parseISO(value, { in: utc }) : null))
  .refine(
    (date) =>
      date === null ||
      !isAfter(subHours(date, LATEST_UTC_OFFSET_HOURS), new Date()),
    "Can't be in the future",
  )

/** Everything the form collects; also the create server function's input. */
export const taskFormSchema = taskFieldsSchema.extend({ lastCompletedOn })

export const updateTaskSchema = taskFieldsSchema.extend({ taskId: z.uuid() })

export type TaskFormValues = z.input<typeof taskFormSchema>
export type UpdateTaskValues = z.input<typeof updateTaskSchema>
