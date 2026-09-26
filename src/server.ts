import handler from '@tanstack/react-start/server-entry'
import { app as honoApp } from '#/hono/app'
import { auth } from '#/lib/auth'

/** Must be exported from the Worker entry for wrangler durable_objects. */
export { ChatRunDO } from '#/durable-objects/chat-run'

/**
 * Cloudflare Workers entry.
 *
 * - `/api/auth/*` → Better Auth
 * - `/api/rest/*` → Hono (inference / history)
 * - everything else → TanStack Start (SSR, UI)
 */
function isHonoRestRequest(pathname: string) {
  return pathname === '/api/rest' || pathname.startsWith('/api/rest/')
}

function isAuthRequest(pathname: string) {
  return pathname === '/api/auth' || pathname.startsWith('/api/auth/')
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (isAuthRequest(url.pathname)) {
      return auth.handler(request)
    }

    if (isHonoRestRequest(url.pathname)) {
      return honoApp.fetch(request, env, ctx)
    }

    return handler.fetch(request)
  },
}
