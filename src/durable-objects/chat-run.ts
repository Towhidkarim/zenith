import { DurableObject, env } from 'cloudflare:workers'
import { createAgentDeps, runAgent } from '#/agent'
import type { AgentEvent, AgentInput } from '#/agent'
import { logAndFormatError } from '#/agent/lib/errors'
import { persistChatTurn } from '#/agent/persistence/chat-turn'
import type {
  ChatRunStatusResult,
  RunStatus,
  StartChatRunInput,
  StartChatRunResult,
  StoredAgentEvent,
} from '#/runtime/types'

type Subscriber = {
  fromSeq: number
  controller: ReadableStreamDefaultController<Uint8Array>
}

const encoder = new TextEncoder()

/**
 * One Durable Object instance ≈ one assistant turn (`runId`).
 *
 * - SQLite-backed append-only event log (survives hibernation)
 * - RPC methods (no fetch routing)
 * - Live NDJSON fan-out with race-free subscribe
 * - Injects Qdrant + Gemini deps into the pure agent
 */
export class ChatRunDO extends DurableObject<Env> {
  private sql = this.ctx.storage.sql
  private hydrated = false
  private status: RunStatus = 'idle'
  private subscribers = new Set<Subscriber>()
  private nextSeq = 1
  private abortController: AbortController | null = null

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.initSchema()
  }

  async start(input: StartChatRunInput): Promise<StartChatRunResult> {
    this.hydrate()
    this.ensureStarted(input)
    return this.toStartResult(input.runId)
  }

  async startAndSubscribe(
    input: StartChatRunInput,
    fromSeq = 0,
  ): Promise<ReadableStream<Uint8Array>> {
    this.hydrate()
    this.ensureStarted(input)
    return this.createSubscriberStream(fromSeq)
  }

  async subscribe(fromSeq = 0): Promise<ReadableStream<Uint8Array>> {
    this.hydrate()
    return this.createSubscriberStream(fromSeq)
  }

  async cancel(): Promise<{ ok: true; status: RunStatus }> {
    this.hydrate()
    this.abortController?.abort()
    if (this.status === 'running') {
      this.setStatus('cancelled')
      this.append({
        type: 'error',
        message: 'Run cancelled',
      })
      this.append({ type: 'done' })
    }
    return { ok: true, status: this.status }
  }

  async getStatus(): Promise<ChatRunStatusResult> {
    this.hydrate()
    return {
      status: this.status,
      eventCount: this.countEvents(),
      nextSeq: this.nextSeq,
    }
  }

  private initSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS events (
        seq INTEGER PRIMARY KEY,
        event_json TEXT NOT NULL,
        at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
  }

  private hydrate() {
    if (this.hydrated) return

    const statusRow = this.sql
      .exec(`SELECT value FROM meta WHERE key = 'status'`)
      .toArray()[0] as { value: string } | undefined
    if (statusRow?.value) {
      this.status = statusRow.value as RunStatus
    }

    const maxRow = this.sql
      .exec(`SELECT COALESCE(MAX(seq), 0) AS max_seq FROM events`)
      .one() as { max_seq: number }
    this.nextSeq = maxRow.max_seq + 1
    this.hydrated = true
  }

  private ensureStarted(input: StartChatRunInput) {
    if (
      this.status === 'running' ||
      this.status === 'done' ||
      this.status === 'error' ||
      this.status === 'cancelled'
    ) {
      return
    }

    this.setStatus('running')
    this.abortController = new AbortController()
    this.ctx.waitUntil(this.executeAgent(input, this.abortController.signal))
  }

  private async executeAgent(input: StartChatRunInput, signal: AbortSignal) {
    // Secrets from importable Worker env; agent stays portable via AgentDeps.
    const deps = createAgentDeps(env)
    const agentInput: AgentInput = {
      runId: input.runId,
      chatId: input.chatId,
      messages: input.messages,
      signal,
      deps,
    }

    const collectedSources: AgentEvent[] = []
    let assistantText = ''

    const userText =
      [...input.messages].reverse().find((m) => m.role === 'user')?.text ?? ''

    const persist = () =>
      persistChatTurn(
        {
          chatId: input.chatId,
          runId: input.runId,
          userId: input.userId,
          userText,
          assistantText,
          sources: collectedSources.filter(
            (e): e is Extract<AgentEvent, { type: 'source' }> =>
              e.type === 'source',
          ),
        },
        env.DB,
      )

    try {
      for await (const event of runAgent(agentInput)) {
        if (signal.aborted) break
        this.append(event)
        if (event.type === 'error') this.setStatus('error')
        if (event.type === 'source') collectedSources.push(event)
        if (event.type === 'text') assistantText += event.delta
      }

      if (this.status === 'running') this.setStatus('done')
      this.ctx.waitUntil(persist())
    } catch (err) {
      if (signal.aborted) {
        if (this.status === 'running') this.setStatus('cancelled')
        this.ctx.waitUntil(persist())
        return
      }
      const message = logAndFormatError(`ChatRunDO(${input.runId})`, err)
      this.setStatus('error')
      this.append({
        type: 'error',
        message,
      })
      this.append({ type: 'done' })
      this.ctx.waitUntil(persist())
    }
  }

  private append(event: AgentEvent) {
    const stored: StoredAgentEvent = {
      seq: this.nextSeq++,
      event,
      at: Date.now(),
    }
    this.sql.exec(
      `INSERT INTO events (seq, event_json, at) VALUES (?, ?, ?)`,
      stored.seq,
      JSON.stringify(event),
      stored.at,
    )
    this.fanOut(stored)

    if (event.type === 'done') {
      this.closeAllSubscribers()
    }
  }

  private fanOut(stored: StoredAgentEvent) {
    for (const sub of [...this.subscribers]) {
      if (stored.seq <= sub.fromSeq) continue
      try {
        sub.controller.enqueue(encodeLine(stored))
        sub.fromSeq = stored.seq
      } catch {
        this.subscribers.delete(sub)
      }
    }
  }

  private createSubscriberStream(fromSeq: number): ReadableStream<Uint8Array> {
    let subscriber: Subscriber | null = null

    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        this.ctx.blockConcurrencyWhile(async () => {
          const replay = this.loadEventsAfter(fromSeq)
          for (const item of replay) {
            controller.enqueue(encodeLine(item))
          }

          const lastSeq =
            replay.length > 0 ? replay[replay.length - 1].seq : fromSeq

          if (isTerminal(this.status)) {
            controller.close()
            return
          }

          subscriber = { fromSeq: lastSeq, controller }
          this.subscribers.add(subscriber)
        })
      },
      cancel: () => {
        if (subscriber) this.subscribers.delete(subscriber)
      },
    })
  }

  private loadEventsAfter(fromSeq: number): StoredAgentEvent[] {
    const rows = this.sql
      .exec(
        `SELECT seq, event_json, at FROM events WHERE seq > ? ORDER BY seq ASC`,
        fromSeq,
      )
      .toArray() as Array<{ seq: number; event_json: string; at: number }>

    return rows.map((row) => ({
      seq: row.seq,
      event: JSON.parse(row.event_json) as AgentEvent,
      at: row.at,
    }))
  }

  private countEvents(): number {
    const row = this.sql
      .exec(`SELECT COUNT(*) AS count FROM events`)
      .one() as { count: number }
    return row.count
  }

  private setStatus(status: RunStatus) {
    this.status = status
    this.sql.exec(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('status', ?)`,
      status,
    )
  }

  private closeAllSubscribers() {
    for (const sub of [...this.subscribers]) {
      try {
        sub.controller.close()
      } catch {
        // already closed
      }
      this.subscribers.delete(sub)
    }
  }

  private toStartResult(runId: string): StartChatRunResult {
    return {
      runId,
      status: this.status,
      eventCount: this.countEvents(),
    }
  }
}

function isTerminal(status: RunStatus) {
  return status === 'done' || status === 'error' || status === 'cancelled'
}

function encodeLine(item: StoredAgentEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(item)}\n`)
}
