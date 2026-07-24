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
