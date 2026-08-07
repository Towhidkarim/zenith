/**
 * Domain events the agent emits while working.
 * Keep this transport-agnostic — not SSE, not AI SDK chunks.
 */

import type { SourceKind } from '#/agent/plan'
import type { LawLanguage } from '#/agent/retrieval/qdrant-types'
import type { AgentLlm } from '#/agent/ports/llm'
import type { LegalRetrieval } from '#/agent/ports/retrieval'

export type AgentStepStatus = 'active' | 'done'

export type AgentMessage = {
  role: 'user' | 'assistant' | 'system'
  text: string
}

export type AgentDeps = {
  retrieval: LegalRetrieval
  llm: AgentLlm
}

export type AgentInput = {
  runId?: string
  chatId?: string
  messages: AgentMessage[]
  signal?: AbortSignal
  deps: AgentDeps
}

export type AgentEvent =
  | {
      type: 'step'
      id: string
      label: string
      status: AgentStepStatus
    }
  | {
      type: 'reasoning'
      id: string
      delta: string
    }
  | {
      type: 'source'
      id: string
      actTitle: string
      actNo: string
      actYear: number
      sectionNumber: string
      sectionTitle: string
      subsectionNumber?: string
      chapterTitle?: string
      language: LawLanguage
      excerpt?: string
      score?: number
      url?: string
      isRepealed?: boolean
      /** Display label for UI / AI SDK source-url title */
      title: string
      kind?: SourceKind
    }
  | {
      type: 'text'
      id: string
      delta: string
    }
  | {
      type: 'error'
      message: string
    }
  | {
      type: 'done'
    }
