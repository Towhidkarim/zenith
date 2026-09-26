# ChatRunDO (`src/durable-objects`)

One Durable Object instance = **one assistant turn** (`runId`).

## How you talk to it

```ts
import { env } from 'cloudflare:workers'

const stub = env.CHAT_RUN.getByName(runId)
const stream = await stub.startAndSubscribe({ runId, messages, chatId }, fromSeq)
await stub.cancel()
```

Hono uses `createDoChatRunRuntime()` (same binding via imported `env`) — no `c.env` plumbing.

## What it owns

| Concern | Implementation |
|---------|----------------|
| Agent execution | `createAgentDeps(env)` + `runAgent` via `waitUntil` |
| Event log | SQLite (`events` + `meta`) |
| Live streaming | NDJSON fan-out |
| Cancel | `AbortSignal` into agent |
| History | `persistChatTurn` → D1 `env.DB` when `chatId` is set |

## Env for legal RAG

- `GEMINI_API_KEY` — chat + embeddings
- `QDRANT_URL` / `QDRANT_API_KEY` / `QDRANT_COLLECTION` (`bd_laws_v1`)

Local: `.dev.vars` (see `.dev.vars.example`).

## IDs

- `chatId` — conversation (optional persistence key)
- `runId` — one assistant turn (DO name)
