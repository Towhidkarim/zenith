import type { z } from 'zod'
import type {
  RetrievalPlan,
  SufficiencyDecision,
  Passage,
} from '#/agent/plan'

export type LlmObjectCall<T> = {
  system: string
  prompt: string
  schema: z.ZodType<T>
  signal?: AbortSignal
}

export type LlmStreamCall = {
  system: string
  prompt: string
  signal?: AbortSignal
}

/**
 * Port for structured + streaming LLM calls.
 * Gemini (or stub) implements this; runAgent stays provider-agnostic.
 */
export interface AgentLlm {
  generateObject<T>(call: LlmObjectCall<T>): Promise<T>
  streamText(call: LlmStreamCall): AsyncIterable<string>
}

export type RouteContext = {
  userText: string
  historySnippet?: string
}

export type JudgeContext = {
  userText: string
  passages: Passage[]
  round: number
  priorGaps?: string[]
}

export type AnswerContext = {
  userText: string
  passages: Passage[]
  confidence: SufficiencyDecision['confidence']
  gaps: string[]
  conflicts: string[]
  followUps?: string[]
  skippedRetrieval: boolean
  planReason?: string
}

export type { RetrievalPlan, SufficiencyDecision }
