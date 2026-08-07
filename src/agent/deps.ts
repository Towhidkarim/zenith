import { agentConfig, getDefaultCorpus } from '#/agent/config'
import { createGeminiAgentLlm } from '#/agent/llm/gemini'
import {
  createStubAgentLlm,
  createStubLegalRetrieval,
} from '#/agent/llm/stub'
import { createQdrantLegalRetrieval } from '#/agent/retrieval/qdrant-client'
import type { AgentDeps } from '#/agent/types'

export type AgentEnvBindings = {
  GEMINI_API_KEY?: string
  QDRANT_URL?: string
  QDRANT_API_KEY?: string
  /** Optional override; defaults to agentConfig corpora collection. */
  QDRANT_COLLECTION?: string
}

/**
 * Build agent deps from plain bindings (portable — no Cloudflare imports).
 * Pass `{}` / omit for stubs; Workers wire real secrets via `import { env }`.
 */
export function createAgentDeps(bindings: AgentEnvBindings = {}): AgentDeps {
  const geminiKey = bindings.GEMINI_API_KEY
  const qdrantUrl = bindings.QDRANT_URL
  const qdrantKey = bindings.QDRANT_API_KEY
  const corpus = getDefaultCorpus()

  const llm = geminiKey
    ? createGeminiAgentLlm({
        apiKey: geminiKey,
        model: agentConfig.geminiChatModel,
      })
    : createStubAgentLlm()

  const retrieval =
    geminiKey && qdrantUrl && qdrantKey
      ? createQdrantLegalRetrieval({
          url: qdrantUrl,
          apiKey: qdrantKey,
          geminiApiKey: geminiKey,
          collection: bindings.QDRANT_COLLECTION ?? corpus.collection,
        })
      : createStubLegalRetrieval()

  return { llm, retrieval }
}
