import { createHono } from './factory'
import { sessionMiddleware } from './middleware/session'
import chat from './routes/chat'
import health from './routes/health'

/**
 * Hono REST API — mounted at `/api/rest/*` from the Workers fetch entry.
 *
 * Path convention:
 * - `/api/auth/*` → Better Auth (TanStack Start route)
 * - `/api/rest/*` → Hono (chat inference, future domain APIs)
 *
 * Auth: same Better Auth cookies via `sessionMiddleware`.
 * Protect a route with `requireAuth` after the session middleware.
 */
const app = createHono()
  .basePath('/api/rest')
  .use('*', sessionMiddleware)
  .route('/health', health)
  .route('/chat', chat)

app.notFound((c) =>
  c.json(
    {
      error: 'Not found',
      path: c.req.path,
    },
    404,
  ),
)

app.onError((err, c) => {
  console.error(
    JSON.stringify({
      message: 'Hono Unhandled Error',
      error: err instanceof Error ? err.message : String(err),
      path: c.req.path,
    }),
  )

  return c.json({ error: 'Internal server error' }, 500)
})

export type AppType = typeof app
export { app }
export default app
