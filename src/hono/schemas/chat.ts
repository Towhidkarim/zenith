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

/** Agent-step data part payload (mirrored by ChatDataParts['agent-step']). */
export const AgentStepDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(['active', 'done']),
})

export type AgentStepData = z.infer<typeof AgentStepDataSchema>

/** Open part: text + agent-step are strict; other AI SDK shapes stay loose. */
const chatMessagePartSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('data-agent-step'),
    id: z.string().optional(),
    data: AgentStepDataSchema,
  }),
  z.looseObject({
    type: z.string(),
  }),
])

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(chatMessagePartSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
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
