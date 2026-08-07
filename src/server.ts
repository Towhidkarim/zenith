import handler from '@tanstack/react-start/server-entry'
import { app as honoApp } from '#/hono/app'

/** Must be exported from the Worker entry for wrangler durable_objects. */
export { ChatRunDO } from '#/durable-objects/chat-run'

/**
 * Cloudflare Workers entry.
 *
 * - `/api/rest/*` → Hono (inference / REST)
 * - everything else → TanStack Start (SSR, server fns, `/api/auth/*`)
 *
 * Chat inference: Hono → ChatRunDO (owns agent) → stream back to client.
 */
function isHonoRestRequest(pathname: string) {
  return pathname === '/api/rest' || pathname.startsWith('/api/rest/')
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (isHonoRestRequest(url.pathname)) {
      return honoApp.fetch(request, env, ctx)
    }

    return handler.fetch(request)
  },
}
