import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Plus } from 'lucide-react'
import { chatCopy } from '#/features/chat/lib/chat-copy'
import { authClient } from '#/lib/auth-client'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '#/components/ui/sidebar'
import type { SidebarChat } from '#/features/chat/hooks/use-chat-sidebar-list'

type ChatSidebarProps = {
  chats: SidebarChat[]
  loading?: boolean
  activeChatId?: string | null
  /** True when viewing the draft composer at `/` (no session yet). */
  isDraft?: boolean
  onNewChat?: () => void
}

/** Left rail built on the shadcn sidebar. Mobile uses its sheet. */
export function ChatSidebar({
  chats,
  loading = false,
  activeChatId,
  isDraft = false,
  onNewChat,
}: ChatSidebarProps) {
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()

  const goHome = () => {
    if (onNewChat) onNewChat()
    else void navigate({ to: '/' })
    setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden border-border">
      <SidebarHeader className="group-data-[collapsible=icon]:items-center">
        <div className="flex w-full items-center gap-1 group-data-[collapsible=icon]:flex-col">
          <SidebarMenu className="min-w-0 flex-1 group-data-[collapsible=icon]:w-auto">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={chatCopy.brand}
                className="group-data-[collapsible=icon]:justify-center"
                onClick={goHome}
              >
                <img src="/favicon.svg" alt="" className="size-5 shrink-0" />
                <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                  {chatCopy.brand}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="shrink-0 text-muted-foreground" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New chat"
              isActive={isDraft}
              className="group-data-[collapsible=icon]:justify-center"
              onClick={goHome}
            >
              <Plus />
              <span className="group-data-[collapsible=icon]:hidden">
                New chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading && chats.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">Loading…</p>
            ) : null}
            {!loading && chats.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                Conversations you start will show up here.
              </p>
            ) : null}
            <SidebarMenu>
              {chats.map((chat) => {
                const title = chat.title?.trim() || 'New chat'
                return (
                  <SidebarMenuItem key={chat.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={!isDraft && chat.id === activeChatId}
                        >
                          <Link
                            to="/chat/$chatId"
                            params={{ chatId: chat.id }}
                            onClick={() => setOpenMobile(false)}
                          >
                            <span>{title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {title}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarAccount() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-sidebar-accent group-data-[collapsible=icon]:hidden" />
      </div>
    )
  }

  const user = session?.user
  if (!user) return null

  const label = user.name?.trim() || user.email || 'Account'
  const initial = (label.charAt(0) || 'U').toUpperCase()

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={label}
          className="group-data-[collapsible=icon]:justify-center"
        >
          <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-[10px] font-medium">
            {user.image ? (
              <img src={user.image} alt="" className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <span className="group-data-[collapsible=icon]:hidden">{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Sign out"
          className="group-data-[collapsible=icon]:justify-center"
          onClick={() => {
            void authClient.signOut()
          }}
        >
          <LogOut />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
