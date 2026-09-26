import type { AgentEvent } from '#/agent/types'

export type PersistChatTurnInput = {
  chatId?: string
  runId: string
  userText: string
  assistantText: string
  sources: Array<Extract<AgentEvent, { type: 'source' }>>
  /** Better Auth user id when signed in; null/omit for anonymous. */
  userId?: string | null
  /** Conversation title — applied on first upsert when chat has no title. */
  title?: string | null
}

type D1Like = {
  prepare: (query: string) => {
    bind: (
      ...args: unknown[]
    ) => { run: () => Promise<unknown> }
  }
}

const TITLE_MAX = 60

export function titleFromUserText(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'New chat'
  if (trimmed.length <= TITLE_MAX) return trimmed
  return `${trimmed.slice(0, TITLE_MAX - 1).trimEnd()}…`
}

/**
 * Persist a finished (or cancelled) chat turn to D1.
 * No-op if `chatId` or `db` is missing.
 * Re-entrant for the same `runId` (replaces that run's message rows).
 */
export async function persistChatTurn(
  input: PersistChatTurnInput,
  db?: D1Like,
): Promise<void> {
  if (!input.chatId || !db) return
  if (!input.userText.trim() && !input.assistantText.trim()) return

  const now = Date.now()
  const title = input.title?.trim() || titleFromUserText(input.userText)
  const ownerId = input.userId ?? null

  try {
    await db
      .prepare(
        `INSERT INTO chats (id, user_id, title, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           updated_at = excluded.updated_at,
           user_id = CASE
             WHEN chats.user_id IS NULL AND excluded.user_id IS NOT NULL
             THEN excluded.user_id
             ELSE chats.user_id
           END,
           title = CASE
             WHEN chats.title IS NULL OR chats.title = ''
             THEN excluded.title
             ELSE chats.title
           END`,
      )
      .bind(input.chatId, ownerId, title, now)
      .run()

    // Replace any prior rows for this run (cancel re-persist / double-fire).
    await db
      .prepare(
        `DELETE FROM message_citations WHERE message_id IN (
           SELECT id FROM messages WHERE run_id = ?
         )`,
      )
      .bind(input.runId)
      .run()
    await db
      .prepare(`DELETE FROM messages WHERE run_id = ?`)
      .bind(input.runId)
      .run()

    if (input.userText.trim()) {
      await db
        .prepare(
          `INSERT INTO messages (id, chat_id, role, content, run_id, created_at)
           VALUES (?, ?, 'user', ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          input.chatId,
          input.userText,
          input.runId,
          now,
        )
        .run()
    }

    const assistantId = crypto.randomUUID()
    await db
      .prepare(
        `INSERT INTO messages (id, chat_id, role, content, run_id, created_at)
         VALUES (?, ?, 'assistant', ?, ?, ?)`,
      )
      .bind(
        assistantId,
        input.chatId,
        input.assistantText,
        input.runId,
        now + 1,
      )
      .run()

    for (const source of input.sources) {
      await db
        .prepare(
          `INSERT INTO message_citations (
            id, message_id, point_id, kind, act_title, act_no, act_year,
            section_number, section_title, url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          assistantId,
          source.id,
          source.kind ?? 'act_section',
          source.actTitle ?? '',
          source.actNo ?? '',
          source.actYear ?? 0,
          source.sectionNumber ?? '',
          source.sectionTitle ?? '',
          source.url ?? null,
          now + 1,
        )
        .run()
    }
  } catch (err) {
    console.error('persistChatTurn failed', err)
  }
}
