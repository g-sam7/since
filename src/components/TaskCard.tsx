import { UTCDate } from '@date-fns/utc'
import { format } from 'date-fns'

import { Badge } from '#/components/utils/Badge'
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

// Dates are formatted in UTC so the server render and the client hydration
// agree regardless of the browser's zone; the due helpers already work in UTC.
function formatDate(date: Date): string {
  return format(new UTCDate(date), 'MMM d, yyyy')
}

export type TaskCardProps = {
  task: DashboardTask
  /** Reference time for elapsed and due copy; defaults to now. */
  now?: Date
}

// Purely presentational so stories can render it with fixture data.
export function TaskCard({ task, now = new Date() }: TaskCardProps) {
  return (
    <Card data-testid="task-card" className="gap-4 py-5">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg leading-snug">{task.name}</CardTitle>
          <Badge
            variant={DUE_STATUS_VARIANT[task.dueStatus]}
            data-status={task.dueStatus}
          >
            {DUE_STATUS_LABEL[task.dueStatus]}
          </Badge>
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
      <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Due {formatDueIn(task, now)} · {formatDate(task.nextDueAt)}
        </p>
        <p>
          Created {formatDate(task.createdAt)} by{' '}
          {task.createdByName ?? 'Unknown'}
        </p>
      </CardFooter>
    </Card>
  )
}
