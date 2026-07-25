import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ChatUIMessage, ZenithChatApi } from '#/features/chat/types'

/** Backend chat endpoint (Hono, mounted under /api/rest). */
export const CHAT_API_PATH = '/api/rest/chat'

export type UseZenithChatOptions = {
  /** Stable chat id for multi-conversation / resume later. */
  id?: string
  /** Seed messages (e.g. loaded history). */
  messages?: ChatUIMessage[]
  /** Override API path (defaults to CHAT_API_PATH). */
  api?: string
}

/**
 * Zenith chat hook — wraps AI SDK `useChat` with the project transport.
 * Streams multi-step responses (agent steps, reasoning, sources, text)
 * from the Hono `/api/rest/chat` route.
 */
export function useZenithChat(options: UseZenithChatOptions = {}): ZenithChatApi {
  const { id, messages, api = CHAT_API_PATH } = options

  const chat = useChat<ChatUIMessage>({
    id,
    messages,
    // Coalesce rapid stream deltas so Streamdown doesn't reparse every token.
    throttle: 80,
    transport: new DefaultChatTransport({
      api,
      credentials: 'include',
    }),
  })

  return {
    messages: chat.messages,
    status: chat.status,
    sendMessage: chat.sendMessage,
    stop: chat.stop,
    error: chat.error,
    clearError: chat.clearError,
    regenerate: chat.regenerate,
  }
}
