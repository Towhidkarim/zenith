import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '#/hono/factory'

/**
 * Reject unauthenticated requests with 401.
 * Apply after `sessionMiddleware` on protected route groups.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  await next()
})
