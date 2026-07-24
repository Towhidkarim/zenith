import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useStickToBottom } from 'use-stick-to-bottom'
import { ChatComposer } from '#/features/chat/compositions/chat-composer'
import { ChatEmptyState } from '#/features/chat/compositions/chat-empty-state'
import { MessageList } from '#/features/chat/compositions/message-list'
import { useZenithChat } from '#/features/chat/hooks/use-zenith-chat'
import { springSoft } from '#/features/chat/lib/motion'
import { cn } from '#/lib/utils'

/**
 * Chat surface orchestrator. Centers the composer + starters when empty,
 * then shifts to a scrolling transcript with a pinned composer once a
 * conversation begins.
 */
export function ChatWindow() {
  const { messages, sendMessage, stop, status } = useZenithChat()
  const reduceMotion = useReducedMotion()
  // Purpose-built for AI streams: handles shrink/grow + scrollbar gutter
  // without the up/down bounce our hand-rolled scroller hit at the floor.
  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom({
    resize: 'instant',
    initial: 'instant',
  })

  const isEmpty = messages.length === 0
  const isStreaming = status === 'streaming' || status === 'submitted'

  const handleSend = (text: string) => {
    sendMessage({ text })
    void scrollToBottom({ animation: 'instant' })
  }

  const composer = (
    <ChatComposer
      onSend={handleSend}
      onStop={stop}
      isStreaming={isStreaming}
      autoFocus
    />
  )

  const layoutTransition = reduceMotion ? { duration: 0 } : springSoft

  return (
    <LayoutGroup>
      <div className="flex h-full min-h-0 flex-col">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="flex w-full max-w-4xl flex-col gap-8">
              <ChatEmptyState onSelect={handleSend} />
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
                  'mx-auto w-full max-w-2xl px-4 pt-8',
                  isStreaming ? 'pb-[min(22vh,9rem)]' : 'pb-6',
                )}
              >
                <MessageList messages={messages} status={status} />
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="mx-auto w-full max-w-2xl">
                <motion.div layoutId="chat-composer" transition={layoutTransition}>
                  {composer}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </LayoutGroup>
  )
}
