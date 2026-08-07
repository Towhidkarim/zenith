/**
 * Normalize provider / fetch errors into a readable string + always log.
 * AI SDK / Qdrant often surface as opaque "Bad Request" without a body.
 */
export function logAndFormatError(context: string, err: unknown): string {
  const detail = extractErrorDetail(err)
  const message = detail ? `${context}: ${detail}` : `${context}: unknown error`

  console.error(`[zenith:${context}]`, message, err)
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>
    if (record.data !== undefined) console.error(`[zenith:${context}:data]`, record.data)
    if (record.cause !== undefined) console.error(`[zenith:${context}:cause]`, record.cause)
    if (record.response !== undefined) {
      console.error(`[zenith:${context}:response]`, record.response)
    }
  }

  return message
}

function extractErrorDetail(err: unknown): string {
  if (err == null) return ''
  if (typeof err === 'string') return err

  if (err instanceof Error) {
    const parts = [err.message]
    const anyErr = err as Error & {
      statusCode?: number
      status?: number
      url?: string
      data?: unknown
      responseBody?: string
      cause?: unknown
    }
    if (anyErr.statusCode ?? anyErr.status) {
      parts.push(`status=${anyErr.statusCode ?? anyErr.status}`)
    }
    if (anyErr.url) parts.push(`url=${anyErr.url}`)
    if (typeof anyErr.responseBody === 'string' && anyErr.responseBody) {
      parts.push(anyErr.responseBody.slice(0, 400))
    } else if (anyErr.data !== undefined) {
      try {
        parts.push(JSON.stringify(anyErr.data).slice(0, 400))
      } catch {
        /* ignore */
      }
    }
    if (anyErr.cause) parts.push(`cause=${extractErrorDetail(anyErr.cause)}`)
    return parts.filter(Boolean).join(' | ')
  }

  if (typeof err === 'object') {
    try {
      return JSON.stringify(err).slice(0, 500)
    } catch {
      return String(err)
    }
  }

  return String(err)
}
