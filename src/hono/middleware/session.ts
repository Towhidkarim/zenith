import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '#/hono/factory'
import { auth } from '#/lib/auth'

/**
 * Attach Better Auth session (same cookie jar as `/api/auth/*`) to Hono context.
 * Does not reject anonymous requests — use `requireAuth` for that.
 */
export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})
