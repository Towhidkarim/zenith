import type { AgentEvent } from '#/agent/types'

/** Run work between step active/done events (Grok-style ticker). */
export async function* withStep(
  label: string,
  signal: AbortSignal | undefined,
  work: () => AsyncGenerator<AgentEvent> | Promise<void> | void,
): AsyncGenerator<AgentEvent> {
  throwIfAborted(signal)
  const id = crypto.randomUUID()
  yield { type: 'step', id, label, status: 'active' }
  try {
    const result = work()
    if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
      yield* result as AsyncGenerator<AgentEvent>
    } else if (result && typeof (result as Promise<void>).then === 'function') {
      await result
    }
  } finally {
    yield { type: 'step', id, label, status: 'done' }
  }
}

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Agent run aborted', 'AbortError')
  }
}
