import { useEffect, useRef, useState } from 'react'

import { TaskForm } from '#/components/TaskForm'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/utils/Sheet'
import type { Task } from '#/db/task-schema'
import { useCreateTask } from '#/hooks/useCreateTask'
import { useUpdateTask } from '#/hooks/useUpdateTask'
import type { TaskFormValues } from '#/lib/tasks/task-input'

export type TaskFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The task to edit, read from the dashboard query; omitted to create. */
  task?: Task
  /** Called with the saved task's id once the sheet has finished closing. */
  onSaved: (taskId: string) => void
}

// The single create/edit sheet for the dashboard. It is the default export so
// the route can `lazy()` load it, keeping the form out of the initial bundle.
export default function TaskFormSheet({
  open,
  onOpenChange,
  task,
  onSaved,
}: TaskFormSheetProps) {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const mutation = task ? updateTask : createTask
  // Held until the sheet has closed: the saved card can only take focus once
  // the sheet's focus trap has been released.
  const [savedTaskId, setSavedTaskId] = useState<string | null>(null)
  // The sheet is opened by several buttons rather than a Radix trigger, so
  // Radix has nothing to return focus to on close. A ref, not state: it only
  // holds the DOM element to refocus and never affects rendering.
  const openerRef = useRef<HTMLElement | null>(null)

  // Clear any failed save so the next opening starts without its error. Keyed
  // on `open` rather than done in `onOpenChange` because the route can also
  // close the sheet by changing the prop (when the edited task disappears),
  // and Radix does not call `onOpenChange` for that.
  const resetCreate = createTask.reset
  const resetUpdate = updateTask.reset
  useEffect(() => {
    if (!open) {
      resetCreate()
      resetUpdate()
    }
  }, [open, resetCreate, resetUpdate])

  async function handleSubmit(values: TaskFormValues) {
    if (task) {
      await updateTask.mutateAsync({ ...values, taskId: task.id })
      setSavedTaskId(task.id)
    } else {
      setSavedTaskId(await createTask.mutateAsync(values))
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-md"
        onOpenAutoFocus={() => {
          // Focus has not moved into the sheet yet, so this is the opener.
          openerRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (savedTaskId !== null) {
            // The saved card takes focus instead of the opener.
            onSaved(savedTaskId)
            setSavedTaskId(null)
          } else {
            openerRef.current?.focus()
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>{task ? 'Edit task' : 'New task'}</SheetTitle>
          <SheetDescription>
            {task
              ? 'Update the details of this recurring task.'
              : 'Add something you do on a regular schedule.'}
          </SheetDescription>
        </SheetHeader>
        {/* Content unmounts on close, so each opening starts from the task's
            persisted values rather than any abandoned edits. */}
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          error={mutation.error}
          onDismissError={() => mutation.reset()}
        />
      </SheetContent>
    </Sheet>
  )
}
