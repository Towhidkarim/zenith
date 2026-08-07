import { env } from 'cloudflare:workers'
import type { ChatRunDO } from '#/durable-objects/chat-run'
import type { ChatRunRuntime } from '#/runtime/types'

/** Cloudflare adapter — one `runId` maps to one ChatRunDO via `getByName`. */
export function createDoChatRunRuntime(): ChatRunRuntime {
  return {
    start(input) {
      return stub(input.runId).start(input)
    },

    startAndSubscribe(input, fromSeq = 0) {
      return stub(input.runId).startAndSubscribe(input, fromSeq)
    },

    subscribe(runId, fromSeq = 0) {
      return stub(runId).subscribe(fromSeq)
    },

    cancel(runId) {
      return stub(runId).cancel()
    },

    getStatus(runId) {
      return stub(runId).getStatus()
    },
  }
}

function stub(runId: string): DurableObjectStub<ChatRunDO> {
  return env.CHAT_RUN.getByName(runId)
}
