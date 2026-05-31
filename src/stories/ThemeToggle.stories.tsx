import type { Meta, StoryObj } from '@storybook/tanstack-react'

import ThemeToggle from '#/components/ThemeToggle'

const meta = {
  title: 'ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

// Seed localStorage so the component mounts in the desired mode
function withStoredTheme(theme: 'light' | 'dark' | 'auto') {
  return (Story: React.ComponentType) => {
    localStorage.setItem('theme', theme)
    return <Story />
  }
}

export const Playground: Story = {
  decorators: [
    (Story) => {
      localStorage.removeItem('theme')
      return <Story />
    },
  ],
}

export const LightMode: Story = {
  decorators: [withStoredTheme('light')],
}

export const DarkMode: Story = {
  decorators: [withStoredTheme('dark')],
}

export const AutoMode: Story = {
  decorators: [withStoredTheme('auto')],
}
