import type { Preview } from '@storybook/tanstack-react'
import { sb } from 'storybook/test'
import '../src/styles.css'

// Module mocks can only be registered here. Uses `src/lib/__mocks__/`.
sb.mock(import('../src/lib/auth-client.ts'))

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
