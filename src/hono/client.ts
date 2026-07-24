import { hc } from 'hono/client'
import type { AppType } from '#/hono/app'

/**
 * Typed Hono RPC client for `/api/rest/*`.
 *
 * Usage:
 *   const res = await restClient.health.$get()
 *   const data = await res.json()
 *
 * For chat streaming, prefer AI SDK `useChat` + `DefaultChatTransport`
 * (`api: '/api/rest/chat'`, `credentials: 'include'`). You can still use this
 * client for typed non-stream routes, or wrap `hc` fetch into a custom transport.
 */
export const restClient = hc<AppType>('/', {
  init: {
    credentials: 'include',
  },
})

export type RestClient = typeof restClient
