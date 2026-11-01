import { useHydrated } from '@tanstack/react-router'
import { ArchiveIcon, CheckIcon, PencilIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Badge } from '#/components/utils/Badge'
import { Button } from '#/components/utils/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/utils/Card'
import type { DashboardTask } from '#/lib/tasks/dashboard'
import type { DueStatus } from '#/lib/tasks/due'
import { formatDueIn } from '#/lib/tasks/due'
import { formatElapsedLine } from '#/lib/tasks/elapsed'
import { formatTaskDate } from '#/lib/tasks/format-date'

const DUE_STATUS_LABEL: Record<DueStatus, string> = {
  overdue: 'Overdue',
  dueSoon: 'Due soon',
  upcoming: 'Upcoming',
}

const DUE_STATUS_VARIANT: Record<DueStatus, 'danger' | 'warning' | 'ok'> = {
  overdue: 'danger',
  dueSoon: 'warning',
  upcoming: 'ok',
}

export type TaskCardProps = {
  task: DashboardTask
  /** Reference time for elapsed and due copy; defaults to now. */
  now?: Date
  onEdit: () => void
  onComplete: () => void
  onArchive: () => void
  /** Disables Done and Archive, e.g. while a task action is in flight. */
  actionsDisabled?: boolean
  /**
   * Marks the card as just saved or completed: it is outlined briefly,
   * scrolled into view, and the button named by `highlightFocus` takes focus
   * so keyboard and screen reader users land on it.
   */
  highlighted?: boolean
  highlightFocus?: TaskCardFocus
}

/** The button a highlighted card focuses: the one the user last acted with. */
export type TaskCardFocus = 'edit' | 'done'

// Purely presentational so stories can render it with fixture data.
export function TaskCard({
  task,
  now = new Date(),
  onEdit,
  onComplete,
  onArchive,
  actionsDisabled = false,
  highlighted = false,
  highlightFocus = 'edit',
}: TaskCardProps) {
  // The actions need JavaScript, so the buttons stay disabled until hydration.
  const hydrated = useHydrated()
  // Refs rather than state: these only reach the DOM to scroll and focus.
  const cardRef = useRef<HTMLDivElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const doneButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // A disabled button cannot take focus, so wait until the action that
    // highlighted the card has finished re-enabling its buttons.
    if (!highlighted || actionsDisabled) return
    const focusTarget =
      highlightFocus === 'done' ? doneButtonRef : editButtonRef
    // Focus without the browser's instant jump so the scroll below can be
    // smooth; `nearest` leaves an already visible card where it is.
    focusTarget.current?.focus({ preventScroll: true })
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    cardRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [highlighted, highlightFocus, actionsDisabled])

  return (
    <Card
      ref={cardRef}
      data-testid="task-card"
      data-highlighted={highlighted || undefined}
      // The scroll margin keeps a scrolled-to card clear of the list's edge
      // fades. The outline sits inside the card's edge because the list
      // clips anything outside it. With reduced motion it stays, unfaded.
      className="scroll-my-12 gap-4 py-5 data-highlighted:outline-2 data-highlighted:-outline-offset-2 data-highlighted:outline-primary data-highlighted:animate-highlight-fade motion-reduce:data-highlighted:animate-none"
    >
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg leading-snug">{task.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={DUE_STATUS_VARIANT[task.dueStatus]}
              data-status={task.dueStatus}
            >
              {DUE_STATUS_LABEL[task.dueStatus]}
            </Badge>
            <Button
              ref={editButtonRef}
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${task.name}`}
              disabled={!hydrated}
              onClick={onEdit}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Archive ${task.name}`}
              disabled={!hydrated || actionsDisabled}
              onClick={onArchive}
            >
              <ArchiveIcon />
            </Button>
          </div>
        </div>
        <CardDescription className="text-base text-foreground">
          {formatElapsedLine(task, now)}
        </CardDescription>
      </CardHeader>
      {(task.description || task.notes) && (
        <CardContent className="flex flex-col gap-3 text-sm">
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}
          {task.notes && (
            <p className="whitespace-pre-line rounded-md bg-surface-subtle px-3 py-2 text-muted-foreground">
              {task.notes}
            </p>
          )}
        </CardContent>
      )}
      <CardFooter className="flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p>
            Due {formatDueIn(task, now)} · {formatTaskDate(task.nextDueAt)}
          </p>
          <p>
            Created {formatTaskDate(task.createdAt)} by{' '}
            {task.createdByName ?? 'Unknown'}
          </p>
        </div>
        <Button
          ref={doneButtonRef}
          variant="outline"
          size="sm"
          // The visible "Done" alone would not say which task it is for.
          aria-label={`Mark ${task.name} done`}
          disabled={!hydrated || actionsDisabled}
          onClick={onComplete}
        >
          <CheckIcon />
          Done
        </Button>
      </CardFooter>
    </Card>
  )
}
