import { getAppErrorCode } from '#/lib/app-error'

/** The one-click state changes on the dashboard and archived view. */
export type TaskAction = 'complete' | 'archive' | 'restore' | 'delete'

/** A failed task action, with the action so its message can name it. */
export type TaskActionError = { action: TaskAction; error: Error }

const FAILED_MESSAGE: Record<TaskAction, string> = {
  complete: "Couldn't mark the task done. Please try again.",
  archive: "Couldn't archive the task. Please try again.",
  restore: "Couldn't restore the task. Please try again.",
  delete: "Couldn't delete the task. Please try again.",
}

export function getTaskActionErrorMessage({
  action,
  error,
}: TaskActionError): string {
  switch (getAppErrorCode(error)) {
    case 'unauthorized':
      return 'Your session has expired. Sign in again to continue.'
    // The action hooks refetch after a failure, so by the time this shows
    // the list already reflects whatever changed.
    case 'notFound':
      return 'This task was changed or removed elsewhere. The list now shows its latest state.'
    default:
      return FAILED_MESSAGE[action]
  }
}
