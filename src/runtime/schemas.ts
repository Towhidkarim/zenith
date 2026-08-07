import { z } from 'zod'

const agentStepEventSchema = z.object({
  type: z.literal('step'),
  id: z.string(),
  label: z.string(),
  status: z.enum(['active', 'done']),
})

const agentReasoningEventSchema = z.object({
  type: z.literal('reasoning'),
  id: z.string(),
  delta: z.string(),
})

const agentSourceEventSchema = z.object({
  type: z.literal('source'),
  id: z.string(),
  actTitle: z.string(),
  actNo: z.string(),
  actYear: z.number(),
  sectionNumber: z.string(),
  sectionTitle: z.string(),
  subsectionNumber: z.string().optional(),
  chapterTitle: z.string().optional(),
  language: z.enum(['english', 'bengali', 'mixed']),
  excerpt: z.string().optional(),
  score: z.number().optional(),
  url: z.string().optional(),
  isRepealed: z.boolean().optional(),
  title: z.string(),
  kind: z.enum(['act_section', 'case', 'commentary']).optional(),
})

const agentTextEventSchema = z.object({
  type: z.literal('text'),
  id: z.string(),
  delta: z.string(),
})

const agentErrorEventSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
})

const agentDoneEventSchema = z.object({
  type: z.literal('done'),
})

export const AgentEventSchema = z.discriminatedUnion('type', [
  agentStepEventSchema,
  agentReasoningEventSchema,
  agentSourceEventSchema,
  agentTextEventSchema,
  agentErrorEventSchema,
  agentDoneEventSchema,
])

export const StoredAgentEventSchema = z.object({
  seq: z.number().int().positive(),
  event: AgentEventSchema,
  at: z.number().int(),
})

export type ParsedStoredAgentEvent = z.infer<typeof StoredAgentEventSchema>
