import type { Passage, PlannedQuery, SourceKind } from '#/agent/plan'

export type LegalSearchInput = {
  queries: PlannedQuery[]
  topK: number
  /** Which corpora to search — v1 only act_section is implemented. */
  sourceKinds?: SourceKind[]
  signal?: AbortSignal
}

/**
 * Port for vector retrieval. Qdrant adapter implements this.
 * Keep Cloudflare / HTTP details out of runAgent.
 */
export interface LegalRetrieval {
  search(input: LegalSearchInput): Promise<Passage[]>
}
