import { z } from 'zod'
import { OkResponseSchema } from './common'

/**
 * Chat request/response schemas.
 *
 * Convention:
 * - `*BodySchema`     → JSON request body (zValidator('json', …))
 * - `*QuerySchema`    → query string
 * - `*ResponseSchema` → JSON success responses (c.json)
 * - Streaming routes document the protocol in comments; SSE is not Zod-validated
 *   (AI SDK UI message stream), but the *request* still is.
 */

/** Open part: text is strict; other AI SDK part shapes are accepted loosely. */
const chatMessagePartSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.looseObject({
    type: z.string(),
  }),
])

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(chatMessagePartSchema).default([]),
  metadata: z.unknown().optional(),
})

export const ChatPostBodySchema = z.object({
  id: z.string().optional(),
  messages: z.array(ChatMessageSchema).default([]),
})

export type ChatPostBody = z.infer<typeof ChatPostBodySchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatHealthResponseSchema = OkResponseSchema.extend({
  route: z.literal('chat'),
  mode: z.enum(['dummy-stream', 'llm']),
})

export type ChatHealthResponse = z.infer<typeof ChatHealthResponseSchema>
