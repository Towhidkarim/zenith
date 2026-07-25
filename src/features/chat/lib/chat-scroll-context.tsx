import { createContext, useContext } from 'react'
import type { StickToBottomInstance } from 'use-stick-to-bottom'

const ChatScrollContext = createContext<StickToBottomInstance | null>(null)

export const ChatScrollProvider = ChatScrollContext.Provider

/** Optional access to the transcript scroller (e.g. pause stick on accordion expand). */
export function useChatScroll() {
  return useContext(ChatScrollContext)
}
