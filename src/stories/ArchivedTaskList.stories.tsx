import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { ArchivedTaskList } from '#/components/ArchivedTaskList'
import { AppError } from '#/lib/app-error'
import type { TaskActionError } from '#/lib/tasks/action-error'
import {
  archivedCompletedTask,
  archivedNeverCompletedTask,
  archivedTasks,
} from '#/test-utils/tasks'

const meta = {
  title: 'Tasks/ArchivedTaskList',
  component: ArchivedTaskList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    tasks: archivedTasks,
    onRestore: fn(),
    onDelete: fn(() => Promise.resolve()),
    onDismissError: fn(),
  },
  // Mirrors the `/archived` route, which passes the failed delete's error
  // back in: a rejected `onDelete` is shown until it is dismissed.
  render: function Render(args) {
    const [actionError, setActionError] = useState<TaskActionError | null>(null)
    return (
      <ArchivedTaskList
        {...args}
        actionError={actionError}
        onDelete={async (task) => {
          setActionError(null)
          try {
            await args.onDelete(task)
          } catch (caught) {
            setActionError({ action: 'delete', error: caught as Error })
            throw caught
          }
        }}
        onDismissError={() => {
          args.onDismissError()
          setActionError(null)
        }}
      />
    )
  },
} satisfies Meta<typeof ArchivedTaskList>

export default meta
type Story = StoryObj<typeof meta>

// The confirmation renders in a portal outside the story's canvas.
const page = () => within(document.body)

export const Populated: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Archived tasks')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Back to tasks' }),
    ).toHaveAttribute('href', '/app')
    const rows = canvas.getAllByTestId('archived-task')
    // Rendered in the order given: newest archive first.
    await expect(rows).toHaveLength(2)
    await expect(rows[0]).toHaveTextContent('Renew the passport')
    await expect(rows[0]).toHaveTextContent('Archived Sep 1, 2026')
    await expect(rows[0]).toHaveTextContent(
      'Every 10 years · Last done Jul 6, 2026',
    )
    await expect(rows[1]).toHaveTextContent('Descale the kettle')
    await expect(rows[1]).toHaveTextContent('Archived Aug 20, 2026')
    await expect(rows[1]).toHaveTextContent('Every month · Last done never')
  },
}

export const Empty: Story = {
  args: { tasks: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/^Nothing is archived\./)).toBeVisible()
    await expect(canvas.queryByTestId('archived-task')).toBeNull()
  },
}

export const Restore: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore Descale the kettle' }),
    )
    await expect(args.onRestore).toHaveBeenCalledOnce()
    await expect(args.onRestore).toHaveBeenCalledWith(
      archivedNeverCompletedTask,
    )
  },
}

export const DeleteCancelled: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const deleteButton = canvas.getByRole('button', {
      name: 'Delete Renew the passport permanently',
    })
    await userEvent.click(deleteButton)

    const dialog = await page().findByRole('alertdialog')
    await expect(dialog).toHaveTextContent(
      'Delete “Renew the passport” permanently?',
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )
    await waitFor(() => expect(page().queryByRole('alertdialog')).toBeNull())
    await expect(args.onDelete).not.toHaveBeenCalled()
    // Focus returns to the button that opened the confirmation.
    await expect(deleteButton).toHaveFocus()
  },
}

export const DeleteConfirmed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Delete Renew the passport permanently',
      }),
    )
    const dialog = await page().findByRole('alertdialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete permanently' }),
    )
    await expect(args.onDelete).toHaveBeenCalledOnce()
    await expect(args.onDelete).toHaveBeenCalledWith(archivedCompletedTask)
    await waitFor(() => expect(page().queryByRole('alertdialog')).toBeNull())
  },
}

export const DeleteServerError: Story = {
  args: {
    onDelete: fn(() => Promise.reject(new AppError('internal'))),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Delete Renew the passport permanently',
      }),
    )
    const dialog = await page().findByRole('alertdialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete permanently' }),
    )
    // The confirmation stays open with the error so the user can retry.
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "Couldn't delete the task. Please try again.",
    )
    await expect(page().getByRole('alertdialog')).toBeVisible()

    // Closing clears the error so the next opening starts fresh.
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )
    await expect(args.onDismissError).toHaveBeenCalledOnce()
    await expect(canvas.getAllByTestId('archived-task')).toHaveLength(2)
  },
}

export const ActionsPending: Story = {
  args: { actionsDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const button of canvas.getAllByRole('button', {
      name: /^(Restore|Delete) /,
    })) {
      await expect(button).toBeDisabled()
    }
  },
}
