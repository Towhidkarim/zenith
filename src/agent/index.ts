/**
 * Pure agent layer — no Hono, no Durable Objects.
 *
 * Mental model:
 *   runAgent({ messages, deps, signal }) → AsyncGenerator<AgentEvent>
 *
 * ChatRunDO injects deps (Qdrant + Gemini or stubs) and owns the event log.
 */

export type {
  AgentDeps,
  AgentEvent,
  AgentInput,
  AgentMessage,
  AgentStepStatus,
} from './types'
export type {
  Passage,
  RetrievalPlan,
  SufficiencyDecision,
  SourceKind,
} from './plan'
export { runAgent } from './run-agent'
export { createAgentDeps } from './deps'
export {
  agentConfig,
  getCorpus,
  getDefaultCorpus,
} from './config'
export type { AgentConfig, CorpusConfig } from './config'
export type { QdrantPayload, QdrantLegalPoint } from './retrieval/qdrant-types'
