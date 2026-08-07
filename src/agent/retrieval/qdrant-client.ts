import { QdrantClient } from '@qdrant/js-client-rest'
import { getCorpus, type CorpusConfig } from '#/agent/config'
import type { Passage, PlannedQuery } from '#/agent/plan'
import type { LegalRetrieval, LegalSearchInput } from '#/agent/ports/retrieval'
import { embedQuery } from '#/agent/retrieval/embed'
import { mergePassages } from '#/agent/retrieval/map-passage'
import type { QdrantPayload } from '#/agent/retrieval/qdrant-types'

export type QdrantRetrievalConfig = {
  url: string
  apiKey: string
  geminiApiKey: string
  /** Override corpus id from agentConfig (default: defaultCorpusId). */
  corpusId?: string
  /** Optional env override for collection name. */
  collection?: string
}

/**
 * MVP Qdrant adapter: embed query → vector search → return payloads.
 * Collection / dims / embedding model come from `#/agent/config`.
 */
export function createQdrantLegalRetrieval(
  config: QdrantRetrievalConfig,
): LegalRetrieval {
  const corpus: CorpusConfig = getCorpus(config.corpusId)
  const collection = config.collection ?? corpus.collection
  const client = new QdrantClient({
    url: config.url.replace(/\/$/, ''),
    apiKey: config.apiKey,
  })

  return {
    async search(input: LegalSearchInput): Promise<Passage[]> {
      const kinds = input.sourceKinds ?? [corpus.kind]
      if (!kinds.includes(corpus.kind)) {
        return []
      }

      let merged: Passage[] = []
      for (const query of input.queries) {
        try {
          const vector = await embedQuery(
            query.text,
            {
              apiKey: config.geminiApiKey,
              model: corpus.embeddingModel,
              dimensions: corpus.embeddingDimensions,
            },
            input.signal,
          )

          const hits = await client.search(collection, {
            vector,
            limit: input.topK,
            with_payload: true,
          })

          const passages: Passage[] = []
          for (const h of hits) {
            const payload = h.payload as QdrantPayload | null | undefined
            if (!payload?.display_content) continue
            passages.push({
              kind: corpus.kind,
              id: String(h.id),
              score: h.score,
              text: payload.display_content,
              payload,
            })
          }

          merged = mergePassages(
            merged,
            passages,
            input.topK * input.queries.length,
          )
        } catch (err) {
          const message = formatErr(err)
          console.error('[zenith:qdrant]', {
            collection,
            dims: corpus.embeddingDimensions,
            model: corpus.embeddingModel,
            query: query.text.slice(0, 120),
            error: message,
            data:
              err && typeof err === 'object' && 'data' in err
                ? JSON.stringify((err as { data: unknown }).data)
                : undefined,
          })
          throw new Error(`Qdrant search failed: ${message}`)
        }
      }
      return merged
    },
  }
}

function formatErr(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    try {
      const data = (err as { data: unknown; message?: string }).data
      const msg = (err as { message?: string }).message ?? 'error'
      return `${msg} | ${JSON.stringify(data)}`
    } catch {
      /* fall through */
    }
  }
  if (err instanceof Error) return err.message
  return String(err)
}

export type { PlannedQuery }
