# Agent core (`src/agent`)

Pure multi-step **Bangladesh legal RAG** agent. No Hono. No Durable Objects.

## Loop

```text
route → (plan queries → retrieve → judge)* → cite → answer → done
```

Every phase emits `step` events (Grok-style ticker) plus optional `reasoning`.

## Ports

| Port | Implementations |
|------|-----------------|
| `LegalRetrieval` | Qdrant `bd_laws_v1`, or stub |
| `AgentLlm` | Gemini (`generateObject` + `streamText`), or stub |

`createAgentDeps(bindings?)` picks real vs stub from plain `GEMINI_API_KEY` / `QDRANT_*` bindings (no Cloudflare imports). Workers call it with `import { env } from 'cloudflare:workers'`.

## Config

[`src/agent/config.ts`](src/agent/config.ts) — collection name, **embedding dims (768)**, embedding model, Gemini chat model. Add corpora entries there when case law lands.

Secrets stay in env / `.dev.vars` (`GEMINI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`).


## Test without Cloudflare

```ts
import { runAgent, createAgentDeps } from '#/agent'

for await (const event of runAgent({
  messages: [{ role: 'user', text: 'What is bail?' }],
  deps: createAgentDeps(), // stubs
})) {
  console.log(event)
}
```
