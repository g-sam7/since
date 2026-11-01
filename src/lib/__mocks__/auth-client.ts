import { fn } from 'storybook/test'

// Stands in for `#/lib/auth-client` in stories (registered with `sb.mock` in
// `.storybook/preview.tsx`). The real client is a Proxy that ignores property
// assignments, so stories cannot stub its methods in place. Stories set the
// session with `mocked(authClient.useSession).mockReturnValue(...)`.
export const authClient = {
  useSession: fn(() => ({ data: null, isPending: false })),
  signOut: fn(async () => {}),
}
