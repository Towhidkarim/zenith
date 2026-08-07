import type { Passage } from '#/agent/plan'
import type { QdrantPayload } from '#/agent/retrieval/qdrant-types'
import type { AgentEvent } from '#/agent/types'

export function passageKey(p: Passage): string {
  const { act_no, act_year, section_number, subsection_number } = p.payload
  return [act_no, act_year, section_number, subsection_number ?? ''].join('|')
}

export function mergePassages(
  existing: Passage[],
  incoming: Passage[],
  max: number,
): Passage[] {
  const map = new Map<string, Passage>()
  for (const p of existing) map.set(passageKey(p), p)
  for (const p of incoming) {
    const key = passageKey(p)
    const prev = map.get(key)
    if (!prev || p.score > prev.score) map.set(key, p)
  }
  return [...map.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
}

export function formatCitationLabel(payload: QdrantPayload): string {
  const base = `${payload.act_title} (${payload.act_year}) · s.${payload.section_number}`
  if (payload.subsection_number) {
    return `${base}(${payload.subsection_number})`
  }
  return base
}

export function passageToSourceEvent(passage: Passage): AgentEvent {
  const { payload } = passage
  const label = formatCitationLabel(payload)
  return {
    type: 'source',
    id: passage.id,
    actTitle: payload.act_title,
    actNo: payload.act_no,
    actYear: payload.act_year,
    sectionNumber: payload.section_number,
    sectionTitle: payload.section_title,
    subsectionNumber: payload.subsection_number,
    chapterTitle: payload.chapter_title,
    language: payload.language,
    excerpt: payload.display_content.slice(0, 240),
    score: passage.score,
    url: payload.source_url,
    isRepealed: payload.is_repealed,
    title: label,
    kind: passage.kind,
  }
}

export function passagesForPrompt(passages: Passage[]): string {
  if (passages.length === 0) return '(No retrieved passages.)'
  return passages
    .map((p, i) => {
      const label = formatCitationLabel(p.payload)
      return `[${i + 1}] ${label}\n${p.text}`
    })
    .join('\n\n---\n\n')
}
