# Zenith — agent notes

Minimal orientation for coding agents. Visual system: `DESIGN.md`.

## Product

Domain-focused AI chat agent (TanStack Start UI + Hono inference API) on Cloudflare Workers. Early phase: dummy multi-step streams; swap in real LLMs later without changing the HTTP contract.

## Runtime split (`src/server.ts`)

| Path | Handler |
|------|---------|
| `/api/rest/*` | Hono (`src/hono`) |
| `/api/auth/*` | Better Auth (TanStack Start route) |
| everything else | TanStack Start (SSR, server fns) |

Only `/api/rest` is diverted to Hono — `/api/auth` stays on Start.

`wrangler.jsonc` → `"main": "./src/server.ts"`.

## Hono layout

```text
src/hono/
  app.ts              # basePath('/api/rest'), middleware, route mounts, AppType
  factory.ts          # Hono<{ Bindings: Env, Variables: auth }>
  client.ts           # hc<AppType> RPC client (credentials: include)
  middleware/         # session (Better Auth), requireAuth
  routes/             # HTTP only: path, zValidator, thin handlers
  schemas/            # Zod *BodySchema / *ResponseSchema
  lib/                # services / stream producers (business logic)
    chat/
      types.ts          # ChatUIMessage, ChatDataParts, toChatUIMessages
      create-stream.ts  # replaceable inference seam (calls dummy today)
      dummy-stream.ts   # early-dev multi-step SSE producer
```

### Conventions

- **Route** = HTTP + validation (+ optional `requireAuth`). Keep handlers thin so Hono RPC can infer types from `c.json` / validators.
- **Logic** = `lib/` (services). Prefer route + service over fat controllers (controllers often widen RPC types to `Response`).
- **Schemas** = `schemas/<feature>.ts`. Name `*BodySchema`, `*QuerySchema`, `*ResponseSchema`. Infer types with `z.infer`.
- **Streaming chat** = validate request with Zod; response is AI SDK UI-message SSE (`createUIMessageStreamResponse`), not JSON RPC output. Replace inference via `lib/chat/create-stream.ts` (not the route).
- **Auth** = same Better Auth cookies via `sessionMiddleware`. Use `c.get('user' | 'session')`. Protect with `requireAuth`.
- **Client JSON** = `restClient` from `#/hono/client`. **Chat UI** = AI SDK `useChat` + `DefaultChatTransport({ api: '/api/rest/chat', credentials: 'include' })`. Do **not** force streaming through Hono RPC.

### Key endpoints

- `GET  /api/rest/health`
- `GET  /api/rest/chat/health` — `mode: 'dummy-stream' | 'llm'`
- `POST /api/rest/chat` — multi-step UI-message SSE (agent-step → reasoning → sources → text)

### Chat stream protocol

SSE via AI SDK UI message stream. Custom / built-in parts the UI understands:

| Part | Role |
|------|------|
| `data-agent-step` | Rolling progress ticker (`id`, `label`, `status: active \| done`) |
| `reasoning` | Collapsible chain-of-thought |
| `source-url` | Citations (UI defers display until stream ends) |
| `text` | Final answer (Streamdown markdown) |

Request body: Zod `ChatPostBodySchema` (`schemas/chat.ts`). `data-agent-step` payload is Zod-validated when present; other part shapes stay loosely typed until the LLM path lands.

Swap path for real models:

1. Implement `lib/chat/llm-stream.ts` (or similar) that emits the **same** part protocol.
2. Point `createChatStreamResponse` at it.
3. Flip health `mode` to `'llm'`.
4. Leave `routes/chat.ts` thin (validate → `toChatUIMessages` → factory).

## Frontend

Thin TanStack routes; chat UI lives under `src/features/chat`. Do not put conversation UI in route files.

```text
src/features/chat/
  index.ts                 # public barrel (ChatWindow, useZenithChat, types)
  types.ts                 # ChatUIMessage re-export, ChatStatus, ZenithChatApi, starters
  hooks/use-zenith-chat.ts # useChat + DefaultChatTransport + throttle
  compositions/
    chat-window.tsx        # empty ↔ active layout; scroll; error banner
    message-list.tsx
    chat-composer.tsx      # slots for future attachments/tools
    chat-empty-state.tsx
  components/              # messages, steps, reasoning, sources, send, caret
  lib/
    message-parts.ts       # getMessageText / extractAssistantView
    chat-copy.ts           # brand, cue, starters, error strings
    chat-scroll-context.tsx
    motion.ts
```

- `/` renders full-viewport `<ChatWindow />`; `__root.tsx` hides `Header`/`Footer` on `/` only.
- Scroll: `use-stick-to-bottom` (stable scrollbar gutter). Reasoning accordion calls `stopScroll()` on manual toggle so expand doesn’t fight the floor.
- Streaming: `throttle: 80` on `useChat`; Streamdown `mode="streaming"` while live; quiet error banner + Retry (`clearError` + `regenerate`).

### Chat extensibility seams (current)

- **Hook / view injection** — `useZenithChat({ id, messages, api })` for session options. Pass `chat: ZenithChatApi` into `ChatWindow` for history/tests; omit it to use the default hook (wrapper avoids a double subscription).
- **Part helpers** — `lib/message-parts.ts` is the single place that knows part type strings (`data-agent-step`, `reasoning`, `source-url`, `text`). Prefer extending helpers before adding new walkers in JSX.
- **Copy** — `lib/chat-copy.ts` + empty-state props for brand / cue / starters (domain vocabulary stays out of JSX).
- **Composer slots** — `leadingSlot` / `trailingSlot` / `footerSlot` on `ChatComposer` for attachments, tools, model pills later.
- **Stream factory** — Hono `createChatStreamResponse(messages, { env })`; swap implementation without touching HTTP.
- **Types** — UI re-exports `ChatUIMessage` / `ChatDataParts` from `#/hono/lib/chat/types` (one protocol end-to-end). A `src/shared/chat-protocol.ts` split is optional later if the UI→hono import becomes a boundary problem.

## Future steps (deferred)

Do **not** fake these inside `ChatWindow` without a real session/model layer—they need product decisions first.

| Item | Notes |
|------|--------|
| **History sidebar / chat id / persistence** | Needs a conversation session model + storage. Use `useZenithChat({ id, messages })` + injected `ZenithChatApi` once history exists; don’t grow `ChatWindow` into a store. |
| **Message actions** | Copy / regenerate / feedback on hover (see `DESIGN.md`). Wire when regenerate is a real product path (`regenerate` is already on `ZenithChatApi`). |
| **Auth-gated chat** | `requireAuth` exists under Hono middleware but is not on `POST /chat`. Wire when login is required. Better Auth still needs a real DB adapter before relying on `c.get('user')` in production. |
| **Attachments / tools** | Composer slots are ready; send path is still `sendMessage({ text })`. Extend transport/body + part helpers for files/tools. |
| **Real LLM** | Replace body of `create-stream.ts`; keep step/reasoning/source/text protocol (or document a reduced UI path if some parts are omitted). |
| **List virtualization** | Only when threads get long; message `memo` is enough for early volume. |
| **Ordered part rendering** | Today helpers flatten to structured fields. Move to ordered part list rendering when interleaved tool/UI blocks matter. |

## Do / don’t

- Do extend `/api/rest` for new backend APIs; keep Start for pages + `/api/auth`.
- Do replace `lib/chat/create-stream.ts` (currently delegates to `dummy-stream.ts`) when adding real models — keep the stream protocol.
- Do inject `ZenithChatApi` / extend part helpers rather than forking `ChatWindow` for history or tests.
- Don’t add gradients/shadows that fight `DESIGN.md`.
- Don’t put inference in TanStack server routes when it belongs on Hono.
- Don’t route all of `/api/*` to Hono — that would break Better Auth.
- Don’t force chat streaming through Hono RPC (`restClient` is for JSON only).
