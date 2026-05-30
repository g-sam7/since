import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Slider } from '#/components/ui/Slider'
import { Label } from '#/components/ui/Label'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    defaultValue: [40],
  },
}

export const Default: Story = {
  render: () => <Slider defaultValue={[40]} />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-3">
      <Label>Volume</Label>
      <Slider defaultValue={[60]} />
    </div>
  ),
}

export const Steps: Story = {
  render: () => (
    <div className="space-y-6">
      {[1, 10, 25].map((step) => (
        <div key={step} className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono">step={step}</p>
          <Slider defaultValue={[50]} step={step} />
        </div>
      ))}
    </div>
  ),
}

export const Range: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-mono">two thumbs</p>
      <Slider defaultValue={[25, 75]} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <Slider defaultValue={[40]} disabled />,
}

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div className="h-48 flex justify-center">
        <Story />
      </div>
    ),
  ],
  render: () => <Slider defaultValue={[40]} orientation="vertical" />,
}

export const VerticalRange: Story = {
  decorators: [
    (Story) => (
      <div className="h-48 flex justify-center">
        <Story />
      </div>
    ),
  ],
  render: () => <Slider defaultValue={[20, 80]} orientation="vertical" />,
}
