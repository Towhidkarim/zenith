import { memo } from 'react'
import { Streamdown } from 'streamdown'
import { AgentStepList } from '#/features/chat/components/agent-step-list'
import { ReasoningBlock } from '#/features/chat/components/reasoning-block'
import { SourceList } from '#/features/chat/components/source-list'
import { extractAssistantView } from '#/features/chat/lib/message-parts'
import type { ChatUIMessage } from '#/features/chat/types'

type AssistantMessageProps = {
  message: ChatUIMessage
  /** True when this is the active, still-streaming assistant turn. */
  isStreaming: boolean
}

/**
 * Full-width assistant turn.
 * Streamdown fades tokens in as they arrive.
 * Stagger stays at 0 so later list items are not held invisible.
 */
function AssistantMessageImpl({ message, isStreaming }: AssistantMessageProps) {
  const { steps, reasoning, isReasoningActive, text, sources } =
    extractAssistantView(message)
  const hasText = text.length > 0
  const isThinking = isStreaming && !hasText

  return (
    <div className="flex flex-col gap-2">
      <AgentStepList steps={steps} isThinking={isThinking} />

      {reasoning ? (
        <ReasoningBlock text={reasoning} isActive={isReasoningActive} />
      ) : null}

      {hasText ? (
        <div className="zenith-markdown text-[15px] leading-[1.6] text-foreground">
          <Streamdown
            mode={isStreaming ? 'streaming' : 'static'}
            isAnimating={isStreaming}
            parseIncompleteMarkdown
            animated={
              isStreaming
                ? { animation: 'fadeIn', duration: 150, stagger: 0 }
                : false
            }
            className="space-y-3"
          >
            {text}
          </Streamdown>
        </div>
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
