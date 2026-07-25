import { zValidator } from '@hono/zod-validator'
import { createHono } from '#/hono/factory'
import { createChatStreamResponse } from '#/hono/lib/chat/create-stream'
import { toChatUIMessages } from '#/hono/lib/chat/types'
import {
  ChatHealthResponseSchema,
  ChatPostBodySchema,
} from '#/hono/schemas/chat'

/**
 * Chat inference routes.
 *
 * POST /chat — multi-step UI message SSE stream (AI SDK protocol).
 * Request body validated with Zod; response is an SSE stream (not JSON).
 */
const chat = createHono()

chat.post('/', zValidator('json', ChatPostBodySchema), async (c) => {
  const body = c.req.valid('json')
  const messages = toChatUIMessages(body.messages)

  // Optional: c.get('user') / c.get('session') when sessionMiddleware ran
  return createChatStreamResponse(messages, { env: c.env })
})

chat.get('/health', (c) => {
  const payload = ChatHealthResponseSchema.parse({
    ok: true,
    route: 'chat',
    mode: 'dummy-stream',
  })

  return c.json(payload)
})

export default chat
