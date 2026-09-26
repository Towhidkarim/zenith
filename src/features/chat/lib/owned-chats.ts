const STORAGE_KEY = 'zenith.chatIds'
const MAX_IDS = 50

function readIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ids.slice(0, MAX_IDS)),
  )
}

/** Ordered chat ids owned by this browser (anonymous ownership). */
export function getOwnedChatIds(): string[] {
  return readIds()
}

/** Move `chatId` to the front of the ownership list. */
export function rememberChatId(chatId: string) {
  const next = [chatId, ...readIds().filter((id) => id !== chatId)]
  writeIds(next)
}

export function removeOwnedChatId(chatId: string) {
  writeIds(readIds().filter((id) => id !== chatId))
}
