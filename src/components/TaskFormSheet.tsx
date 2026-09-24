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
}

// The single create/edit sheet for the dashboard. It is the default export so
// the route can `lazy()` load it, keeping the form out of the initial bundle.
export default function TaskFormSheet({
  open,
  onOpenChange,
  task,
}: TaskFormSheetProps) {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const mutation = task ? updateTask : createTask

  function handleOpenChange(nextOpen: boolean) {
    // Clear any failed save so the next opening starts without its error.
    if (!nextOpen) {
      createTask.reset()
      updateTask.reset()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: TaskFormValues) {
    if (task) {
      await updateTask.mutateAsync({ ...values, taskId: task.id })
    } else {
      await createTask.mutateAsync(values)
    }
    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
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
