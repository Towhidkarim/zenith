import { motion } from 'motion/react'
import { AssistantMessage } from '#/features/chat/components/assistant-message'
import { UserMessage } from '#/features/chat/components/user-message'
import { getMessageText } from '#/features/chat/lib/message-parts'
import { messagePresence } from '#/features/chat/lib/motion'
import type { ChatStatus, ChatUIMessage } from '#/features/chat/types'

type MessageListProps = {
  messages: ChatUIMessage[]
  status: ChatStatus
}

/** Renders the transcript. Each turn animates in with a small rise. */
export function MessageList({ messages, status }: MessageListProps) {
  const lastIndex = messages.length - 1

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message, index) => {
        const isLast = index === lastIndex
        const isStreaming =
          isLast &&
          message.role === 'assistant' &&
          (status === 'streaming' || status === 'submitted')

        return (
          <motion.div
            key={message.id}
            variants={messagePresence}
            initial="hidden"
            animate="visible"
          >
            {message.role === 'user' ? (
              <UserMessage text={getMessageText(message)} />
            ) : (
              <AssistantMessage message={message} isStreaming={isStreaming} />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
