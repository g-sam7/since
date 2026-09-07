import { createServerFn } from '@tanstack/react-start'

import { authMiddleware } from '#/lib/auth-middleware'
import { toDashboardTask } from './dashboard'
import type { DashboardTask } from './dashboard'
import { getOrCreatePersonalWorkspace, listActiveTasks } from './repository'

/** Active tasks in the signed-in user's workspace, soonest due first. */
export const listDashboardTasks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardTask[]> => {
    const workspace = await getOrCreatePersonalWorkspace(
      context.session.user.id,
    )
    const tasks = await listActiveTasks(workspace.id)
    // `dueStatus` is fixed at fetch time on the server, while the card's
    // elapsed and due copy use the clock at render. They can disagree for a
    // single render at a band boundary and realign on the next refetch.
    // Deferred: the full fix is to return `now` here and thread it through
    // to the card so the badge, copy, and hydration all share one timestamp.
    const now = new Date()
    return tasks.map((task) => toDashboardTask(task, now))
  })
