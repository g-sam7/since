import type { Meta, StoryObj } from '@storybook/tanstack-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '#/components/utils/Card'
import { Button } from '#/components/utils/Button'

const meta = {
  title: 'Utils/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const ContentOnly: Story = {
  render: () => (
    <Card>
      <CardContent>Just some content inside a card.</CardContent>
    </Card>
  ),
}

export const WithHeaderAndContent: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          A short description of what this card is about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the main body of the card. It can contain any content.
        </p>
      </CardContent>
    </Card>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          A short description of what this card is about.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card body content goes here.
        </p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          A short description of what this card is about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card body content goes here.
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Footer note</p>
      </CardFooter>
    </Card>
  ),
}

export const WithFooterActions: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          A short description of what this card is about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card body content goes here.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

export const FullComposition: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Full Card</CardTitle>
        <CardDescription>
          Every sub-component composed together.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This card uses CardHeader, CardTitle, CardDescription, CardAction,
          CardContent, and CardFooter.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
}

export const AllCompositions: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-4">
      {[
        {
          label: 'Content only',
          node: (
            <Card>
              <CardContent>Content only.</CardContent>
            </Card>
          ),
        },
        {
          label: 'Header + Content',
          node: (
            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
                <CardDescription>Description</CardDescription>
              </CardHeader>
              <CardContent>Body content.</CardContent>
            </Card>
          ),
        },
        {
          label: 'Header + Action + Content',
          node: (
            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
                <CardDescription>Description</CardDescription>
                <CardAction>
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>Body content.</CardContent>
            </Card>
          ),
        },
        {
          label: 'Header + Content + Footer',
          node: (
            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
                <CardDescription>Description</CardDescription>
              </CardHeader>
              <CardContent>Body content.</CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          ),
        },
      ].map(({ label, node }) => (
        <div key={label} className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{label}</p>
          {node}
        </div>
      ))}
    </div>
  ),
}
