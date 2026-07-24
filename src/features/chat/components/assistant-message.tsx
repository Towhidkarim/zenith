import { memo } from 'react'
import { Streamdown } from 'streamdown'
import { ExternalLink } from 'lucide-react'
import { AgentStepList } from '#/features/chat/components/agent-step-list'
import { ReasoningBlock } from '#/features/chat/components/reasoning-block'
import { StreamingCursor } from '#/features/chat/components/streaming-cursor'
import type { ChatDataParts, ChatUIMessage } from '#/features/chat/types'

type AgentStep = ChatDataParts['agent-step']

type SourceLink = {
  sourceId: string
  url: string
  title?: string
}

type AssistantMessageProps = {
  message: ChatUIMessage
  /** True when this is the active, still-streaming assistant turn. */
  isStreaming: boolean
}

type ExtractedParts = {
  steps: AgentStep[]
  reasoning: string
  isReasoningActive: boolean
  text: string
  sources: SourceLink[]
}

function extractParts(message: ChatUIMessage): ExtractedParts {
  const steps: AgentStep[] = []
  const sources: SourceLink[] = []
  let reasoning = ''
  let isReasoningActive = false
  let text = ''

  for (const part of message.parts) {
    switch (part.type) {
      case 'text':
        text += part.text
        break
      case 'reasoning':
        reasoning += part.text
        if (part.state === 'streaming') isReasoningActive = true
        break
      case 'data-agent-step':
        steps.push(part.data)
        break
      case 'source-url':
        sources.push({
          sourceId: part.sourceId,
          url: part.url,
          title: part.title,
        })
        break
      default:
        break
    }
  }

  return { steps, reasoning, isReasoningActive, text, sources }
}

/**
 * Full-width assistant turn — no bubble. Renders agent steps, reasoning,
 * streamed markdown, and source links in a stable order.
 */
function AssistantMessageImpl({ message, isStreaming }: AssistantMessageProps) {
  const { steps, reasoning, isReasoningActive, text, sources } = extractParts(message)
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

      {sources.length > 0 && !isStreaming ? (
        <div className="mt-1 flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Sources
          </span>
          {sources.map((source) => (
            <a
              key={source.sourceId}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{source.title ?? source.url}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const AssistantMessage = memo(AssistantMessageImpl)
