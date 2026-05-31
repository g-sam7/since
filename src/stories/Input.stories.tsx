import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Input } from '#/components/utils/Input'

const meta = {
  title: 'Utils/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'file'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'text',
    placeholder: 'Placeholder...',
    disabled: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllTypes: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      {(
        [
          { type: 'text', placeholder: 'Text' },
          { type: 'email', placeholder: 'Email' },
          { type: 'password', placeholder: 'Password' },
          { type: 'number', placeholder: 'Number' },
          { type: 'search', placeholder: 'Search' },
          { type: 'tel', placeholder: 'Phone number' },
          { type: 'url', placeholder: 'https://example.com' },
        ] as const
      ).map(({ type, placeholder }) => (
        <div key={type} className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{type}</p>
          <Input type={type} placeholder={placeholder} />
        </div>
      ))}
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    type: 'text',
    defaultValue: 'Filled in value',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
}

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
}

export const Invalid: Story = {
  render: () => <Input aria-invalid defaultValue="bad@value" />,
}

export const FileUpload: Story = {
  args: {
    type: 'file',
  },
}
