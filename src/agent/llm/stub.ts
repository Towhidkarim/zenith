import {
  RetrievalPlanSchema,
  SufficiencyDecisionSchema,
  type Passage,
  type RetrievalPlan,
  type SufficiencyDecision,
} from '#/agent/plan'
import type { AgentLlm } from '#/agent/ports/llm'
import type { LegalRetrieval } from '#/agent/ports/retrieval'
import type { QdrantPayload } from '#/agent/retrieval/qdrant-types'

function looksLegal(text: string): boolean {
  return /act|section|law|legal|court|bail|arrest|contract|rights?|penalt|ordinance|code|জামিন|আইন|ধারা/i.test(
    text,
  )
}

function isMeta(text: string): boolean {
  return /^(hi|hello|hey|thanks|thank you|what can you do|who are you)\b/i.test(
    text.trim(),
  )
}

function extractUserText(prompt: string): string {
  const userMatch = prompt.match(/User question:\n([\s\S]*?)(?:\n\n|$)/)
  return userMatch?.[1]?.trim() ?? prompt
}

/** Heuristic router / planner / judge when no LLM is configured. */
export function createStubAgentLlm(): AgentLlm {
  return {
    async generateObject({ schema, prompt }) {
      if (prompt.includes('TASK: route')) {
        return schema.parse(stubRoute(extractUserText(prompt))) as never
      }
      if (prompt.includes('TASK: judge')) {
        return schema.parse(stubJudge(prompt)) as never
      }
      // Fallback: try both known schemas
      try {
        return RetrievalPlanSchema.parse(stubRoute(extractUserText(prompt))) as never
      } catch {
        return SufficiencyDecisionSchema.parse(stubJudge(prompt)) as never
      }
    },

    async *streamText({ prompt }) {
      const answer = stubAnswer(prompt)
      const chunk = 24
      for (let i = 0; i < answer.length; i += chunk) {
        yield answer.slice(i, i + chunk)
      }
    },
  }
}

function stubRoute(userText: string): RetrievalPlan {
  if (isMeta(userText) || !looksLegal(userText)) {
    return {
      needsRetrieval: false,
      reason: isMeta(userText)
        ? 'Greeting or capability question'
        : 'Does not appear to require a statutory lookup',
      intent: isMeta(userText) ? 'meta' : 'advice_framing',
      queries: [],
      sourceKinds: ['act_section'],
    }
  }
  return {
    needsRetrieval: true,
    reason: 'Question appears to depend on Bangladesh statutory law',
    intent: 'statutory_lookup',
    languagePreference: /[\u0980-\u09FF]/.test(userText) ? 'bengali' : 'english',
    queries: [
      {
        text: userText.slice(0, 400),
        purpose: 'Primary statutory search',
        sourceKinds: ['act_section'],
      },
    ],
    sourceKinds: ['act_section'],
  }
}

function stubJudge(prompt: string): SufficiencyDecision {
  const hasPassages = /\[1\]/.test(prompt)
  if (!hasPassages) {
    return {
      enough: false,
      confidence: 'low',
      gaps: ['No matching sections retrieved'],
      nextQueries: [
        {
          text: 'relevant statutory provisions Bangladesh',
          purpose: 'Broaden search after empty hits',
        },
      ],
    }
  }
  return {
    enough: true,
    confidence: 'medium',
    gaps: [],
  }
}

function stubAnswer(prompt: string): string {
  const hasPassages = /\[1\]/.test(prompt)
  if (!hasPassages) {
    return [
      'I could not find matching provisions in the loaded Bangladesh acts for this question.',
      '',
      '**Uncertainty:** This answer is incomplete — the corpus may not cover the topic, or a clearer act/section reference would help.',
      '',
      'This is not legal advice.',
    ].join('\n')
  }
  return [
    'Based on the retrieved statutory passages, here is a grounded summary.',
    '',
    '**From the corpus:** See the cited sections below for the controlling text.',
    '',
    '**General framing:** Apply the cited sections to your facts carefully; local procedure may add requirements not in this excerpt.',
    '',
    '**Uncertainty:** Medium confidence — verify the full Act text and any amendments not present in the retrieved snippets.',
    '',
    'This is not legal advice.',
  ].join('\n')
}

/** In-memory fake retrieval for UI path without Qdrant. */
export function createStubLegalRetrieval(): LegalRetrieval {
  return {
    async search(input) {
      const q = input.queries[0]?.text ?? 'sample'
      const payload: QdrantPayload = {
        act_title: 'Sample Demonstration Act',
        act_no: 'DEMO',
        act_year: 2020,
        is_repealed: false,
        language: 'english',
        section_number: '3',
        section_title: 'Illustrative provision',
        embedding_text: q,
        display_content: `Section 3 — Illustrative provision.\n\nFor demonstration purposes related to: “${q.slice(0, 120)}”. Replace with live Qdrant hits when credentials are configured.`,
        source_url: 'https://example.com/bd-laws/demo',
      }
      const passage: Passage = {
        kind: 'act_section',
        id: 'stub-demo-section-3',
        score: 0.72,
        text: payload.display_content,
        payload,
      }
      return [passage]
    },
  }
}
