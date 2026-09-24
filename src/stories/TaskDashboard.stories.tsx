import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { TaskDashboard } from '#/components/TaskDashboard'
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
      canvas.getByText("You don't have any tracked tasks yet."),
    ).toBeVisible()
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
