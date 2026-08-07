import type { ChatDataParts, ChatUIMessage } from '#/hono/lib/chat/types'

export type { ChatDataParts, ChatUIMessage }

/** Chat lifecycle status from the AI SDK `useChat` hook. */
export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error'

/** A single conversation starter shown on the empty state. */
export type SuggestionStarter = {
  id: string
  label: string
  prompt: string
}

/**
 * Minimal chat controller surface the shell needs.
 * Inject into ChatWindow for history/tests; otherwise ChatWindow uses useZenithChat().
 */
export type ZenithChatApi = {
  messages: ChatUIMessage[]
  status: ChatStatus
  sendMessage: (message: { text: string }) => void | Promise<void>
  /** Abort the client stream and cancel the server-side ChatRunDO. */
  stop: () => void | Promise<void>
  error: Error | undefined
  clearError: () => void
  regenerate: () => void | Promise<void>
}
