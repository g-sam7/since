import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
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

export const Route = createFileRoute('/sign-up')({
  head: () => ({ meta: [{ title: 'Sign up · Since' }] }),
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (session) {
      throw redirect({ to: '/app' })
    }
  },
  component: SignUp,
})

// Better Auth's default minimum password length.
const MIN_PASSWORD_LENGTH = 8

const signUpSchema = z.object({
  name: z.string(),
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
})

type SignUpValues = z.infer<typeof signUpSchema>

function SignUp() {
  const navigate = useNavigate()
  const signUp = useMutation({
    // Throws only messages written for the user, so the alert can show them
    // as they are.
    mutationFn: async ({ name, email, password }: SignUpValues) => {
      let result
      try {
        result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0],
        })
      } catch {
        throw new Error('Something went wrong. Please try again.')
      }
      if (result.error) {
        throw new Error('Unable to create account. Please try again.')
      }
    },
  })
  const form = useForm({
    defaultValues: { name: '', email: '', password: '' } satisfies SignUpValues,
    // Validate on submit, then on every change once a submit has failed.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signUpSchema },
    onSubmit: async ({ value }) => {
      try {
        await signUp.mutateAsync(value)
      } catch {
        // Shown through `signUp.error`.
        return
      }
      await navigate({ to: '/app' })
    },
  })

  return (
    <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4 py-14">
      <Card className="w-full max-w-sm border-border/80 shadow-[0_18px_40px_var(--shadow-color)]">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Get started with Since</CardDescription>
        </CardHeader>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <CardContent className="flex flex-col gap-4">
            {signUp.error && (
              <ErrorAlert onDismiss={() => signUp.reset()}>
                {signUp.error.message}
              </ErrorAlert>
            )}
            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Your name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="name"
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
                    placeholder="Create a password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="new-password"
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
                  {isSubmitting ? 'Creating account…' : 'Sign up'}
                </Button>
              )}
            </form.Subscribe>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/sign-in"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
