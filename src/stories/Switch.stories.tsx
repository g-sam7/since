import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Switch } from '#/components/ui/Switch'
import { Label } from '#/components/ui/Label'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
  },
  args: {
    size: 'default',
    disabled: false,
    defaultChecked: false,
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      {(['default', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <Switch size={size} defaultChecked />
          <p className="text-xs text-muted-foreground font-mono">{size}</p>
        </div>
      ))}
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="space-y-3">
      {[
        { label: 'Unchecked', props: {} },
        { label: 'Checked', props: { defaultChecked: true } },
        { label: 'Disabled unchecked', props: { disabled: true } },
        { label: 'Disabled checked', props: { disabled: true, defaultChecked: true } },
      ].map(({ label, props }) => (
        <div key={label} className="flex items-center gap-3">
          <Switch {...props} />
          <p className="text-xs text-muted-foreground font-mono">{label}</p>
        </div>
      ))}
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
  ),
}

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="flex items-start gap-3">
      <Switch id="marketing" className="mt-0.5" />
      <div className="space-y-1">
        <Label htmlFor="marketing">Marketing emails</Label>
        <p className="text-sm text-muted-foreground">
          Receive emails about new features and updates.
        </p>
      </div>
    </div>
  ),
}

export const SettingsList: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      {[
        { id: 'push', label: 'Push notifications', description: 'Get notified on your device.', defaultChecked: true },
        { id: 'email', label: 'Email digest', description: 'Weekly summary of your activity.', defaultChecked: false },
        { id: 'sms', label: 'SMS alerts', description: 'Critical alerts via text message.', defaultChecked: false },
      ].map(({ id, label, description, defaultChecked }) => (
        <div key={id} className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor={id}>{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch id={id} defaultChecked={defaultChecked} />
        </div>
      ))}
    </div>
  ),
}
