import { useCallback, useMemo, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ChatUIMessage, ZenithChatApi } from '#/features/chat/types'

/** Backend chat endpoint (Hono, mounted under /api/rest). */
export const CHAT_API_PATH = '/api/rest/chat'

const RUN_ID_HEADER = 'X-Zenith-Run-Id'

export type UseZenithChatOptions = {
  /** Stable chat id for multi-conversation / resume later. */
  id?: string
  /** Seed messages (e.g. loaded history). */
  messages?: ChatUIMessage[]
  /** Override API path (defaults to CHAT_API_PATH). */
  api?: string
  /** Fired when a stream finishes (success, abort, or error). */
  onFinish?: () => void
}

/**
 * Zenith chat hook — wraps AI SDK `useChat` with the project transport.
 * Streams multi-step responses (agent steps, reasoning, sources, text)
 * from the Hono `/api/rest/chat` route.
 *
 * Stop: aborts the client stream and DELETE-cancels the ChatRunDO
 * (disconnect alone does not halt the agent).
 */
export function useZenithChat(
  options: UseZenithChatOptions = {},
): ZenithChatApi {
  const { id, messages, api = CHAT_API_PATH, onFinish } = options
  const activeRunIdRef = useRef<string | null>(null)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api,
        credentials: 'include',
        fetch: async (input, init) => {
          const res = await fetch(input, init)
          const runId = res.headers.get(RUN_ID_HEADER)
          if (runId) activeRunIdRef.current = runId

          if (!res.ok) {
            const raw = await res.text().catch(() => '')
            let detail = raw
            try {
              const parsed = JSON.parse(raw) as { error?: string }
              if (parsed.error) detail = parsed.error
            } catch {
              /* keep raw */
            }
            const message = detail
              ? `${res.status} ${res.statusText}: ${detail}`
              : `${res.status} ${res.statusText}`
            console.error('[zenith:chat:http]', message)
            throw new Error(message)
          }
          return res
        },
      }),
    [api],
  )

  const chat = useChat<ChatUIMessage>({
    id,
    messages,
    // Keep stream updates snappy for visible token growth.
    throttle: 32,
    transport,
    onError: (err) => {
      console.error('[zenith:chat]', err)
    },
    onFinish: () => {
      activeRunIdRef.current = null
      onFinishRef.current?.()
    },
  })

  const stop = useCallback(async () => {
    const runId = activeRunIdRef.current
    chat.stop()
    if (!runId) return

    try {
      const res = await fetch(`${api}/runs/${encodeURIComponent(runId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        console.error(
          '[zenith:chat:cancel]',
          res.status,
          await res.text().catch(() => ''),
        )
      }
    } catch (err) {
      console.error('[zenith:chat:cancel]', err)
    } finally {
      if (activeRunIdRef.current === runId) {
        activeRunIdRef.current = null
      }
    }
  }, [api, chat])

  const sendMessage = useCallback(
    async (message: { text: string }) => {
      if (chat.status === 'streaming' || chat.status === 'submitted') return
      await chat.sendMessage(message)
    },
    [chat],
  )

  const regenerate = useCallback(async () => {
    if (chat.status === 'streaming' || chat.status === 'submitted') return
    await chat.regenerate()
  }, [chat])

  return {
    messages: chat.messages,
    status: chat.status,
    sendMessage,
    stop,
    error: chat.error,
    clearError: chat.clearError,
    regenerate,
  }
}
