import { useEffect } from 'react'

const BRAND = 'Zenith'

/**
 * Sync `document.title` with the active chat surface.
 * Draft (`/`) → "Zenith"; conversation → "{title} · Zenith".
 */
export function useChatDocumentTitle(options: {
  chatId?: string
  title?: string | null
}) {
  const { chatId, title } = options

  useEffect(() => {
    if (!chatId) {
      document.title = BRAND
      return
    }

    const trimmed = title?.trim()
    document.title = trimmed ? `${trimmed} · ${BRAND}` : BRAND
  }, [chatId, title])
}
