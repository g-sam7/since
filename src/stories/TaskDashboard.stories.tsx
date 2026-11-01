import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { TaskDashboard } from '#/components/TaskDashboard'
import { AppError } from '#/lib/app-error'
import type { TaskActionError } from '#/lib/tasks/action-error'
import {
  FIXTURE_NOW,
  dashboardTasks,
  dueSoonTask,
  upcomingTask,
} from '#/test-utils/tasks'

const meta = {
  title: 'Tasks/TaskDashboard',
  component: TaskDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    now: FIXTURE_NOW,
    onCreate: fn(),
    onEdit: fn(),
    onComplete: fn(),
    onArchive: fn(),
    onDismissError: fn(),
  },
} satisfies Meta<typeof TaskDashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { tasks: [] },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Welcome back')).toBeVisible()
    await expect(
      canvas.getByText("You don't have any active tasks."),
    ).toBeVisible()
    // Reachable after archiving the last active task.
    await expect(
      canvas.getByRole('link', { name: 'View archived tasks' }),
    ).toHaveAttribute('href', '/archived')
    await userEvent.click(
      canvas.getByRole('button', { name: 'Create your first task' }),
    )
    await expect(args.onCreate).toHaveBeenCalledOnce()
    // The heading's "New task" action is only on the populated dashboard.
    await expect(
      canvas.queryByRole('button', { name: 'New task' }),
    ).not.toBeInTheDocument()
  },
}

export const Populated: Story = {
  args: { tasks: dashboardTasks },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Your tasks')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Archived' }),
    ).toHaveAttribute('href', '/archived')
    const cards = canvas.getAllByTestId('task-card')
    await expect(cards).toHaveLength(dashboardTasks.length)
    // Rendered in the order given: soonest due first.
    const statuses = cards.map((card) =>
      card.querySelector('[data-slot="badge"]')?.getAttribute('data-status'),
    )
    await expect(statuses).toEqual([
      'overdue',
      'dueSoon',
      'dueSoon',
      'upcoming',
      'upcoming',
    ])
  },
}

export const CreateAndEditActions: Story = {
  args: { tasks: dashboardTasks },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'New task' }))
    await expect(args.onCreate).toHaveBeenCalledOnce()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Water the plants' }),
    )
    await expect(args.onEdit).toHaveBeenCalledOnce()
    await expect(args.onEdit).toHaveBeenCalledWith(dueSoonTask)
  },
}

export const HighlightedTask: Story = {
  args: { tasks: dashboardTasks, highlightedTaskId: upcomingTask.id },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const highlighted = canvas
      .getAllByTestId('task-card')
      .filter((card) => card.hasAttribute('data-highlighted'))
    await expect(highlighted).toHaveLength(1)
    await expect(highlighted[0]).toHaveTextContent('See the dentist')
    await expect(
      canvas.getByRole('button', { name: 'Edit See the dentist' }),
    ).toHaveFocus()
  },
}

export const CompleteAndArchiveActions: Story = {
  args: { tasks: dashboardTasks },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Mark Water the plants done' }),
    )
    await expect(args.onComplete).toHaveBeenCalledOnce()
    await expect(args.onComplete).toHaveBeenCalledWith(dueSoonTask)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Archive See the dentist' }),
    )
    await expect(args.onArchive).toHaveBeenCalledOnce()
    await expect(args.onArchive).toHaveBeenCalledWith(upcomingTask)
  },
}

export const ActionsPending: Story = {
  args: { tasks: dashboardTasks, actionsDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Every card's actions wait for the one in flight.
    for (const button of canvas.getAllByRole('button', {
      name: /^(Mark .* done|Archive .*)$/,
    })) {
      await expect(button).toBeDisabled()
    }
  },
}

export const ActionServerError: Story = {
  args: { tasks: dashboardTasks },
  // Mirrors the `/app` route, which passes the failed mutation's error back
  // in: here every Done fails with an internal error until dismissed.
  render: function Render(args) {
    const [actionError, setActionError] = useState<TaskActionError | null>(null)
    return (
      <TaskDashboard
        {...args}
        actionError={actionError}
        onComplete={(task) => {
          args.onComplete(task)
          setActionError({
            action: 'complete',
            error: new AppError('internal'),
          })
        }}
        onDismissError={() => {
          args.onDismissError()
          setActionError(null)
        }}
      />
    )
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Mark Water the plants done' }),
    )
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Couldn't mark the task done. Please try again.",
    )
    // The list is unchanged and the action can be retried.
    await expect(canvas.getAllByTestId('task-card')).toHaveLength(
      dashboardTasks.length,
    )
    await expect(
      canvas.getByRole('button', { name: 'Mark Water the plants done' }),
    ).toBeEnabled()

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss error' }))
    await expect(args.onDismissError).toHaveBeenCalledOnce()
    await expect(canvas.queryByRole('alert')).toBeNull()
  },
}
