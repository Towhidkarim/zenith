import { useCallback, useEffect, useState } from 'react'
import { getOwnedChatIds, rememberChatId } from '#/features/chat/lib/owned-chats'

export type SidebarChat = {
  id: string
  title: string | null
  updatedAt: number
}

const CHATS_API = '/api/rest/chats'

/** Survives `/` ↔ `/chat/$chatId` remounts so titles don't blank out. */
let sidebarCache: SidebarChat[] = []

function publishChats(
  next: SidebarChat[],
  setChats: (chats: SidebarChat[]) => void,
) {
  sidebarCache = next
  setChats(next)
}

/**
 * Anonymous sidebar: localStorage ids → GET /api/rest/chats?ids=
 * Titles only. The open thread is loaded separately.
 */
export function useChatSidebarList() {
  const [chats, setChats] = useState<SidebarChat[]>(sidebarCache)
  const [loading, setLoading] = useState(sidebarCache.length === 0)

  const refresh = useCallback(async () => {
    const ids = getOwnedChatIds()
    if (ids.length === 0) {
      publishChats([], setChats)
      setLoading(false)
      return
    }

    if (sidebarCache.length === 0) setLoading(true)
    try {
      const res = await fetch(
        `${CHATS_API}?ids=${encodeURIComponent(ids.join(','))}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        console.error('[zenith:chats:list]', res.status)
        return
      }
      const data = (await res.json()) as {
        chats: Array<{
          id: string
          title: string | null
          updatedAt: number
        }>
      }
      // Keep localStorage order preference when possible.
      const byId = new Map(data.chats.map((c) => [c.id, c]))
      const ordered: SidebarChat[] = []
      for (const id of ids) {
        const row = byId.get(id)
        if (row) ordered.push(row)
      }
      for (const row of data.chats) {
        if (!ordered.some((c) => c.id === row.id)) ordered.push(row)
      }
      publishChats(ordered, setChats)
    } catch (err) {
      console.error('[zenith:chats:list]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const trackChat = useCallback(
    (chatId: string, optimistic?: { title: string }) => {
      rememberChatId(chatId)
      if (optimistic) {
        setChats((prev) => {
          const rest = prev.filter((c) => c.id !== chatId)
          const next = [
            {
              id: chatId,
              title: optimistic.title,
              updatedAt: Date.now(),
            },
            ...rest,
          ]
          sidebarCache = next
          return next
        })
      }
      void refresh()
    },
    [refresh],
  )

  return { chats, loading, refresh, trackChat }
}

export async function fetchChatThread(chatId: string) {
  const res = await fetch(`${CHATS_API}/${encodeURIComponent(chatId)}`, {
    credentials: 'include',
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to load chat (${res.status})`)
  }
  return (await res.json()) as {
    chat: { id: string; title: string | null; updatedAt: number }
    messages: unknown[]
  }
}
