import { UTCDate } from '@date-fns/utc'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { XIcon } from 'lucide-react'

import { Button } from '#/components/utils/Button'
import { Input } from '#/components/utils/Input'
import { Label } from '#/components/utils/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/utils/Select'
import { TextArea } from '#/components/utils/TextArea'
import type { IntervalUnit, Task } from '#/db/task-schema'
import type { AppErrorCode } from '#/lib/app-error'
import { getAppErrorCode } from '#/lib/app-error'
import {
  INTERVAL_UNITS,
  MAX_INTERVAL_COUNT,
  taskFormSchema,
} from '#/lib/tasks/task-input'
import type { TaskFormValues } from '#/lib/tasks/task-input'

const UNIT_LABEL: Record<IntervalUnit, string> = {
  day: 'Days',
  week: 'Weeks',
  month: 'Months',
  year: 'Years',
}

const SAVE_ERROR_MESSAGE: Record<AppErrorCode, string> = {
  unauthorized: 'Your session has expired. Sign in again to save this task.',
  notFound: 'This task no longer exists. It may have been deleted.',
  invalidInput: "Some details weren't accepted. Check the form and try again.",
  internal: "Couldn't save the task. Please try again.",
}

type EditableTask = Pick<
  Task,
  | 'name'
  | 'description'
  | 'notes'
  | 'intervalCount'
  | 'intervalUnit'
  | 'lastCompletedAt'
>

export type TaskFormProps = {
  /** The task being edited; omitted when creating. */
  task?: EditableTask
  /** Saves the values; rejects on failure, which is shown through `error`. */
  onSubmit: (values: TaskFormValues) => Promise<void>
  /** The save error, from the mutation behind `onSubmit`. */
  error: Error | null
  onDismissError: () => void
}

// Purely presentational so stories can drive it without a server: the caller
// owns the mutation and passes its error back in.
export function TaskForm({
  task,
  onSubmit,
  error,
  onDismissError,
}: TaskFormProps) {
  const defaultValues: TaskFormValues = {
    name: task?.name ?? '',
    description: task?.description ?? '',
    notes: task?.notes ?? '',
    intervalCount: task ? String(task.intervalCount) : '1',
    intervalUnit: task?.intervalUnit ?? 'week',
    // Only set when creating; editing never changes the last completion.
    lastCompletedOn: '',
  }
  const form = useForm({
    defaultValues,
    // Validate on submit, then on every change once a submit has failed.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: taskFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value)
      } catch {
        // Already surfaced through the `error` prop.
      }
    },
  })
  // The schema can only bound the date loosely because the server does not
  // know the user's zone; this is the exact check against their local today.
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <form
      noValidate
      className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p>{SAVE_ERROR_MESSAGE[getAppErrorCode(error)]}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss error"
            onClick={onDismissError}
          >
            <XIcon />
          </Button>
        </div>
      )}

      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Name</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-required
              aria-invalid={field.state.meta.errors.length > 0}
              aria-describedby={`${field.name}-error`}
            />
            <FieldError
              id={`${field.name}-error`}
              errors={field.state.meta.errors}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Description</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Notes</Label>
            <TextArea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>

      <div className="flex flex-col gap-2">
        <Label htmlFor="intervalCount">Repeat every</Label>
        <div className="flex gap-2">
          <form.Field name="intervalCount">
            {(field) => (
              <Input
                id={field.name}
                name={field.name}
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_INTERVAL_COUNT}
                step={1}
                className="w-24"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-required
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={`${field.name}-error`}
              />
            )}
          </form.Field>
          <form.Field name="intervalUnit">
            {(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as IntervalUnit)
                }
              >
                <SelectTrigger aria-label="Unit" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {UNIT_LABEL[unit]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </div>
        <form.Subscribe
          selector={(state) => state.fieldMeta.intervalCount?.errors ?? []}
        >
          {(errors) => <FieldError id="intervalCount-error" errors={errors} />}
        </form.Subscribe>
      </div>

      {task ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-none font-medium">Last done on</p>
          <p className="text-sm text-muted-foreground">
            {/* UTC, matching how the card and the date input store dates. */}
            {task.lastCompletedAt
              ? format(new UTCDate(task.lastCompletedAt), 'MMM d, yyyy')
              : 'Never'}
          </p>
        </div>
      ) : (
        <form.Field
          name="lastCompletedOn"
          validators={{
            onDynamic: ({ value }) =>
              value > today ? "Can't be in the future" : undefined,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Last done on</Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                max={today}
                className="w-fit"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={`${field.name}-error`}
              />
              <FieldError
                id={`${field.name}-error`}
                errors={field.state.meta.errors}
              />
            </div>
          )}
        </form.Field>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-auto"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Create task'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

type FieldErrorProps = {
  id: string
  /** Schema issues and validator messages, as TanStack Form collects them. */
  errors: ReadonlyArray<{ message: string } | string | undefined>
}

function FieldError({ id, errors }: FieldErrorProps) {
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
