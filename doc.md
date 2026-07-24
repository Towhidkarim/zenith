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
```

### Conventions

- **Route** = HTTP + validation (+ optional `requireAuth`). Keep handlers thin so Hono RPC can infer types from `c.json` / validators.
- **Logic** = `lib/` (services). Prefer route + service over fat controllers (controllers often widen RPC types to `Response`).
- **Schemas** = `schemas/<feature>.ts`. Name `*BodySchema`, `*QuerySchema`, `*ResponseSchema`. Infer types with `z.infer`.
- **Streaming chat** = validate request with Zod; response is AI SDK UI-message SSE (`createUIMessageStreamResponse`), not JSON RPC output.
- **Auth** = same Better Auth cookies via `sessionMiddleware`. Use `c.get('user' | 'session')`. Protect with `requireAuth`.
- **Client JSON** = `restClient` from `#/hono/client`. **Chat UI** = AI SDK `useChat` + `DefaultChatTransport({ api: '/api/rest/chat', credentials: 'include' })`.

### Key endpoints

- `GET  /api/rest/health`
- `GET  /api/rest/chat/health`
- `POST /api/rest/chat` — multi-step dummy stream (agent-step → reasoning → sources → text)

## Frontend

Thin TanStack routes; chat UI lives under `src/features/chat` (`components/`, `compositions/`, `hooks/use-zenith-chat.ts`, `lib/`). Do not put conversation UI in route files.

- `ChatWindow` (`compositions/chat-window.tsx`) is the orchestrator: centered empty state ↔ scrolling transcript + pinned composer, animated with `motion`.
- `/` renders full-viewport chat; `__root.tsx` hides `Header`/`Footer` on `/` only.
- Streaming parts render by type: `data-agent-step` → step list, `reasoning` → collapsible block, `text` → `streamdown`, `source-url` → link row.

## Do / don’t

- Do extend `/api/rest` for new backend APIs; keep Start for pages + `/api/auth`.
- Do replace `lib/chat/dummy-stream.ts` when adding real models — keep the stream protocol.
- Don’t add gradients/shadows that fight `DESIGN.md`.
- Don’t put inference in TanStack server routes when it belongs on Hono.
- Don’t route all of `/api/*` to Hono — that would break Better Auth.
