import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from 'ai'
import type { AgentEvent } from '#/agent'
import type { ChatUIMessage } from '#/hono/lib/chat/types'
import { StoredAgentEventSchema } from '#/runtime/schemas'

type StreamState = {
  textStarted: boolean
  textId: string | null
  reasoningStarted: boolean
  reasoningId: string | null
}

/**
 * Translate durable agent events → AI SDK UI message stream (what useChat expects).
 *
 * Input: NDJSON lines `{ seq, event, at }` from ChatRunDO.
 * Output: AI SDK UI message SSE response.
 */
export function createUIStreamFromAgentNdjson(
  ndjson: ReadableStream<Uint8Array>,
  originalMessages: ChatUIMessage[],
  headers?: HeadersInit,
) {
  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages,
    execute: async ({ writer }) => {
      const messageId = generateId()
      writer.write({ type: 'start', messageId })
      writer.write({ type: 'start-step' })

      const state: StreamState = {
        textStarted: false,
        textId: null,
        reasoningStarted: false,
        reasoningId: null,
      }

      for await (const event of readNdjsonEvents(ndjson)) {
        applyAgentEvent(event, writer, state)
      }

      if (state.reasoningStarted && state.reasoningId) {
        writer.write({ type: 'reasoning-end', id: state.reasoningId })
      }
      if (state.textStarted && state.textId) {
        writer.write({ type: 'text-end', id: state.textId })
      }
      writer.write({ type: 'finish-step' })
      writer.write({ type: 'finish', finishReason: 'stop' })
    },
  })

  return createUIMessageStreamResponse({
    stream,
    headers: {
      ...headers,
      'Access-Control-Expose-Headers': 'X-Zenith-Run-Id',
    },
  })
}

async function* readNdjsonEvents(
  ndjson: ReadableStream<Uint8Array>,
): AsyncGenerator<AgentEvent> {
  const reader = ndjson.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let newlineIdx = buffer.indexOf('\n')
      while (newlineIdx !== -1) {
        const line = buffer.slice(0, newlineIdx).trim()
        buffer = buffer.slice(newlineIdx + 1)
        newlineIdx = buffer.indexOf('\n')
        if (!line) continue

        let parsedLine: unknown
        try {
          parsedLine = JSON.parse(line)
        } catch {
          continue
        }
        const parsed = StoredAgentEventSchema.safeParse(parsedLine)
        if (!parsed.success) continue
        yield parsed.data.event
      }
    }

    const tail = buffer.trim()
    if (tail) {
      try {
        const parsed = StoredAgentEventSchema.safeParse(JSON.parse(tail))
        if (parsed.success) yield parsed.data.event
      } catch {
        // ignore partial tail
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function applyAgentEvent(
  event: AgentEvent,
  writer: { write: (chunk: never) => void },
  state: StreamState,
) {
  // AI SDK writer is strongly typed per chunk; cast keeps this adapter readable.
  const write = (chunk: object) => writer.write(chunk as never)

  switch (event.type) {
    case 'step':
      write({
        type: 'data-agent-step',
        id: event.id,
        data: {
          id: event.id,
          label: event.label,
          status: event.status,
        },
      })
      break

    case 'reasoning':
      if (!state.reasoningStarted) {
        state.reasoningStarted = true
        state.reasoningId = event.id
        write({ type: 'reasoning-start', id: event.id })
      }
      write({
        type: 'reasoning-delta',
        id: state.reasoningId ?? event.id,
        delta: event.delta,
      })
      break

    case 'source': {
      const title = event.title
      const url = event.url ?? `#cite-${event.id}`
      write({
        type: 'source-url',
        sourceId: event.id,
        url,
        title,
      })
      break
    }

    case 'text':
      if (!state.textStarted) {
        if (state.reasoningStarted && state.reasoningId) {
          write({ type: 'reasoning-end', id: state.reasoningId })
          state.reasoningStarted = false
        }
        state.textStarted = true
        state.textId = event.id
        write({ type: 'text-start', id: event.id })
      }
      write({
        type: 'text-delta',
        id: state.textId ?? event.id,
        delta: event.delta,
      })
      break

    case 'error':
      write({ type: 'error', errorText: event.message })
      break

    case 'done':
      break
  }
}
