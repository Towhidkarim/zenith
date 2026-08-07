import { generateId } from 'ai'
import { toAgentMessages } from '#/hono/lib/chat/agent-messages'
import type { ChatUIMessage } from '#/hono/lib/chat/types'
import { createUIStreamFromAgentNdjson } from '#/hono/lib/chat/to-ui-stream'
import { createDoChatRunRuntime } from '#/runtime'

export type CreateChatStreamOptions = {
  /** useChat conversation id — metadata on the run, not the per-turn run id. */
  chatId?: string
  /** Reconnect to an in-flight or completed run without starting a new one. */
  resume?: {
    runId: string
    fromSeq?: number
  }
}

/**
 * Hono chat inference seam:
 * 1. Start or resume a DO-owned run
 * 2. Subscribe to NDJSON AgentEvents
 * 3. Translate to AI SDK UI SSE for useChat
 */
export async function createChatStreamResponse(
  messages: ChatUIMessage[],
  options: CreateChatStreamOptions = {},
) {
  const runtime = createDoChatRunRuntime()

  if (options.resume) {
    const { runId, fromSeq = 0 } = options.resume
    const ndjson = await runtime.subscribe(runId, fromSeq)
    return createUIStreamFromAgentNdjson(ndjson, messages, {
      'X-Zenith-Run-Id': runId,
    })
  }

  const runId = generateId()
  const ndjson = await runtime.startAndSubscribe(
    {
      runId,
      chatId: options.chatId,
      messages: toAgentMessages(messages),
    },
    0,
  )

  return createUIStreamFromAgentNdjson(ndjson, messages, {
    'X-Zenith-Run-Id': runId,
  })
}
