import { zValidator } from '@hono/zod-validator'
import { createHono } from '#/hono/factory'
import { getChatThread, listChatsByIds } from '#/hono/lib/chat/history'
import { ChatListQuerySchema, ChatListResponseSchema } from '#/hono/schemas/chats'

/**
 * Conversation history (D1).
 *
 * GET /chats?ids=a,b,c  — metadata for anonymous ownership list
 * GET /chats/:chatId    — full thread for useChat seed
 *
 * Session-scoped list + claim deferred to auth follow-up.
 */
const chats = createHono()

chats.get('/', zValidator('query', ChatListQuerySchema), async (c) => {
  const { ids } = c.req.valid('query')
  const idList = ids.split(',').map((id) => id.trim()).filter(Boolean)
  const rows = await listChatsByIds(idList)
  return c.json(ChatListResponseSchema.parse({ chats: rows }))
})

chats.get('/:chatId', async (c) => {
  const chatId = c.req.param('chatId')
  const user = c.get('user')
  const thread = await getChatThread(chatId, user?.id ?? null)

  if (thread === 'forbidden') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403)
  }
  if (!thread) {
    return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({
    chat: thread.chat,
    messages: thread.messages,
  })
})

export default chats
