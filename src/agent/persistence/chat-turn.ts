import type { AgentEvent } from '#/agent/types'

export type PersistChatTurnInput = {
  chatId?: string
  runId: string
  userText: string
  assistantText: string
  sources: Array<Extract<AgentEvent, { type: 'source' }>>
}

type D1Like = {
  prepare: (query: string) => {
    bind: (
      ...args: unknown[]
    ) => { run: () => Promise<unknown> }
  }
}

/**
 * Persist a finished chat turn when a D1-compatible db is provided.
 * No-op if `chatId` or `db` is missing — history UI can wire later.
 */
export async function persistChatTurn(
  input: PersistChatTurnInput,
  db?: D1Like,
): Promise<void> {
  if (!input.chatId || !db) return
  if (!input.assistantText.trim() && input.sources.length === 0) return

  const now = Date.now()

  try {
    await db
      .prepare(
        `INSERT INTO chats (id, updated_at) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`,
      )
      .bind(input.chatId, now)
      .run()

    const userId = crypto.randomUUID()
    await db
      .prepare(
        `INSERT INTO messages (id, chat_id, role, content, run_id, created_at)
         VALUES (?, ?, 'user', ?, ?, ?)`,
      )
      .bind(userId, input.chatId, input.userText, input.runId, now)
      .run()

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
          source.actTitle,
          source.actNo,
          source.actYear,
          source.sectionNumber,
          source.sectionTitle,
          source.url ?? null,
          now + 1,
        )
        .run()
    }
  } catch (err) {
    // Persistence must not fail the agent run (tables may not be migrated yet).
    console.error('persistChatTurn failed', err)
  }
}
