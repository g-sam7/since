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
    const now = new Date()
    return tasks.map((task) => toDashboardTask(task, now))
  })
