import { memo } from 'react'
import { Streamdown } from 'streamdown'
import { AgentStepList } from '#/features/chat/components/agent-step-list'
import { ReasoningBlock } from '#/features/chat/components/reasoning-block'
import { SourceList } from '#/features/chat/components/source-list'
import { StreamingCursor } from '#/features/chat/components/streaming-cursor'
import { extractAssistantView } from '#/features/chat/lib/message-parts'
import type { ChatUIMessage } from '#/features/chat/types'

type AssistantMessageProps = {
  message: ChatUIMessage
  /** True when this is the active, still-streaming assistant turn. */
  isStreaming: boolean
}

/**
 * Full-width assistant turn — no bubble. Renders agent steps, reasoning,
 * streamed markdown, and source links in a stable order.
 */
function AssistantMessageImpl({ message, isStreaming }: AssistantMessageProps) {
  const { steps, reasoning, isReasoningActive, text, sources } =
    extractAssistantView(message)
  const hasText = text.length > 0
  // Still "thinking" until the final answer text begins (or the stream ends).
  const isThinking = isStreaming && !hasText

  return (
    <div className="flex flex-col gap-2">
      <AgentStepList steps={steps} isThinking={isThinking} />

      {reasoning ? (
        <ReasoningBlock text={reasoning} isActive={isReasoningActive} />
      ) : null}

      {hasText ? (
        <div
          className={
            isStreaming
              ? 'zenith-markdown zenith-markdown--streaming text-[15px] leading-[1.6] text-foreground'
              : 'zenith-markdown text-[15px] leading-[1.6] text-foreground'
          }
        >
          <Streamdown
            mode={isStreaming ? 'streaming' : 'static'}
            parseIncompleteMarkdown
            className="space-y-3"
          >
            {text}
          </Streamdown>
        </div>
      ) : null}

      {!hasText && isStreaming && steps.length === 0 && !reasoning ? (
        <StreamingCursor />
      ) : null}

      <SourceList
        sources={sources}
        deferWhileStreaming
        isStreaming={isStreaming}
      />
    </div>
  )
}

export const AssistantMessage = memo(AssistantMessageImpl)
