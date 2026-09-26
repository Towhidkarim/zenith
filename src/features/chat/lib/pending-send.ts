/** One-shot handoff: draft → first message after navigating to `/chat/$id`. */
let pending: { chatId: string; text: string } | null = null

export function stashPendingSend(chatId: string, text: string) {
  pending = { chatId, text }
}

export function takePendingSend(chatId: string): string | null {
  if (!pending || pending.chatId !== chatId) return null
  const text = pending.text
  pending = null
  return text
}
