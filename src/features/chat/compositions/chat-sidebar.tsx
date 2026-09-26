import { Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { SidebarChat } from '#/features/chat/hooks/use-chat-sidebar-list'

type ChatSidebarProps = {
  chats: SidebarChat[]
  loading?: boolean
  activeChatId?: string | null
  /** True when viewing the draft composer at `/` (no session yet). */
  isDraft?: boolean
  onNewChat?: () => void
  className?: string
}

/** Left rail: new chat + conversation list. */
export function ChatSidebar({
  chats,
  loading = false,
  activeChatId,
  isDraft = false,
  onNewChat,
  className,
}: ChatSidebarProps) {
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-[var(--surface-1)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => {
            if (onNewChat) onNewChat()
            else void navigate({ to: '/' })
          }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-[16px] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground',
            'hover:border-[var(--hairline-strong)] transition-colors',
            isDraft && 'border-[var(--hairline-strong)]',
          )}
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading && chats.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">Loading…</p>
        ) : null}
        {!loading && chats.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Conversations you start will show up here.
          </p>
        ) : null}
        <ul className="flex flex-col gap-0.5">
          {chats.map((chat) => {
            const active = !isDraft && chat.id === activeChatId
            return (
              <li key={chat.id}>
                <Link
                  to="/chat/$chatId"
                  params={{ chatId: chat.id }}
                  className={cn(
                    'block rounded-[12px] px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )}
                >
                  <span className="line-clamp-2">
                    {chat.title?.trim() || 'New chat'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
