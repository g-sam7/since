import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { addDays, format } from 'date-fns'
import { useState } from 'react'
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test'

import { TaskForm } from '#/components/TaskForm'
import { AppError } from '#/lib/app-error'
import { overdueTask } from '#/test-utils/tasks'

const meta = {
  title: 'Tasks/TaskForm',
  component: TaskForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    error: null,
    // Resolves after a short delay so the in-flight state can be asserted.
    onSubmit: fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 300)),
    ),
    onDismissError: fn(),
  },
  // Mirrors `TaskFormSheet`, which passes the failed mutation's error back
  // in: a rejected `onSubmit` is shown until it is dismissed.
  render: function Render(args) {
    const [error, setError] = useState<Error | null>(null)
    return (
      <TaskForm
        {...args}
        error={error}
        onSubmit={async (values) => {
          try {
            await args.onSubmit(values)
          } catch (caught) {
            setError(caught as Error)
            throw caught
          }
        }}
        onDismissError={() => {
          args.onDismissError()
          setError(null)
        }}
      />
    )
  },
  decorators: [
    (Story) => (
      <div className="flex w-[min(28rem,90vw)] flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskForm>

export default meta
type Story = StoryObj<typeof meta>

export const CreateValidationErrors: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const intervalCount = canvas.getByLabelText('Repeat every')
    await userEvent.clear(intervalCount)
    await userEvent.click(canvas.getByRole('button', { name: 'Create task' }))

    await expect(await canvas.findByText('Enter a name')).toBeVisible()
    await expect(canvas.getByLabelText('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    const intervalError = 'Enter a whole number from 1 to 999'
    await expect(canvas.getByText(intervalError)).toBeVisible()

    // Errors revalidate on change after the failed submit.
    for (const invalid of ['0', '-1', '1.5', '1000']) {
      await userEvent.clear(intervalCount)
      await userEvent.type(intervalCount, invalid)
      await expect(await canvas.findByText(intervalError)).toBeVisible()
    }
    await userEvent.type(canvas.getByLabelText('Name'), '   ')
    await expect(canvas.getByText('Enter a name')).toBeVisible()

    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const CreateFutureDate: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Name'), 'Descale the kettle')
    fireEvent.change(canvas.getByLabelText('Last done on'), {
      target: { value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Create task' }))

    await expect(
      await canvas.findByText("Can't be in the future"),
    ).toBeVisible()
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const CreateSuccess: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Description'), 'Citric acid')
    await userEvent.type(
      canvas.getByLabelText('Notes'),
      'Two sachets.{Enter}Rinse twice.',
    )
    const intervalCount = canvas.getByLabelText('Repeat every')
    await userEvent.clear(intervalCount)
    await userEvent.type(intervalCount, '2')
    await userEvent.click(canvas.getByRole('combobox', { name: 'Unit' }))
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Months' }),
    )
    // Radix disables pointer events on the page until the listbox unmounts.
    await waitFor(() =>
      expect(within(document.body).queryByRole('listbox')).toBeNull(),
    )
    fireEvent.change(canvas.getByLabelText('Last done on'), {
      target: { value: '2026-09-01' },
    })
    // Enter in a text field submits the form.
    await userEvent.type(
      canvas.getByLabelText('Name'),
      '  Descale the kettle{Enter}',
    )

    await expect(
      await canvas.findByRole('button', { name: 'Saving...' }),
    ).toBeDisabled()
    await expect(args.onSubmit).toHaveBeenCalledOnce()
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: '  Descale the kettle',
      description: 'Citric acid',
      notes: 'Two sachets.\nRinse twice.',
      intervalCount: '2',
      intervalUnit: 'month',
      lastCompletedOn: '2026-09-01',
    })
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Create task' })).toBeEnabled(),
    )
  },
}

export const EditPrefill: Story = {
  args: { task: overdueTask },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText('Name')).toHaveValue(
      'Change the air filter',
    )
    await expect(canvas.getByLabelText('Description')).toHaveValue(
      'The HVAC filter in the hallway return.',
    )
    await expect(canvas.getByLabelText('Notes')).toHaveValue(
      '20x25x1, MERV 11.\nSpares are in the garage cabinet.',
    )
    await expect(canvas.getByLabelText('Repeat every')).toHaveValue(3)
    await expect(
      canvas.getByRole('combobox', { name: 'Unit' }),
    ).toHaveTextContent('Months')
    // The last completion is shown but cannot be edited here.
    await expect(canvas.getByText('May 6, 2026')).toBeVisible()
    await expect(canvas.queryByLabelText('Last done on')).toBeNull()

    await userEvent.clear(canvas.getByLabelText('Description'))
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }))
    await expect(args.onSubmit).toHaveBeenCalledOnce()
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Change the air filter',
      description: '',
      notes: '20x25x1, MERV 11.\nSpares are in the garage cabinet.',
      intervalCount: '3',
      intervalUnit: 'month',
      lastCompletedOn: '',
    })
  },
}

export const ServerError: Story = {
  args: {
    onSubmit: fn(() => Promise.reject(new AppError('internal'))),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByLabelText('Name'),
      'Descale the kettle{Enter}',
    )

    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent(
      "Couldn't save the task. Please try again.",
    )
    // The form keeps the entered values and can be resubmitted.
    await expect(canvas.getByLabelText('Name')).toHaveValue(
      'Descale the kettle',
    )
    await expect(
      canvas.getByRole('button', { name: 'Create task' }),
    ).toBeEnabled()

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss error' }))
    await expect(args.onDismissError).toHaveBeenCalledOnce()
    await expect(canvas.queryByRole('alert')).toBeNull()
  },
}

export const EditNotFound: Story = {
  args: {
    task: overdueTask,
    onSubmit: fn(() => Promise.reject(new AppError('notFound'))),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'This task no longer exists. It may have been deleted.',
    )
  },
}
