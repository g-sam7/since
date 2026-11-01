import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { ErrorAlert } from '#/components/ErrorAlert'
import { FieldError } from '#/components/FieldError'
import { Button } from '#/components/utils/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/utils/Card'
import { Input } from '#/components/utils/Input'
import { Label } from '#/components/utils/Label'
import { authClient } from '#/lib/auth-client'
import { getAuthSession } from '#/lib/auth-session'

export const Route = createFileRoute('/sign-in')({
  head: () => ({ meta: [{ title: 'Sign in · Since' }] }),
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (session) {
      throw redirect({ to: '/app' })
    }
  },
  component: SignIn,
})

const signInSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

type SignInValues = z.infer<typeof signInSchema>

function SignIn() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const signIn = useMutation({
    // Throws only messages written for the user, so the alert can show them
    // as they are.
    mutationFn: async (values: SignInValues) => {
      let result
      try {
        result = await authClient.signIn.email(values)
      } catch {
        throw new Error('Something went wrong. Please try again.')
      }
      if (result.error) throw new Error('Invalid email or password.')
    },
  })
  const form = useForm({
    defaultValues: { email: '', password: '' } satisfies SignInValues,
    // Validate on submit, then on every change once a submit has failed.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signInSchema },
    onSubmit: async ({ value }) => {
      try {
        await signIn.mutateAsync(value)
      } catch {
        // Shown through `signIn.error`.
        return
      }
      // A session that ended without signing out (e.g. expired) leaves the
      // previous user's data cached, which the loaders would serve as is.
      queryClient.clear()
      await navigate({ to: '/app' })
    },
  })

  return (
    <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4 py-14">
      <Card className="w-full max-w-sm border-border/80 shadow-[0_18px_40px_var(--shadow-color)]">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <CardContent className="flex flex-col gap-4">
            {signIn.error && (
              <ErrorAlert onDismiss={() => signIn.reset()}>
                {signIn.error.message}
              </ErrorAlert>
            )}
            <form.Field name="email">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="email"
                    aria-required
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={`${field.name}-error`}
                  />
                  <FieldError
                    id={`${field.name}-error`}
                    errors={field.state.meta.errors}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="Enter your password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="current-password"
                    aria-required
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={`${field.name}-error`}
                  />
                  <FieldError
                    id={`${field.name}-error`}
                    errors={field.state.meta.errors}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 py-6">
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              )}
            </form.Subscribe>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                to="/sign-up"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
