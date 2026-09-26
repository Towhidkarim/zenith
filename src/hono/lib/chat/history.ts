import { env } from 'cloudflare:workers'
import type { ChatUIMessage } from '#/hono/lib/chat/types'

const MAX_LIST_IDS = 50

export type ChatListItem = {
  id: string
  title: string | null
  updatedAt: number
  userId: string | null
}

export type ChatCitationRow = {
  id: string
  messageId: string
  pointId: string
  kind: string
  actTitle: string
  actNo: string
  actYear: number
  sectionNumber: string
  sectionTitle: string
  url: string | null
}

export type ChatMessageRow = {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  runId: string | null
  createdAt: number
}

export type ChatThread = {
  chat: ChatListItem
  messages: ChatUIMessage[]
}

function db() {
  return env.DB
}

export async function listChatsByIds(ids: string[]): Promise<ChatListItem[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(
    0,
    MAX_LIST_IDS,
  )
  if (unique.length === 0) return []

  const placeholders = unique.map(() => '?').join(',')
  const result = await db()
    .prepare(
      `SELECT id, title, updated_at AS updatedAt, user_id AS userId
       FROM chats
       WHERE id IN (${placeholders})
       ORDER BY updated_at DESC`,
    )
    .bind(...unique)
    .all<{
      id: string
      title: string | null
      updatedAt: number
      userId: string | null
    }>()

  return (result.results ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt,
    userId: row.userId,
  }))
}

export async function getChatRow(chatId: string): Promise<ChatListItem | null> {
  const row = await db()
    .prepare(
      `SELECT id, title, updated_at AS updatedAt, user_id AS userId
       FROM chats WHERE id = ? LIMIT 1`,
    )
    .bind(chatId)
    .first<{
      id: string
      title: string | null
      updatedAt: number
      userId: string | null
    }>()

  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt,
    userId: row.userId,
  }
}

export async function getChatThread(
  chatId: string,
  viewerUserId?: string | null,
): Promise<ChatThread | null | 'forbidden'> {
  const chat = await getChatRow(chatId)
  if (!chat) return null

  if (chat.userId && chat.userId !== viewerUserId) {
    return 'forbidden'
  }

  const messageResult = await db()
    .prepare(
      `SELECT id, chat_id AS chatId, role, content, run_id AS runId,
              created_at AS createdAt
       FROM messages
       WHERE chat_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(chatId)
    .all<ChatMessageRow>()

  const messages = messageResult.results ?? []
  const assistantIds = messages
    .filter((m) => m.role === 'assistant')
    .map((m) => m.id)

  const citationsByMessage = new Map<string, ChatCitationRow[]>()
  if (assistantIds.length > 0) {
    const placeholders = assistantIds.map(() => '?').join(',')
    const citationResult = await db()
      .prepare(
        `SELECT id, message_id AS messageId, point_id AS pointId, kind,
                act_title AS actTitle, act_no AS actNo, act_year AS actYear,
                section_number AS sectionNumber, section_title AS sectionTitle,
                url
         FROM message_citations
         WHERE message_id IN (${placeholders})`,
      )
      .bind(...assistantIds)
      .all<ChatCitationRow>()

    for (const cite of citationResult.results ?? []) {
      const list = citationsByMessage.get(cite.messageId) ?? []
      list.push(cite)
      citationsByMessage.set(cite.messageId, list)
    }
  }

  const uiMessages: ChatUIMessage[] = messages.map((row) => {
    const parts: ChatUIMessage['parts'] = [
      { type: 'text', text: row.content },
    ]

    if (row.role === 'assistant') {
      for (const cite of citationsByMessage.get(row.id) ?? []) {
        const title =
          cite.sectionTitle ||
          `${cite.actTitle} · s.${cite.sectionNumber}`
        parts.push({
          type: 'source-url',
          sourceId: cite.pointId,
          url: cite.url ?? `#cite-${cite.pointId}`,
          title,
        } as ChatUIMessage['parts'][number])
      }
    }

    return {
      id: row.id,
      role: row.role,
      parts,
    }
  })

  return { chat, messages: uiMessages }
}
