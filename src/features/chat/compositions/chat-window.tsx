import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useStickToBottom } from 'use-stick-to-bottom'
import { ChatComposer } from '#/features/chat/compositions/chat-composer'
import { ChatEmptyState } from '#/features/chat/compositions/chat-empty-state'
import { MessageList } from '#/features/chat/compositions/message-list'
import { useZenithChat } from '#/features/chat/hooks/use-zenith-chat'
import { chatCopy } from '#/features/chat/lib/chat-copy'
import { ChatScrollProvider } from '#/features/chat/lib/chat-scroll-context'
import { springSoft } from '#/features/chat/lib/motion'
import type { SuggestionStarter, ZenithChatApi } from '#/features/chat/types'
import { cn } from '#/lib/utils'

type ChatWindowProps = {
  /** Inject a controller (history/tests); defaults to useZenithChat(). */
  chat?: ZenithChatApi
  brand?: string
  cue?: string
  starters?: SuggestionStarter[]
}

/**
 * Chat surface orchestrator. Centers the composer + starters when empty,
 * then shifts to a scrolling transcript with a pinned composer once a
 * conversation begins.
 */
export function ChatWindow(props: ChatWindowProps) {
  if (props.chat) {
    return <ChatWindowView {...props} chat={props.chat} />
  }
  return <ChatWindowWithDefaultHook {...props} />
}

function ChatWindowWithDefaultHook(props: Omit<ChatWindowProps, 'chat'>) {
  const chat = useZenithChat()
  return <ChatWindowView {...props} chat={chat} />
}

function ChatWindowView({
  chat,
  brand,
  cue,
  starters,
}: ChatWindowProps & { chat: ZenithChatApi }) {
  const { messages, sendMessage, stop, status, error, clearError, regenerate } =
    chat

  const reduceMotion = useReducedMotion()
  const stick = useStickToBottom({
    // Smooth resize so accordion expands (reasoning) don't hard-jump the floor.
    resize: 'smooth',
    initial: 'instant',
  })
  const { scrollRef, contentRef, scrollToBottom } = stick

  const isEmpty = messages.length === 0
  const isStreaming = status === 'streaming' || status === 'submitted'
  const showError = status === 'error' || Boolean(error)

  const handleSend = (text: string) => {
    if (isStreaming) return
    clearError()
    void sendMessage({ text })
    void scrollToBottom({ animation: 'instant' })
  }

  const handleStop = () => {
    void stop()
  }

  const handleRetry = () => {
    if (isStreaming) return
    clearError()
    void regenerate()
  }

  const errorBanner = showError ? (
    <div className="mb-2 flex items-start justify-between gap-3 rounded-[16px] border border-border bg-[var(--surface-1)] px-3 py-2 text-sm text-muted-foreground">
      <span className="min-w-0 whitespace-pre-wrap break-words">
        {error?.message?.trim() || chatCopy.streamError}
      </span>
      <button
        type="button"
        onClick={handleRetry}
        className="shrink-0 text-foreground underline-offset-2 hover:underline"
      >
        {chatCopy.retryLabel}
      </button>
    </div>
  ) : null

  const composer = (
    <div>
      {errorBanner}
      <ChatComposer
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        placeholder={chatCopy.composerPlaceholder}
        autoFocus
      />
    </div>
  )

  const layoutTransition = reduceMotion ? { duration: 0 } : springSoft

  return (
    <ChatScrollProvider value={stick}>
      <LayoutGroup>
        <div className="flex h-full min-h-0 flex-col">
          {isEmpty ? (
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="flex w-full max-w-4xl flex-col gap-8">
                <ChatEmptyState
                  onSelect={handleSend}
                  disabled={isStreaming}
                  brand={brand}
                  cue={cue}
                  starters={starters}
                />
                <motion.div layoutId="chat-composer" transition={layoutTransition}>
                  {composer}
                </motion.div>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto"
                style={{ scrollbarGutter: 'stable' }}
              >
                <div
                  ref={contentRef}
                  className={cn(
                    'mx-auto w-full max-w-4xl px-4 pt-8',
                    isStreaming ? 'pb-[min(22vh,9rem)]' : 'pb-6',
                  )}
                >
                  <MessageList messages={messages} status={status} />
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="mx-auto w-full max-w-4xl">
                  <motion.div layoutId="chat-composer" transition={layoutTransition}>
                    {composer}
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </div>
      </LayoutGroup>
    </ChatScrollProvider>
  )
}
