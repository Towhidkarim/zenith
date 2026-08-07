import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, Output, streamText } from 'ai'
import { agentConfig } from '#/agent/config'
import { logAndFormatError } from '#/agent/lib/errors'
import type { AgentLlm } from '#/agent/ports/llm'

export type GeminiLlmConfig = {
  apiKey: string
  /** Chat / structured model id — defaults to agentConfig.geminiChatModel. */
  model?: string
}

/**
 * Gemini adapter for the agent LLM port.
 * Structured calls use AI SDK 7 `generateText` + `Output.object`
 * (replaces deprecated `generateObject`).
 */
export function createGeminiAgentLlm(config: GeminiLlmConfig): AgentLlm {
  const google = createGoogleGenerativeAI({ apiKey: config.apiKey })
  const modelId = config.model ?? agentConfig.geminiChatModel

  return {
    async generateObject({ system, prompt, schema, signal }) {
      try {
        const { output } = await generateText({
          model: google(modelId),
          output: Output.object({ schema }),
          system,
          prompt,
          abortSignal: signal,
        })
        if (output == null) {
          throw new Error('No structured output returned from model')
        }
        return output
      } catch (err) {
        throw new Error(
          logAndFormatError(`gemini.generateObject(${modelId})`, err),
        )
      }
    },

    async *streamText({ system, prompt, signal }) {
      try {
        const result = streamText({
          model: google(modelId),
          system,
          prompt,
          abortSignal: signal,
        })
        for await (const delta of result.textStream) {
          yield delta
        }
      } catch (err) {
        throw new Error(
          logAndFormatError(`gemini.streamText(${modelId})`, err),
        )
      }
    },
  }
}
