import { Link, useHydrated } from '@tanstack/react-router'
import { ArchiveRestoreIcon, ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { useRef, useState } from 'react'

import { ErrorAlert } from '#/components/ErrorAlert'
import { FadingScrollList } from '#/components/FadingScrollList'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/utils/AlertDialog'
import { Button } from '#/components/utils/Button'
import { Card, CardContent } from '#/components/utils/Card'
import type { ArchivedTask, Task } from '#/db/task-schema'
import { getTaskActionErrorMessage } from '#/lib/tasks/action-error'
import type { TaskActionError } from '#/lib/tasks/action-error'
import { formatTaskDate } from '#/lib/tasks/format-date'

export type ArchivedTaskListProps = {
  /** Already sorted newest archive first by the server. */
  tasks: ArchivedTask[]
  onRestore: (task: ArchivedTask) => void
  /**
   * Deletes the task once the user confirms. Rejects on failure, which keeps
   * the confirmation open and is shown through `actionError`.
   */
  onDelete: (task: ArchivedTask) => Promise<void>
  /** Disables every action while a restore or delete is in flight. */
  actionsDisabled?: boolean
  /** The failed Restore or Delete, from the route's mutations. */
  actionError?: TaskActionError | null
  onDismissError: () => void
}

function formatInterval({ intervalCount, intervalUnit }: Task): string {
  return intervalCount === 1
    ? `Every ${intervalUnit}`
    : `Every ${intervalCount} ${intervalUnit}s`
}

// Presentational apart from the confirmation's open state, so stories can
// drive restore and both outcomes of the delete confirmation.
export function ArchivedTaskList({
  tasks,
  onRestore,
  onDelete,
  actionsDisabled = false,
  actionError = null,
  onDismissError,
}: ArchivedTaskListProps) {
  // The actions need JavaScript, so the buttons stay disabled until hydration.
  const hydrated = useHydrated()
  // One confirmation serves every row. The task is kept after closing so the
  // title does not empty mid-animation.
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingTask, setDeletingTask] = useState<ArchivedTask | null>(null)
  // The dialog is opened by several buttons rather than a Radix trigger, so
  // Radix has nothing to return focus to on close. A ref, not state: it only
  // holds the DOM element to refocus and never affects rendering.
  const openerRef = useRef<HTMLElement | null>(null)

  const deleteError = actionError?.action === 'delete' ? actionError : null
  const listError = deleteError ? null : actionError

  function openConfirm(task: ArchivedTask, opener: HTMLElement) {
    openerRef.current = opener
    setDeletingTask(task)
    setConfirmOpen(true)
  }

  function handleConfirmOpenChange(open: boolean) {
    setConfirmOpen(open)
    // Each opening starts without the previous attempt's error.
    if (!open && deleteError) onDismissError()
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return
    try {
      await onDelete(deletingTask)
      setConfirmOpen(false)
    } catch {
      // Shown in the dialog through `actionError`.
    }
  }

  return (
    // Padding sits outside `page-wrap`, as on the dashboard, so the list
    // edges line up with the header.
    <main className="px-4 py-10">
      <div className="page-wrap flex flex-col">
        {/* Laid out like the dashboard heading: an icon button with a
            browser tooltip naming it. */}
        <div className="mb-6 flex w-full items-center justify-between gap-3">
          <h1 className="display-title text-3xl font-semibold text-foreground sm:text-4xl">
            Archived tasks
          </h1>
          <Button variant="outline" size="icon" asChild>
            <Link to="/app" aria-label="Back to tasks" title="Back to tasks">
              <ArrowLeftIcon />
            </Link>
          </Button>
        </div>

        {listError && (
          <div className="mb-4 w-full">
            <ErrorAlert onDismiss={onDismissError}>
              {getTaskActionErrorMessage(listError)}
            </ErrorAlert>
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-center text-base text-muted-foreground">
            Nothing is archived. Tasks you archive from the dashboard appear
            here.
          </p>
        ) : (
          // Scrolls and fades like the dashboard's list.
          <FadingScrollList aria-label="Archived tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <Card data-testid="archived-task" className="py-5">
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">{task.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Archived {formatTaskDate(task.archivedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatInterval(task)} · Last done{' '}
                        {task.lastCompletedAt
                          ? formatTaskDate(task.lastCompletedAt)
                          : 'never'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Restore ${task.name}`}
                        disabled={!hydrated || actionsDisabled}
                        onClick={() => onRestore(task)}
                      >
                        <ArchiveRestoreIcon />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        // Starts with the visible text so speech input
                        // ("click Delete permanently") still matches it.
                        aria-label={`Delete permanently: ${task.name}`}
                        disabled={!hydrated || actionsDisabled}
                        onClick={(event) =>
                          openConfirm(task, event.currentTarget)
                        }
                      >
                        <Trash2Icon />
                        Delete permanently
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </FadingScrollList>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <AlertDialogContent
          // Cancel is disabled while the delete runs, but Escape would still
          // close the dialog, and a failure arriving after that would have
          // nowhere to show. Outside clicks never close an alert dialog.
          onEscapeKeyDown={(event) => {
            if (actionsDisabled) event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            // After a delete the opener has left the page with its row.
            if (openerRef.current?.isConnected) openerRef.current.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{deletingTask?.name}&rdquo; permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the task and its completion history. It can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <ErrorAlert onDismiss={onDismissError}>
              {getTaskActionErrorMessage(deleteError)}
            </ErrorAlert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionsDisabled}>
              Cancel
            </AlertDialogCancel>
            {/* A plain button rather than `AlertDialogAction`, which closes
                on click: the dialog stays open until the delete succeeds so a
                failure can be shown in it. */}
            <Button
              variant="destructive"
              disabled={actionsDisabled}
              onClick={() => void handleConfirmDelete()}
            >
              Delete permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
