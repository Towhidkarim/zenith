import { useNavigate } from '@tanstack/react-router'
import { generateId } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { titleFromUserText } from '#/agent/persistence/chat-turn'
import { ChatAuthBar } from '#/features/chat/compositions/chat-auth-bar'
import { ChatSidebar } from '#/features/chat/compositions/chat-sidebar'
import { ChatWindow } from '#/features/chat/compositions/chat-window'
import { useChatDocumentTitle } from '#/features/chat/hooks/use-chat-document-title'
import {
  fetchChatThread,
  useChatSidebarList,
} from '#/features/chat/hooks/use-chat-sidebar-list'
import { useZenithChat } from '#/features/chat/hooks/use-zenith-chat'
import { getOwnedChatIds } from '#/features/chat/lib/owned-chats'
import {
  stashPendingSend,
  takePendingSend,
} from '#/features/chat/lib/pending-send'
import type { ChatUIMessage, ZenithChatApi } from '#/features/chat/types'

type ChatShellProps = {
  /**
   * Conversation id from `/chat/$chatId`.
   * Omit on `/` for a draft — id is minted only on first send.
   */
  chatId?: string
}

type ActivePane =
  | { kind: 'draft'; key: number }
  | { kind: 'chat'; id: string; messages: ChatUIMessage[]; title: string | null }

/**
 * Persistent chat chrome (sidebar + auth bar).
 * Swaps the center pane only when the next thread is ready (no blank flash).
 */
export function ChatShell({ chatId }: ChatShellProps) {
  const navigate = useNavigate()
  const { chats, loading: sidebarLoading, trackChat, refresh } =
    useChatSidebarList()
  const [draftKey, setDraftKey] = useState(0)
  const [active, setActive] = useState<ActivePane | null>(() =>
    chatId ? null : { kind: 'draft', key: 0 },
  )
  const requestIdRef = useRef(0)
  const isDraft = !chatId
  const conversationTitle =
    chatId != null
      ? (chats.find((c) => c.id === chatId)?.title ??
          (active?.kind === 'chat' && active.id === chatId
            ? active.title
            : null))
      : null

  useChatDocumentTitle({
    chatId,
    title: conversationTitle,
  })

  useEffect(() => {
    if (!chatId) {
      setActive({ kind: 'draft', key: draftKey })
      return
    }

    // Unowned / brand-new id — show empty composer immediately.
    if (!getOwnedChatIds().includes(chatId)) {
      setActive({ kind: 'chat', id: chatId, messages: [], title: null })
      return
    }

    const requestId = ++requestIdRef.current
    void (async () => {
      try {
        const thread = await fetchChatThread(chatId)
        if (requestId !== requestIdRef.current) return
        setActive({
          kind: 'chat',
          id: chatId,
          messages: (thread?.messages ?? []) as ChatUIMessage[],
          title: thread?.chat.title ?? null,
        })
      } catch (err) {
        console.error('[zenith:chat:load]', err)
        if (requestId !== requestIdRef.current) return
        setActive({ kind: 'chat', id: chatId, messages: [], title: null })
      }
    })()
    // Keep showing the previous pane until this resolves (no Loading flash).
  }, [chatId, draftKey])

  const startDraftSession = useCallback(
    (text: string) => {
      const id = generateId()
      stashPendingSend(id, text)
      trackChat(id, { title: titleFromUserText(text) })
      void navigate({
        to: '/chat/$chatId',
        params: { chatId: id },
        replace: true,
      })
    },
    [navigate, trackChat],
  )

  const openNewChat = useCallback(() => {
    if (isDraft) {
      setDraftKey((k) => k + 1)
      return
    }
    void navigate({ to: '/' })
  }, [isDraft, navigate])

  return (
    <div className="flex h-full min-h-0 w-full">
      <ChatSidebar
        chats={chats}
        loading={sidebarLoading}
        activeChatId={chatId ?? null}
        isDraft={isDraft}
        onNewChat={openNewChat}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatAuthBar />
        <div className="relative min-h-0 flex-1">
          {active?.kind === 'draft' ? (
            <DraftCenter key={active.key} onStart={startDraftSession} />
          ) : active?.kind === 'chat' ? (
            <ChatCenter
              key={active.id}
              chatId={active.id}
              initialMessages={active.messages}
              onTrack={trackChat}
              onFinish={refresh}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DraftCenter({ onStart }: { onStart: (text: string) => void }) {
  const chatApi: ZenithChatApi = {
    messages: [],
    status: 'ready',
    sendMessage: (message) => {
      onStart(message.text)
    },
    stop: () => {},
    error: undefined,
    clearError: () => {},
    regenerate: () => {},
  }

  return <ChatWindow chat={chatApi} />
}

type ChatCenterProps = {
  chatId: string
  initialMessages: ChatUIMessage[]
  onTrack: (chatId: string, optimistic?: { title: string }) => void
  onFinish: () => void
}

function ChatCenter({
  chatId,
  initialMessages,
  onTrack,
  onFinish,
}: ChatCenterProps) {
  const chat = useZenithChat({
    id: chatId,
    messages: initialMessages,
    onFinish,
  })
  const startedPending = useRef(false)

  useEffect(() => {
    if (startedPending.current) return
    startedPending.current = true
    const pendingText = takePendingSend(chatId)
    if (!pendingText) return
    void chat.sendMessage({ text: pendingText })
  }, [chat, chatId])

  const sendMessage = useCallback(
    async (message: { text: string }) => {
      onTrack(chatId, { title: titleFromUserText(message.text) })
      await chat.sendMessage(message)
    },
    [chat, chatId, onTrack],
  )

  const chatApi: ZenithChatApi = {
    ...chat,
    sendMessage,
  }

  return <ChatWindow chat={chatApi} />
}
