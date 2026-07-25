import { createDummyChatStreamResponse } from '#/hono/lib/chat/dummy-stream'
import type { ChatUIMessage } from '#/hono/lib/chat/types'

export type CreateChatStreamContext = {
  env: Env
}

/**
 * Single replaceable seam for chat inference.
 * Swap the body for a real LLM producer (`llm-stream.ts`) without touching the route.
 */
export function createChatStreamResponse(
  messages: ChatUIMessage[],
  _ctx: CreateChatStreamContext,
) {
  return createDummyChatStreamResponse(messages)
}
