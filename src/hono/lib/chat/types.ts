import type { UIMessage } from 'ai'
import type { ChatMessage, ChatPostBody } from '#/hono/schemas/chat'

/**
 * Custom data parts for multi-step agent progress.
 * Consumed by AI SDK UI (`useChat`) as `data-agent-step` parts.
 */
export type ChatDataParts = {
  'agent-step': {
    id: string
    label: string
    status: 'active' | 'done'
  }
}

/** Metadata bag on chat messages (open for future product fields). */
export type ChatMessageMetadata = Record<string, unknown>

export type ChatUIMessage = UIMessage<ChatMessageMetadata, ChatDataParts>

/** Narrow validated request messages into UIMessage-compatible values. */
export function toChatUIMessages(messages: ChatPostBody['messages']): ChatUIMessage[] {
  return messages.map((message) => {
    const uiMessage: ChatUIMessage = {
      id: message.id ?? crypto.randomUUID(),
      role: message.role,
      parts: message.parts as ChatUIMessage['parts'],
    }

    if (message.metadata !== undefined && message.metadata !== null) {
      uiMessage.metadata = message.metadata as ChatMessageMetadata
    }

    return uiMessage
  })
}

export type { ChatMessage, ChatPostBody }
