import { env } from 'cloudflare:workers'
import { zValidator } from '@hono/zod-validator'
import { createHono } from '#/hono/factory'
import { createChatStreamResponse } from '#/hono/lib/chat/create-stream'
import { createUIStreamFromAgentNdjson } from '#/hono/lib/chat/to-ui-stream'
import { toChatUIMessages } from '#/hono/lib/chat/types'
import { createDoChatRunRuntime } from '#/runtime'
import {
  ChatHealthResponseSchema,
  ChatPostBodySchema,
  ChatRunStreamQuerySchema,
} from '#/hono/schemas/chat'

/**
 * Chat inference routes.
 *
 * POST /chat
 *   - New turn: mints a run id, starts DO agent, streams UI SSE
 *   - Resume: `{ resume: { runId, fromSeq } }` reconnects to an existing run
 *
 * GET /runs/:runId/stream?fromSeq=0
 *   - Resume-only stream (for custom clients; useChat can use POST resume)
 *
 * DELETE /runs/:runId
 *   - Cancel a DO-owned run
 */
const chat = createHono()

chat.post('/', zValidator('json', ChatPostBodySchema), async (c) => {
  const body = c.req.valid('json')
  const messages = toChatUIMessages(body.messages)

  // Errors bubble to app.onError (console log + JSON { error }).
  return createChatStreamResponse(messages, {
    chatId: body.id,
    resume: body.resume,
  })
})

chat.get(
  '/runs/:runId/stream',
  zValidator('query', ChatRunStreamQuerySchema),
  async (c) => {
    const runId = c.req.param('runId')
    const { fromSeq } = c.req.valid('query')
    const ndjson = await createDoChatRunRuntime().subscribe(runId, fromSeq)
    return createUIStreamFromAgentNdjson(ndjson, [], {
      'X-Zenith-Run-Id': runId,
    })
  },
)

chat.delete('/runs/:runId', async (c) => {
  const runId = c.req.param('runId')
  return c.json(await createDoChatRunRuntime().cancel(runId))
})

chat.get('/runs/:runId', async (c) => {
  const runId = c.req.param('runId')
  const status = await createDoChatRunRuntime().getStatus(runId)
  return c.json({ runId, ...status })
})

chat.get('/health', (c) => {
  const hasGemini = Boolean(env.GEMINI_API_KEY)
  const hasQdrant = Boolean(env.QDRANT_URL && env.QDRANT_API_KEY)
  const payload = ChatHealthResponseSchema.parse({
    ok: true,
    route: 'chat',
    mode: hasGemini && hasQdrant ? 'llm' : 'do-agent',
  })

  return c.json(payload)
})

export default chat
