import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Label } from '#/components/ui/Label'
import { Input } from '#/components/ui/Input'
import { Button } from '#/components/ui/Button'

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Label text',
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Standalone: Story = {
  args: { children: 'Standalone label' },
}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithRequiredMarker: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="name">
        Full name <span className="text-destructive">*</span>
      </Label>
      <Input id="name" type="text" placeholder="Jane Smith" />
    </div>
  ),
}

export const PeerDisabled: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Input id="disabled-peer" disabled placeholder="Disabled" className="peer" />
      <Label htmlFor="disabled-peer">
        This label dims when its input is disabled (peer-disabled)
      </Label>
    </div>
  ),
}

export const FormGroup: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fg-email">Email</Label>
        <Input id="fg-email" type="email" placeholder="you@example.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fg-password">Password</Label>
        <Input id="fg-password" type="password" placeholder="••••••••" />
      </div>
      <Button className="w-full">Sign in</Button>
    </div>
  ),
}
