import type { Meta, StoryObj } from '@storybook/tanstack-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/Select'
import { Label } from '#/components/ui/Label'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']

function BasicSelect({ size = 'default', ...props }: { size?: 'sm' | 'default'; disabled?: boolean; placeholder?: string }) {
  return (
    <Select {...props}>
      <SelectTrigger size={size} className="w-48">
        <SelectValue placeholder={props.placeholder ?? 'Select a fruit'} />
      </SelectTrigger>
      <SelectContent>
        {fruits.map((fruit) => (
          <SelectItem key={fruit} value={fruit.toLowerCase()}>{fruit}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const Default: Story = {
  render: () => <BasicSelect />,
}

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="banana">
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fruits.map((fruit) => (
          <SelectItem key={fruit} value={fruit.toLowerCase()}>{fruit}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      {(['sm', 'default'] as const).map((size) => (
        <div key={size} className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{size}</p>
          <BasicSelect size={size} />
        </div>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <BasicSelect disabled placeholder="Disabled" />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="fruit-select">Favourite fruit</Label>
      <Select>
        <SelectTrigger id="fruit-select" className="w-48">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          {fruits.map((fruit) => (
            <SelectItem key={fruit} value={fruit.toLowerCase()}>{fruit}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern (EST)</SelectItem>
          <SelectItem value="cst">Central (CST)</SelectItem>
          <SelectItem value="mst">Mountain (MST)</SelectItem>
          <SelectItem value="pst">Pacific (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="gmt">Greenwich (GMT)</SelectItem>
          <SelectItem value="cet">Central European (CET)</SelectItem>
          <SelectItem value="eet">Eastern European (EET)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
        <SelectSeparator />
        <SelectItem value="az">A → Z</SelectItem>
        <SelectItem value="za">Z → A</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48" aria-invalid>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        {fruits.map((fruit) => (
          <SelectItem key={fruit} value={fruit.toLowerCase()}>{fruit}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}
