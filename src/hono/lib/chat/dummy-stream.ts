import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from 'ai'
import type { ChatUIMessage } from './types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function writeTextChunks(
  writer: { write: (chunk: { type: 'text-delta'; id: string; delta: string }) => void },
  textId: string,
  text: string,
  chunkSize = 12,
  delayMs = 28,
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    writer.write({
      type: 'text-delta',
      id: textId,
      delta: text.slice(i, i + chunkSize),
    })
    await sleep(delayMs)
  }
}

/**
 * Dummy multi-step agent stream for early development.
 *
 * Later: replace the body of this function with real LLM / tool orchestration
 * while keeping the same Response shape (`createUIMessageStreamResponse`).
 *
 * Stream shape (SSE via AI SDK UI message protocol):
 * 1. agent-step — analyzing / thinking
 * 2. reasoning-* — chain-of-thought headlines
 * 3. agent-step — browsing / tools
 * 4. text-* — final answer tokens
 */
export function createDummyChatStreamResponse(messages: ChatUIMessage[]) {
  const lastUserText =
    messages
      .filter((m) => m.role === 'user')
      .at(-1)
      ?.parts?.filter((p) => p.type === 'text')
      .map((p) => (p.type === 'text' ? p.text : ''))
      .join('')
      .trim() || 'your request'

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const messageId = generateId()
      writer.write({ type: 'start', messageId })

      // --- Step 1: analyze -------------------------------------------------
      const analyzeStepId = generateId()
      writer.write({
        type: 'data-agent-step',
        id: analyzeStepId,
        data: {
          id: analyzeStepId,
          label: 'Thinking about your request',
          status: 'active',
        },
      })

      writer.write({ type: 'start-step' })

      const reasoningId = generateId()
      writer.write({ type: 'reasoning-start', id: reasoningId })

      const headlines = [
        'Parse the user intent',
        'Identify domain constraints',
        'Decide which tools or documents to consult',
      ]

      for (const headline of headlines) {
        writer.write({
          type: 'reasoning-delta',
          id: reasoningId,
          delta: `${headline}\n`,
        })
        await sleep(350)
      }

      writer.write({ type: 'reasoning-end', id: reasoningId })

      writer.write({
        type: 'data-agent-step',
        id: analyzeStepId,
        data: {
          id: analyzeStepId,
          label: 'Thinking about your request',
          status: 'done',
        },
      })

      writer.write({ type: 'finish-step' })
      await sleep(200)

      // --- Step 2: browse / gather ----------------------------------------
      const browseStepId = generateId()
      writer.write({
        type: 'data-agent-step',
        id: browseStepId,
        data: {
          id: browseStepId,
          label: 'Browsing necessary documents',
          status: 'active',
        },
      })

      writer.write({ type: 'start-step' })
      await sleep(700)

      writer.write({
        type: 'source-url',
        sourceId: generateId(),
        url: 'https://example.com/docs/overview',
        title: 'Domain overview (placeholder)',
      })

      writer.write({
        type: 'data-agent-step',
        id: browseStepId,
        data: {
          id: browseStepId,
          label: 'Browsing necessary documents',
          status: 'done',
        },
      })

      writer.write({ type: 'finish-step' })
      await sleep(150)

      // --- Step 3: answer (swap for streamText later) ---------------------
      writer.write({ type: 'start-step' })

      const textId = generateId()
      writer.write({ type: 'text-start', id: textId })

      const reply = [
        `Got it — you asked about “${lastUserText}”.`,
        '',
        'This is a **dummy streamed reply** from the Hono `/api/rest/chat` route.',
        'The pipeline already emits agent steps, reasoning headlines, sources,',
        'and token deltas so the UI can mirror a multi-phase agent.',
        '',
        'When you plug in Gemini (or another provider), replace',
        '`createDummyChatStreamResponse` with a real `streamText` merge',
        'and keep the same step / reasoning protocol.',
      ].join('\n')

      await writeTextChunks(writer, textId, reply)

      writer.write({ type: 'text-end', id: textId })
      writer.write({ type: 'finish-step' })
      writer.write({ type: 'finish', finishReason: 'stop' })
    },
  })

  return createUIMessageStreamResponse({ stream })
}
