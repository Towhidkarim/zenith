import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '#/hono/factory'

const isDev = import.meta.env.DEV

/**
 * Top-level Hono error handler — used via `app.onError`.
 * Logs to the Worker console (visible in `pnpm dev` terminal) and returns JSON
 * `{ error }` so clients like useChat can show the real message.
 */
export const honoOnError: ErrorHandler<AppEnv> = (err, c) => {
  const message = err instanceof Error ? err.message : String(err)
  const status =
    err instanceof HTTPException
      ? err.status
      : 500

  console.error('[zenith:hono]', {
    method: c.req.method,
    path: c.req.path,
    status,
    message,
    ...(isDev && err instanceof Error
      ? { stack: err.stack, cause: err.cause }
      : {}),
  })

  // Full error object in the terminal during local/dev for inspection.
  if (isDev) {
    console.error(err)
  }

  return c.json({ error: message }, status)
}
