import type { ChatDataParts, ChatUIMessage } from '#/features/chat/types'

export type AgentStep = ChatDataParts['agent-step']

export type SourceLink = {
  sourceId: string
  url: string
  title?: string
}

export type AssistantView = {
  steps: AgentStep[]
  reasoning: string
  isReasoningActive: boolean
  text: string
  sources: SourceLink[]
}

/** Join all text parts on a message (user or assistant). */
export function getMessageText(message: ChatUIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

/**
 * Flatten assistant parts into the view model the UI renders today.
 * Single place that knows part type strings (`data-agent-step`, etc.).
 */
export function extractAssistantView(message: ChatUIMessage): AssistantView {
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
