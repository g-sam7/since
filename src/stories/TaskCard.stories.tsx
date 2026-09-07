import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, within } from 'storybook/test'

import { TaskCard } from '#/components/TaskCard'
import {
  FIXTURE_NOW,
  deletedCreatorTask,
  dueSoonTask,
  neverCompletedTask,
  overdueTask,
  upcomingTask,
} from '#/test-utils/tasks'

const meta = {
  title: 'Tasks/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    now: FIXTURE_NOW,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,90vw)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskCard>

export default meta
type Story = StoryObj<typeof meta>

export const Overdue: Story = {
  args: { task: overdueTask },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Change the air filter')).toBeVisible()
    await expect(canvas.getByText('Overdue')).toHaveAttribute(
      'data-status',
      'overdue',
    )
    await expect(
      canvas.getByText("It's been 4 months since you last did this."),
    ).toBeVisible()
    await expect(
      canvas.getByText('The HVAC filter in the hallway return.'),
    ).toBeVisible()
    await expect(canvas.getByText(/MERV 11/)).toBeVisible()
    await expect(canvas.getByText(/^Due 1 month ago/)).toBeVisible()
    await expect(canvas.getByText(/Created Jun 1, 2026 by Sam/)).toBeVisible()
  },
}

export const DueSoon: Story = {
  args: { task: dueSoonTask },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Due soon')).toHaveAttribute(
      'data-status',
      'dueSoon',
    )
    await expect(canvas.getByText(/^Due in 1 day/)).toBeVisible()
  },
}

export const Upcoming: Story = {
  args: { task: upcomingTask },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Upcoming')).toHaveAttribute(
      'data-status',
      'upcoming',
    )
    await expect(canvas.getByText(/^Due in 10 months/)).toBeVisible()
    // No description or notes: the content block is omitted entirely.
    await expect(
      canvasElement.querySelector('[data-slot="card-content"]'),
    ).toBeNull()
  },
}

export const NeverCompleted: Story = {
  args: { task: neverCompletedTask },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Created 29 days ago, never completed.'),
    ).toBeVisible()
    await expect(canvas.getByText('Due soon')).toBeVisible()
  },
}

export const DeletedCreator: Story = {
  args: { task: deletedCreatorTask },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/by Unknown$/)).toBeVisible()
  },
}
