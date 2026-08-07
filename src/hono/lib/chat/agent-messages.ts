import type { ChatUIMessage } from '#/hono/lib/chat/types'

/** Narrow UI messages to the plain text history the pure agent expects today. */
export function toAgentMessages(messages: ChatUIMessage[]) {
  return messages.map((message) => ({
    role: message.role as 'user' | 'assistant' | 'system',
    text: message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join(''),
  }))
}
