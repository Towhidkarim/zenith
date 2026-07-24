import { Hono } from 'hono'
import type { auth } from '#/lib/auth'

export type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export type AppEnv = {
  Bindings: Env
  Variables: AuthVariables
}

/**
 * Typed Hono factory bound to Cloudflare Worker `Env` + Better Auth session vars.
 * Use this for the root app and every route module.
 */
export const createHono = () => new Hono<AppEnv>()
