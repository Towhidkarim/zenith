import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ChatUIMessage } from '#/features/chat/types'

/** Backend chat endpoint (Hono, mounted under /api/rest). */
export const CHAT_API_PATH = '/api/rest/chat'

/**
 * Zenith chat hook — wraps AI SDK `useChat` with the project transport.
 * Streams multi-step responses (agent steps, reasoning, sources, text)
 * from the Hono `/api/rest/chat` route.
 */
export function useZenithChat() {
  return useChat<ChatUIMessage>({
    // Coalesce rapid stream deltas so Streamdown doesn't reparse every token.
    throttle: 80,
    transport: new DefaultChatTransport({
      api: CHAT_API_PATH,
      credentials: 'include',
    }),
  })
}
