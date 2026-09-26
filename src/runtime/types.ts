import type { AgentEvent } from '#/agent/types'

export type RunStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled'

export type StartChatRunInput = {
  runId: string
  /** useChat conversation id — D1 chats.id / URL param. */
  chatId?: string
  /** Better Auth user id when signed in. */
  userId?: string | null
  messages: Array<{ role: 'user' | 'assistant' | 'system'; text: string }>
}

export type StartChatRunResult = {
  runId: string
  status: RunStatus
  eventCount: number
}

export type ChatRunStatusResult = {
  status: RunStatus
  eventCount: number
  nextSeq: number
}

export type StoredAgentEvent = {
  seq: number
  event: AgentEvent
  at: number
}

/**
 * Runtime port — how Hono starts / subscribes / cancels chat runs.
 * Cloudflare implements this with ChatRunDO RPC (`createDoChatRunRuntime`).
 */
export interface ChatRunRuntime {
  /** Idempotent start — no-op if the run already started or finished. */
  start(input: StartChatRunInput): Promise<StartChatRunResult>
  /** Start (if needed) and return a live NDJSON event stream. */
  startAndSubscribe(
    input: StartChatRunInput,
    fromSeq?: number,
  ): Promise<ReadableStream<Uint8Array>>
  /** Replay from `fromSeq`, then live events until terminal status. */
  subscribe(runId: string, fromSeq?: number): Promise<ReadableStream<Uint8Array>>
  cancel(runId: string): Promise<{ ok: true; status: RunStatus }>
  getStatus(runId: string): Promise<ChatRunStatusResult>
}
