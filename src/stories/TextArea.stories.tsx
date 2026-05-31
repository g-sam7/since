import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { TextArea } from '#/components/utils/TextArea'
import { Label } from '#/components/utils/Label'
import { Button } from '#/components/utils/Button'

const meta = {
  title: 'Utils/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: {
    placeholder: 'Type something...',
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some pre-filled content inside the textarea.',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
}

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'This content cannot be edited.',
  },
}

export const Invalid: Story = {
  render: () => (
    <TextArea aria-invalid defaultValue="This field has an error." />
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="bio">Bio</Label>
      <TextArea id="bio" placeholder="Tell us about yourself..." />
    </div>
  ),
}

export const AutoGrows: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-mono">field-sizing-content — grows with content</p>
      <TextArea defaultValue={'Line one\nLine two\nLine three\nLine four\nLine five'} />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <TextArea id="subject" placeholder="What's this about?" rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <TextArea id="message" placeholder="Write your message..." rows={5} />
      </div>
      <Button className="w-full">Send message</Button>
    </div>
  ),
}
