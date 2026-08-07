/** Qdrant payload contract for Bangladesh acts/sections. */

export type LawLanguage = 'english' | 'bengali' | 'mixed'

export interface QdrantPayload {
  act_title: string
  act_no: string
  act_year: number
  is_repealed: boolean
  language: LawLanguage

  chapter_title?: string
  section_number: string
  section_title: string
  subsection_number?: string

  /** Formatted string fed to the embedding model at index time. */
  embedding_text: string
  /** Raw text injected into the LLM RAG prompt. */
  display_content: string

  categories?: string[]
  source_url?: string
}

export interface QdrantLegalPoint {
  id: string
  vector: number[]
  payload: QdrantPayload
}
