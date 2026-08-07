import { z } from 'zod'
import type { LawLanguage } from '#/agent/retrieval/qdrant-types'

/** Later: case law / commentary collections behind the same port. */
export const SourceKindSchema = z.enum(['act_section', 'case', 'commentary'])
export type SourceKind = z.infer<typeof SourceKindSchema>

export const QueryFilterSchema = z.object({
  act_no: z.string().optional(),
  act_year: z.number().int().optional(),
  act_title_contains: z.string().optional(),
  section_number: z.string().optional(),
  language: z.enum(['english', 'bengali', 'mixed']).optional(),
  /** Default false → must_not is_repealed */
  includeRepealed: z.boolean().optional(),
})

export const PlannedQuerySchema = z.object({
  text: z.string().min(1),
  purpose: z.string().min(1),
  filters: QueryFilterSchema.optional(),
  sourceKinds: z.array(SourceKindSchema).optional(),
})

export const RetrievalPlanSchema = z.object({
  needsRetrieval: z.boolean(),
  reason: z.string(),
  intent: z.enum([
    'statutory_lookup',
    'procedure',
    'definition',
    'comparison',
    'advice_framing',
    'meta',
    'unclear',
  ]),
  jurisdictionHint: z.string().optional(),
  languagePreference: z
    .enum(['english', 'bengali', 'mixed', 'any'])
    .optional(),
  queries: z.array(PlannedQuerySchema).max(4),
  followUpsForUser: z.array(z.string()).optional(),
  sourceKinds: z.array(SourceKindSchema).optional(),
})

export type RetrievalPlan = z.infer<typeof RetrievalPlanSchema>
export type PlannedQuery = z.infer<typeof PlannedQuerySchema>
export type QueryFilter = z.infer<typeof QueryFilterSchema>

export const SufficiencyDecisionSchema = z.object({
  enough: z.boolean(),
  confidence: z.enum(['high', 'medium', 'low']),
  gaps: z.array(z.string()),
  nextQueries: z.array(PlannedQuerySchema).max(4).optional(),
  conflicts: z.array(z.string()).optional(),
})

export type SufficiencyDecision = z.infer<typeof SufficiencyDecisionSchema>

export type AnswerPolicy = {
  grounding: 'hybrid'
  mustCiteWhenUsingCorpus: true
  mustStateUncertaintyWhen: Array<
    'low_confidence' | 'empty_hits' | 'conflicts' | 'out_of_corpus'
  >
}

export const DEFAULT_ANSWER_POLICY: AnswerPolicy = {
  grounding: 'hybrid',
  mustCiteWhenUsingCorpus: true,
  mustStateUncertaintyWhen: [
    'low_confidence',
    'empty_hits',
    'conflicts',
    'out_of_corpus',
  ],
}

export type Passage = {
  kind: SourceKind
  id: string
  score: number
  /** Always display_content — never embedding_text. */
  text: string
  payload: import('#/agent/retrieval/qdrant-types').QdrantPayload
}

export type LanguagePreference = LawLanguage | 'any'

export const MAX_RETRIEVAL_ROUNDS = 3
export const MAX_QUERIES_PER_ROUND = 4
export const MAX_WORKING_SET = 12
export const TOP_K_PER_QUERY = 6
