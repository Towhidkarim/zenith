import { getDefaultCorpus } from '#/agent/config'

export type EmbedConfig = {
  apiKey: string
  /** Google Generative Language API base. */
  baseUrl?: string
  model?: string
  /** Must match Qdrant collection vector size (see agent/config.ts). */
  dimensions?: number
}

/**
 * Embed a query with the same model + dims used at index time.
 * Defaults come from `agentConfig` corpora.
 */
export async function embedQuery(
  text: string,
  config: EmbedConfig,
  signal?: AbortSignal,
): Promise<number[]> {
  const corpus = getDefaultCorpus()
  const model = config.model ?? corpus.embeddingModel
  const dimensions = config.dimensions ?? corpus.embeddingDimensions
  const base =
    config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta'
  const url = `${base}/models/${model}:embedContent?key=${encodeURIComponent(config.apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      outputDimensionality: dimensions,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const message = `Embedding failed (${res.status}) model=${model} dims=${dimensions}: ${body.slice(0, 400)}`
    console.error('[zenith:embed]', message)
    throw new Error(message)
  }

  const json = (await res.json()) as {
    embedding?: { values?: number[] }
  }
  const values = json.embedding?.values
  if (!values || values.length === 0) {
    throw new Error('Embedding response missing values')
  }
  if (values.length !== dimensions) {
    throw new Error(
      `Embedding dim mismatch: got ${values.length}, expected ${dimensions} (agent/config.ts)`,
    )
  }
  return values
}
