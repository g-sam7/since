import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db/index'
import * as authSchema from '#/db/auth-schema'
import { env } from '#/env'
import { createPersonalWorkspace } from '#/lib/tasks/repository'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createPersonalWorkspace(user.id)
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
