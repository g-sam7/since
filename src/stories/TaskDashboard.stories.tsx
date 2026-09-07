import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, within } from 'storybook/test'

import { TaskDashboard } from '#/components/TaskDashboard'
import { FIXTURE_NOW, dashboardTasks } from '#/test-utils/tasks'

const meta = {
  title: 'Tasks/TaskDashboard',
  component: TaskDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    now: FIXTURE_NOW,
  },
} satisfies Meta<typeof TaskDashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { tasks: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Welcome back')).toBeVisible()
    await expect(
      canvas.getByText("You don't have any tracked tasks yet."),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Create your first task' }),
    ).toBeDisabled()
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
